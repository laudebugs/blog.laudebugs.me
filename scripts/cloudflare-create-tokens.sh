#!/usr/bin/env bash
# Creates the Cloudflare API token that the blog's deploy workflows use, from a temporary bootstrap token, and stores it
# (and the account id) as secrets of the GitHub environment `cloudflare`. The new token's value is piped straight into
# `gh secret set`: it is never printed, never written to a file and never passed on a command line.
#
# Before you run it:
#   1. In the Cloudflare dashboard, make a TEMPORARY account API token with the permission
#      Account > Account API Tokens > Edit (and, only if you want the zone looked up by name, Zone > Zone > Read).
#      Give it a short expiry. Delete it when this script is done.
#   2. gh signed in as someone who can administer the repository. Over SSH use `gh auth login -p ssh -w` (a one-time code
#      you enter in a browser on your own machine), or export GH_TOKEN with a token that can administer the repository.
#      The script checks this before it creates anything.
#
# Usage (run it with ./ or bash; the first line makes it use bash even when your shell is zsh):
#   CF_ACCOUNT_ID=<account id> scripts/cloudflare-create-tokens.sh [--zone laudebugs.me | --zone-id <id>] [--dry-run]
#   (the bootstrap token is read from CF_BOOTSTRAP_TOKEN, or asked for with a hidden prompt)
#
# Without a zone the token can only edit Workers scripts on the account, which is enough until `routes` is added to
# wrangler.jsonc. Once the custom domain is in wrangler.jsonc, `wrangler deploy` also manages that domain, so pass
# the zone and the token gets Workers Routes and DNS edit on that one zone only.
set -euo pipefail

REPO="${REPO:-laudebugs/blog.laudebugs.me}"
ENVIRONMENT="${ENVIRONMENT:-cloudflare}"
TOKEN_NAME="${TOKEN_NAME:-blog.laudebugs.me deploy}"
TTL_DAYS="${TTL_DAYS:-365}"
API="https://api.cloudflare.com/client/v4"
ZONE_NAME=""
ZONE_ID=""
DRY_RUN=false

while [ $# -gt 0 ]; do
  case "$1" in
    --zone) ZONE_NAME="${2:?--zone needs a name}"; shift 2 ;;
    --zone-id) ZONE_ID="${2:?--zone-id needs an id}"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    -h|--help) sed -n '2,22p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

for tool in curl jq gh; do
  command -v "$tool" >/dev/null || { echo "missing: $tool" >&2; exit 1; }
done
: "${CF_ACCOUNT_ID:?set CF_ACCOUNT_ID to your Cloudflare account id}"
if [ -z "${CF_BOOTSTRAP_TOKEN:-}" ]; then
  # Portable hidden prompt: `read -s` and `read -p` mean different things in bash and zsh.
  printf 'Bootstrap token (hidden): ' >&2
  if [ -t 0 ]; then stty -echo; trap 'stty echo' EXIT; fi
  read -r CF_BOOTSTRAP_TOKEN
  if [ -t 0 ]; then stty echo; trap - EXIT; fi
  echo >&2
fi

# The bootstrap token goes in a header read from stdin, not on the command line, so it is not visible in `ps`.
cf() {
  local method="$1" path="$2"; shift 2
  printf 'header = "Authorization: Bearer %s"\n' "$CF_BOOTSTRAP_TOKEN" |
    curl -sS --fail-with-body -K - -X "$method" "$API$path" -H "Content-Type: application/json" "$@"
}

# Check GitHub first. The new token's value is shown only once, so the secret must be certain to land.
echo "Checking GitHub access..." >&2
gh auth status >/dev/null 2>&1 || {
  echo "gh is not signed in. Run: gh auth login -p ssh -w   (or export GH_TOKEN)" >&2
  exit 1
}
# Creates the environment if it is missing and succeeds if it exists; it needs admin rights on the repository.
gh api -X PUT "repos/$REPO/environments/$ENVIRONMENT" --silent || {
  echo "cannot create or reach the \"$ENVIRONMENT\" environment of $REPO; gh needs admin access to the repository" >&2
  exit 1
}

echo "Looking up permission groups..." >&2
groups="$(cf GET "/accounts/$CF_ACCOUNT_ID/tokens/permission_groups?per_page=1000")"

# Names are cosmetic and can change, so they are looked up at run time and the script stops if one is missing.
group_id() {
  local id
  id="$(jq -r --arg n "$1" '[.result[] | select(.name == $n)][0].id // empty' <<<"$groups")"
  if [ -z "$id" ]; then
    echo "permission group \"$1\" not found. Groups that mention it:" >&2
    jq -r --arg n "${1%% *}" '.result[] | select(.name | contains($n)) | "  " + .name' <<<"$groups" >&2
    exit 1
  fi
  printf '%s' "$id"
}

if [ -n "$ZONE_NAME" ] && [ -z "$ZONE_ID" ]; then
  ZONE_ID="$(cf GET "/zones?name=$ZONE_NAME&account.id=$CF_ACCOUNT_ID" | jq -r '.result[0].id // empty')"
  [ -n "$ZONE_ID" ] || { echo "zone $ZONE_NAME not found (does the bootstrap token have Zone > Zone > Read? or pass --zone-id)" >&2; exit 1; }
fi

# Assigned first: a failure inside $(...) used as an argument would not stop the script.
scripts_id="$(group_id 'Workers Scripts Write')"
account_policy="$(jq -n --arg acct "$CF_ACCOUNT_ID" --arg id "$scripts_id" '{
  effect: "allow",
  resources: {("com.cloudflare.api.account." + $acct): "*"},
  permission_groups: [{id: $id, name: "Workers Scripts Write"}]
}')"
policies="[$account_policy]"
if [ -n "$ZONE_ID" ]; then
  routes_id="$(group_id 'Workers Routes Write')"
  dns_id="$(group_id 'DNS Write')"
  zone_policy="$(jq -n --arg zone "$ZONE_ID" --arg routes "$routes_id" --arg dns "$dns_id" '{
    effect: "allow",
    resources: {("com.cloudflare.api.account.zone." + $zone): "*"},
    permission_groups: [{id: $routes, name: "Workers Routes Write"}, {id: $dns, name: "DNS Write"}]
  }')"
  policies="[$account_policy, $zone_policy]"
fi

now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
expires="$(date -u -d "+$TTL_DAYS days" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v+"${TTL_DAYS}"d +%Y-%m-%dT%H:%M:%SZ)"
body="$(jq -n --arg name "$TOKEN_NAME" --argjson policies "$policies" --arg nb "$now" --arg exp "$expires" \
  '{name: $name, policies: $policies, not_before: $nb, expires_on: $exp}')"

if $DRY_RUN; then
  echo "Dry run: would create this token and set two secrets in $REPO ($ENVIRONMENT):" >&2
  jq . <<<"$body"
  exit 0
fi

echo "Creating the token (expires $expires)..." >&2
response="$(cf POST "/accounts/$CF_ACCOUNT_ID/tokens" --data "$body")"
jq -e '.success == true' >/dev/null <<<"$response" || { jq '.errors' <<<"$response" >&2; exit 1; }
token_id="$(jq -r '.result.id' <<<"$response")"

# The value goes from the response straight into gh's stdin. If storing it fails, delete the token again: its value
# cannot be read a second time, so an unstored token is only a loose end.
store() {
  jq -j '.result.value' <<<"$response" | gh secret set CLOUDFLARE_API_TOKEN --env "$ENVIRONMENT" --repo "$REPO" &&
    printf '%s' "$CF_ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID --env "$ENVIRONMENT" --repo "$REPO"
}
if ! store; then
  echo "Storing the secrets failed; deleting the token that was just created..." >&2
  cf DELETE "/accounts/$CF_ACCOUNT_ID/tokens/$token_id" >/dev/null || echo "could not delete it; delete token $token_id in the dashboard" >&2
  exit 1
fi

cat >&2 <<DONE

Done. Created token "$TOKEN_NAME" (id $token_id, expires $expires) and set CLOUDFLARE_API_TOKEN and
CLOUDFLARE_ACCOUNT_ID in the "$ENVIRONMENT" environment of $REPO.

Now delete the bootstrap token in the Cloudflare dashboard (My Profile or Manage Account > API Tokens).
To rotate this token later, run the script again and delete the old one by its id.
DONE

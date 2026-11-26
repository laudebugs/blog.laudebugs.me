# One task entry point. CI runs exactly these targets, so "green locally" means "green in CI".
# Swap the stubbed targets for your stack's commands (pnpm, cargo, uv, ...) when you start a project.

.PHONY: help check check-docs check-code fmt test todos doctor ci

help: ## List targets
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-12s %s\n", $$1, $$2}'

check: check-docs check-code ## Everything CI runs on a pull request

check-docs: ## Todo board consistency and doc index checks (no network, no build)
	node scripts/check-todos.mjs
	node scripts/check-doc-indexes.mjs

check-code: ## STUB until BL2: typecheck, lint, duplication and dead-code checks
	@echo "check-code: not configured yet. BL2 adds astro check, Biome and tsc (see docs/guidelines/maintainability.md)."

fmt: ## STUB: format the code
	@echo "fmt: not configured yet."

test: ## STUB: run the tests
	@echo "test: not configured yet."

todos: ## Print the todo board (derived, never committed)
	node scripts/check-todos.mjs --board

doctor: ## Check that required tools are installed
	@command -v git >/dev/null || (echo "missing: git" && exit 1)
	@command -v gh  >/dev/null || (echo "missing: gh (GitHub CLI)" && exit 1)
	@command -v node >/dev/null || (echo "missing: node (needed by scripts/)" && exit 1)
	@command -v pnpm >/dev/null || (echo "missing: pnpm (the blog uses pnpm)" && exit 1)
	@echo "ok"

ci: check test ## The whole fast lane locally

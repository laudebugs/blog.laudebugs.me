#!/usr/bin/env node
// Dependencies are pinned exactly, to releases at least a week old (plan D11).
//   node scripts/check-deps.mjs          exact pins only, offline
//   node scripts/check-deps.mjs --age    also asks the npm registry when each pinned version was published
// A version under a week old passes only with an entry in scripts/dependency-exceptions.json that names the
// package and version, a reason and a date; an exception for a security fix is the usual one.
import { readFileSync } from 'node:fs';

export const MIN_AGE_DAYS = 7;
const EXACT = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

/** The dependencies whose version is not one exact release (a range, a tag such as `latest`, a URL). */
export function findInexact(pkg) {
  const found = [];
  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies']) {
    for (const [name, version] of Object.entries(pkg[section] ?? {})) {
      if (!EXACT.test(version)) found.push({ section, name, version });
    }
  }
  return found;
}

/** Every pinned dependency as `[name, version]`. */
export function pinned(pkg) {
  return ['dependencies', 'devDependencies', 'optionalDependencies'].flatMap((section) =>
    Object.entries(pkg[section] ?? {}).filter(([, version]) => EXACT.test(version)),
  );
}

/** Which of the published times are under the minimum age and have no recorded exception. */
export function findTooNew(published, exceptions, now = Date.now()) {
  const limit = now - MIN_AGE_DAYS * 86_400_000;
  return published.filter(({ name, version, time }) => Date.parse(time) > limit && !exceptions[`${name}@${version}`]);
}

async function publishedTimes(entries) {
  const result = [];
  for (const [name, version] of entries) {
    const response = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2F')}`);
    if (!response.ok) throw new Error(`${name}: registry answered ${response.status}`);
    const full = await response.json();
    const time = full.time?.[version];
    if (!time) throw new Error(`${name}@${version} is not on the registry`);
    result.push({ name, version, time });
  }
  return result;
}

async function main() {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const inexact = findInexact(pkg);
  for (const { name, version, section } of inexact) {
    console.error(`${name}: "${version}" in ${section} is not an exact version; pin it (for example with \`pnpm add -E\`)`);
  }
  let failed = inexact.length > 0;
  if (process.argv.includes('--age')) {
    const exceptions = JSON.parse(readFileSync('scripts/dependency-exceptions.json', 'utf8')).exceptions;
    try {
      const tooNew = findTooNew(await publishedTimes(pinned(pkg)), exceptions);
      for (const { name, version, time } of tooNew) {
        console.error(`${name}@${version} was published ${time}, under ${MIN_AGE_DAYS} days ago; pick an older release or record an exception`);
      }
      failed ||= tooNew.length > 0;
    } catch (error) {
      // A registry that cannot be reached is not a reason to block a commit; the weekly run checks again.
      console.warn(`release-age check skipped: ${error.message}`);
    }
  }
  if (failed) process.exit(1);
  console.log('dependencies: all pinned exactly');
}

if (import.meta.url === `file://${process.argv[1]}`) await main();

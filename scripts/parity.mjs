#!/usr/bin/env node
// Compares a deployed copy of the new site with what the old site served, so no old link breaks at the cutover.
//   node scripts/parity.mjs https://blog-laudebugs-me.<account>.workers.dev
// Checks every old post address, the feed, the sitemap, llms.txt, the index file and the cover images, and exits 1
// with a list of what failed. It only reads: it makes GET requests to the address it is given.
import { readdirSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const FILES = ['/', '/archive', '/topics', '/rss.xml', '/sitemap-index.xml', '/llms.txt', '/llms-full.txt', '/assets/posts-index.json'];

/** The paths a visitor or a feed reader could hold from the old site. */
export function expectedPaths(addresses, covers) {
  return [...FILES, ...addresses, ...addresses.map((address) => `${address}.md`), ...covers.map((name) => `/assets/post-covers/${name}`)];
}

/** A path passes when it answers 200, or a redirect that ends in 200. */
export async function check(base, path, fetchImpl = fetch) {
  try {
    const response = await fetchImpl(new URL(path, base), { redirect: 'follow' });
    return response.status === 200 ? null : `${path}: ${response.status}`;
  } catch (error) {
    return `${path}: ${error.message}`;
  }
}

async function main() {
  const base = process.argv[2];
  if (!base?.startsWith('http')) {
    console.error('usage: node scripts/parity.mjs <the deployed address, such as https://blog-laudebugs-me.example.workers.dev>');
    process.exit(2);
  }
  const addresses = readFileSync('fixtures/addresses.txt', 'utf8').split('\n').filter(Boolean);
  const covers = readdirSync('public/assets/post-covers').filter((name) => /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(name));
  const paths = expectedPaths(addresses, covers);
  const failures = (await Promise.all(paths.map((path) => check(base, path)))).filter(Boolean);
  // The index file is what laudebugs.me reads, so its shape matters as much as its presence.
  try {
    const response = await fetch(new URL('/assets/posts-index.json', base), { headers: { Origin: 'https://laudebugs.me' } });
    const index = await response.json();
    if (index.version !== 1 || index.posts?.length !== addresses.length) failures.push('/assets/posts-index.json: wrong shape or post count');
    // Without this header a browser on laudebugs.me refuses to read the file and its post list stays empty.
    if (!response.headers.get('access-control-allow-origin')) failures.push('/assets/posts-index.json: no Access-Control-Allow-Origin header');
  } catch (error) {
    failures.push(`/assets/posts-index.json: ${error.message}`);
  }
  for (const failure of failures) console.error(failure);
  console.log(`${paths.length - failures.length} of ${paths.length} paths ok on ${base}`);
  if (failures.length > 0) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

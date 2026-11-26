import { rmSync } from 'node:fs';
import type { TestProject } from 'vitest/node';
import { buildSite } from './helpers/build';

declare module 'vitest' {
  export interface ProvidedContext {
    siteDir: string;
  }
}

// One real build for every test file, so they never write to Astro's temporary folder at the same time.
export default function setup(project: TestProject) {
  const siteDir = buildSite();
  project.provide('siteDir', siteDir);
  return () => rmSync(siteDir, { recursive: true, force: true });
}

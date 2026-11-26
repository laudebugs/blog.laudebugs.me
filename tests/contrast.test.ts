import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The code colours come from the design tokens, so they are checked from tokens.css: every colour a code block
// uses must be readable (4.5:1) on the glass it sits on, in both themes. Dimmed focus lines are left out on purpose.
const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

function block(selector: RegExp): Record<string, string> {
  const start = css.search(selector);
  if (start < 0) throw new Error(`no block for ${selector}`);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  return Object.fromEntries([...body.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((match) => [match[1], match[2]]));
}

const light = block(/^:root \{/m);
const dark = { ...light, ...block(/^:root\[data-theme=['"]dark['"]\] \{/m) };

type Rgb = [number, number, number];
const rgb = (hex: string): Rgb => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)) as Rgb;
const mix = (top: Rgb, bottom: Rgb, amount: number): Rgb =>
  top.map((value, i) => value * amount + bottom[i] * (1 - amount)) as Rgb;
const channel = (value: number) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: Rgb) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe.each([
  ['light', light],
  ['dark', dark],
])('code colours in the %s theme', (_name, tokens) => {
  const panel = rgb(tokens.panel);
  const glass = mix(rgb(tokens['tone-a']), panel, 0.55);
  const colours: Record<string, Rgb> = {
    text: rgb(tokens.ink),
    // These formulas are the ones in code.css (color-mix with the ink colour); keep the two in step.
    keyword: mix(rgb(tokens.ink), rgb(tokens['tone-a-ink']), 0.08),
    string: mix(rgb(tokens.ink), rgb(tokens['tone-c-ink']), 0.15),
    function: mix(rgb(tokens.ink), rgb(tokens['tone-d-ink']), 0.15),
    constant: mix(rgb(tokens.ink), rgb(tokens['tone-b-ink']), 0.2),
    punctuation: mix(rgb(tokens.ink), panel, 0.75),
    comment: mix(rgb(tokens.ink), panel, 0.7),
    label: rgb(tokens['tone-a-ink']),
  };

  it.each(Object.keys(colours))('%s is readable on the glass', (kind) => {
    expect(contrast(colours[kind], glass)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['text', 'keyword', 'string', 'function', 'constant'])('%s is readable on a highlighted line', (kind) => {
    expect(contrast(colours[kind], rgb(tokens.mark))).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['an added line', 'tone-c', 0.7],
    ['a removed line', 'tone-b', 0.55],
  ])('text is readable on %s', (_label, tone, amount) => {
    const line = mix(rgb(tokens[tone as string]), glass, amount as number);
    expect(contrast(colours.text, line)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colours.keyword, line)).toBeGreaterThanOrEqual(4.5);
  });

  it('error text is readable on the error band', () => {
    const band = mix(rgb(tokens['tone-b']), panel, 0.55);
    expect(contrast(mix(rgb(tokens.ink), rgb(tokens['tone-b-ink']), 0.12), band)).toBeGreaterThanOrEqual(4.5);
  });
});

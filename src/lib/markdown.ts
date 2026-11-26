/** A plain Markdown copy of a post, for `<post>.md`, `llms-full.txt` and anything that reads the post as text. */

const CALLOUT_LABELS: Record<string, string> = {
  note: 'Note',
  info: 'Note',
  tip: 'Tip',
  warning: 'Warning',
  danger: 'Warning',
};
const EMBEDS = /^<(StackBlitzEmbed|CodeSandBox|SpotifyTrack)\b/;

export function postMarkdown(body: string): string {
  const out: string[] = [];
  const lines = body.split('\n');
  let inFence = false;
  let quote: string | null = null; // the label of the callout being copied, until it closes

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^```/.test(line)) {
      inFence = !inFence;
      out.push(inFence ? line.replace(/\s+twoslash\b.*$/, '') : line);
      continue;
    }
    if (inFence) {
      if (/^\s*\/\/ @(noErrors|ts-\w+|showEmit)\b/.test(line)) continue;
      out.push(line.replace(/\s*\/\/ \[!code [^\]]*\]\s*$/, ''));
      continue;
    }

    if (/^import \w|^import \{/.test(line)) continue;

    const callout = line.match(/^<Callout\s+type=["'](\w+)["']\s*>\s*$/);
    const directive = line.match(/^:::(\w+)\s*$/);
    const name = callout?.[1] ?? directive?.[1];
    if (name !== undefined && (callout || name in CALLOUT_LABELS)) {
      quote = CALLOUT_LABELS[name] ?? 'Note';
      out.push(`> **${quote}**`, '>');
      continue;
    }
    if (quote !== null && (line.trim() === '</Callout>' || line.trim() === ':::')) {
      quote = null;
      continue;
    }
    if (quote !== null) {
      out.push(line.trim() === '' ? '>' : `> ${line}`);
      continue;
    }

    if (EMBEDS.test(line)) {
      while (!lines[i].includes('/>') && i < lines.length - 1) i++;
      out.push('_An interactive example is on the web version of this post._');
      continue;
    }

    out.push(line);
  }
  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

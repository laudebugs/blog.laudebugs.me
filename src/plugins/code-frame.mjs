// Wraps every code block in the design's frame: a label (the title, or the language), a Copy button, then the code.
// Where Shiki's notation transformers cannot read a comment (HTML, JSON, shell and plain text have no `//` comments),
// it handles `// [!code focus]`, `// [!code highlight]`, `// [!code ++]` and `// [!code --]` at the end of a line itself.
// In HTML it also turns `// @error: message` lines into the error band the old blog showed under a line.
// TypeScript, JavaScript and SCSS get all of this from the transformers and twoslash.

const TITLE = /title=(?:"([^"]*)"|'([^']*)'|(\S+))/;
const ERROR_LINE = /^\s*\/\/ @error:\s*(.*)$/;
const MARK = /\s*\/\/ \[!code (focus|highlight|\+\+|--)\]\s*$/;
// The posts write plain text three ways; the label should not.
const LANGUAGE_LABELS = { txt: 'text', plaintext: 'text', text: 'text' };
const HANDLED_BY_SHIKI = new Set(['ts', 'tsx', 'js', 'jsx', 'scss', 'css']);

export function codeFrame() {
  return {
    name: 'blog-code-frame',
    preprocess(code, options) {
      if (HANDLED_BY_SHIKI.has(options.lang)) return undefined;
      const marks = new Map();
      this.meta.blogMarks = marks;
      return code
        .split('\n')
        .map((text, index) => {
          const found = text.match(MARK);
          if (found) marks.set(index + 1, found[1]);
          return found ? text.replace(MARK, '') : text;
        })
        .join('\n');
    },
    pre(node) {
      const kinds = [...(this.meta.blogMarks?.values() ?? [])];
      if (kinds.includes('focus')) this.addClassToHast(node, 'has-focused');
      if (kinds.includes('++') || kinds.includes('--')) this.addClassToHast(node, 'has-diff');
    },
    line(node, line) {
      const mark = this.meta.blogMarks?.get(line);
      if (mark === 'focus') this.addClassToHast(node, 'focused');
      if (mark === 'highlight') this.addClassToHast(node, 'highlighted');
      if (mark === '++') this.addClassToHast(node, ['diff', 'add']);
      if (mark === '--') this.addClassToHast(node, ['diff', 'remove']);
      if (this.options.lang !== 'html') return;
      const match = (this.source.split('\n')[line - 1] ?? '').match(ERROR_LINE);
      if (!match) return;
      this.addClassToHast(node, 'error-band');
      node.children = [{ type: 'text', value: match[1] }];
    },
    root(root) {
      const pre = root.children.find((child) => child.type === 'element' && child.tagName === 'pre');
      if (!pre) return;
      const found = (this.options.meta?.__raw ?? '').match(TITLE);
      const lang = this.options.lang;
      const label = found ? (found[1] ?? found[2] ?? found[3]) : (LANGUAGE_LABELS[lang] ?? lang);
      root.children = [
        {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-frame'] },
          children: [
            {
              type: 'element',
              tagName: 'div',
              properties: { className: ['code-head', 'mono'] },
              children: [
                {
                  type: 'element',
                  tagName: 'span',
                  properties: { className: ['code-label'] },
                  children: [{ type: 'text', value: label }],
                },
                {
                  type: 'element',
                  tagName: 'button',
                  properties: { type: 'button', className: ['code-copy'], hidden: true, 'data-copy': '' },
                  children: [{ type: 'text', value: 'Copy' }],
                },
              ],
            },
            pre,
          ],
        },
      ];
    },
  };
}

import { visit } from 'unist-util-visit';

// Turns Vocs's `:::tip` ... `:::` blocks (remark-directive) into the same markup as the Callout component.
const TONES = { note: 'note', info: 'note', tip: 'tip', warning: 'warning', danger: 'warning', caution: 'warning' };
const LABELS = { note: 'Note', info: 'Note', tip: 'Tip', warning: 'Warning', danger: 'Warning', caution: 'Warning' };

export function remarkCallouts() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'containerDirective' || !(node.name in TONES)) return;
      node.data = { hName: 'aside', hProperties: { className: ['callout', `callout-${TONES[node.name]}`] } };
      node.children.unshift({
        type: 'paragraph',
        data: { hName: 'p', hProperties: { className: ['callout-label'] } },
        children: [{ type: 'text', value: LABELS[node.name] }],
      });
    });
  };
}

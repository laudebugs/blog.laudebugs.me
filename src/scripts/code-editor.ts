/**
 * The editor behind a live example's Edit button: line numbers and syntax colours that match the code blocks.
 *
 * It is imported only when Edit is pressed, so a post that is only read does not download CodeMirror.
 */
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { bracketMatching, HighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { drawSelection, EditorView, keymap, lineNumbers } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

/** The same --code-token-* colours as the code blocks, so editing does not change how the code looks. */
const highlight = HighlightStyle.define([
  {
    tag: [t.keyword, t.modifier, t.controlKeyword, t.operatorKeyword, t.definitionKeyword, t.moduleKeyword],
    color: 'var(--code-token-keyword)',
  },
  { tag: [t.string, t.special(t.string), t.regexp], color: 'var(--code-token-string)' },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))],
    color: 'var(--code-token-function)',
  },
  {
    tag: [t.number, t.bool, t.null, t.atom, t.typeName, t.className, t.standard(t.variableName)],
    color: 'var(--code-token-constant)',
  },
  { tag: [t.comment, t.lineComment, t.blockComment], color: 'var(--code-token-comment)' },
  { tag: [t.punctuation, t.bracket, t.separator, t.operator, t.derefOperator], color: 'var(--code-token-punctuation)' },
]);

const theme = EditorView.theme({
  '&': { color: 'var(--ink)', backgroundColor: 'transparent', fontSize: '0.86rem' },
  '&.cm-focused': { outline: '3px solid var(--accent)', outlineOffset: '-3px' },
  '.cm-scroller': { fontFamily: 'var(--font-code)', lineHeight: '1.65', minHeight: '190px', overflow: 'auto' },
  '.cm-content': { padding: '14px 0', caretColor: 'var(--ink)' },
  '.cm-line': { padding: '0 18px 0 8px' },
  '.cm-cursor': { borderLeftColor: 'var(--ink)' },
  '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--dim)', border: 'none' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 4px 0 18px', minWidth: '2.4em' },
  '.cm-selectionBackground, &.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'var(--mark)',
  },
  '.cm-matchingBracket': { backgroundColor: 'var(--mark)', outline: 'none' },
});

export interface CodeEditor {
  value(): string;
  focus(): void;
}

interface Options {
  label: string;
  onChange(): void;
  /** Called on Escape, which lets a keyboard user leave the editor, since Tab indents inside it. */
  onEscape(): void;
}

export function mountEditor(parent: HTMLElement, doc: string, { label, onChange, onEscape }: Options): CodeEditor {
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc,
      extensions: [
        lineNumbers(),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        javascript({ typescript: true }),
        syntaxHighlighting(highlight),
        theme,
        keymap.of([
          {
            key: 'Escape',
            run: () => {
              onEscape();
              return true;
            },
          },
          indentWithTab,
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        EditorView.contentAttributes.of({ 'aria-label': label, spellcheck: 'false' }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChange();
        }),
      ],
    }),
  });
  return { value: () => view.state.doc.toString(), focus: () => view.focus() };
}

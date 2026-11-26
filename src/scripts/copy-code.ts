/** Shows each code block's Copy button and makes it copy the block's code, without the type popovers and error bands. */
export function initCodeCopy(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    button.hidden = false;
    button.addEventListener('click', () => {
      const code = button.closest('.code-frame')?.querySelector('code');
      if (!code) return;
      void copyText(codeText(code)).then((ok) => {
        const label = button.textContent;
        button.textContent = ok ? 'Copied' : 'Press Ctrl+C';
        if (!ok) selectContents(code);
        setTimeout(() => {
          button.textContent = label;
        }, 1600);
      });
    });
  }
}

/** The code as written: the lines of the block, without the popups, completions and error bands twoslash adds. */
export function codeText(code: Element): string {
  const copy = code.cloneNode(true) as Element;
  for (const extra of copy.querySelectorAll(
    '.twoslash-popup-container, .twoslash-completion-list, .error-band, .twoslash-meta-line, .twoslash-tag-line',
  )) {
    extra.remove();
  }
  return (copy.textContent ?? '').replace(/\n+$/, '');
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function selectContents(code: Element): void {
  const range = document.createRange();
  range.selectNodeContents(code);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

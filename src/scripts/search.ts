// Search over the built site with Pagefind. The index is a static folder (/pagefind) made by `pnpm site:build`, so
// nothing the reader types leaves the page, and it is loaded only when the dialog is first opened.

interface PagefindResult {
  data(): Promise<{
    url: string;
    excerpt: string;
    meta: { title?: string; published?: string };
    filters?: { tag?: string[] };
  }>;
}
interface Pagefind {
  init(): Promise<void>;
  debouncedSearch(query: string, options?: object, wait?: number): Promise<{ results: PagefindResult[] } | null>;
}

const MAX_RESULTS = 8;

/** The next highlighted row when an arrow key is pressed, wrapping at both ends. */
export function moveIndex(current: number, delta: number, length: number): number {
  if (length === 0) return -1;
  if (current < 0) return delta > 0 ? 0 : length - 1;
  return (current + delta + length) % length;
}

let pagefind: Promise<Pagefind> | undefined;
function loadPagefind(): Promise<Pagefind> {
  pagefind ??= (async () => {
    const url = '/pagefind/pagefind.js';
    const module = (await import(/* @vite-ignore */ url)) as Pagefind;
    await module.init();
    return module;
  })();
  return pagefind;
}

export function initSearch(root: ParentNode = document) {
  const dialog = root.querySelector<HTMLDialogElement>('dialog[data-search]');
  if (!dialog || dialog.dataset.ready) return;
  dialog.dataset.ready = 'true';
  // SearchDialog.astro always renders these three, so they are not optional.
  const input = dialog.querySelector('[data-search-input]') as HTMLInputElement;
  const list = dialog.querySelector('[data-search-results]') as HTMLElement;
  const status = dialog.querySelector('[data-search-status]') as HTMLElement;
  let active = -1;

  const rows = () => [...list.querySelectorAll<HTMLElement>('[role="option"]')];
  const highlight = (index: number) => {
    active = index;
    rows().forEach((row, i) => {
      row.setAttribute('aria-selected', String(i === index));
    });
    const row = rows()[index];
    if (row) {
      input.setAttribute('aria-activedescendant', row.id);
      row.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const setStatus = (text: string, empty = false) => {
    status.textContent = text;
    status.dataset.empty = String(empty);
  };

  async function run(query: string) {
    list.replaceChildren();
    highlight(-1);
    input.setAttribute('aria-expanded', 'false');
    if (!query.trim()) return setStatus('Type to search the posts.');
    let found: Awaited<ReturnType<Pagefind['debouncedSearch']>>;
    try {
      found = await (await loadPagefind()).debouncedSearch(query, {}, 120);
    } catch {
      return setStatus('Search needs the built site; it is not available here.', true);
    }
    if (found === null) return; // a newer keystroke replaced this search
    const data = await Promise.all(found.results.slice(0, MAX_RESULTS).map((result) => result.data()));
    if (input.value !== query) return;
    if (data.length === 0) {
      status.replaceChildren();
      status.dataset.empty = 'true';
      status.append(`No posts match "${query}". Try the `);
      const archive = document.createElement('a');
      archive.href = '/archive';
      archive.textContent = 'archive';
      status.append(archive, '.');
      return;
    }
    data.forEach((item, index) => {
      const row = document.createElement('li');
      row.id = `search-result-${index}`;
      row.setAttribute('role', 'option');
      row.dataset.url = item.url;
      const title = document.createElement('b');
      title.textContent = item.meta.title ?? item.url;
      const excerpt = document.createElement('p');
      // Pagefind marks the matches with <mark>; the text itself comes from our own pages.
      excerpt.innerHTML = item.excerpt;
      const tags = item.filters?.tag?.join(', ');
      const meta = document.createElement('small');
      meta.className = 'mono';
      meta.textContent = [item.meta.published, tags].filter(Boolean).join(' · ');
      row.append(title, meta, excerpt);
      row.addEventListener('click', () => {
        location.href = item.url;
      });
      list.append(row);
    });
    input.setAttribute('aria-expanded', 'true');
    setStatus(`${data.length} ${data.length === 1 ? 'result' : 'results'} · ↑↓ to move · enter to open`);
    highlight(0);
  }

  const open = () => {
    if (!dialog.open) dialog.showModal();
    input.select();
    void run(input.value);
  };

  for (const trigger of root.querySelectorAll<HTMLElement>('[data-search-open]')) {
    trigger.hidden = false;
    trigger.addEventListener('click', open);
  }
  document.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement | null;
    const typing = target?.matches('input, textarea, select, [contenteditable="true"]');
    if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      open();
    }
  });
  input.addEventListener('input', () => void run(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      highlight(moveIndex(active, event.key === 'ArrowDown' ? 1 : -1, rows().length));
    } else if (event.key === 'Enter') {
      // The input sits in a form that closes the dialog; opening the result is what Enter should do.
      event.preventDefault();
      const url = rows()[active]?.dataset.url;
      if (url) location.href = url;
    }
  });
  // A click on the backdrop is a click on the dialog itself, outside its content.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

// The search dialog: opens with / or the header button, searches with Pagefind and opens a result with Enter. The
// Ask mode, when the browser has a built-in model, answers a question with the read-only agent in src/agent.
import { runAgent, SYSTEM_PROMPT } from '../agent/loop';
import { type ModelSession, promptApiProvider } from '../agent/model';
import { siteTools } from '../agent/tools';
import { searchPosts } from './pagefind';

const MAX_RESULTS = 8;

/** The next highlighted row when an arrow key is pressed, wrapping at both ends. */
export function moveIndex(current: number, delta: number, length: number): number {
  if (length === 0) return -1;
  if (current < 0) return delta > 0 ? 0 : length - 1;
  return (current + delta + length) % length;
}

interface Row {
  url: string;
  title: string;
  meta: string;
  /** Excerpt HTML from Pagefind (our own pages, matches in <mark>). */
  excerptHtml?: string;
  /** Plain text, such as the agent's reason. */
  text?: string;
}

export function initSearch(root: ParentNode = document) {
  const dialog = root.querySelector<HTMLDialogElement>('dialog[data-search]');
  if (!dialog || dialog.dataset.ready) return;
  dialog.dataset.ready = 'true';
  // SearchDialog.astro always renders these, so they are not optional.
  const input = dialog.querySelector('[data-search-input]') as HTMLInputElement;
  const list = dialog.querySelector('[data-search-results]') as HTMLElement;
  const status = dialog.querySelector('[data-search-status]') as HTMLElement;
  const askToggle = dialog.querySelector('[data-ask-toggle]') as HTMLButtonElement;
  const consent = dialog.querySelector('[data-ask-consent]') as HTMLElement;
  const consentButton = dialog.querySelector('[data-ask-download]') as HTMLButtonElement;
  const progress = dialog.querySelector('[data-ask-progress]') as HTMLProgressElement;
  let active = -1;
  let asking = false;
  let session: ModelSession | undefined;
  let controller: AbortController | undefined;

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

  function clear() {
    list.replaceChildren();
    highlight(-1);
    input.setAttribute('aria-expanded', 'false');
  }

  function show(items: Row[], summary: string) {
    items.forEach((item, index) => {
      const row = document.createElement('li');
      row.id = `search-result-${index}`;
      row.setAttribute('role', 'option');
      row.dataset.url = item.url;
      const title = document.createElement('b');
      title.textContent = item.title;
      const meta = document.createElement('small');
      meta.className = 'mono';
      meta.textContent = item.meta;
      const body = document.createElement('p');
      if (item.excerptHtml !== undefined) body.innerHTML = item.excerptHtml;
      else body.textContent = item.text ?? '';
      row.append(title, meta, body);
      row.addEventListener('click', () => {
        location.href = item.url;
      });
      list.append(row);
    });
    input.setAttribute('aria-expanded', 'true');
    setStatus(summary);
    highlight(0);
  }

  function noResults(query: string) {
    status.replaceChildren();
    status.dataset.empty = 'true';
    status.append(`No posts match "${query}". Try the `);
    const archive = document.createElement('a');
    archive.href = '/archive';
    archive.textContent = 'archive';
    status.append(archive, '.');
  }

  async function run(query: string, note = '') {
    clear();
    if (!query.trim()) return setStatus(asking ? 'Ask a question about the posts.' : 'Type to search the posts.');
    let hits: Awaited<ReturnType<typeof searchPosts>>;
    try {
      hits = await searchPosts(query, MAX_RESULTS, 120);
    } catch {
      return setStatus('Search needs the built site; it is not available here.', true);
    }
    if (hits === null || input.value !== query) return; // a newer keystroke replaced this search
    if (hits.length === 0) return noResults(query);
    show(
      hits.map((hit) => ({
        url: hit.url,
        title: hit.title,
        meta: [hit.published, hit.tags.join(', ')].filter(Boolean).join(' · '),
        excerptHtml: hit.excerpt,
      })),
      `${note}${hits.length} ${hits.length === 1 ? 'result' : 'results'} · ↑↓ to move · enter to open`,
    );
  }

  async function ask(question: string) {
    if (!question.trim() || !session) return;
    clear();
    controller?.abort();
    controller = new AbortController();
    setStatus('Thinking…');
    const result = await runAgent(question, session, siteTools, { signal: controller.signal });
    if (input.value !== question) return;
    if (!result.ok) {
      // The model could not give a grounded answer, so the reader still gets the ordinary results.
      return run(question, 'Ask had no answer, so these are the usual results. ');
    }
    show(
      result.picks.map((pick) => ({ url: pick.url, title: pick.title, meta: 'suggested', text: pick.why })),
      `${result.picks.length} suggested · ↑↓ to move · enter to open`,
    );
  }

  async function startSession(): Promise<boolean> {
    if (session) return true;
    try {
      session = await promptApiProvider.create(SYSTEM_PROMPT, (fraction) => {
        progress.hidden = false;
        progress.value = fraction;
      });
      return true;
    } catch {
      setStatus('Ask could not start, so search works as usual.', true);
      setAsking(false);
      return false;
    } finally {
      progress.hidden = true;
    }
  }

  function setAsking(on: boolean) {
    asking = on;
    askToggle.setAttribute('aria-pressed', String(on));
    input.placeholder = on ? 'Ask a question about the posts' : 'Search the posts';
    input.setAttribute('aria-label', input.placeholder);
    clear();
    setStatus(on ? 'Ask a question about the posts, then press enter.' : 'Type to search the posts.');
  }

  // The Ask toggle appears only when the browser has the built-in model API and can use it.
  void promptApiProvider.availability().then((availability) => {
    if (availability === 'unavailable') return;
    askToggle.hidden = false;
    askToggle.addEventListener('click', async () => {
      if (asking) return setAsking(false);
      const state = await promptApiProvider.availability();
      setAsking(true);
      if (state === 'available') await startSession();
      else if (state !== 'unavailable') consent.hidden = false;
    });
    consentButton.addEventListener('click', async () => {
      consentButton.disabled = true;
      if (await startSession()) consent.hidden = true;
      consentButton.disabled = false;
    });
  });

  const open = () => {
    if (!dialog.open) dialog.showModal();
    input.select();
    if (!asking) void run(input.value);
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
  input.addEventListener('input', () => {
    if (asking) {
      controller?.abort();
      clear();
    } else void run(input.value);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      highlight(moveIndex(active, event.key === 'ArrowDown' ? 1 : -1, rows().length));
    } else if (event.key === 'Enter') {
      // The input sits in a form that closes the dialog; Enter should open a result or ask.
      event.preventDefault();
      const url = rows()[active]?.dataset.url;
      if (url) location.href = url;
      else if (asking) void ask(input.value);
    }
  });
  dialog.addEventListener('close', () => controller?.abort());
  // A click on the backdrop is a click on the dialog itself, outside its content.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

import { runInWorker, type WorkerLike } from '../runner/run';

// The worker only ever posts a RunResult, which WorkerLike says; the DOM's Worker types its messages as `any`.
const createWorker = () =>
  new Worker(new URL('../runner/worker.ts', import.meta.url), { type: 'module' }) as unknown as WorkerLike;

export function initExamples(root: ParentNode = document) {
  for (const box of root.querySelectorAll<HTMLElement>('[data-example]')) {
    if (box.dataset.ready) continue;
    box.dataset.ready = 'true';
    const view = box.querySelector<HTMLElement>('[data-view]');
    const editor = box.querySelector<HTMLTextAreaElement>('[data-editor]');
    const out = box.querySelector<HTMLElement>('[data-out]');
    const edit = box.querySelector<HTMLButtonElement>('[data-edit]');
    const run = box.querySelector<HTMLButtonElement>('[data-run]');
    const note = box.querySelector<HTMLElement>('[data-note]');
    if (!view || !editor || !out || !edit || !run) continue;
    const recorded = out.textContent ?? '';
    edit.hidden = false;
    if (note) note.hidden = false;
    edit.addEventListener('click', () => {
      view.hidden = true;
      editor.hidden = false;
      edit.hidden = true;
      run.hidden = false;
      editor.focus();
    });
    run.addEventListener('click', async () => {
      run.disabled = true;
      out.textContent = 'Running…';
      const result = await runInWorker(editor.value, createWorker);
      out.textContent = result.output || (result.ok ? '(no output)' : '');
      out.dataset.state = result.ok ? 'ok' : 'error';
      run.disabled = false;
    });
    editor.addEventListener('input', () => {
      out.dataset.state = '';
      if (out.textContent === recorded) out.dataset.state = 'recorded';
    });
  }
}

import { runInWorker, type WorkerLike } from '../runner/run';
import type { CodeEditor } from './code-editor';

// The worker only ever posts a RunResult, which WorkerLike says; the DOM's Worker types its messages as `any`.
const createWorker = () =>
  new Worker(new URL('../runner/worker.ts', import.meta.url), { type: 'module' }) as unknown as WorkerLike;

export function initExamples(root: ParentNode = document) {
  for (const box of root.querySelectorAll<HTMLElement>('[data-example]')) {
    if (box.dataset.ready) continue;
    box.dataset.ready = 'true';
    const view = box.querySelector<HTMLElement>('[data-view]');
    const source = box.querySelector<HTMLTextAreaElement>('[data-source]');
    const mount = box.querySelector<HTMLElement>('[data-editor]');
    const out = box.querySelector<HTMLElement>('[data-out]');
    const edit = box.querySelector<HTMLButtonElement>('[data-edit]');
    const run = box.querySelector<HTMLButtonElement>('[data-run]');
    const note = box.querySelector<HTMLElement>('[data-note]');
    if (!view || !source || !mount || !out || !edit || !run) continue;
    const recorded = out.textContent ?? '';
    let editor: CodeEditor | undefined;
    edit.hidden = false;
    run.hidden = false;
    if (note) note.hidden = false;
    // Edit and Run are separate: Run works on the code as shown, and Edit swaps the code for an editor.
    edit.addEventListener('click', async () => {
      edit.disabled = true;
      // The editor is a separate chunk, loaded now so that reading a post does not fetch it.
      const { mountEditor } = await import('./code-editor');
      view.hidden = true;
      mount.hidden = false;
      editor = mountEditor(mount, source.value.trimEnd(), {
        label: mount.dataset.label ?? 'Editable code',
        onChange: () => {
          out.dataset.state = out.textContent === recorded ? 'recorded' : '';
        },
        onEscape: () => run.focus(),
      });
      edit.hidden = true;
      editor.focus();
    });
    run.addEventListener('click', async () => {
      run.disabled = true;
      out.textContent = 'Running…';
      const result = await runInWorker(editor?.value() ?? source.value, createWorker);
      out.textContent = result.output || (result.ok ? '(no output)' : '');
      out.dataset.state = result.ok ? 'ok' : 'error';
      run.disabled = false;
    });
  }
}

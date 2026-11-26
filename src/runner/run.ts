import type { RunResult } from './execute';

/** The part of a Worker the runner uses, so a test can pass a fake. */
export interface WorkerLike {
  onmessage: ((event: { data: RunResult }) => void) | null;
  onerror: ((event: { message?: string }) => void) | null;
  postMessage(message: { source: string }): void;
  terminate(): void;
}

export const TIME_LIMIT_MS = 30_000;

/** Runs the source in a fresh worker and stops it after the time limit, so a runaway loop cannot freeze the page. */
export function runInWorker(
  source: string,
  createWorker: () => WorkerLike,
  limitMs = TIME_LIMIT_MS,
): Promise<RunResult> {
  return new Promise((resolve) => {
    const worker = createWorker();
    const finish = (result: RunResult) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    };
    const timer = setTimeout(
      () => finish({ ok: false, output: `Stopped: the code ran for more than ${Math.round(limitMs / 1000)} seconds.` }),
      limitMs,
    );
    worker.onmessage = (event) => finish(event.data);
    worker.onerror = (event) => finish({ ok: false, output: `Error: ${event.message ?? 'the worker failed'}` });
    worker.postMessage({ source });
  });
}

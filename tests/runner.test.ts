import { afterEach, describe, expect, it, vi } from 'vitest';
import { execute } from '../src/runner/execute';
import { formatArg, formatLine } from '../src/runner/format';
import { runInWorker, type WorkerLike } from '../src/runner/run';

describe('formatting', () => {
  it('prints strings as they are and other values as JSON', () => {
    expect(formatArg('a')).toBe('a');
    expect(formatArg(undefined)).toBe('undefined');
    expect(formatArg({ a: 1 })).toBe('{\n  "a": 1\n}');
    expect(formatArg(new TypeError('no'))).toBe('TypeError: no');
    expect(formatLine(['n:', 3])).toBe('n: 3');
  });
});

describe('execute', () => {
  it('strips types and collects console output', async () => {
    const result = await execute('const n: number = 2;\nconsole.log("n", n * 2);');
    expect(result).toEqual({ ok: true, output: 'n 4' });
  });

  it('shows the message when the code throws', async () => {
    const result = await execute('console.log("a");\nthrow new Error("boom");');
    expect(result.ok).toBe(false);
    expect(result.output).toBe('a\nError: boom');
  });

  it('shows a syntax error instead of throwing', async () => {
    const result = await execute('const = ;');
    expect(result.ok).toBe(false);
    expect(result.output).not.toBe('');
  });

  it('refuses imports with a clear message', async () => {
    const result = await execute("import fs from 'node:fs';");
    expect(result.ok).toBe(false);
    expect(result.output).toContain('imports and exports are not available');
  });
});

class FakeWorker implements WorkerLike {
  onmessage: WorkerLike['onmessage'] = null;
  onerror: WorkerLike['onerror'] = null;
  terminated = false;
  constructor(private readonly reply?: () => void) {}
  postMessage() {
    this.reply?.();
  }
  terminate() {
    this.terminated = true;
  }
}

describe('runInWorker', () => {
  afterEach(() => vi.useRealTimers());

  it('returns the worker result and ends the worker', async () => {
    const worker: FakeWorker = new FakeWorker(() => worker.onmessage?.({ data: { ok: true, output: 'hi' } }));
    expect(await runInWorker('x', () => worker)).toEqual({ ok: true, output: 'hi' });
    expect(worker.terminated).toBe(true);
  });

  it('stops code that never finishes after the time limit', async () => {
    vi.useFakeTimers();
    const worker = new FakeWorker();
    const pending = runInWorker('while (true) {}', () => worker);
    await vi.advanceTimersByTimeAsync(30_000);
    const result = await pending;
    expect(result.ok).toBe(false);
    expect(result.output).toContain('more than 30 seconds');
    expect(worker.terminated).toBe(true);
  });

  it('reports a worker error', async () => {
    const worker: FakeWorker = new FakeWorker(() => worker.onerror?.({ message: 'bad' }));
    expect(await runInWorker('x', () => worker)).toEqual({ ok: false, output: 'Error: bad' });
  });
});

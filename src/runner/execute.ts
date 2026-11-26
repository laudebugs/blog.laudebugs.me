import { transform } from 'sucrase';
import { formatLine } from './format';

export interface RunResult {
  ok: boolean;
  output: string;
}

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
  ...args: string[]
) => (console: Pick<Console, 'log' | 'info' | 'warn' | 'error'>) => Promise<unknown>;

/**
 * Strips the types and runs the code with a console that collects its output.
 * Imports are not supported: the example must be a plain script, which is why the examples folder holds only those.
 */
export async function execute(source: string): Promise<RunResult> {
  const lines: string[] = [];
  const write = (...args: unknown[]) => void lines.push(formatLine(args));
  const sandboxConsole = { log: write, info: write, warn: write, error: write };
  try {
    // Checked before the types are stripped, because stripping drops an import that is only used as a type.
    if (/^\s*(import|export)\b/m.test(source)) {
      throw new Error('imports and exports are not available here; use a plain script');
    }
    const { code } = transform(source, { transforms: ['typescript'] });
    await new AsyncFunction('console', code)(sandboxConsole);
    return { ok: true, output: lines.join('\n') };
  } catch (error) {
    lines.push(
      `${error instanceof Error ? error.name : 'Error'}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return { ok: false, output: lines.join('\n') };
  }
}

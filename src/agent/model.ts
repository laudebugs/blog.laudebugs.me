// The model the Ask mode talks to. Today that is the browser's built-in Prompt API (Chrome's on-device model); the
// rest of the agent sees only these two small interfaces, so another runtime can be added without touching the loop.

export type Availability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

export interface ModelSession {
  /** Sends one message and returns the reply, which must satisfy the JSON schema. */
  prompt(text: string, schema: object, signal?: AbortSignal): Promise<string>;
  destroy(): void;
}

export interface ModelProvider {
  availability(): Promise<Availability>;
  /** Starts a session. When the model must be downloaded first, this needs a user gesture; `onProgress` gets 0 to 1. */
  create(system: string, onProgress?: (fraction: number) => void, signal?: AbortSignal): Promise<ModelSession>;
}

interface PromptApiSession {
  prompt(text: string, options?: { responseConstraint?: object; signal?: AbortSignal }): Promise<string>;
  destroy(): void;
}
interface PromptApi {
  availability(options?: object): Promise<Availability>;
  create(options?: object): Promise<PromptApiSession>;
}

// The same options go to availability() and create(), as Chrome's documentation asks.
const LANGUAGES = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
};

function api(): PromptApi | undefined {
  return (globalThis as { LanguageModel?: PromptApi }).LanguageModel;
}

export const promptApiProvider: ModelProvider = {
  async availability() {
    const prompt = api();
    if (!prompt) return 'unavailable';
    try {
      return await prompt.availability(LANGUAGES);
    } catch {
      return 'unavailable';
    }
  },
  async create(system, onProgress, signal) {
    const prompt = api();
    if (!prompt) throw new Error('The built-in model is not available in this browser.');
    const session = await prompt.create({
      ...LANGUAGES,
      initialPrompts: [{ role: 'system', content: system }],
      signal,
      monitor(monitor: EventTarget) {
        monitor.addEventListener('downloadprogress', (event) =>
          onProgress?.((event as Event & { loaded: number }).loaded),
        );
      },
    });
    return {
      prompt: (text, schema, abort) => session.prompt(text, { responseConstraint: schema, signal: abort }),
      destroy: () => session.destroy(),
    };
  },
};

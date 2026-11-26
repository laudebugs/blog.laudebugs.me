// Runs in a module worker, so edited code has no access to the page, its cookies or its storage.
import { execute } from './execute';

self.onmessage = async (event: MessageEvent<{ source: string }>) => {
  self.postMessage(await execute(event.data.source));
};

import { createTransport } from './core';
import { xhrAdapter } from './adapters/xhr/xhr-adapter';
import { fetchAdapter } from './adapters/fetch/fetch-adapter';

export * from './core/index';
export { xhrAdapter, fetchAdapter };
export const transport = createTransport({
  adapter: xhrAdapter,
});

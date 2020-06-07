import { xhrAdapter } from './adapters/xhr/xhr-adapter';
import { fetchAdapter } from './adapters/fetch/fetch-adapter';

export * from './core/index';
export * from './adapters/adapter';

export { xhrAdapter, fetchAdapter };

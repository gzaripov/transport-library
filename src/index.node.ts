import { createTransport } from './core';
import { nodeAdapter } from './adapters/node/node-adapter';

export * from './adapters';
export * from './core/index';
export const transport = createTransport({
  adapter: nodeAdapter,
});

export default transport;

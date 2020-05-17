import createTransport from './core';
import withServer from '../../test/fixtures/with-server';
import { nodeAdapter } from '../adapters/node/node-adapter';

describe('Core test', () => {
  it('send request using node adapter with response type json', async () => {
    const transport = createTransport({
      adapter: nodeAdapter,
      responseType: 'json',
    });

    const response = await withServer(
      async (baseUrl) => {
        return transport.request({
          url: '/test',
          baseUrl,
        });
      },
      {
        handler: (_, res) => res.end(JSON.stringify({ test: { json: {} } })),
      },
    );

    expect(response.data).toStrictEqual({ test: { json: {} } });
  });

  it('send request using node adapter with response type text', async () => {
    const transport = createTransport({
      adapter: nodeAdapter,
      responseType: 'text',
    });

    const response = await withServer(
      async (baseUrl) =>
        transport.request({
          baseUrl,
          url: '/test',
        }),
      {
        handler: (_, res) => res.end(JSON.stringify({ test: { json: {} } })),
      },
    );

    expect(response.data).toStrictEqual('{"test":{"json":{}}}');
  });

  it('should allow make middlwares', async () => {
    const transport = createTransport({
      adapter: nodeAdapter,
      responseType: 'text',
    });

    const response = await withServer(
      async (baseUrl) => {
        return transport.request({
          url: '/test',
          middlwares: [
            async (request) => {
              const res = await request();

              res.data = JSON.parse(res.data);

              return res;
            },
          ],
          baseUrl,
        });
      },
      {
        handler: (_, res) => res.end(JSON.stringify({ test: { json: {} } })),
      },
    );

    expect(response.data).toStrictEqual({ test: { json: {} } });
  });
});

import createTransport from './create-transport';
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

  it('should allow make middlewares', async () => {
    const transport = createTransport({
      adapter: nodeAdapter,
      responseType: 'text',
    });

    const response = await withServer(
      async (baseUrl) => {
        return transport.request({
          url: '/test',
          middlewares: [
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

  it('should allow to add custom fields to request', async () => {
    const transport = createTransport(
      {
        adapter: nodeAdapter,
        responseType: 'text',
      },
      {
        extras: { secret: 'test' },
      },
    ).extend({});

    const response = await withServer(
      async (baseUrl) => {
        return transport.request({
          url: '/test',
          middlewares: [
            async (request, options) => {
              const res = await request();

              res.data = Object.assign(JSON.parse(res.data), options.extras);

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

    expect(response.data).toStrictEqual({ test: { json: {} }, secret: 'test' });
  });
});

import createTransport from './core';
import withServer from '../../test/fixtures/with-server';
import nodeAdapter from '../adapters/node/node-adapter';

describe('Core test', () => {
  it('send request using node adapter', async () => {
    const transport = createTransport({
      timeout: 100,
      adapter: nodeAdapter,
      responseType: 'json',
    });

    const response = await withServer(
      async (baseUrl) => {
        return transport.get('/test', {
          baseUrl,
          responseType: 'json',
        });
      },
      {
        handler: (_, res) => res.end(JSON.stringify({ test: { json: {} } })),
      },
    );

    expect(response).toStrictEqual({ test: { json: {} } });
  });
});

// const middleware: Middleware<BaseRequest, Response<any, 'json'>> = async (next) => {
//   const response = await next();

//   response.data.split('');

//   return response;
// };

// transport.extend(middleware);

// transport.extend(async (next, options) => {
//   const response = await next(options);

//   response.data;

//   return next(options);
// });

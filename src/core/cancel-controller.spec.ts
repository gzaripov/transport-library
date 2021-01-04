import { createTransport } from '.';
import withServer from '../../test/fixtures/with-server';
import { nodeAdapter } from '../adapters';
import { createCancelController } from './cancel-controller';

describe('Cancel Controller', () => {
  it('should cancel request when .cancel called', async () => {
    const transport = createTransport({
      adapter: nodeAdapter,
    });

    const response = withServer(
      async (baseUrl) => {
        const cancelController = createCancelController();

        const responsePromise = transport.request({
          url: '/test',
          cancelToken: cancelController.token,
          baseUrl,
        });

        cancelController.cancel('Cancelled');

        return responsePromise;
      },
      {
        handler: (_, res) => {
          setTimeout(() => {
            res.end(JSON.stringify({ test: { json: {} } }));
          }, 100);
        },
      },
    );

    await expect(response).rejects.toThrowError('Request cancelled: Cancelled');
  });
});

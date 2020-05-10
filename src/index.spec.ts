import { nodeAdapter } from './adapters/node/node-adapter';
import createTestServer from '../test/fixtures/test-server';

describe('main', () => {
  jest.setTimeout(1000);
  it('node transport should send requests', async () => {
    const { url } = await createTestServer();

    const result = await nodeAdapter({
      url,
      method: 'GET',
      headers: {},
    });

    console.log(result);

    expect(result).toBeTruthy();
  });
});

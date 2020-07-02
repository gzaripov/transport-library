import { createTransport } from '../../core';
import createFakeAdapter from './fake-adapter';

describe('Fake adapter', () => {
  jest.setTimeout(100);

  it('should allow fake requests', async () => {
    const fakeAdapter = createFakeAdapter();
    const transport = createTransport({
      adapter: fakeAdapter.adapter,
    });

    fakeAdapter.onGet().reply(200);

    const response = await transport.get('/test');

    expect(response.data).toEqual({});
  });
});

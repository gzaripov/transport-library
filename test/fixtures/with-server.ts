import http from 'http';
import createTestServer from './test-server';

type WithServerOptions = {
  handler?: http.RequestListener;
};

export default async function withServer<T>(
  cb: (url: string) => T | Promise<T>,
  { handler }: WithServerOptions = {},
) {
  const server = await createTestServer(handler);

  await server.start();

  const result = await cb(server.url);

  await server.stop();

  return result;
}

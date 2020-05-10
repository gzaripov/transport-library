import http from 'http';
import getPort from 'get-port';

export default async function createTestServer(handler?: http.RequestListener) {
  const instance = http.createServer(
    handler ||
      ((_, res) => {
        res.writeHead(200);
        res.end();
      }),
  );

  const hostname = 'localhost' as string;
  const port = await getPort();
  const host = `localhost:${port}`;
  const url = `http://${host}`;

  const start = () => {
    return new Promise((resolve, reject) => {
      try {
        instance.listen(port, hostname, () => {
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  await start();

  const stop = () => {
    return new Promise((resolve, reject) => {
      instance.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };

  afterEach(stop);

  return {
    instance,
    port,
    hostname,
    host,
    start,
    stop,
    url,
  };
}

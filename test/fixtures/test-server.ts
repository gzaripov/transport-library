import http from 'http';

export default async function createTestServer(handler?: http.RequestListener) {
  const instance = http.createServer(
    handler ||
      ((_, res) => {
        res.writeHead(200);
        res.end();
      }),
  );

  const hostname = 'localhost';

  const start = () => {
    return new Promise<void>((resolve, reject) => {
      try {
        instance.listen(0, hostname, resolve);
      } catch (error) {
        reject(error);
      }
    });
  };

  const stop = () => {
    return new Promise<void>((resolve, reject) => {
      instance.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };

  await start();

  const address = instance.address();

  if (!address || typeof address !== 'object') {
    throw new Error(`type of address is not object, it is ${typeof address}, value is: ${address}`);
  }

  const port = address?.port!;
  const host = `localhost:${port}`;
  const url = `http://${host}`;

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

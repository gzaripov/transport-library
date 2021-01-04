import { Adapter, StreamAdapter } from '../adapter';

export type FetchRequest = RequestInit;
export const fetchAdapter: Adapter<FetchRequest> = (request, response) => {
  const req = new Request(request.url, request);

  return fetch(req)
    .then((res) => {
      request.emit('sent');

      response.emit('head', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
      });

      return res.text();
    })
    .then(
      (text) => response.emit('text', text),
      (error) => {
        request.emit('error', error);
      },
    );
};

export const fetchStreamAdapter: StreamAdapter<RequestInit, ReadableStream<Uint8Array>> = (
  request,
) => {
  const req = new Request(request.url, request);

  return new ReadableStream({
    start(controller) {
      fetch(req)
        .then((res) => {
          request.emit('sent');

          if (!res.body) {
            controller.close();
            return;
          }

          const reader = res.body.getReader();

          function read() {
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();

                return;
              }

              if (value) {
                controller.enqueue(value);
              }

              read();
            });
          }

          read();
        })
        .catch((error) => {
          request.emit('error', error);
        });
    },
  });
};

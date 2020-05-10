import { Adapter } from '../adapter';

const fetchAdapter: Adapter<RequestInit> = (request, response) => {
  const req = new Request(request.url, request);

  fetch(req)
    .then((res) => {
      request.emit('sent');

      response.emit('head', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
      });

      if (!res.body) {
        response.emit('end');
        return;
      }

      const reader = res.body.getReader();

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            response.emit('end');

            return;
          }

          if (value) {
            response.emit('data', value);
          }

          read();
        });
      }

      read();
    })
    .catch((error) => {
      request.emit('error', error);
    });
};

export default fetchAdapter;

import { Adapter, StreamAdapter } from '../adapter';

type XhrRequest = {
  withCredentials?: boolean;
  body?: Document | BodyInit | null;
};

const parseXhrHeaders = (rawHeaders: string): Record<string, string> => {
  const headersRows = rawHeaders.trim().split(/[\r\n]+/);

  const headers: Record<string, string> = {};

  headersRows.forEach((line) => {
    const [header, ...values] = line.split(': ');
    headers[header] = values.join(': ');
  });

  return headers;
};

export const xhrAdapter: Adapter<XhrRequest> = (request, response) => {
  const xhr = new XMLHttpRequest();

  xhr.onloadstart = () => request.emit('sent');
  xhr.onabort = () => request.emit('abort');
  xhr.onerror = () =>
    response.emit('error', new Error('XHR request failed, check console for more details'));

  const headersRecieved = () => {
    response.emit('head', {
      status: xhr.status,
      statusText: xhr.statusText,
      headers: parseXhrHeaders(xhr.getAllResponseHeaders()),
    });
  };

  xhr.onreadystatechange = () => {
    if (xhr.readyState === xhr.HEADERS_RECEIVED) {
      headersRecieved();
    }
  };

  xhr.onload = () => response.emit('text', xhr.responseText);

  xhr.withCredentials = !!request.withCredentials;
  xhr.open(request.method, request.url, true);

  Object.entries(request.headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));

  xhr.responseType = 'text';

  xhr.send(request.body);
};

export const xhrStreamAdapter: StreamAdapter<XhrRequest, ReadableStream<Uint8Array>> = (
  request,
) => {
  const xhr = new XMLHttpRequest();

  xhr.onloadstart = () => request.emit('sent');
  xhr.onabort = () => request.emit('abort');

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let seenBytes = 0;

      xhr.onprogress = () => {
        const newData = xhr.response.substr(seenBytes);
        seenBytes = xhr.responseText.length;

        controller.enqueue(new Uint8Array(newData));
      };

      xhr.onload = () => controller.close();
      xhr.onerror = () =>
        controller.error(new Error('XHR request failed, check console for more details'));

      xhr.onreadystatechange = () => {
        if (xhr.readyState === xhr.HEADERS_RECEIVED) {
          if (xhr.status >= 400) {
            controller.error(new Error(`request failed with code ${xhr.status}`));
          }
        }
      };
    },
  });

  xhr.withCredentials = !!request.withCredentials;
  xhr.open(request.method, request.url, true);

  Object.entries(request.headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
  xhr.responseType = 'arraybuffer';

  xhr.send(request.body);

  return stream;
};

import { Adapter } from '../adapter';

type XhrRequest = {
  withCredentials: boolean;
  body: Document | BodyInit | null;
  responseType: XMLHttpRequestResponseType;
};

const xhrAdapter: Adapter<XhrRequest> = (request, response) => {
  const xhr = new XMLHttpRequest();

  xhr.onloadstart = () => request.emit('sent');
  xhr.onabort = () => request.emit('abort');
  xhr.onerror = () =>
    response.emit('error', new Error('XHR request failed, check console for more details'));

  let seenBytes = 0;

  const headersRecieved = () => {
    const rawHeaders = xhr.getAllResponseHeaders();
    const headersRows = rawHeaders.trim().split(/[\r\n]+/);

    const headers: Record<string, string> = {};

    headersRows.forEach((line) => {
      const [header, ...values] = line.split(': ');
      headers[header] = values.join(': ');
    });

    response.emit('head', {
      status: xhr.status,
      statusText: xhr.statusText,
      headers,
    });
  };

  xhr.onreadystatechange = () => {
    if (xhr.readyState === xhr.HEADERS_RECEIVED) {
      headersRecieved();
    }
  };

  xhr.onprogress = () => {
    const newData = xhr.response.substr(seenBytes);
    seenBytes = xhr.responseText.length;

    response.emit('data', newData);
  };

  xhr.onload = () => {
    // response.emit('data', xhr.response);
    response.emit('end');
  };

  xhr.withCredentials = request.withCredentials;
  xhr.open(request.method, request.url, true);

  Object.entries(request.headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
  xhr.responseType = 'arraybuffer';

  xhr.send(request.body);
};

export default xhrAdapter;

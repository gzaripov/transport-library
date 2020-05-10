import { Adapter } from '../adapter';

type XhrRequest = {
  withCredentials: boolean;
  body: Document | BodyInit | null;
  responseType: XMLHttpRequestResponseType;
};

type XhrResponse<Request extends XhrRequest, DataType> = Request['responseType'] extends 'json'
  ? DataType
  : Request['responseType'] extends 'arraybuffer'
  ? ArrayBuffer
  : Request['responseType'] extends 'blob'
  ? Blob
  : Request['responseType'] extends 'document'
  ? Document | undefined
  : string;

const xhrAdapter: Adapter<XhrRequest> = (request, response) => {
  const xhr = new XMLHttpRequest();

  xhr.onloadstart = () => request.emit('sent');
  xhr.onabort = () => request.emit('abort');
  xhr.onerror = () =>
    response.emit('error', new Error('XHR request failed, check console for more details'));

  let seenBytes = 0;

  xhr.onprogress = () => {
    const newData = xhr.response.substr(seenBytes);
    seenBytes = xhr.responseText.length;

    response.emit('data', newData);
  };

  xhr.onload = () => {
    response.emit('end', xhr.response);
  };

  xhr.withCredentials = request.withCredentials;
  xhr.open(request.method, request.url, true);

  Object.entries(request.headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
  xhr.responseType = 'arraybuffer';

  xhr.send(request.body);
};

export default xhrAdapter;

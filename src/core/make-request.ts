import { Response, Request } from './types';
import createEventEmitter from '../lib/event-emitter/event-emitter';
import { RequestEvents, ResponseEvents } from '../adapters/adapter';
import buildUrl from './build-url';

const makeRequest = <R extends Request<any>>(config: R): Promise<any> => {
  const url = buildUrl(config.url, config.baseUrl, config.params);

  const baseRequest = {
    ...config,
    url,
    method: config.method?.toUpperCase() || 'GET',
    headers: config.headers || {},
  };

  const request = Object.assign(createEventEmitter<RequestEvents>(), baseRequest);
  const response = createEventEmitter<ResponseEvents>();

  return new Promise((resolve, reject) => {
    const responseObject = {} as Response;

    response.on('head', ({ status, statusText, headers }) => {
      responseObject.status = status;
      responseObject.statusText = statusText;
      responseObject.headers = headers;
    });

    response.on('text', (text) => {
      try {
        responseObject.data = config.responseType === 'text' ? text : JSON.parse(text);
        resolve(responseObject);
      } catch (error) {
        reject(error);
      }
    });
    response.on('error', reject);
    request.on('error', reject);

    config.adapter(request, response);
  });
};

export default makeRequest;

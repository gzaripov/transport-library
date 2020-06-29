import { RequestMethod, Transport, CreateTransportOptions } from './types';
import makeRequest from './make-request';

const createTransport = <T>(options: CreateTransportOptions<T>) => {
  const transport = {
    request: (opts) => {
      const defaultOptions = { ...options, ...opts, middlwares: [] };
      const request = (newOpts: CreateTransportOptions<T> = defaultOptions) => makeRequest(newOpts);

      const layers = [
        ...(options.middlwares! || []).reverse(),
        ...(opts.middlwares || []).reverse(),
      ];

      if (!layers.length) {
        return request();
      }

      let currentLayer = request;

      layers.forEach((layer) => {
        const previousLayer = currentLayer;
        currentLayer = (newOpts = defaultOptions) => layer(previousLayer, newOpts);
      });

      return currentLayer();
    },
  } as Transport<T>;
  const requestMethods: RequestMethod[] = ['get', 'put', 'post', 'head', 'patch', 'delete'];

  requestMethods.forEach((method) => {
    transport[method] = (url, opts) =>
      transport.request({ ...options, ...opts, method, url } as any);
  });

  return transport;
};

export default createTransport;

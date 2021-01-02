import { Transport, CreateTransportOptions, Request, httpMethods } from './types';
import makeRequest from './make-request';

const createTransport = <T>(options: CreateTransportOptions<T>) => {
  const transport = {
    request: (opts) => {
      const defaultOptions = { ...options, ...opts, middlwares: [] };
      const request = (newOpts: Request<T> = defaultOptions) => makeRequest(newOpts);

      const layers = [
        ...(options.middlewares! || []).reverse(),
        ...(opts.middlewares || []).reverse(),
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

  httpMethods.forEach((method) => {
    transport[method] = (url, opts) =>
      transport.request({ ...options, ...opts, method, url } as any);
  });

  return transport;
};

export default createTransport;

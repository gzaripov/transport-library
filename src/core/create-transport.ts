import {
  Transport,
  Response,
  Middleware,
  CreateTransport,
  Request,
  CreateTransportOptions,
  httpMethods,
} from './types';
import makeRequest from './make-request';

const applyMiddlewares = (
  request: (req: Request<any>) => Promise<Response>,
  middlewares: Middleware<Request, Response>[],
) => {
  const layers = middlewares.slice().reverse();
  let currentLayer = request as (req: Request<any>) => Promise<Response>;

  layers.forEach((layer) => {
    const previousLayer = currentLayer;
    currentLayer = (newOpts) => layer((o = newOpts) => previousLayer(o), newOpts);
  });

  return currentLayer;
};

const createTransport: CreateTransport = <T>(config: CreateTransportOptions<T>) => {
  const middlewares = (config.middlewares || []) as any;
  const request: Transport['request'] = (opts) => {
    const defaultOptions = { ...config, ...opts };

    return applyMiddlewares(
      makeRequest as (req: Request<any>) => Promise<Response>,
      opts.middlewares || [],
    )(defaultOptions);
  };

  const transport = {
    request: applyMiddlewares(request, middlewares),
    extend: (...mws: Middleware[]) =>
      createTransport({
        ...config,
        middlewares: [...middlewares, ...mws],
      }),
  } as Transport<T>;

  httpMethods.forEach((method) => {
    transport[method] = (url, opts) => transport.request({ ...config, ...opts, url, method });
  });

  return transport;
};

export default createTransport;

import { Transport, Response, Middleware, CreateTransport, Request, httpMethods } from './types';
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

const createTransport: CreateTransport = <R, C>(config: Request<R>, custom?: C) => {
  const middlewares = (config.middlewares || []) as any;
  const request: Transport['request'] = (opts) => {
    const defaultOptions = { ...config, ...custom, ...opts };

    return applyMiddlewares(
      makeRequest as (req: Request<any>) => Promise<Response>,
      opts.middlewares || [],
    )(defaultOptions);
  };

  const transport = {
    request: applyMiddlewares(request, middlewares),
    extend: (o) => createTransport(config, { ...custom, ...o }),
    apply: (...mws: Middleware[]) => {
      return createTransport({
        ...config,
        middlewares: [...middlewares, ...mws],
      });
    },
  } as Transport<R & C>;

  httpMethods.forEach((method) => {
    transport[method] = (url, opts) => transport.request({ ...config, ...opts, url, method });
  });

  return transport;
};

export default createTransport;

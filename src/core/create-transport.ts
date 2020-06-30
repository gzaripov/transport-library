import { RequestMethod, Transport, Response, Middleware, CreateTransport, Request } from './types';
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

const createTransport: CreateTransport = (options) => {
  const middlewares = (options.middlewares || []) as any;
  const request: Transport['request'] = (opts) => {
    const defaultOptions = { ...options, ...opts };

    return applyMiddlewares(
      makeRequest as (req: Request<any>) => Promise<Response>,
      opts.middlewares || [],
    )(defaultOptions);
  };

  const transport = ({
    request: applyMiddlewares(request, middlewares),
    extend: (...mws: Middleware[]) =>
      createTransport({
        ...options,
        middlewares: [...middlewares, ...mws],
      }),
  } as unknown) as ReturnType<CreateTransport>;
  const requestMethods: RequestMethod[] = ['get', 'put', 'post', 'head', 'patch', 'delete'];

  requestMethods.forEach((method) => {
    transport[method] = (url, opts) =>
      transport.request({ ...options, ...opts, method, url } as any);
  });

  return transport as any;
};

export default createTransport;

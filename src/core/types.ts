import { Adapter } from '../adapters/adapter';

export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  // custom method support
  | string;

export type ResponseType = 'json' | 'text';

export type BaseRequest = {
  url: string;
  method?: Method;
  baseUrl?: string;
  timeout?: number;
  responseType?: ResponseType;
  headers?: Record<string, string>;
  params?: Record<string, any> | string;
  cancelToken?: string;
};
export type Request<T = {}> = BaseRequest & {
  adapter: Adapter<T>;
  middlewares?: Middleware<Request<T>, Response>[];
} & Partial<Omit<T, keyof BaseRequest>>;

export type RequestConfig<T = {}> = BaseRequest & {
  adapter?: Adapter<T>;
  middlewares?: Middleware<Request<T>, Response>[];
} & Partial<Omit<T, keyof BaseRequest>>;

export type Response<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
};

export type Middleware<Req = BaseRequest, Res = Response> = (
  next: (options?: Req) => Promise<Res>,
  options: Req,
) => Promise<Res>;

export type CreateTransportOptions<T> = Omit<Request<T>, 'url'> & {
  responseType?: ResponseType;
};

export type CreateTransport = <T>(options: CreateTransportOptions<T>) => Transport<T>;

export type RequestMethod = 'get' | 'put' | 'delete' | 'head' | 'post' | 'patch';

export type Transport<R = {}> = {
  request: <T>(config: RequestConfig<R>) => Promise<Response<T>>;
  extend: {
    <C extends RequestConfig<R> = RequestConfig<R>>(config: C): Transport<
      undefined extends C['adapter'] ? R : NonNullable<C['adapter']>
    >;
    (...middlewares: Middleware<Request<R>, Response<any>>[]): Transport<R>;
  };
  stream<T>(config: RequestConfig<R>): ReadableStream<T>;
} & Record<RequestMethod, <T>(url: string, config?: RequestConfig<R>) => Promise<Response<T>>>;

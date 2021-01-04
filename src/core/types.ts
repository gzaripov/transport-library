import { Adapter } from '../adapters/adapter';

export type HttpMethod =
  | 'get'
  | 'delete'
  | 'head'
  | 'options'
  | 'post'
  | 'put'
  | 'patch'
  | 'connect'
  | 'trace';

export const httpMethods: HttpMethod[] = [
  'get',
  'delete',
  'head',
  'options',
  'post',
  'put',
  'patch',
  'connect',
  'trace',
];

export type Method = HttpMethod | Uppercase<HttpMethod>;

export type ResponseType = 'json' | 'text';

export type Request<T = {}> = {
  url?: string;
  method?: Method;
  baseUrl?: string;
  timeout?: number;
  responseType?: ResponseType;
  headers?: Record<string, string>;
  params?: Record<string, any> | string;
  cancelToken?: string;
  adapter?: Adapter<T>;
  middlewares?: Middleware<Request<T>, Response>[];
} & T;

export type Response<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
};

export type Middleware<Req = Request, Res = Response> = (
  next: (options?: Req) => Promise<Res>,
  options: Req,
) => Promise<Res>;

export type CreateTransport = <T>(options: Request<T>) => Transport<T>;

export type Transport<R = {}> = {
  request: <T>(config: Request<R>) => Promise<Response<T>>;
  extend: (...middlewares: Middleware<Request<R>, Response<any>>[]) => Transport<R>;
  stream<T>(config: Request<R>): ReadableStream<T>;
} & Record<HttpMethod, <T>(url: string, config?: Request<R>) => Promise<Response<T>>>;

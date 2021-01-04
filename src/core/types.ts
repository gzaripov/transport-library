import { Adapter } from '../adapters/adapter';
import { CancelToken } from './cancel-controller';

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

export type Request<T = {}, C = {}> = {
  url?: string;
  method?: Method;
  baseUrl?: string;
  timeout?: number;
  responseType?: ResponseType;
  headers?: Record<string, string>;
  params?: Record<string, any> | string;
  cancelToken?: CancelToken;
  adapter?: Adapter<T>;
  middlewares?: Middleware<Request<T> & C, Response>[];
} & T &
  Partial<C>;

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

export type CreateTransport = <R, C>(options: Request<R>, custom?: C) => Transport<R, C>;

export type Transport<R = {}, C = {}> = {
  request: <T>(config: Request<R, C>) => Promise<Response<T>>;
  extend: <O>(options: O & Partial<R & C>) => Transport<R, C & O>;
  apply: (...middlewares: Middleware<Request<R, C>, Response<any>>[]) => Transport<R, C>;
  // stream<T>(config: Request<R, C>): ReadableStream<T>;
} & Record<HttpMethod, <T>(url: string, config?: Request<R, C>) => Promise<Response<T>>>;

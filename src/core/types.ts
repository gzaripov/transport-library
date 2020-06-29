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
} & Partial<{
  method: Method;
  baseUrl: string;
  timeout: number;
  responseType: ResponseType;
  headers: Record<string, string>;
  params: Record<string, any> | string;
  cancelToken: string;
}>;

export type Request<T = {}> = BaseRequest & {
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

export type CreateTransportOptions<T> = {
  adapter: Adapter<T>;
  responseType?: ResponseType;
} & Omit<Request<T>, 'url' | 'adapter'>;

export type CreateTransport = <T>(options: CreateTransportOptions<T>) => Transport<T>;

export type RequestMethod = 'get' | 'put' | 'delete' | 'head' | 'post' | 'patch';

export type Transport<ReqType = {}> = {
  request: <T>(config: Request<ReqType>) => Promise<Response<T>>;
  extend: {
    <R extends Request<ReqType> = Request<ReqType>>(config: R): Transport<
      undefined extends R['adapter'] ? ReqType : NonNullable<R['adapter']>
    >;
    (...middlewares: Middleware<Request<ReqType>, Response<any>>[]): Transport<ReqType>;
  };
  stream<T>(config: Request<ReqType>): ReadableStream<T>;
} & Record<RequestMethod, <T>(url: string, config?: Request<ReqType>) => Promise<Response<T>>>;

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
  middlewares?: Middleware<Request<T>, Response<any, Request<T>['responseType']>>[];
} & Partial<Omit<T, keyof BaseRequest>>;

export type Response<T = any, ResType extends ResponseType | undefined = 'json'> = {
  data: ResType extends 'text' ? string : T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
};

export type Middleware<Req = BaseRequest, Res = Response<any, any>> = (
  next: (options?: Req) => Promise<Res>,
  options: Req,
) => Promise<Res>;

export type CreateTransportOptions<ResType extends ResponseType, T> = {
  adapter: Adapter<T>;
  responseType?: ResType;
} & Omit<Request<T>, 'url' | 'adapter'>;

export type CreateTransport = <T, ResType extends ResponseType = 'json'>(
  options: CreateTransportOptions<ResType, T>,
) => Transport<T, ResType>;

type TypeNotPassed = { _response_type_not_passed: true };

type InferResponseType<
  T,
  RequestResType extends ResponseType | undefined,
  TransportResType extends ResponseType
> = T extends TypeNotPassed
  ? undefined extends RequestResType
    ? TransportResType
    : RequestResType
  : 'json';

export type RequestMethod = 'get' | 'put' | 'delete' | 'head' | 'post' | 'patch';

export type Transport<T = {}, ResType extends ResponseType = 'json'> = {
  request: <Req extends Request<T> = Request<T>, Res = TypeNotPassed>(
    config: Req,
  ) => Promise<Response<Res, InferResponseType<Res, Req['responseType'], ResType>>>;
  extend: {
    <R extends Request<T> = Request<T>>(config: R): Transport<
      undefined extends R['adapter'] ? T : NonNullable<R['adapter']>,
      undefined extends R['responseType'] ? ResType : NonNullable<R['responseType']>
    >;
    (...middlewares: Middleware<Request<T>, Response<any, ResType>>[]): Transport<T, ResType>;
  };
} & Record<
  RequestMethod,
  <Req extends Request<T> = Request<T>, Res = TypeNotPassed>(
    url: string,
    config: Req,
  ) => Promise<Response<Res, InferResponseType<Res, Req['responseType'], ResType>>>
>;

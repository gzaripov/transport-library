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

export type Request<AdapterSettings = {}> = BaseRequest & {
  adapter?: Adapter<AdapterSettings>;
  middlewares?: Middleware<
    Request<AdapterSettings>,
    Response<any, Request<AdapterSettings>['responseType']>
  >[];
} & Omit<AdapterSettings, keyof BaseRequest>;

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

export type CreateTransportOptions<ResType extends ResponseType, AdapterSettings> = {
  adapter: Adapter<AdapterSettings>;
  responseType?: ResType;
} & Omit<Request<AdapterSettings>, 'url' | 'adapter'>;

export type CreateTransport = <AdapterSettings, ResType extends ResponseType = 'json'>(
  options: CreateTransportOptions<ResType, AdapterSettings>,
) => Transport<AdapterSettings, ResType>;

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

export type Transport<AdapterSettings = {}, ResType extends ResponseType = 'json'> = {
  request: <T = TypeNotPassed, R extends Request<AdapterSettings> = Request<AdapterSettings>>(
    config: R,
  ) => Promise<Response<T, InferResponseType<T, R['responseType'], ResType>>>;
  extend: {
    <R extends Request<AdapterSettings> = Request<AdapterSettings>>(config: R): Transport<
      undefined extends R['adapter'] ? AdapterSettings : NonNullable<R['adapter']>,
      undefined extends R['responseType'] ? ResType : NonNullable<R['responseType']>
    >;
    (...middlewares: Middleware<Request<AdapterSettings>, Response<any, ResType>>[]): Transport<
      AdapterSettings,
      ResType
    >;
  };
  // stream<T = TypeNotPassed, R extends Request<AdapterSettings> = Request<AdapterSettings>>(
  //   config: R,
  // ): ReadableStream<T>;
} & Record<
  RequestMethod,
  <T = TypeNotPassed, R extends Request<AdapterSettings> = Request<AdapterSettings>>(
    url: string,
    config: R,
  ) => Promise<Response<T, InferResponseType<T, R['responseType'], ResType>>>
>;

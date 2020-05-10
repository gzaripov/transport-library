import { Adapter } from '../adapters/adapter';
import nodeAdapter from '../adapters/node/node-adapter';
import fetchAdapter from '../adapters/fetch/fetch-adapter';

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
  | 'PATCH';

type BaseRequestOptions = {
  url: string;
} & Partial<{
  method: Method;
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
  params: Record<string, any>;
  cancelToken: string;
}>;

type Middleware<Request, Response> = (
  next: (options: Request) => Promise<Response>,
  options: Request,
) => Promise<Response>;

type Request<AdapterSettings> = BaseRequestOptions & {
  adapter?: Adapter<AdapterSettings>;
} & Omit<AdapterSettings, keyof BaseRequestOptions>;

type Response<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
};

type CreateTransportOptions<AdapterSettings> = {
  adapter: Adapter<AdapterSettings>;
  timeout: number;
} & AdapterSettings;

type NamedRequestConfig<T> = Omit<T, 'url' | 'method'>;

export interface Transport<AdapterSettings> {
  (config: Request<AdapterSettings>): Promise<Response>;
  (url: string, config?: Omit<Request<AdapterSettings>, 'url'>): Promise<Response>;
  request<T = any, R = Response<T>>(config: Request<AdapterSettings>): Promise<R>;
  get<T = any, R = Response<T>>(
    url: string,
    config?: NamedRequestConfig<Request<AdapterSettings>>,
  ): Promise<R>;
  delete<T = any, R = Response<T>>(
    url: string,
    config?: NamedRequestConfig<Request<AdapterSettings>>,
  ): Promise<R>;
  head<T = any, R = Response<T>>(
    url: string,
    config?: NamedRequestConfig<Request<AdapterSettings>>,
  ): Promise<R>;
  post<T = any, R = Response<T>>(
    url: string,
    config?: NamedRequestConfig<Request<AdapterSettings>>,
  ): Promise<R>;
  put<T = any, R = Response<T>>(
    url: string,
    config?: NamedRequestConfig<Request<AdapterSettings>>,
  ): Promise<R>;
  patch<T = any, R = Response<T>>(
    url: string,
    config?: NamedRequestConfig<Request<AdapterSettings>>,
  ): Promise<R>;
  extend: {
    (...layers: Middleware<Request<AdapterSettings>, Response>[]): Transport<AdapterSettings>;
    (config: Middleware<Request<AdapterSettings>, Response>): Transport<AdapterSettings>;
  };
}

const createTransport = <AdapterSettings>(
  options: CreateTransportOptions<AdapterSettings>,
): Transport<AdapterSettings> => {
  return (options as unknown) as Transport<AdapterSettings>;
};

const transport = createTransport({ adapter: nodeAdapter, timeout: 100 });

transport.get('/test', {});

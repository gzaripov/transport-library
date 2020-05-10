import { Adapter } from '../adapters/adapter';
import nodeAdapter from '../adapters/node/node-adapter';

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

type ResponseType = 'json' | 'text' | 'arraybuffer';

type BaseRequestOptions = {
  url: string;
} & Partial<{
  method: Method;
  baseUrl: string;
  timeout: number;
  responseType: ResponseType;
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

type Response<Type = 'json', T = any> = {
  data: Type extends 'text' ? string : Type extends 'arraybuffer' ? ArrayBuffer : T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
};

type CreateTransportOptions<ResType extends ResponseType, AdapterSettings> = {
  adapter: Adapter<AdapterSettings>;
  responseType?: ResType;
  timeout: number;
} & AdapterSettings;

type NamedRequestConfig<T> = Omit<T, 'url' | 'method'>;

export interface Transport<ResType, AdapterSettings> {
  (config: Request<AdapterSettings>): Promise<Response>;
  (url: string, config?: Omit<Request<AdapterSettings>, 'url'>): Promise<Response>;
  request<T = any, R extends Request<AdapterSettings> = Request<AdapterSettings>>(
    config: R,
  ): Promise<Response<undefined extends R['responseType'] ? ResType : R['responseType'], T>>;

  get<T = any, R = Request<AdapterSettings>>(
    url: string,
    config?: NamedRequestConfig<Request<AdapterSettings>>,
  ): Promise<R>;
  delete<T = any, R = Request<AdapterSettings>>(
    url: string,
    config?: NamedRequestConfig<Request<AdapterSettings>>,
  ): Promise<R>;
  head<T = any, R = Request<AdapterSettings>>(
    url: string,
    config?: NamedRequestConfig<Request<AdapterSettings>>,
  ): Promise<R>;
  post<T = any, R = Request<AdapterSettings>>(
    url: string,
    config?: NamedRequestConfig<Request<AdapterSettings>>,
  ): Promise<R>;
  put<T = any, R = Request<AdapterSettings>>(
    url: string,
    config?: NamedRequestConfig<Request<AdapterSettings>>,
  ): Promise<R>;
  patch<T = any, R = Request<AdapterSettings>>(
    url: string,
    config?: NamedRequestConfig<Request<AdapterSettings>>,
  ): Promise<R>;
  extend: {
    (...layers: Middleware<Request<AdapterSettings>, Response>[]): Transport<
      ResType,
      AdapterSettings
    >;
    (config: Middleware<Request<AdapterSettings>, Response>): Transport<ResType, AdapterSettings>;
  };
}

const createTransport = <AdapterSettings, ResType extends ResponseType = 'json'>(
  options: CreateTransportOptions<ResType, AdapterSettings>,
): Transport<ResType, AdapterSettings> => {
  return (options as unknown) as any;
};

async function main() {
  const transport = createTransport({
    adapter: nodeAdapter,
    timeout: 100,
  });

  const response = await transport.request<number>({
    url: '/test',
  });

  response.data;
}

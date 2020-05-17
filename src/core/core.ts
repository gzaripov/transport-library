import {
  Request,
  ResponseType,
  RequestMethod,
  Transport,
  CreateTransportOptions,
  Response,
} from './types';
import createEventEmitter from '../lib/event-emitter/event-emitter';
import { RequestEvents, ResponseEvents, Adapter } from '../adapters/adapter';

const isAbsoluteUrl = (url: string) => {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};

const combineUrls = (baseUrl: string, relativeUrl?: string) => {
  return relativeUrl
    ? `${baseUrl.replace(/\/+$/, '')}/${relativeUrl.replace(/^\/+/, '')}`
    : baseUrl;
};

const serializeParams = (params: Record<string, any>) => {
  return Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&');
};

const buildUrl = (
  url: Request['url'],
  baseUrl?: Request['baseUrl'],
  params: Request['params'] = '',
) => {
  const fullUrl = baseUrl && !isAbsoluteUrl(url) ? combineUrls(baseUrl, url) : url;
  const serializedParams = typeof params === 'string' ? params : serializeParams(params);

  if (serializedParams) {
    return fullUrl.split('#')[0] + (fullUrl.includes('?') ? '?' : '&') + serializedParams;
  }

  return fullUrl;
};

const makeRequest = <R extends Request & { adapter: Adapter<any> }>(config: R): Promise<any> => {
  const url = buildUrl(config.url, config.baseUrl, config.params);

  const baseRequest = {
    ...config,
    url,
    method: config.method?.toUpperCase() || 'GET',
    headers: config.headers || {},
  };

  const request = Object.assign(createEventEmitter<RequestEvents>(), baseRequest);
  const response = createEventEmitter<ResponseEvents>();

  config.adapter(request, response);

  return new Promise((resolve, reject) => {
    const responseObject = {} as Response;

    response.on('head', ({ status, statusText, headers }) => {
      responseObject.status = status;
      responseObject.statusText = statusText;
      responseObject.headers = headers;
    });

    response.on('text', (text) => {
      try {
        responseObject.data = config.responseType === 'text' ? text : JSON.parse(text);
        resolve(responseObject);
      } catch (error) {
        reject(error);
      }
    });
    response.on('error', reject);
    request.on('error', reject);
  });
};

const createTransport = <AdapterSettings, ResType extends ResponseType = 'json'>(
  options: CreateTransportOptions<ResType, AdapterSettings>,
) => {
  const transport = {
    request: (opts) => {
      const defaultOptions = { ...options, ...opts, middlwares: [] } as any;
      const request = (newOpts = defaultOptions) => makeRequest(newOpts);

      const layers = [
        ...(options.middlwares! || []).reverse(),
        ...(opts.middlwares || []).reverse(),
      ];

      if (!layers.length) {
        return request();
      }

      let currentLayer = request;

      layers.forEach((layer) => {
        const previousLayer = currentLayer;
        currentLayer = (newOpts = defaultOptions) => layer(previousLayer, newOpts);
      });

      return currentLayer();
    },
  } as Transport<AdapterSettings, ResType>;
  const requestMethods: RequestMethod[] = ['get', 'put', 'post', 'head', 'patch', 'delete'];

  requestMethods.forEach((method) => {
    transport[method] = (url, opts) =>
      transport.request({ ...options, ...opts, method, url } as any);
  });

  return transport;
};

export default createTransport;

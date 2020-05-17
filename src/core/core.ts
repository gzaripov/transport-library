import { Request, ResponseType, RequestMethod, Transport, CreateTransportOptions } from './types';
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

  const textDecoder = new TextDecoder('utf-8');
  const chunks: string[] = [];

  response.on('data', (chunk) => {
    if (typeof chunk === 'string') {
      chunks.push(chunk);
    } else {
      chunks.push(textDecoder.decode(chunk));
    }
  });

  return new Promise((resolve, reject) => {
    response.on('end', () => {
      resolve(JSON.parse(chunks.join('')));
    });
    response.on('error', reject);
    request.on('error', reject);
  });
};

const createTransport = <AdapterSettings, ResType extends ResponseType = 'json'>(
  options: CreateTransportOptions<ResType, AdapterSettings>,
) => {
  const transport = {
    request: makeRequest,
  } as Transport<AdapterSettings, ResType>;
  const requestMethods: RequestMethod[] = ['get', 'put', 'post', 'head', 'patch', 'delete'];

  requestMethods.forEach((method) => {
    transport[method] = (url, opts) => makeRequest({ ...options, ...opts, method, url } as any);
  });

  return transport;
};

export default createTransport;

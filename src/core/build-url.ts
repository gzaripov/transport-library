import { RequestConfig } from './types';

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
  url: RequestConfig['url'] = '',
  baseUrl?: RequestConfig['baseUrl'],
  params: RequestConfig['params'] = '',
) => {
  const fullUrl = baseUrl && url && !isAbsoluteUrl(url) ? combineUrls(baseUrl, url) : url;

  const serializedParams = typeof params === 'string' ? params : serializeParams(params);

  if (serializedParams) {
    return fullUrl.split('#')[0] + (fullUrl.includes('?') ? '?' : '&') + serializedParams;
  }

  return fullUrl;
};

export default buildUrl;

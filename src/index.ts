import http from 'http';
import https from 'https';

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
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK';

export interface Request {
  url: string;
  method: Method;
  headers: Record<string, string | string[]>;
  data?: any;
  withCredentials?: boolean;
  responseType?: ResponseType;
  agent?: { http?: http.Agent; https?: https.Agent };
  // cancelToken?: CancelToken;
}

function nodeTransport(request: Request) {
  const isSecure = request.url.startsWith('https:');
  const transport = isSecure ? https : http;
  const agent = isSecure ? request?.agent?.https : request?.agent?.http;

  const transportRequest: http.RequestOptions = {
    path: request.url,
    method: request.method,
    headers: request.headers,
    agent,
  };

  return new Promise((resolve, reject) => {
    transport.request(transportRequest, (response) => {
      const responseBuffer: Uint8Array[] = [];

      response.on('error', reject);
      response.on('data', (chunk) => responseBuffer.push(chunk));
      response.on('end', function handleStreamEnd() {
        const responseData = Buffer.concat(responseBuffer);

        const res = {
          status: response.statusCode,
          statusText: response.statusMessage,
          headers: response.headers,
          request: transportRequest,
          data: responseData,
        };

        resolve(res);
      });
    });
  });
}

export function createTransport(config: Request) {
  // implement library
  return '';
}

import http from 'http';
import https from 'https';
import url from 'url';
import { Adapter } from '../adapter';

const nodeAdapter: Adapter<https.RequestOptions> = (request, response) => {
  const transport = http;
  const agent =
    request.agent ?? request.url.startsWith('https:') ? https.globalAgent : http.globalAgent;
  const parsed = url.parse(request.url);

  const transportRequest: http.RequestOptions = {
    ...request,
    path: parsed.path,
    hostname: parsed.hostname,
    port: parsed.port,
    method: request.method,
    agent,
    headers: {
      ...request.headers,
      Accept: 'application/json, text/plain, */*',
      'User-Agent': 'axios/0.19.2',
    },
  };

  const req = transport.request(transportRequest, (res) => {
    if (req.aborted) {
      return;
    }

    const headers = Object.entries(res.headers).reduce((acc, [header, value]) => {
      if (value) {
        acc[header] = Array.isArray(value) ? value.join(';') : value;
      }

      return acc;
    }, {} as Record<string, string>);

    response.emit('head', {
      status: res.statusCode!,
      statusText: res.statusMessage || '',
      headers,
    });

    res.on('error', (error) => response.emit('error', error));
    res.on('data', (chunk) => response.emit('data', chunk));
    res.on('end', () => response.emit('end'));
  });

  request.on('abort', () => req.destroy());

  req.on('abort', () => request.emit('abort'));
  req.on('error', (err) => request.emit('error', err));
  req.end(() => request.emit('sent'));
};

export default nodeAdapter;

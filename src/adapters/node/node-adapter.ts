import url from 'url';
import http from 'http';
import https from 'https';
import stream from 'stream';
import { Adapter, StreamAdapter } from '../adapter';

export type NodeRequest = https.RequestOptions;

export const nodeAdapter: Adapter<NodeRequest> = (request, response) => {
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

    const chunks: string[] = [];

    res.on('error', (error) => response.emit('error', error));
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => response.emit('text', chunks.join('')));
  });

  request.on('abort', () => req.destroy());

  req.on('abort', () => request.emit('abort'));
  req.on('error', (err) => request.emit('error', err));
  req.end(() => request.emit('sent'));
};

export const nodeStreamAdapter: StreamAdapter<https.RequestOptions, stream.Readable> = (
  request,
) => {
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

  const responseStream = new stream.Readable();

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

    responseStream.emit('head', {
      status: res.statusCode!,
      statusText: res.statusMessage || '',
      headers,
    });

    res.on('error', (error) => responseStream.emit('error', error));
    res.on('data', (chunk) => responseStream.push(chunk));
    res.on('end', () => responseStream.push(null));
  });

  request.on('abort', () => req.destroy());

  req.on('abort', () => request.emit('abort'));
  req.on('error', (err) => request.emit('error', err));
  req.end(() => request.emit('sent'));

  return responseStream;
};

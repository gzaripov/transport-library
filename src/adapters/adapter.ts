import http from 'http';
import https from 'https';
import { Emitter } from '../lib/event-emitter/event-emitter';

export type Method =
  | 'GET'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'PURGE'
  | 'LINK'
  | 'UNLINK';

export type RequestEvents = {
  sent: () => void;
  abort: () => void;
  error: (error: string | Error) => void;
};

export type Request<CustomSettings> = {
  url: string;
  method: Method;
  headers: Record<string, string>;
  data?: any;
  withCredentials?: boolean;
  responseType?: ResponseType;
  agent?: { http?: http.Agent; https?: https.Agent };
  // cancelToken?: CancelToken;
} & CustomSettings &
  Emitter<RequestEvents>;

export type ResponseEvents = {
  head: (data: { status: number; statusText: string; headers: Record<string, string> }) => void;
  end: (data?: Uint8Array) => void;
  data: (data: Uint8Array) => void;
  error: (error: string | Error) => void;
};

export type ResponseEmitter = Emitter<ResponseEvents>;

export type Adapter<CustomSettings> = (
  request: Request<CustomSettings>,
  response: ResponseEmitter,
) => void;

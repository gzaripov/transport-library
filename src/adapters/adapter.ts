import { Emitter } from '../lib/event-emitter/event-emitter';

type Method =
  | 'GET'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'PURGE'
  | 'LINK'
  | 'UNLINK'
  // custom method support
  | string;

export type RequestEvents = {
  sent: () => void;
  cancel: () => void;
  error: (error: string | Error) => void;
};

export type Request<T> = {
  url: string;
  method: Method;
  headers: Record<string, string>;
  responseType: 'json' | 'text';
} & T;

export type RequestEmitter<T> = Request<T> & Emitter<RequestEvents>;

export type ResponseEvents = {
  head: (data: { status: number; statusText: string; headers: Record<string, string> }) => void;
  error: (error: string | Error) => void;
  text: (text: string) => void;
};

export type ResponseEmitter = Emitter<ResponseEvents>;

export type StreamAdapter<T, StreamType> = (request: RequestEmitter<T>) => StreamType;

export type Adapter<T, R = void> = (request: RequestEmitter<T>, response: ResponseEmitter) => R;

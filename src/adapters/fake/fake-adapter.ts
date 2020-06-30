import { getStatusText } from 'http-status-codes';
import matchHandler from './match-handler';
import { Adapter } from '..';
import {
  NO_MATCHER,
  Handler,
  ReplyHandler,
  AnyRequest,
  FakeAdapter,
  Matcher,
  RegisteredHandler,
  FakeMethods,
  Handlers,
} from './types';

const METHODS = ['get', 'post', 'head', 'delete', 'patch', 'put', 'options', 'list', 'any'];

const reply: Handler = (
  statusOrCallback: number | ReplyHandler,
  data?: any,
  headers?: any,
) => async (request, response) => {
  const text = (d?: any) => {
    if (!d) {
      return '';
    }

    if (typeof d === 'string') {
      return d;
    }

    return JSON.stringify(d);
  };

  if (typeof statusOrCallback === 'function') {
    const res = await statusOrCallback(request);

    response.emit('head', {
      status: res.status,
      statusText: getStatusText(res.status),
      headers: res.headers || {},
    });

    response.emit('text', text(res.data));

    return;
  }

  response.emit('head', {
    status: statusOrCallback,
    statusText: getStatusText(statusOrCallback),
    headers: headers || {},
  });

  response.emit('text', text(data));
};

const timeout: Handler = () => (request) => {
  request.emit('error', `timeout of ${request.timeout || 0}ms exceeded`);
};

const abortRequest: Handler = () => (request) => {
  request.emit('abort');
};

const networkError: Handler = () => (request) => {
  request.emit('error', 'Network error');
};

const passThrough: Handler = () => () => {};

const handlers: Record<string, Handler> = {
  reply,
  timeout,
  abortRequest,
  networkError,
  passThrough,
};

type FakeAdapterFn = (options?: {
  adapter?: Adapter<AnyRequest>;
  delayResponse?: number;
}) => FakeAdapter;

export const fakeAdapter: FakeAdapterFn = ({ adapter, delayResponse } = {}) => {
  let currentMatcher: Matcher | typeof NO_MATCHER | null = null;
  let currentMethod: string = 'any';

  const fakeApi = {} as FakeAdapter;

  const allHandlers: Record<string, (...args: any[]) => FakeAdapter> = {};

  const registeredHandlers: RegisteredHandler[] = [];

  const registerHandler = (type: string, handler: Handler, { once }: { once: boolean }) => (
    ...args: any[]
  ) => {
    if (currentMatcher === null) {
      throw new Error('Cannot find matcher, have you called query function e.g. onGet before?');
    }

    registeredHandlers.push({
      once,
      handlerType: type,
      method: currentMethod,
      matcher: currentMatcher,
      handler: handler(...args),
    });

    return fakeApi;
  };

  Object.keys(handlers).forEach((handler) => {
    allHandlers[handler] = registerHandler(handler, handlers[handler], { once: false });
    allHandlers[`${handler}Once`] = registerHandler(handler, handlers[handler], { once: true });
  });

  METHODS.forEach((method) => {
    const methodName = `on${method.charAt(0).toUpperCase()}${method.slice(1)}` as keyof FakeMethods;

    fakeApi[methodName] = (matcher) => {
      currentMethod = method;
      currentMatcher = matcher || NO_MATCHER;

      return allHandlers as Handlers;
    };
  });

  fakeApi.adapter = (request, response) => {
    const handler = matchHandler(request, registeredHandlers);

    if (!handler) {
      request.emit(
        'error',
        new Error(`Cannot find handler for request: ${request.method} ${request.url}`),
      );

      return;
    }

    if (handler.handlerType === 'passThrough') {
      if (!adapter) {
        throw new Error('Specify adapter to pass through to MockAdapter options');
      }

      adapter(request, response);

      return;
    }

    request.emit('sent');

    if (delayResponse) {
      setTimeout(() => {
        handler.handler(request, response);
      }, delayResponse);

      return;
    }

    handler.handler(request, response);
  };

  return fakeApi;
};

export default fakeAdapter;

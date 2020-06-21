import { getStatusText } from 'http-status-codes';
import { URL } from 'url';
import { Adapter } from '..';
import { Request } from '../adapter';

const METHODS = ['get', 'post', 'head', 'delete', 'patch', 'put', 'options', 'list', 'any'];

type AnyRequest = Request<Record<string, any>>;

type ReplyHandlerData = {
  status: number;
  data?: any;
  headers?: Record<string, string>;
};

type ReplyHandler = (request: AnyRequest) => ReplyHandlerData | Promise<ReplyHandlerData>;

type Reply = (statusOrCallback: number | ReplyHandler, data?: any, headers?: any) => FakeAdapter;

type Handlers = {
  reply: Reply;
  replyOnce: Reply;
  timeout(): FakeAdapter;
  timeoutOnce(): FakeAdapter;
  abortRequest(): FakeAdapter;
  abortRequestOnce(): FakeAdapter;
  networkError(): FakeAdapter;
  networkErrorOnce(): FakeAdapter;
  passThrough(): FakeAdapter;
  passThroughOnce(): FakeAdapter;
};

type MatcherFn = (request: AnyRequest & { pathname: string }) => boolean;
type Matcher = string | RegExp | MatcherFn | undefined;
type Query = (matcher?: Matcher) => Handlers;

type FakeMethods = {
  onGet: Query;
  onPost: Query;
  onPut: Query;
  onHead: Query;
  onDelete: Query;
  onPatch: Query;
  onList: Query;
  onAny: Query;
};

type FakeAdapter = {
  reset(): void;
  restore(): void;
  adapter: Adapter<AnyRequest>;

  history: { [method: string]: AnyRequest[] };
} & FakeMethods;

type Handler = (...args: any[]) => Adapter<AnyRequest>;

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

const passThrough: Handler = ({ adapter }: { adapter?: Adapter<AnyRequest> } = {}): Adapter<
  AnyRequest
> => (request, response) => {
  if (!adapter) {
    throw new Error('Specify adapter to pass through to MockAdapter options');
  }

  adapter(request, response);
};

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

// const onceHandler: Adapter<AnyRequest> = (request, response) => {
//   registeredHandlers = registeredHandlers.filter((h) => h !== onceHandler);

//   handler(...args)(request, response);
// };

function isUrlMatching(url1: string, url2: string) {
  const noSlashUrl = url1[0] === '/' ? url1.substr(1) : url1;
  const noSlashRequired = url2[0] === '/' ? url2.substr(1) : url2;
  return noSlashUrl === noSlashRequired;
}

export const fakeAdapter: FakeAdapterFn = ({ adapter, delayResponse } = {}) => {
  let currentMatcher: Matcher | null = null;
  let currentMethod: string = 'any';

  const fakeApi = {} as FakeAdapter;

  const allHandlers: Record<string, (...args: any[]) => FakeAdapter> = {};

  const registeredHandlers: {
    once: boolean;
    method: string;
    matcher: Matcher;
    handler: Adapter<AnyRequest>;
  }[] = [];

  const registerHandler = (handler: Handler, { once }: { once: boolean }) => (...args: any[]) => {
    if (currentMatcher === null) {
      throw new Error('Cannot find matcher, have you called query function e.g. onGet bef?');
    }

    registeredHandlers.push({
      once,
      method: currentMethod,
      matcher: currentMatcher,
      handler: handler(...args),
    });

    return fakeApi;
  };

  Object.keys(handlers).forEach((handler) => {
    allHandlers[handler] = registerHandler(handlers[handler], { once: false });
    allHandlers[`${handler}Once`] = registerHandler(handlers[handler], { once: true });
  });

  METHODS.forEach((method) => {
    const methodName = `on${method.charAt(0).toUpperCase()}${method.slice(1)}` as keyof FakeMethods;

    fakeApi[methodName] = (matcher) => {
      currentMethod = method;
      currentMatcher = matcher;

      return allHandlers as Handlers;
    };
  });

  // TODO: finish mock adapter, add text to debug library
  fakeApi.adapter = (request, response) => {
    const handler = registeredHandlers.find(({ method, matcher }) => {
      if (method !== 'any' && request.method !== method) {
        return false;
      }

      const { pathname } = new URL(request.url);

      if (typeof matcher === 'function') {
        return Boolean(
          matcher({
            ...request,
            pathname,
          }),
        );
      }

      return [request.url, pathname].some((url) => {
        if (typeof matcher === 'string') {
          return isUrlMatching(url, matcher);
        }

        if (matcher instanceof RegExp) {
          return matcher.test(url);
        }

        return false;
      });
    });

    request.emit('sent');

    // response.emit('head', {
    //   status: response.status,
    //   statusText: res.statusText,
    //   headers: Object.fromEntries(res.headers.entries()),
    // });

    // response.emit('text', text);
    request.emit('error', 'error');
    response.emit('error', 'errror');
  };

  return fakeApi;
};

export const a = 2;

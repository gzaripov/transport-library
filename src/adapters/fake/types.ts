import { Adapter, Request } from '../adapter';

export type AnyRequest = Request<Record<string, any>>;
export type Handler = (...args: any[]) => Adapter<AnyRequest>;

type ReplyHandlerData = {
  status: number;
  data?: any;
  headers?: Record<string, string>;
};

export type ReplyHandler = (request: AnyRequest) => ReplyHandlerData | Promise<ReplyHandlerData>;

type Reply = (statusOrCallback: number | ReplyHandler, data?: any, headers?: any) => FakeAdapter;

export type FakeAdapter = {
  reset(): void;
  restore(): void;
  adapter: Adapter<AnyRequest>;

  history: { [method: string]: AnyRequest[] };
} & FakeMethods;

export type Handlers = {
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
type Query = (matcher?: string | RegExp | MatcherFn) => Handlers;
// We do this because typescript can't unwrap type in suggestions.
// Developer sees signature (matcher?: Matcher) instead of (matcher?: string | RegExp | MatcherFn)
// to avoid this we put original signature to function and extract type to use it in code
export type Matcher = Parameters<Query>[0];

export type FakeMethods = {
  onGet: Query;
  onPost: Query;
  onPut: Query;
  onHead: Query;
  onDelete: Query;
  onPatch: Query;
  onList: Query;
  onAny: Query;
};

export const NO_MATCHER = Symbol('NO_MATCHER');

export type NoMatcher = typeof NO_MATCHER;

export type RegisteredHandler = {
  once: boolean;
  method: string;
  matcher: Matcher | NoMatcher;
  handler: Adapter<AnyRequest>;
  handlerType: string;
};

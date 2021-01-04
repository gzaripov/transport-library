import { URL } from 'url';
import buildUrl from '../../core/build-url';
import { RegisteredHandler, NO_MATCHER } from './types';

function isUrlMatching(url1: string, url2: string) {
  const noSlashUrl = url1[0] === '/' ? url1.substr(1) : url1;
  const noSlashRequired = url2[0] === '/' ? url2.substr(1) : url2;
  return noSlashUrl === noSlashRequired;
}

export default function matchHandler(request: any, handlers: RegisteredHandler[]) {
  return handlers.find(({ method, matcher }) => {
    if (method !== 'any' && request.method !== method.toUpperCase()) {
      return false;
    }

    if (matcher === NO_MATCHER) {
      return true;
    }

    const { pathname } = new URL(
      buildUrl(request.url || '/test', request.baseUrl || 'http://localhost'),
    );

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
}

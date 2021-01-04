import createEventEmitter, { Emitter } from '../lib/event-emitter/event-emitter';

type CancelEvents = {
  cancel: (message?: string) => void;
  cancelled: (message?: string) => void;
};

export type CancelToken = Emitter<CancelEvents>;

export type CancelController = {
  token: CancelToken;
  cancel: (message?: string) => void;
};

export function createCancelController(): CancelController {
  const token = createEventEmitter<CancelEvents>();

  return {
    token,
    cancel: (message?: string) => token.emit('cancel', message),
  };
}

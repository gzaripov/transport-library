type Listener = (...args: any[]) => void;

export type EventsMap = { [event: string]: Listener };

export type Emitter<Events extends EventsMap> = {
  on: <E extends string>(event: E, cb: Events[E]) => Emitter<Events>;
  once: <E extends string>(event: E, cb: EventsMap[E]) => Emitter<Events>;
  off: <E extends string>(event: E, cb: EventsMap[E]) => Emitter<Events>;
  offAll: <E extends string>(event?: E) => Emitter<Events>;
  emit: <E extends string>(event: E, ...args: Parameters<Events[E]>) => Emitter<Events>;
  listeners: <E extends string>(event: E) => Listener[];
};

type ListenersMap<Events extends EventsMap> = Map<keyof Events, Set<Events[keyof Events]>>;

export default function createEventEmitter<Events extends EventsMap>(): Emitter<Events> {
  const emitter = {} as Emitter<Events>;
  const eventTolisteners = new Map() as ListenersMap<Events>;
  const listenersSet = <E extends keyof Events>(event: E) => {
    if (!eventTolisteners.has(event)) {
      eventTolisteners.set(event, new Set());
    }

    return eventTolisteners.get(event)!;
  };

  const on = <E extends keyof Events>(event: E, cb: Events[E]) => {
    const set = listenersSet(event);

    set.add(cb);

    return emitter;
  };

  const off = <E extends keyof Events>(event: E, cb: Events[E]) => {
    const set = listenersSet(event);

    set.delete(cb);

    return emitter;
  };

  const once = <E extends keyof Events>(event: E, cb: Events[E]) => {
    on(event, cb);
    on(event, function offCb() {
      off(event, cb);
      off(event, offCb as Events[E]);
    } as Events[E]);

    return emitter;
  };

  const offAll = <E extends keyof Events>(event?: E) => {
    if (event) {
      listenersSet(event).clear();
    } else {
      eventTolisteners.clear();
    }

    return emitter;
  };

  const emit = <E extends keyof Events>(event: E, ...args: Parameters<Events[E]>) => {
    listenersSet(event).forEach((cb) => cb(...args));

    return emitter;
  };

  const listeners = <E extends keyof Events>(event: E) => Array.from(listenersSet(event).values());

  return Object.assign(emitter, {
    on,
    once,
    off,
    offAll,
    emit,
    listeners,
  });
}

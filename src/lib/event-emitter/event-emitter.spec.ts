import createEventEmitter from './event-emitter';

describe('Event emitter', () => {
  it('should call subscribers after emit event is fired', () => {
    const emitter = createEventEmitter();
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    emitter.on('event', listener1);
    emitter.on('event', listener2);
    emitter.on('event', listener2);

    emitter.emit('event');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it('should not call subscribers after unsubscriptions event', () => {
    const emitter = createEventEmitter();
    const listener = jest.fn();

    emitter.on('event', listener);

    emitter.emit('event');

    expect(listener).toHaveBeenCalledTimes(1);

    emitter.off('event', listener);

    emitter.emit('event');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should call callback only once when using .once', () => {
    const emitter = createEventEmitter();

    const listener = jest.fn();

    emitter.once('event', listener);

    emitter.emit('event');
    emitter.emit('event');
    emitter.emit('event');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should not call callback when using .once and off it before call', () => {
    const emitter = createEventEmitter();

    const listener = jest.fn();

    emitter.once('event', listener);
    emitter.off('event', listener);

    emitter.emit('event');
    emitter.emit('event');
    emitter.emit('event');

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it('should off callbacks by name when using .offAll and specify event name', () => {
    const emitter = createEventEmitter();

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();

    emitter.on('event1', listener1);
    emitter.on('event1', listener2);
    emitter.on('event2', listener3);

    emitter.emit('event1');
    emitter.emit('event2');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener3).toHaveBeenCalledTimes(1);

    emitter.offAll('event1');

    emitter.emit('event1');
    emitter.emit('event2');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener3).toHaveBeenCalledTimes(2);
  });

  it('should off all callbacks when using .offAll without specifying event name', () => {
    const emitter = createEventEmitter();

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();

    emitter.on('event1', listener1);
    emitter.on('event1', listener2);
    emitter.on('event2', listener3);

    emitter.emit('event1');
    emitter.emit('event2');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener3).toHaveBeenCalledTimes(1);

    emitter.offAll();

    emitter.emit('event1');
    emitter.emit('event2');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener3).toHaveBeenCalledTimes(1);
  });

  it('should return all listeners when call .listeners function on event emitter', () => {
    const emitter = createEventEmitter();

    const listener1 = jest.fn();
    const listener2 = jest.fn();

    emitter.on('event1', listener1);
    emitter.on('event1', listener2);

    emitter.emit('event1');

    expect(emitter.listeners('event1')).toStrictEqual([listener1, listener2]);
  });

  it('should allow to chain .on calls', () => {
    const emitter = createEventEmitter();

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();

    emitter
      .on('event1', listener1)
      .on('event2', listener2)
      .on('event3', listener3)
      .on('event3', listener3);

    emitter.emit('event1').emit('event2').emit('event3');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener3).toHaveBeenCalledTimes(1);
  });
});

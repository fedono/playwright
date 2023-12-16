import type { EventEmitter } from 'events';

export type RegisteredListener = {
  emitter: EventEmitter;
  eventName: (string | symbol);
  handler: (...args: any[]) => void;
};

class EventsHelper {
  static addEventListener(
    emitter: EventEmitter,
    eventName: (string | symbol),
    handler: (...args: any[]) => void): RegisteredListener {
    emitter.on(eventName, handler);
    return { emitter, eventName, handler };
  }

  static removeEventListeners(listeners: Array<{
      emitter: EventEmitter;
      eventName: (string | symbol);
      handler: (...args: any[]) => void;
    }>) {
    for (const listener of listeners)
      listener.emitter.removeListener(listener.eventName, listener.handler);
    listeners.splice(0, listeners.length);
  }
}

export const eventsHelper = EventsHelper;

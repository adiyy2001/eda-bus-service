import { EventBusStrategy } from './event-bus-strategy.interface';
import { BaseEvent } from '../../models/event.interface';
import { DEFAULT_LOGGING_CONFIG, LoggingMiddleware } from '../../middleware/logging.middleware';

type EventListener<T> = (event: BaseEvent<T>) => void;

export class PersistedStrategy implements EventBusStrategy {
  private readonly storageKey: string = 'persisted_events';
  private readonly logger: LoggingMiddleware = new LoggingMiddleware(DEFAULT_LOGGING_CONFIG);
  private listeners: Map<string, Set<EventListener<any>>> = new Map();

  constructor() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  subscribe<T>(eventType: string, listener: EventListener<T>): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
    this.logger.handle(eventType, {}, 'emit', 'INFO');
  }

  unsubscribe<T>(eventType: string, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
      this.logger.handle(eventType, {}, 'emit', 'INFO');
    }
  }

  emit<T>(eventName: string, event: BaseEvent<T>): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const events: BaseEvent<T>[] = stored ? JSON.parse(stored) : [];
      events.push(event);
      localStorage.setItem(this.storageKey, JSON.stringify(events));
      this.logger.handle(eventName, event, 'emit', 'INFO');

      const eventListeners = this.listeners.get(eventName);
      if (eventListeners) {
        eventListeners.forEach((listener) => listener(event));
      }
    } catch (error) {
      console.error('PersistedStrategy.emit error:', error);
    }
  }

  drain(): BaseEvent<any>[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const events: BaseEvent<any>[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(this.storageKey, JSON.stringify([]));
      return events;
    } catch (error) {
      console.error('PersistedStrategy.drain error:', error);
      return [];
    }
  }
}

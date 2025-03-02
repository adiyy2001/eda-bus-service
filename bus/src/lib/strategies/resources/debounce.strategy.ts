import { EventBusStrategy } from './event-bus-strategy.interface';
import { BaseEvent } from '../../models/event.interface';
import { DEFAULT_LOGGING_CONFIG, LoggingMiddleware } from '../../middleware/logging.middleware';

export class DebounceStrategy implements EventBusStrategy {
  private defaultDelay: number = 300;
  // Map to store timeout IDs per event name
  private debounceTimers: Map<string, number> = new Map();
  // Store the last event for each event name
  private lastEvents: Map<string, BaseEvent<any>> = new Map();
  // Subscribers for each event type
  private subscribers: Map<string, Array<(event: BaseEvent<any>) => void>> = new Map();
  private readonly logger: LoggingMiddleware = new LoggingMiddleware(DEFAULT_LOGGING_CONFIG);

  subscribe<T>(eventType: string, listener: (event: BaseEvent<T>) => void): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(listener as (event: BaseEvent<any>) => void);
    this.logger.handle(eventType, { listener }, 'subscribe', 'INFO');
  }

  unsubscribe<T>(eventType: string, listener: (event: BaseEvent<T>) => void): void {
    if (this.subscribers.has(eventType)) {
      const arr = this.subscribers.get(eventType)!;
      const index = arr.indexOf(listener as (event: BaseEvent<any>) => void);
      if (index !== -1) {
        arr.splice(index, 1);
        this.logger.handle(eventType, { listener }, 'unsubscribe', 'INFO');
      }
    }
  }

  emit<T>(eventName: string, event: BaseEvent<T>): void {
    // Use a delay from metadata if provided; otherwise, use the default debounce delay.
    const delay = (event.metadata && event.metadata['debounceDelay']) ? event.metadata['debounceDelay'] : this.defaultDelay;
    this.logger.handle(eventName, { event, delay }, 'schedule', 'INFO');

    // Save the latest event for this event name.
    this.lastEvents.set(eventName, event);

    // If a timer already exists for this event, clear it.
    if (this.debounceTimers.has(eventName)) {
      clearTimeout(this.debounceTimers.get(eventName));
    }

    // Schedule a new timer.
    const timerId = window.setTimeout(() => {
      const latestEvent = this.lastEvents.get(eventName);
      if (latestEvent) {
        const subs = this.subscribers.get(eventName);
        if (subs && subs.length > 0) {
          subs.forEach(listener => {
            try {
              listener(latestEvent);
            } catch (error) {
              console.error(`DebounceStrategy: error in listener for event ${eventName}`, error);
            }
          });
        }
        this.logger.handle(eventName, { event: latestEvent }, 'emit', 'INFO');
      }
      this.debounceTimers.delete(eventName);
      this.lastEvents.delete(eventName);
    }, delay);

    this.debounceTimers.set(eventName, timerId);
  }
}

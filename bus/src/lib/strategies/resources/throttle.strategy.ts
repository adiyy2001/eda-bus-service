import { EventBusStrategy } from './event-bus-strategy.interface';
import { BaseEvent } from '../../models/event.interface';
import { DEFAULT_LOGGING_CONFIG, LoggingMiddleware } from '../../middleware/logging.middleware';

export class ThrottleStrategy implements EventBusStrategy {
  // Default throttle delay (in ms)
  private defaultDelay: number = 1000;
  // Map to track whether an event type is throttled
  private throttleFlags: Map<string, boolean> = new Map();
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
    // If throttling is in effect, ignore this event.
    if (this.throttleFlags.get(eventName)) {
      this.logger.handle(eventName, { event }, 'throttled', 'INFO');
      return;
    }

    // Emit the event immediately.
    const subs = this.subscribers.get(eventName);
    if (subs && subs.length > 0) {
      subs.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`ThrottleStrategy: error in listener for event ${eventName}`, error);
        }
      });
    }
    this.logger.handle(eventName, { event }, 'emit', 'INFO');

    // Set the throttle flag and schedule its reset after the throttle delay.
    const delay = (event.metadata && event.metadata['throttleDelay']) ? event.metadata['throttleDelay'] : this.defaultDelay;
    this.throttleFlags.set(eventName, true);
    window.setTimeout(() => {
      this.throttleFlags.delete(eventName);
    }, delay);
  }
}

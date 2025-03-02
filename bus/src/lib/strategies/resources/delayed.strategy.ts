import { EventBusStrategy } from './event-bus-strategy.interface';
import { BaseEvent } from '../../models/event.interface';
import { DEFAULT_LOGGING_CONFIG, LoggingMiddleware } from '../../middleware/logging.middleware';

export class DelayedStrategy implements EventBusStrategy {
  private defaultDelay: number = 1000; // 1 sekunda

  private readonly logger: LoggingMiddleware = new LoggingMiddleware(DEFAULT_LOGGING_CONFIG);

  private subscribers: Map<string, Array<(event: BaseEvent<any>) => void>> = new Map();

  /**
   * Rejestracja subskrypcji dla danego typu zdarzenia.
   * @param eventType typ zdarzenia (nazwa)
   * @param listener funkcja, która zostanie wywołana, gdy zdarzenie zostanie wyemitowane
   */
  subscribe<T>(eventType: string, listener: (event: BaseEvent<T>) => void): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(listener as (event: BaseEvent<any>) => void);
    this.logger.handle(eventType, { listener }, 'subscribe', 'INFO');
  }

  /**
   * @param eventType typ zdarzenia (nazwa)
   * @param listener funkcja, którą chcemy wyrejestrować
   */
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

  /**
   * @param eventName nazwa zdarzenia
   * @param event obiekt zdarzenia
   */
  emit<T>(eventName: string, event: BaseEvent<T>): void {
    // Pobierz opóźnienie – z metadanych lub domyślne
    const delay = (event.metadata && event.metadata['delay']) ? event.metadata['delay'] : this.defaultDelay;
    this.logger.handle(eventName, { event, delay }, 'schedule', 'INFO');

    setTimeout(() => {
      const subs = this.subscribers.get(eventName);
      if (subs && subs.length > 0) {
        subs.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error(`DelayedStrategy: błąd w listenerze dla zdarzenia ${eventName}`, error);
          }
        });
      }
      this.logger.handle(eventName, { event }, 'emit', 'INFO');
    }, delay);
  }
}

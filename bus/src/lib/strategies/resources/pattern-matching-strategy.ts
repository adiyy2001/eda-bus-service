import { BaseEvent } from '../../models/event.interface';
import { EventBusStrategy } from './event-bus-strategy.interface';

/**
 * PatternMatchingStrategy
 *  - Pozwala na subskrypcję zdarzeń według wzorca (np. RegExp).
 *  - Wymaga więc przechowywania par: (RegExp, listener).
 *  - Podczas `emit`, szukamy wszystkich RegExp, które pasują do eventType.
 */
export class PatternMatchingStrategy implements EventBusStrategy {
  private subscribers: Array<{ pattern: RegExp; listener: (event: BaseEvent) => void }> = [];

  /**
   * Zamiast "eventType" (string) przyjmuje wzorzec (RegExp).
   */
  public subscribe(regex: string | RegExp, listener: (event: BaseEvent) => void): void {
    const pattern = typeof regex === 'string' ? new RegExp(regex) : regex;
    this.subscribers.push({ pattern, listener });
  }

  public unsubscribe(regex: string | RegExp, listener: (event: BaseEvent) => void): void {
    const pattern = typeof regex === 'string' ? new RegExp(regex) : regex;
    this.subscribers = this.subscribers.filter(
      s => !(s.pattern.source === pattern.source && s.listener === listener)
    );
  }

  public emit(eventType: string, event: BaseEvent): void {
    for (const { pattern, listener } of this.subscribers) {
      if (pattern.test(eventType)) {
        listener(event);
      }
    }
  }
}

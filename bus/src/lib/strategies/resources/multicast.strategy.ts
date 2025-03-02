import { BaseEvent } from '../../models/event.interface';
import { EventBusStrategy } from './event-bus-strategy.interface';

/**
 * MulticastStrategy
 *  - Każde wyemitowane zdarzenie jest przekazywane do *wszystkich* subskrybentów,
 *    którzy zapisali się konkretnie na dany typ zdarzenia (eventType).
 */
export class MulticastStrategy implements EventBusStrategy {
  private subscribers: Map<string, Array<(event: BaseEvent) => void>> = new Map();

  public subscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(listener);
  }

  public unsubscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    if (this.subscribers.has(eventType)) {
      const listeners = this.subscribers.get(eventType)!;
      const updated = listeners.filter(l => l !== listener);
      this.subscribers.set(eventType, updated);
    }
  }

  /**
   * Emituje zdarzenie do *wszystkich* subskrybentów zapisanych na dany eventType.
   */
  public emit(eventType: string, event: BaseEvent): void {
    const listeners = this.subscribers.get(eventType);
    if (!listeners || listeners.length === 0) {
      return;
    }
    for (const listener of listeners) {
      listener(event);
    }
  }
}

import { BaseEvent } from '../../models/event.interface';
import { EventBusStrategy } from './event-bus-strategy.interface';

/**
 * BroadcastStrategy
 *  - Każde wyemitowane zdarzenie jest przekazywane do absolutnie wszystkich
 *    subskrybentów, niezależnie od tego, na jaki eventType się zapisali.
 *  - Może to powodować 'globalną' reakcję w całym systemie.
 */
export class BroadcastStrategy implements EventBusStrategy {
  private subscribers: Map<string, Array<(event: BaseEvent) => void>> = new Map();

  /**
   * Rejestruje listenera na konkretny eventType.
   */
  public subscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(listener);
  }

  /**
   * Usuwa określonego listenera z listy subskrybentów, jeśli istnieje.
   */
  public unsubscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    if (this.subscribers.has(eventType)) {
      const listeners = this.subscribers.get(eventType)!;
      const updatedListeners = listeners.filter(l => l !== listener);
      this.subscribers.set(eventType, updatedListeners);
    }
  }

  /**
   * Emisja zdarzenia trafia do WSZYSTKICH słuchaczy, niezależnie od eventType.
   */
  public emit(eventType: string, event: BaseEvent): void {
    // Przechodzimy przez wszystkie tablice subskrybentów
    for (const [, listeners] of this.subscribers) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }
}

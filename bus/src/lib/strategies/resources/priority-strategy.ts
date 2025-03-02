import { Subject } from 'rxjs';
import { BaseEvent } from '../../models/event.interface';
import { EventBusStrategy } from './event-bus-strategy.interface';

/**
 * PriorityStrategy
 *  - Każdy subskrybent posiada priorytet.
 *  - Przy emitowaniu zdarzeń subskrybenci są powiadamiani w kolejności od najwyższego do najniższego priorytetu.
 *  - Priorytety są liczbami całkowitymi, gdzie większa liczba oznacza wyższy priorytet.
 */
export class PriorityStrategy implements EventBusStrategy {
  private subscribers: Map<
    string,
    Array<{ priority: number; listener: (event: BaseEvent) => void }>
  > = new Map();

  private subject$ = new Subject<{ eventType: string; event: BaseEvent }>();

  constructor() {
    this.subject$.subscribe(({ eventType, event }) => {
      const subscribers = this.subscribers.get(eventType);
      if (!subscribers) {
        return;
      }

      // Powiadom subskrybentów w kolejności priorytetu`
      subscribers
        .slice() // Kopia, by uniknąć mutacji
        .sort((a, b) => b.priority - a.priority)
        .forEach(subscriber => subscriber.listener(event));
    });
  }

  public subscribe(
    eventType: string,
    listener: (event: BaseEvent) => void,
    priority: number = 0
  ): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push({ priority, listener });
  }

  public unsubscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    if (this.subscribers.has(eventType)) {
      const updated = this.subscribers
        .get(eventType)!
        .filter(sub => sub.listener !== listener);
      this.subscribers.set(eventType, updated);
    }
  }

  public emit(eventType: string, event: BaseEvent): void {
    this.subject$.next({ eventType, event });
  }
}

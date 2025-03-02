import { BaseEvent } from '../../models/event.interface';
import { EventBusStrategy } from './event-bus-strategy.interface';

/**
 * UnicastStrategy umożliwia rozsyłanie zdarzeń do dokładnie jednego subskrybenta
 * (listenera) na każdy emitowany event. Implementuje kilka trybów wyboru listenera:
 *  - first: zawsze pierwszy zarejestrowany listener,
 *  - round-robin: kolejni listenerzy wybierani w kółko,
 *  - random: wybór losowego listenera.
 */
export class UnicastStrategy implements EventBusStrategy {
  private subscribers: Map<string, Array<(event: BaseEvent) => void>> = new Map();
  private _roundRobinIndices: Map<string, number> = new Map();

  constructor(
    private selectionMode: 'first' | 'round-robin' | 'random' = 'first'
  ) {}

  public subscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
      // Inicjujemy indeks round-robin
      this._roundRobinIndices.set(eventType, 0);
    }
    const listeners = this.subscribers.get(eventType)!;
    listeners.push(listener);
  }

  public unsubscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    if (this.subscribers.has(eventType)) {
      const listeners = this.subscribers.get(eventType)!;
      const updated = listeners.filter(l => l !== listener);
      this.subscribers.set(eventType, updated);

      // Aktualizacja indeksu w round-robin, żeby nie wyjść poza zakres
      if (this.selectionMode === 'round-robin') {
        const currentIndex = this._roundRobinIndices.get(eventType) ?? 0;
        if (currentIndex >= updated.length) {
          this._roundRobinIndices.set(eventType, 0);
        }
      }
    }
  }

  /**
   * Emit zdarzenia – wysyłamy do jednego słuchacza zgodnie z trybem:
   *  - 'first': zawsze pierwszy,
   *  - 'round-robin': w kółko,
   *  - 'random': losowy subskrybent.
   */
  public emit(eventType: string, event: BaseEvent): void {
    const listeners = this.subscribers.get(eventType);
    if (!listeners || listeners.length === 0) {
      return;
    }

    let listenerToCall: (event: BaseEvent) => void;
    switch (this.selectionMode) {
      case 'first':
        listenerToCall = listeners[0];
        break;

      case 'round-robin':
        const currentIndex = this._roundRobinIndices.get(eventType)!;
        listenerToCall = listeners[currentIndex];
        const nextIndex = (currentIndex + 1) % listeners.length;
        this._roundRobinIndices.set(eventType, nextIndex);
        break;

      case 'random':
        const randomIndex = Math.floor(Math.random() * listeners.length);
        listenerToCall = listeners[randomIndex];
        break;
    }

    listenerToCall(event);
  }
}

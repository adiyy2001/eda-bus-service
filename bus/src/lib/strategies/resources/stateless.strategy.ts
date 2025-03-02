import { BaseEvent } from '../../models/event.interface';
import { EventBusStrategy } from './event-bus-strategy.interface';

export class StatelessStrategy implements EventBusStrategy {
  private listeners = new Map<string, Array<(event: BaseEvent) => void>>();

  subscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  unsubscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      this.listeners.set(
        eventType,
        eventListeners.filter((l) => l !== listener)
      );
    }
  }

  emit(eventType: string, event: BaseEvent): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(event));
    }
  }
}

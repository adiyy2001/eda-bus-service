import { BaseEvent } from '../../models/event.interface';
import { EventBusStrategy } from './event-bus-strategy.interface';

export class StatefulStrategy implements EventBusStrategy {
  private listeners = new Map<string, Array<(event: BaseEvent) => void>>();
  private eventHistory = new Map<string, BaseEvent[]>();

  /**
   * Subscribe to an event type and replay its history.
   * @param eventType The event type to subscribe to.
   * @param listener The callback function to invoke when the event is emitted.
   */
  subscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    // Replay event history for the new subscriber
    const history = this.eventHistory.get(eventType) || [];
    history.forEach((event) => listener(event));
  }

  /**
   * Unsubscribe a listener from an event type.
   * @param eventType The event type to unsubscribe from.
   * @param listener The callback function to remove.
   */
  unsubscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      this.listeners.set(
        eventType,
        eventListeners.filter((l) => l !== listener)
      );
    }
  }

  /**
   * Emit an event and store it in history.
   * @param eventType The type of event being emitted.
   * @param event The event object containing data.
   */
  emit(eventType: string, event: BaseEvent): void {
    if (!this.eventHistory.has(eventType)) {
      this.eventHistory.set(eventType, []);
    }
    this.eventHistory.get(eventType)!.push(event);

    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(event));
    }
  }

  /**
   * Retrieve the history of a specific event type.
   * @param eventType The event type to retrieve history for.
   * @returns An array of past events for the given type.
   */
  getEventHistory(eventType: string): BaseEvent[] {
    return this.eventHistory.get(eventType) || [];
  }

  /**
   * Clear the history of a specific event type.
   * @param eventType The event type whose history should be cleared.
   */
  clearEventHistory(eventType: string): void {
    this.eventHistory.delete(eventType);
  }

  /**
   * Clean up all listeners and history for an event type.
   * @param eventType The event type to clean up.
   */
  cleanUp(eventType: string): void {
    this.listeners.delete(eventType);
    this.eventHistory.delete(eventType);
  }
}

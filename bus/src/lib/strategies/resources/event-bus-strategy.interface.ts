import { BaseEvent } from '../../models/event.interface';

/**
 * Interface for an Event Bus Strategy that handles event subscription, unsubscription, and emission.
 */
export interface EventBusStrategy {
  /**
   * Subscribe to a specific event type.
   * @param eventType - The type of event to subscribe to.
   * @param listener - The callback function to invoke when the event is emitted.
   */
  subscribe(eventType: string, listener: (event: BaseEvent) => void): void;

  /**
   * Unsubscribe a specific listener from a specific event type.
   * @param eventType - The type of event to unsubscribe from.
   * @param listener - The callback function to remove.
   */
  unsubscribe(eventType: string, listener: (event: BaseEvent) => void): void;

  /**
   * Emit an event to all listeners subscribed to the specified event type.
   * @param eventType - The type of event being emitted.
   * @param event - The event object containing relevant data.
   */
  emit(eventType: string, event: BaseEvent): void;
}

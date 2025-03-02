import { EventCategory } from './event-types';

/**
 * Base interface describing an event in the system.
 * Can be extended by DomainEvent, SystemEvent, UserEvent, etc.
 */
export interface BaseEvent<T = any> {
  /**
   * The name of the event (e.g., "OrderCreated", "UserLoggedIn").
   */
  name: string;

  /**
   * The timestamp indicating when the event was created.
   */
  timestamp: number;

  /**
   * The actual data (payload) carried by the event.
   */
  payload: T;

  /**
   * The category of the event (e.g., DOMAIN, SYSTEM, USER).
   */
  category: EventCategory;

  /**
   * Metadata containing additional information (e.g., event source, environment, etc.).
   */
  metadata?: Record<string, any>;


  delay?: number;
  /**
   * A unique identifier for correlating related events
   * (e.g., for tracking transactions or workflows).
   */
  correlationId?: string;

  /**
   * Identifier of the associated aggregate (e.g., `OrderId`, `UserId`), if applicable.
   */
  aggregateId?: string;

  /**
   * The version of the event, if events are versioned (e.g., in Event Sourcing).
   */
  version?: number;
  priority?:number;
}

/**
 * Interface for events with priority, extending the base event structure.
 */
export interface PriorityEvent<T> extends BaseEvent<T> {
  /**
   * Priority level of the event. Higher numbers indicate higher priority.
   */
  priority: number;
}

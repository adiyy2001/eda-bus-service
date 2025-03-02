// ./models/event-types.ts

import { BaseEvent } from "./event.interface";

/**
 * Enumeration categorizing events in the system.
 */
export enum EventCategory {
  DOMAIN = 'DOMAIN',
  SYSTEM = 'SYSTEM',
  USER = 'USER',
}

/**
 * Domain event — used to carry business-related information
 * (e.g., events such as `OrderCreated`, `ProductPriceChanged`).
 */
export interface DomainEvent<T = any> extends BaseEvent<T> {
  category: EventCategory.DOMAIN;
}

/**
 * System event — related to the application's general functioning
 * (e.g., events such as `CacheInvalidated`, `MicroserviceStarted`).
 */
export interface SystemEvent<T = any> extends BaseEvent<T> {
  category: EventCategory.SYSTEM;
}

/**
 * User event — typically triggered by direct user interaction in the UI
 * (e.g., events such as `ButtonClicked`, `FormSubmitted`).
 */
export interface UserEvent<T = any> extends BaseEvent<T> {
  category: EventCategory.USER;
}

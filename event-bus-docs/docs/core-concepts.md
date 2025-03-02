---
sidebar_position: 3
---

# Core Concepts

The Event Bus Library is built around several key concepts that work together to provide a flexible and powerful event management system.

## Events

Events are the core data structures in the Event Bus. They represent something that has happened in your application that other components might be interested in.

An event consists of:
- **name**: The event identifier (e.g., 'user:login', 'data:loaded')
- **timestamp**: When the event occurred
- **payload**: The data associated with the event
- **category**: The classification of the event (DOMAIN, SYSTEM, USER)
- **metadata**: Optional additional information about the event
- **correlationId**: Optional ID for tracking related events
- **aggregateId**: Optional ID for domain aggregates
- **version**: Optional version number for evolving events
- **priority**: Optional priority level for processing order

## Event Categories

Events are classified into three main categories:

1. **Domain Events**: Represent something significant that happened in your business domain (e.g., 'order:created', 'payment:processed')
2. **System Events**: Related to the application infrastructure (e.g., 'cache:invalidated', 'config:updated')
3. **User Events**: Triggered by user interactions (e.g., 'button:clicked', 'form:submitted')

## Strategies

The Event Bus implements the Strategy pattern to provide different behaviors for event propagation. Each strategy determines how events are routed to subscribers.

Some key strategies include:

- **Stateless**: Basic event propagation with no state maintained
- **Stateful**: Maintains event history and can replay past events
- **Broadcast**: Sends events to all subscribers regardless of event type
- **Multicast**: Sends events to all subscribers of the specific event type
- **Unicast**: Sends events to a single subscriber (first, random, or round-robin)
- **Debounce**: Delays event processing and coalesces multiple events into one
- **Throttle**: Limits the rate at which events are processed
- **Pattern Matching**: Routes events based on name pattern matching
- **Priority**: Processes events based on their priority level
- **Round Robin**: Distributes events across subscribers in sequence
- **Persisted**: Stores events for resilience and later processing

## Middleware

Middleware components process events before they reach subscribers. They can perform tasks like:

- **Logging**: Recording event information
- **Validation**: Ensuring events have valid payloads
- **Error Handling**: Managing exceptions during event processing

## Queues

The Event Bus supports different queuing mechanisms:

- **FIFO Queue**: Processes events in the order they were received
- **Priority Queue**: Processes events based on their priority level

## Subscription Model

The Event Bus uses RxJS Observables for its subscription model, providing:

- **Type Safety**: Generic types for event payloads
- **Filtering**: Ability to filter events before processing
- **Lifecycle Management**: Easy subscription cleanup
- **One-time Subscriptions**: Subscribe to an event just once

In the following sections, we'll explore each of these concepts in more detail with practical examples.

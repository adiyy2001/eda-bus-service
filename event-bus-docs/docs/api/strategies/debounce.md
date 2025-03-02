---
sidebar_position: 2
---

# Stateless Strategy

The `StatelessStrategy` is the simplest event bus strategy that implements the basic publish-subscribe pattern. It delivers events to subscribers without maintaining any history or state.

## Key Features

- Basic event propagation with no state maintained
- Each event is delivered to all subscribers of that specific event type
- No event history is kept
- New subscribers only receive events emitted after they subscribe

## When to Use

Use the `StatelessStrategy` when:

- You need a simple pub/sub mechanism
- Event history is not important
- Memory usage should be minimized
- You want events to be processed immediately

## Implementation

```typescript
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
```

## Usage

```typescript
import { Component, OnInit } from '@angular/core';
import { EventBusService, StrategyType, BaseEvent, EventCategory } from '@yourdomain/event-bus-library';

interface UserData {
  id: string;
  name: string;
}

@Component({
  selector: 'app-example',
  template: '<button (click)="sendEvent()">Send Event</button>'
})
export class ExampleComponent implements OnInit {
  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    // Set the strategy to Stateless (this is the default)
    this.eventBus.setStrategy(StrategyType.STATELESS);
    
    // Subscribe to events
    this.eventBus.on<UserData>('user:updated').subscribe(
      (event: BaseEvent<UserData>) => {
        console.log('User updated:', event.payload);
      }
    );
  }

  sendEvent() {
    // Emit an event
    this.eventBus.emit<UserData>({
      name: 'user:updated',
      timestamp: Date.now(),
      payload: {
        id: '123',
        name: 'John Doe'
      },
      category: EventCategory.DOMAIN
    });
  }
}
```

## Advantages

- **Simplicity**: Easy to understand and implement
- **Low Memory Footprint**: Does not store events
- **Predictable Behavior**: Events are processed in emission order

## Limitations

- **No History**: New subscribers miss events emitted before they subscribed
- **No Replay**: Cannot replay past events
- **No Batching**: Events are processed immediately (which can be inefficient for high-frequency events)

## Comparison with Other Strategies

| Feature | Stateless | Stateful | Persisted |
|---------|-----------|----------|-----------|
| Event History | No | Yes | Yes |
| Replay for New Subscribers | No | Yes | No |
| Memory Usage | Low | Higher | Medium |
| Persistence | No | No | Yes (localStorage) |

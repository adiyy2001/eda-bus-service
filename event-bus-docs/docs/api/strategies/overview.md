---
sidebar_position: 1
---

# Strategies Overview

The Event Bus Library implements the Strategy pattern to provide different behaviors for event propagation. Each strategy determines how events are routed to subscribers and has its own unique characteristics.

## Strategy Types

The library includes the following strategies:

| Strategy | Description |
|----------|-------------|
| [Stateless](./stateless) | Basic event propagation with no state maintained |
| [Stateful](./stateful) | Maintains event history and can replay past events |
| [Broadcast](./broadcast) | Sends events to all subscribers regardless of event type |
| [Multicast](./multicast) | Sends events to all subscribers of the specific event type |
| [Unicast](./unicast) | Sends events to a single subscriber (first, random, or round-robin) |
| [Debounce](./debounce) | Delays event processing and coalesces multiple events into one |
| [Throttle](./throttle) | Limits the rate at which events are processed |
| [Delayed](./delayed) | Delays the delivery of events by a specified time |
| [Persisted](./persisted) | Stores events for resilience and later processing |
| [Pattern Matching](./pattern-matching) | Routes events based on name pattern matching |
| [Priority](./priority) | Processes events based on their priority level |
| [Round Robin](./round-robin) | Distributes events across subscribers in sequence |

## Using Strategies

### Setting the Strategy

You can set the strategy using the `EventBusService`:

```typescript
import { EventBusService, StrategyType } from '@yourdomain/event-bus-library';

@Component({
  selector: 'app-root',
  template: '<div>Event Bus Demo</div>'
})
export class AppComponent implements OnInit {
  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    // Set the strategy at initialization
    this.eventBus.setStrategy(StrategyType.MULTICAST);
  }
}
```

### Choosing the Right Strategy

Here are some guidelines for choosing the appropriate strategy:

1. **Stateless Strategy**: Use for basic event propagation when you don't need event history
2. **Stateful Strategy**: Use when you need to replay events for new subscribers
3. **Broadcast Strategy**: Use when all components need to be notified of all events
4. **Multicast Strategy**: Use for standard pub/sub behavior (most common)
5. **Unicast Strategy**: Use when only one handler should process each event
6. **Debounce Strategy**: Use for high-frequency events where you only care about the final state
7. **Throttle Strategy**: Use to limit the processing rate of events
8. **Delayed Strategy**: Use when event processing should be deferred
9. **Persisted Strategy**: Use when events need to survive page refreshes or app restarts
10. **Pattern Matching Strategy**: Use when event routing needs to be based on naming patterns
11. **Priority Strategy**: Use when some events need to be processed before others
12. **Round Robin Strategy**: Use to distribute event processing load across subscribers

## Strategy Interface

All strategies implement the `EventBusStrategy` interface:

```typescript
export interface EventBusStrategy {
  subscribe(eventType: string, listener: (event: BaseEvent) => void): void;
  unsubscribe(eventType: string, listener: (event: BaseEvent) => void): void;
  emit(eventType: string, event: BaseEvent): void;
}
```

## Creating Custom Strategies

You can create custom strategies by implementing the `EventBusStrategy` interface:

```typescript
import { EventBusStrategy } from '@yourdomain/event-bus-library';
import { BaseEvent } from '@yourdomain/event-bus-library';

export class CustomStrategy implements EventBusStrategy {
  private subscribers: Map<string, Array<(event: BaseEvent) => void>> = new Map();

  public subscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(listener);
  }

  public unsubscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    if (this.subscribers.has(eventType)) {
      const listeners = this.subscribers.get(eventType)!;
      const updated = listeners.filter(l => l !== listener);
      this.subscribers.set(eventType, updated);
    }
  }

  public emit(eventType: string, event: BaseEvent): void {
    // Custom emit logic here
    const listeners = this.subscribers.get(eventType);
    if (listeners) {
      // Implement your custom event propagation logic
      listeners.forEach(listener => listener(event));
    }
  }
}
```

To use a custom strategy, you'll need to register it with Angular's dependency injection system:

```typescript
import { NgModule } from '@angular/core';
import { EventBusModule } from '@yourdomain/event-bus-library';
import { CustomStrategy } from './custom.strategy';

@NgModule({
  imports: [
    EventBusModule
  ],
  providers: [
    {
      provide: 'CUSTOM_STRATEGY',
      useClass: CustomStrategy
    }
  ]
})
export class AppModule { }
```

Then inject and use it:

```typescript
import { Component, Inject, OnInit } from '@angular/core';
import { EventBusService } from '@yourdomain/event-bus-library';

@Component({
  selector: 'app-root',
  template: '<div>Event Bus Demo</div>'
})
export class AppComponent implements OnInit {
  constructor(
    private eventBus: EventBusService,
    @Inject('CUSTOM_STRATEGY') private customStrategy: any
  ) {}

  ngOnInit() {
    // Set custom strategy
    this.eventBus['strategy'] = this.customStrategy;
  }
}
```

In the next sections, we'll explore each strategy in detail.

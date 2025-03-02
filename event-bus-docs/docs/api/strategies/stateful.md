---
sidebar_position: 3
---

# Stateful Strategy

The `StatefulStrategy` maintains a history of events and can replay past events to new subscribers. It's particularly useful for components that need to initialize their state based on events that occurred before they subscribed.

## Key Features

- Maintains a complete history of events by event type
- Automatically replays past events to new subscribers
- Provides methods to retrieve or clear event history
- Supports clean-up of specific event types

## When to Use

Use the `StatefulStrategy` when:

- Components need to recover their state after being created or recreated
- You need event replay capability for late subscribers
- You want to implement event sourcing patterns
- You need audit trails or history of specific event types

## Implementation

```typescript
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
```

## Usage

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventBusService, StrategyType, BaseEvent, EventCategory } from '@yourdomain/event-bus-library';
import { Subscription } from 'rxjs';

interface ThemeConfig {
  primaryColor: string;
  darkMode: boolean;
}

@Component({
  selector: 'app-theme-manager',
  template: `
    <div class="theme-controls">
      <button (click)="toggleDarkMode()">Toggle Dark Mode</button>
      <input type="color" [(ngModel)]="primaryColor" (change)="updatePrimaryColor()">
    </div>
  `
})
export class ThemeManagerComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  primaryColor: string = '#2196F3';
  darkMode: boolean = false;

  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    // Set the strategy to Stateful to maintain theme state
    this.eventBus.setStrategy(StrategyType.STATEFUL);
    
    // Subscribe to theme changes (will also receive past theme events)
    this.subscription = this.eventBus.on<ThemeConfig>('theme:changed').subscribe(
      (event: BaseEvent<ThemeConfig>) => {
        this.primaryColor = event.payload.primaryColor;
        this.darkMode = event.payload.darkMode;
        this.applyTheme(event.payload);
      }
    );

    // If this is a fresh launch with no theme history, set default theme
    const statefulStrategy = this.eventBus['strategy'] as any;
    if (statefulStrategy.getEventHistory && 
        statefulStrategy.getEventHistory('theme:changed').length === 0) {
      this.emitThemeChange();
    }
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.emitThemeChange();
  }

  updatePrimaryColor() {
    this.emitThemeChange();
  }

  private emitThemeChange() {
    // Emit theme change event
    this.eventBus.emit<ThemeConfig>({
      name: 'theme:changed',
      timestamp: Date.now(),
      payload: {
        primaryColor: this.primaryColor,
        darkMode: this.darkMode
      },
      category: EventCategory.USER
    });
  }

  private applyTheme(theme: ThemeConfig) {
    // Apply theme to document
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.body.classList.toggle('dark-mode', theme.darkMode);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

## Working with Event History

You can access the event history directly if you have access to the strategy:

```typescript
import { Injectable } from '@angular/core';
import { EventBusService, StrategyType, BaseEvent } from '@yourdomain/event-bus-library';

@Injectable({
  providedIn: 'root'
})
export class EventHistoryService {
  constructor(private eventBus: EventBusService) {
    // Ensure we're using StatefulStrategy
    this.eventBus.setStrategy(StrategyType.STATEFUL);
  }

  getEventsOfType<T>(eventType: string): BaseEvent<T>[] {
    const statefulStrategy = this.eventBus['strategy'] as any;
    if (statefulStrategy.getEventHistory) {
      return statefulStrategy.getEventHistory(eventType) as BaseEvent<T>[];
    }
    return [];
  }

  clearEventsOfType(eventType: string): void {
    const statefulStrategy = this.eventBus['strategy'] as any;
    if (statefulStrategy.clearEventHistory) {
      statefulStrategy.clearEventHistory(eventType);
    }
  }

  getAllEventTypes(): string[] {
    const statefulStrategy = this.eventBus['strategy'] as any;
    if (statefulStrategy.eventHistory instanceof Map) {
      return Array.from(statefulStrategy.eventHistory.keys());
    }
    return [];
  }
}
```

## Advantages

- **State Recovery**: Components can initialize state based on past events
- **Late Subscription Support**: New subscribers receive past events
- **Audit Trail**: Provides complete history of events
- **Debugging**: Easier to debug by examining event history

## Limitations

- **Memory Usage**: Storing event history can consume significant memory
- **Performance**: Replaying large event histories can affect performance
- **Storage Type**: Events are stored in memory and lost on page refresh

## Comparison with Other Strategies

| Feature | Stateful | Stateless | Persisted |
|---------|----------|-----------|-----------|
| Event History | Yes, in memory | No | Yes, in localStorage |
| Replay for New Subscribers | Yes | No | No |
| Memory Usage | Higher | Lower | Medium |
| Persistence Across Sessions | No | No | Yes |

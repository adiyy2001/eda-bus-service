---
sidebar_position: 1
---

# EventBusService

The `EventBusService` is the central class of the Event Bus Library. It manages event subscriptions, event emission, and strategy selection.

## API Reference

### Methods

#### emit\<T\>(event: BaseEvent\<T\>): void

Emits an event to all subscribers based on the current strategy.

**Parameters:**
- `event: BaseEvent<T>` - The event to emit

**Example:**
```typescript
eventBus.emit<string>({
  name: 'message:sent',
  timestamp: Date.now(),
  payload: 'Hello World',
  category: EventCategory.USER
});
```

#### on\<T\>(eventName: string, filterFn?: (event: BaseEvent\<T\>) => boolean): Observable\<BaseEvent\<T\>\>

Subscribes to a specific event type.

**Parameters:**
- `eventName: string` - The name of the event to subscribe to
- `filterFn?: (event: BaseEvent<T>) => boolean` - Optional filter function

**Returns:**
- `Observable<BaseEvent<T>>` - An observable that emits events of the specified type

**Example:**
```typescript
const subscription = eventBus.on<string>('message:sent').subscribe(
  event => console.log('Received:', event.payload)
);
```

#### once\<T\>(eventName: string): Observable\<BaseEvent\<T\>\>

Subscribes to an event type and automatically unsubscribes after receiving the first event.

**Parameters:**
- `eventName: string` - The name of the event to subscribe to

**Returns:**
- `Observable<BaseEvent<T>>` - An observable that emits only the first event of the specified type

**Example:**
```typescript
eventBus.once<string>('app:initialized').subscribe(
  event => console.log('App initialized with config:', event.payload)
);
```

#### off(eventName: string, subscription: Subscription): void

Unsubscribes from a specific event type.

**Parameters:**
- `eventName: string` - The name of the event to unsubscribe from
- `subscription: Subscription` - The subscription to remove

**Example:**
```typescript
const subscription = eventBus.on('user:action').subscribe(/* ... */);
// Later:
eventBus.off('user:action', subscription);
```

#### offAll(eventName: string): void

Unsubscribes all listeners from a specific event type.

**Parameters:**
- `eventName: string` - The name of the event to unsubscribe all listeners from

**Example:**
```typescript
eventBus.offAll('notifications');
```

#### setStrategy(strategyType: StrategyType): void

Changes the current event bus strategy.

**Parameters:**
- `strategyType: StrategyType` - The strategy to use for event handling

**Example:**
```typescript
eventBus.setStrategy(StrategyType.DEBOUNCE);
```

#### setPriorityMode(enabled: boolean): void

Enables or disables priority-based event processing.

**Parameters:**
- `enabled: boolean` - Whether to enable priority mode

**Example:**
```typescript
eventBus.setPriorityMode(true);
```

#### setBatchSize(size: number): void

Sets the batch size for event processing.

**Parameters:**
- `size: number` - The number of events to process in each batch

**Example:**
```typescript
eventBus.setBatchSize(5);
```

#### drainQueue(): void

Processes all pending events in the queue.

**Example:**
```typescript
eventBus.drainQueue();
```

## Usage Patterns

### Basic Event Communication

```typescript
// Component A
export class SenderComponent {
  constructor(private eventBus: EventBusService) {}
  
  sendNotification() {
    this.eventBus.emit<string>({
      name: 'notification',
      timestamp: Date.now(),
      payload: 'New notification message',
      category: EventCategory.USER
    });
  }
}

// Component B
export class ReceiverComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  
  constructor(private eventBus: EventBusService) {}
  
  ngOnInit() {
    this.subscription = this.eventBus.on<string>('notification')
      .subscribe(event => {
        console.log('Received notification:', event.payload);
      });
  }
  
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

### Using Filters

```typescript
// Only process events with specific payload criteria
this.eventBus.on<User>('user:updated', 
  event => event.payload.role === 'admin')
  .subscribe(event => {
    console.log('Admin user updated:', event.payload);
  });
```

### One-time Events

```typescript
// Listen for application initialization only once
this.eventBus.once<AppConfig>('app:initialized')
  .subscribe(event => {
    this.initializeComponent(event.payload);
  });
```

### Changing Strategies Dynamically

```typescript
// In a form component that needs debouncing for inputs
export class SearchFormComponent {
  constructor(private eventBus: EventBusService) {
    // Use debounce for form inputs
    this.eventBus.setStrategy(StrategyType.DEBOUNCE);
  }
  
  onInput(searchTerm: string) {
    this.eventBus.emit<string>({
      name: 'search:term:changed',
      timestamp: Date.now(),
      payload: searchTerm,
      category: EventCategory.USER,
      metadata: {
        debounceDelay: 300 // Set custom debounce delay
      }
    });
  }
}
```

### Working with Priority

```typescript
// Set up priority-based processing
eventBus.setPriorityMode(true);

// Emit high-priority event
eventBus.emit<AlertMessage>({
  name: 'system:alert',
  timestamp: Date.now(),
  payload: { message: 'Critical system error', level: 'error' },
  category: EventCategory.SYSTEM,
  priority: 10 // High priority
});

// Emit low-priority event
eventBus.emit<Notification>({
  name: 'user:notification',
  timestamp: Date.now(),
  payload: { message: 'New message received' },
  category: EventCategory.USER,
  priority: 1 // Low priority
});
```

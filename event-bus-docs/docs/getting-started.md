---
sidebar_position: 2
---

# Getting Started

This guide will help you set up the Event Bus Library in your Angular application.

## Installation

Install the library using npm:

```bash
npm install @yourdomain/event-bus-library --save
```

## Basic Setup

### Import the Module

Import the `EventBusModule` in your application's main module:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EventBusModule } from '@yourdomain/event-bus-library';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    EventBusModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Configure Logging (Optional)

You can customize the logging configuration:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EventBusModule, LOGGING_CONFIG, LoggingConfig } from '@yourdomain/event-bus-library';

const customLoggingConfig: LoggingConfig = {
  enableLogging: true,
  logLevels: ['INFO', 'ERROR'],
  output: 'console',
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    EventBusModule
  ],
  providers: [
    { provide: LOGGING_CONFIG, useValue: customLoggingConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Using the Event Bus

Inject the `EventBusService` into your components or services:

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventBusService, BaseEvent } from '@yourdomain/event-bus-library';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-example',
  template: '<button (click)="sendMessage()">Send Message</button>'
})
export class ExampleComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    // Subscribe to events
    this.subscription = this.eventBus.on<string>('message:sent').subscribe(
      (event: BaseEvent<string>) => {
        console.log('Received message:', event.payload);
      }
    );
  }

  sendMessage() {
    // Emit an event
    this.eventBus.emit<string>({
      name: 'message:sent',
      timestamp: Date.now(),
      payload: 'Hello from Event Bus!',
      category: EventCategory.USER
    });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

## Changing Strategies

By default, the Event Bus uses the `StatelessStrategy`. You can change the strategy:

```typescript
import { Component, OnInit } from '@angular/core';
import { EventBusService, StrategyType } from '@yourdomain/event-bus-library';

@Component({
  selector: 'app-root',
  template: '<button (click)="changeStrategy()">Change Strategy</button>'
})
export class AppComponent implements OnInit {
  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    // Set the strategy at initialization
    this.eventBus.setStrategy(StrategyType.DEBOUNCE);
  }

  changeStrategy() {
    // Change strategy dynamically
    this.eventBus.setStrategy(StrategyType.THROTTLE);
  }
}
```

Now that you've set up the Event Bus Library, let's explore the core concepts and advanced features in the next sections.

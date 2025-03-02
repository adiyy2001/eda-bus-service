---
sidebar_position: 2
---

# Logging Middleware

The Logging Middleware provides detailed event logging capabilities for the Event Bus. It helps with debugging, monitoring, and auditing of events flowing through your application.

## Features

- Configurable log levels (INFO, DEBUG, ERROR)
- Customizable output destination
- Detailed event metadata logging
- Operation tracking (emit, subscribe, unsubscribe)

## Implementation

```typescript
export interface LoggingConfig {
  enableLogging: boolean;
  logLevels: Array<'INFO' | 'DEBUG' | 'ERROR'>;
  output: 'console' | 'custom';
  customLogger?: (message: string, level: string, data: any) => void;
}

export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  enableLogging: true,
  logLevels: ['INFO', 'DEBUG', 'ERROR'],
  output: 'console',
};

export const LOGGING_CONFIG = new InjectionToken<LoggingConfig>('LOGGING_CONFIG');

@Injectable()
export class LoggingMiddleware {
  private config: LoggingConfig;

  constructor(@Optional() @Inject(LOGGING_CONFIG) config: LoggingConfig) {
    this.config = config || DEFAULT_LOGGING_CONFIG;
  }

  handle(
    eventType: string,
    eventData: any,
    operation: 'emit' | 'subscribe' | 'unsubscribe' | 'receive' | 'schedule',
    level: 'INFO' | 'DEBUG' | 'ERROR' = 'INFO'
  ): void {
    if (!this.config.enableLogging || !this.config.logLevels.includes(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [${level}] [EventBus] [${operation}] ${eventType}`;

    if (this.config.output === 'console') {
      switch (level) {
        case 'ERROR':
          console.error(message, eventData);
          break;
        case 'DEBUG':
          console.debug(message, eventData);
          break;
        default:
          console.log(message, eventData);
      }
    } else if (this.config.output === 'custom' && this.config.customLogger) {
      this.config.customLogger(message, level, eventData);
    }
  }
}
```

## Configuration

You can customize the logging behavior by providing a custom configuration:

```typescript
const customLoggingConfig: LoggingConfig = {
  enableLogging: true,
  logLevels: ['INFO', 'ERROR'], // Exclude DEBUG logs
  output: 'console',
};

@NgModule({
  imports: [
    EventBusModule
  ],
  providers: [
    { provide: LOGGING_CONFIG, useValue: customLoggingConfig }
  ]
})
export class AppModule { }
```

## Custom Logger

You can implement a custom logger by setting the output to 'custom' and providing a customLogger function:

```typescript
const customLoggingConfig: LoggingConfig = {
  enableLogging: true,
  logLevels: ['INFO', 'DEBUG', 'ERROR'],
  output: 'custom',
  customLogger: (message, level, data) => {
    // Send logs to a logging service, analytics, or storage
    myLoggingService.log({
      message,
      level,
      data,
      timestamp: new Date(),
      source: 'EventBus'
    });
  }
};
```

## Example Output

When an event is emitted:

```
[2023-06-15T14:22:45.123Z] [INFO] [EventBus] [emit] user:login {"payload":{"userId":"123","username":"john_doe"},"timestamp":1623763365123}
```

When a subscription is created:

```
[2023-06-15T14:22:40.987Z] [INFO] [EventBus] [subscribe] user:login {"listener":"function"}
```

## Logging Levels

- **INFO**: General information about event flow (default)
- **DEBUG**: Detailed information for debugging purposes
- **ERROR**: Error conditions that occur during event processing

The Logging Middleware is automatically used by all strategies to ensure consistent logging throughout the Event Bus.

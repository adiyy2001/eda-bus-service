import { Subject } from 'rxjs';
import { ListenToEvent } from '../../decorators/listen-to-event.decorator';
import { EventBusService } from '../../services/event-bus.service';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { ErrorHandlerMiddleware } from '../../middleware/error-handler.middleware';
import {
  DEFAULT_LOGGING_CONFIG,
  LoggingMiddleware,
} from '../../middleware/logging.middleware';
import { EventBusStrategyFactory } from '../../strategies/event-bus-strategy.factory';

describe('ListenToEvent Decorator', () => {
  let mockEventBusService: EventBusService = new EventBusService(
    new ErrorHandlerMiddleware(),
    new LoggingMiddleware(DEFAULT_LOGGING_CONFIG),
    new ValidationMiddleware(),
    new EventBusStrategyFactory()
  );
  let eventSubject: Subject<any>;
  let validationMiddleware: ValidationMiddleware;

  beforeEach(() => {
    eventSubject = new Subject<any>();

    // Initialize ValidationMiddleware
    validationMiddleware = new ValidationMiddleware();
    mockEventBusService = {
      on: jasmine.createSpy('on').and.returnValue(eventSubject.asObservable()),
    } as any;
    // Register schema for prioBatch event
    validationMiddleware.addSchema('prioBatch', {
      type: 'object',
      properties: {
        name: { type: 'string' },
        payload: { type: 'string' },
        timestamp: { type: 'number' },
        metadata: {
          type: 'object',
          properties: {
            priority: { type: 'number' },
          },
          required: ['priority'],
        },
        category: { type: 'string' },
        priority: { type: 'number' },
      },
      required: [
        'name',
        'payload',
        'timestamp',
        'metadata',
        'category',
        'priority',
      ],
    });
  });

  it('should subscribe to event and invoke method', () => {
    const eventName = 'prioBatch';
    const mockEvent = {
      name: 'prioBatch',
      payload: 'P10',
      timestamp: 1737977654692,
      metadata: { priority: 10 },
      category: 'DOMAIN',
      priority: 10,
    };

    class TestClass {
      eventBus: EventBusService = mockEventBusService as EventBusService; // Inject the mock
      subscriptions: any[] = [];

      @ListenToEvent(eventName)
      handleEvent(event: any) {
        this.receivedEvent = event;
      }

      receivedEvent: any = null;
    }

    const instance = new TestClass();
    (instance.handleEvent as any)(); // Trigger subscription setup

    // Simulate an event being emitted
    eventSubject.next(mockEvent);

    // Verify subscription
    expect(mockEventBusService.on).toHaveBeenCalledWith(eventName);

    // Verify the event handler
    expect(instance.receivedEvent).toEqual(mockEvent);
  });

  it('should clean up subscriptions in ngOnDestroy', () => {
    const eventName = 'prioBatch';

    class TestClass {
      eventBus = mockEventBusService;
      subscriptions: any[] = [];

      @ListenToEvent(eventName)
      handleEvent(event: any) {}

      ngOnDestroy() {}
    }

    const instance = new TestClass();
    (instance.handleEvent as any)(); // Setup subscription
    instance.ngOnDestroy();

    // Verify that subscriptions are cleaned up
    expect(instance.subscriptions.length).toBe(0);
  });

  it('should handle errors in the decorated method', () => {
    const eventName = 'prioBatch';
    const consoleErrorSpy = spyOn(console, 'error');
    const mockEvent = {
      name: 'prioBatch',
      payload: 'P10',
      timestamp: 1737977654692,
      metadata: { priority: 10 },
      category: 'DOMAIN',
      priority: 10,
    };

    class TestClass {
      eventBus = mockEventBusService;
      subscriptions: any[] = [];

      @ListenToEvent(eventName)
      handleEvent() {
        throw new Error('Test error');
      }
    }

    const instance = new TestClass();
    (instance.handleEvent as any)(); // Setup subscription

    // Simulate an event being emitted
    eventSubject.next(mockEvent);

    // Verify error logging
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `[ListenToEvent] Error handling event "${eventName}":`,
      jasmine.any(Error)
    );
  });
});

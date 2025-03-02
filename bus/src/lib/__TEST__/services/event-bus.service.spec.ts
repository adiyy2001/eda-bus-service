import { TestBed } from '@angular/core/testing';
import { ReplaySubject } from 'rxjs';
import { EventBusService } from '../../services/event-bus.service';
import { StrategyType, EventBusStrategyFactory } from '../../strategies/event-bus-strategy.factory';
import { ErrorHandlerMiddleware } from '../../middleware/error-handler.middleware';
import { LoggingMiddleware } from '../../middleware/logging.middleware';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { EventCategory } from '../../models/event-types';
import { PersistedStrategy } from '../../strategies/resources/persisted.strategy';

describe('EventBusService', () => {
  let service: EventBusService;
  let errorHandler: jasmine.SpyObj<ErrorHandlerMiddleware>;
  let logger: jasmine.SpyObj<LoggingMiddleware>;
  let validator: jasmine.SpyObj<ValidationMiddleware>;
  let strategyFactory: EventBusStrategyFactory;

  beforeEach(() => {
    const errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerMiddleware', ['handleError']);
    // Stub the error handler so it does not throw.
    errorHandlerSpy.handleError.and.callFake(() => {});
    const loggerSpy = jasmine.createSpyObj('LoggingMiddleware', ['handle']);
    const validatorSpy = jasmine.createSpyObj('ValidationMiddleware', ['validate']);
    // By default, let validation pass.
    validatorSpy.validate.and.returnValue(true);

    TestBed.configureTestingModule({
      providers: [
        EventBusService,
        { provide: ErrorHandlerMiddleware, useValue: errorHandlerSpy },
        { provide: LoggingMiddleware, useValue: loggerSpy },
        { provide: ValidationMiddleware, useValue: validatorSpy },
        EventBusStrategyFactory
      ]
    });

    service = TestBed.inject(EventBusService);
    errorHandler = TestBed.inject(ErrorHandlerMiddleware) as jasmine.SpyObj<ErrorHandlerMiddleware>;
    logger = TestBed.inject(LoggingMiddleware) as jasmine.SpyObj<LoggingMiddleware>;
    validator = TestBed.inject(ValidationMiddleware) as jasmine.SpyObj<ValidationMiddleware>;
    strategyFactory = TestBed.inject(EventBusStrategyFactory);
  });

  // --- Constructor & setStrategy ---

  it('should create with default stateless strategy', () => {
    expect(service).toBeTruthy();
    // Default strategy is created in the constructor
    expect((service as any).strategy.constructor.name).toBe('StatelessStrategy');
  });

  it('setStrategy should change strategy on valid type and log success', () => {
    spyOn(console, 'log');
    service.setStrategy(StrategyType.BROADCAST);
    expect((service as any).strategy.constructor.name).toBe('BroadcastStrategy');
    expect(console.log).toHaveBeenCalledWith(`Strategy changed to: ${StrategyType.BROADCAST}`);
  });

  it('setStrategy should handle error for invalid strategy type', () => {
    spyOn(console, 'error');
    // Force an error by passing an invalid type (casting a bogus value as StrategyType)
    service.setStrategy('invalid' as StrategyType);
    expect(console.error).toHaveBeenCalled();
  });

  // --- emit() and Enqueueing ---

  it('emit should log and enqueue event in FIFO mode', () => {
    // Ensure FIFO mode by turning off priority mode.
    service.setPriorityMode(false);
    const testEvent = { name: 'testFIFO', payload: 'A', timestamp: 1000, category: EventCategory.DOMAIN };
    service.emit(testEvent);
    // Subscribe to the event.
    let result = '';
    service.on<string>('testFIFO').subscribe(evt => result = evt.payload);
    service.drainQueue();
    expect(result).toBe('A');
  });

  it('emit should log and enqueue event in Priority mode', () => {
    service.setPriorityMode(true);
    const eventLow = { name: 'testPriority', payload: 'low', timestamp: 1000, metadata: { priority: 1 }, category: EventCategory.DOMAIN };
    const eventHigh = { name: 'testPriority', payload: 'high', timestamp: 1000, metadata: { priority: 10 }, category: EventCategory.DOMAIN };
    const results: string[] = [];
    service.on<string>('testPriority').subscribe(evt => results.push(evt.payload));
    service.emit(eventLow);
    service.emit(eventHigh);
    service.drainQueue();
    // Assuming the priority queue orders descending, expect 'high' then 'low'
    expect(results).toEqual(['high', 'low']);
  });

  it('emit should catch error during enqueue and call errorHandler.handleError', () => {
    service.setPriorityMode(false);
    // Force an error by overriding the FIFO enqueue method.
    (service as any).eventQueueFIFO.enqueue = () => { throw new Error('Enqueue error'); };
    const testEvent = { name: 'errorEmit', payload: 'error', timestamp: 1000, category: EventCategory.DOMAIN };
    service.emit(testEvent);
    expect(errorHandler.handleError).toHaveBeenCalledWith('errorEmit', jasmine.any(Error), 'emit');
    expect(logger.handle).toHaveBeenCalledWith('EmitError', { eventName: 'errorEmit', error: jasmine.any(Error) }, 'emit', 'ERROR');
  });

  // --- on(), off(), offAll(), once() ---

  it('on should subscribe to an event and increment subscriberCount', () => {
    service.on<string>('onTest').subscribe();
    const entry = (service as any).subjects.get('onTest');
    expect(entry.subscriberCount).toBe(1);
  });

  it('off should unsubscribe a subscription', () => {
    let value = '';
    const subscription = service.on<string>('offTest').subscribe(evt => value = evt.payload);
    service.off('offTest', subscription);
    // Manually trigger a next on the subject.
    const entry = (service as any).subjects.get('offTest');
    if (entry) {
      entry.subject.next({ name: 'offTest', payload: 'test', timestamp: 1000, category: EventCategory.DOMAIN });
    }
    expect(value).toBe('');
  });

  it('offAll should complete subject and remove it', () => {
    service.on<string>('offAllTest').subscribe(() => {});
    expect((service as any).subjects.has('offAllTest')).toBeTrue();
    service.offAll('offAllTest');
    expect((service as any).subjects.has('offAllTest')).toBeFalse();
  });

  it('once should deliver only the first event', (done) => {
    let count = 0;
    service.once<string>('onceTest').subscribe({
      next: evt => count++,
      complete: () => {
        expect(count).toBe(1);
        done();
      }
    });
    service.emit({ name: 'onceTest', payload: 'first', timestamp: 1000, category: EventCategory.DOMAIN });
    service.drainQueue();
    service.emit({ name: 'onceTest', payload: 'second', timestamp: 1000, category: EventCategory.DOMAIN });
    service.drainQueue();
  });

  // --- setPriorityMode & setBatchSize ---

  it('setPriorityMode should update priorityQueue and log', () => {
    service.setPriorityMode(true);
    expect((service as any).priorityQueue).toBeTrue();
    service.setPriorityMode(false);
    expect((service as any).priorityQueue).toBeFalse();
    expect(logger.handle).toHaveBeenCalledWith('PriorityModeChange', { enabled: jasmine.any(Boolean) }, 'emit', 'INFO');
  });

  it('setBatchSize should set batchSize to at least 1 and log', () => {
    service.setBatchSize(5);
    expect((service as any).batchSize).toBe(5);
    service.setBatchSize(0);
    expect((service as any).batchSize).toBe(1);
    expect(logger.handle).toHaveBeenCalledWith('BatchSizeChange', { size: jasmine.any(Number) }, 'emit', 'INFO');
  });

  // --- drainQueue() Branches ---

  it('drainQueue should process persisted strategy branch', () => {
    const fakePersistedStrategy = Object.create(PersistedStrategy.prototype);
    fakePersistedStrategy.drain = () => [
      { name: 'persistTest', payload: 'P1', timestamp: 1000, category: EventCategory.DOMAIN },
      { name: 'persistTest', payload: 'P2', timestamp: 1000, category: EventCategory.DOMAIN }
    ];
    (service as any).strategy = fakePersistedStrategy;
    const received: string[] = [];
    service.on<string>('persistTest').subscribe(evt => received.push(evt.payload));
    service.drainQueue();
    expect(received).toEqual(['P1', 'P2']);
  });

  it('drainQueue should process in-memory queue branch', () => {
    service.setPriorityMode(false);
    const results: string[] = [];
    service.on<string>('fifoTest').subscribe(evt => results.push(evt.payload));
    service.emit({ name: 'fifoTest', payload: 'F1', timestamp: 1000, category: EventCategory.DOMAIN });
    service.emit({ name: 'fifoTest', payload: 'F2', timestamp: 1000, category: EventCategory.DOMAIN });
    service.drainQueue();
    expect(results).toEqual(['F1', 'F2']);
  });

  it('drainQueue should not re-enter if already processing', () => {
    (service as any).isProcessingQueue = true;
    service.drainQueue();
    expect(logger.handle).toHaveBeenCalledWith('DrainQueue', {}, 'emit', 'INFO');
    (service as any).isProcessingQueue = false; // reset for further tests
  });

  // --- deliverEvent() and its branches ---

  it('deliverEvent should log error if no subject exists', () => {
    service['deliverEvent']({ name: 'noSub', payload: 'x', timestamp: 1000, category: EventCategory.DOMAIN });
    expect(logger.handle).toHaveBeenCalledWith('NoSubscribers',
      { name: 'noSub', payload: 'x', timestamp: 1000, category: EventCategory.DOMAIN },
      'emit', 'ERROR');
  });

  it('deliverEvent should log error if validator fails', () => {
    // Create a subject for the event.
    service.on<string>('invalidDelivery').subscribe();
    validator.validate.and.returnValue(false);
    service['deliverEvent']({ name: 'invalidDelivery', payload: 'bad', timestamp: 1000, category: EventCategory.DOMAIN });
    expect(logger.handle).toHaveBeenCalledWith('InvalidEventDuringDelivery',
      { eventName: 'invalidDelivery', payload: 'bad' }, 'emit', 'ERROR');
    validator.validate.and.returnValue(true); // reset for further tests
  });

  it('deliverEvent should catch error from subject.next and call errorHandler.handleError', () => {
    // Create a fake subject that throws when next is called.
    const fakeSubject = { next: () => { throw new Error('next error'); } };
    (service as any).subjects.set('errorDelivery', { subject: fakeSubject, subscriberCount: 1 });
    service['deliverEvent']({ name: 'errorDelivery', payload: 'error', timestamp: 1000, category: EventCategory.DOMAIN });
    expect(errorHandler.handleError).toHaveBeenCalledWith('errorDelivery', jasmine.any(Error), 'emit');
    expect(logger.handle).toHaveBeenCalledWith('DeliverEventError',
      { event: { name: 'errorDelivery', payload: 'error', timestamp: 1000, category: EventCategory.DOMAIN }, error: jasmine.any(Error) },
      'emit', 'ERROR');
  });

  // --- cleanUp() ---

  it('cleanUp should remove subject when subscriberCount reaches 0', () => {
    (service as any).subjects.set('cleanupTest', { subject: new ReplaySubject<any>(1), subscriberCount: 1 });
    service['cleanUp']('cleanupTest');
    expect((service as any).subjects.has('cleanupTest')).toBeFalse();
  });

  // --- extractPriority() ---

  it('extractPriority should return event.priority if it is a number', () => {
    const event = { name: 'prio', payload: 'x', timestamp: 1000, priority: 5, category: EventCategory.DOMAIN };
    const prio = service['extractPriority'](event);
    expect(prio).toBe(5);
  });

  it('extractPriority should return metadata priority if available', () => {
    const event = { name: 'prio', payload: 'x', timestamp: 1000, metadata: { priority: 7 }, category: EventCategory.DOMAIN };
    const prio = service['extractPriority'](event);
    expect(prio).toBe(7);
  });

  it('extractPriority should return 0 if no priority info is available', () => {
    const event = { name: 'prio', payload: 'x', timestamp: 1000, category: EventCategory.DOMAIN };
    const prio = service['extractPriority'](event);
    expect(prio).toBe(0);
  });

  it('should log error when strategy creation fails', () => {
    spyOn(strategyFactory, 'createStrategy').and.throwError('Creation failed');
    const consoleErrorSpy = spyOn(console, 'error');
    service.setStrategy(StrategyType.DEBOUNCE);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to set strategy: Creation failed');
  });
});

import { Injectable } from '@angular/core';
import { ReplaySubject, Observable, Subscription } from 'rxjs';
import { take, filter, finalize } from 'rxjs/operators';
import { BaseEvent, PriorityEvent } from '../models/event.interface';
import { FIFOQueue } from '../utils/fifo-queue';
import { PriorityQueue } from '../utils/priority-queue';
import { ErrorHandlerMiddleware } from '../middleware/error-handler.middleware';
import { LoggingMiddleware } from '../middleware/logging.middleware';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { EventBusStrategy } from '../strategies/resources/event-bus-strategy.interface';
import { EventBusStrategyFactory, StrategyType } from '../strategies/event-bus-strategy.factory';
import { PersistedStrategy } from '../strategies/resources/persisted.strategy';
import { DebounceStrategy } from '../strategies/resources/debounce.strategy';
import { DelayedStrategy } from '../strategies/resources/delayed.strategy';
import { ThrottleStrategy } from '../strategies/resources/throttle.strategy';

@Injectable({
  providedIn: 'root',
})
export class EventBusService {

  private strategy: EventBusStrategy;
  private subjects: Map<
  string,
  { subject: ReplaySubject<BaseEvent<any>>; subscriberCount: number }
> = new Map();

  private priorityQueue: boolean = false;
  private batchSize: number = 1;

  private eventQueueFIFO = new FIFOQueue<BaseEvent<any>>();
  private eventQueuePRIO = new PriorityQueue<PriorityEvent<any>>();
  private isProcessingQueue = false;

  constructor(
    private errorHandler: ErrorHandlerMiddleware,
    private logger: LoggingMiddleware,
    private validator: ValidationMiddleware,
    private strategyFactory: EventBusStrategyFactory
  ) {
    this.strategy = this.strategyFactory.createStrategy(StrategyType.STATELESS);

   }

   setStrategy(strategyType: StrategyType): void {
    try {
      this.strategy = this.strategyFactory.createStrategy(strategyType);
      console.log(`Strategy changed to: ${strategyType}`);
    } catch (error: any) {
      console.error(`Failed to set strategy: ${error.message}`);
    }
  }



  emit<T>(event: BaseEvent<T>): void {
    const enrichedEvent: BaseEvent<T> = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    };

    this.logger.handle(enrichedEvent.name, enrichedEvent, 'emit', 'INFO');

    // Validate event payload
    if (!this.validator.validate(enrichedEvent.name, enrichedEvent.payload)) {
      this.logger.handle(
        enrichedEvent.name,
        { error: 'Invalid event payload', payload: enrichedEvent.payload },
        'emit',
        'ERROR'
      );
      return; // Skip invalid events
    }

    if (this.isAsyncStrategy(this.strategy)) {
      this.strategy.emit(enrichedEvent.name, enrichedEvent);
      return;
    }

    try {
      // Enqueue the event depending on the priority mode
      if (this.priorityQueue) {
        // Enrich the event with a priority value (using your helper)
        const prioEvent: PriorityEvent<any> = {
          ...enrichedEvent,
          priority: this.extractPriority(enrichedEvent)
        };
        this.eventQueuePRIO.enqueue(prioEvent);
      } else {
        this.eventQueueFIFO.enqueue(enrichedEvent);
      }

      // Optionally, you can still call the strategy if it has additional logic:
      // this.strategy.emit(enrichedEvent.name, enrichedEvent);
    } catch (error) {
      this.errorHandler.handleError(enrichedEvent.name, error as Error, 'emit');
      this.logger.handle('EmitError', { eventName: enrichedEvent.name, error }, 'emit', 'ERROR');
    }
  }



  private extractPriority<T>(event: BaseEvent<T>): number {
    if (typeof event.priority === 'number') {
      return event.priority;
    }
    if (event.metadata && typeof event.metadata['priority'] === 'number') {
      return event.metadata['priority'];
    }
    return 0;
  }

  on<T>(eventName: string, filterFn?: (event: BaseEvent<T>) => boolean): Observable<BaseEvent<T>> {
    this.logger.handle(eventName, {}, 'receive', 'INFO');
    let entry = this.subjects.get(eventName);
    if (!entry) {
      entry = { subject: new ReplaySubject<BaseEvent<T>>(1), subscriberCount: 0 };
      this.subjects.set(eventName, entry);
    }
    entry.subscriberCount++;

    return entry.subject.asObservable().pipe(
      filter(filterFn || (() => true)),
      finalize(() => this.cleanUp(eventName))
    );
  }

  private isAsyncStrategy(strategy: EventBusStrategy): boolean {
    return strategy instanceof DebounceStrategy ||
           strategy instanceof ThrottleStrategy ||
           strategy instanceof DelayedStrategy;
  }

  off(eventName: string, subscription: Subscription): void {
    this.logger.handle(eventName, {}, 'receive', 'INFO');
    subscription.unsubscribe();
  }

  offAll(eventName: string): void {
    this.logger.handle(eventName, {}, 'receive', 'INFO');
    const entry = this.subjects.get(eventName);
    if (entry) {
      entry.subject.complete();
      this.subjects.delete(eventName);
    }
  }

  once<T>(eventName: string): Observable<BaseEvent<T>> {
    this.logger.handle(eventName, {}, 'receive', 'INFO');
    return this.on<T>(eventName).pipe(take(1));
  }

  setPriorityMode(enabled: boolean): void {
    this.logger.handle('PriorityModeChange', { enabled }, 'emit', 'INFO');
    this.priorityQueue = enabled;
  }

  setBatchSize(size: number): void {
    this.logger.handle('BatchSizeChange', { size }, 'emit', 'INFO');
    this.batchSize = Math.max(1, size);
  }

  public drainQueue(): void {
    if (this.isProcessingQueue) {
      this.logger.handle('DrainQueue', {}, 'emit', 'INFO');
      return;
    }

    this.logger.handle('DrainQueue', {}, 'emit', 'INFO');
    this.isProcessingQueue = true;

    try {
      if (this.strategy instanceof PersistedStrategy) {
        // For persisted strategy, drain events from localStorage.
        const persistedEvents = (this.strategy as PersistedStrategy).drain();
        // Process events in batches (if needed).
        for (let i = 0; i < persistedEvents.length; i += this.batchSize) {
          const batch = persistedEvents.slice(i, i + this.batchSize);
          if (batch.length > 0) {
            this.logger.handle('DeliverBatch', { batch }, 'emit', 'INFO');
            this.deliverBatch(batch);
          }
        }
      } else {
        // Existing logic for in-memory queues (FIFO or priority).
        while (!this.isQueueEmpty()) {
          const batch: BaseEvent<any>[] = [];
          for (let i = 0; i < this.batchSize; i++) {
            const evt = this.dequeueOne();
            if (!evt) break;
            batch.push(evt);
          }
          if (batch.length > 0) {
            this.logger.handle('DeliverBatch', { batch }, 'emit', 'INFO');
            this.deliverBatch(batch);
          }
        }
      }
    } finally {
      this.logger.handle('DrainQueueComplete', {}, 'emit', 'INFO');
      this.isProcessingQueue = false;
    }
  }


  private dequeueOne(): BaseEvent<any> | undefined {
    const event = this.priorityQueue
      ? this.eventQueuePRIO.dequeue()
      : this.eventQueueFIFO.dequeue();

    if (event) {
      this.logger.handle('DequeueEvent', event, 'receive', 'DEBUG');
    }
    return event;
  }

  private isQueueEmpty(): boolean {
    const isEmpty = this.priorityQueue
      ? this.eventQueuePRIO.isEmpty()
      : this.eventQueueFIFO.isEmpty();
    this.logger.handle('QueueEmptyCheck', { isEmpty }, 'emit', 'DEBUG');
    return isEmpty;
  }

  private deliverBatch(batch: BaseEvent<any>[]): void {
    for (const event of batch) {
      this.deliverEvent(event);
    }
  }

  private deliverEvent<T>(event: BaseEvent<T>): void {
    const entry = this.subjects.get(event.name);
    if (!entry) {
      this.logger.handle('NoSubscribers', event, 'emit', 'ERROR');
      return;
    }

    // Validate payload again before delivering (optional)
    if (!this.validator.validate(event.name, event.payload)) {
      this.logger.handle(
        'InvalidEventDuringDelivery',
        { eventName: event.name, payload: event.payload },
        'emit',
        'ERROR'
      );
      return;
    }

    try {
      this.logger.handle('DeliverEvent', event, 'emit', 'INFO');
      entry.subject.next(event);
    } catch (error) {
      this.errorHandler.handleError(event.name, error as Error, 'emit');
      this.logger.handle('DeliverEventError', { event, error }, 'emit', 'ERROR');
    }
  }

  private cleanUp(eventName: string): void {
    const entry = this.subjects.get(eventName);
    if (entry && --entry.subscriberCount === 0) {
      this.logger.handle('Cleanup', { eventName }, 'emit', 'INFO');
      this.subjects.delete(eventName);
    }
  }
}

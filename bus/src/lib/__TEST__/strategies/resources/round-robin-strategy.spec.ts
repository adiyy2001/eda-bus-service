import { TestBed } from '@angular/core/testing';
import { BaseEvent } from '../../../models/event.interface';
import { EventCategory } from '../../../models/event-types';
import { PriorityStrategy } from '../../../strategies/resources/priority-strategy';

describe('PriorityStrategy', () => {
  let strategy: PriorityStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PriorityStrategy],
    });
    strategy = TestBed.inject(PriorityStrategy);
  });

  it('should notify subscribers in order of priority', () => {
    const handlerA = jasmine.createSpy('handlerA');
    const handlerB = jasmine.createSpy('handlerB');
    const handlerC = jasmine.createSpy('handlerC');

    strategy.subscribe('testEvent', handlerA, 1); // Priorytet 1
    strategy.subscribe('testEvent', handlerB, 3); // Priorytet 3
    strategy.subscribe('testEvent', handlerC, 2); // Priorytet 2

    const event: BaseEvent<any> = {
      name: 'testEvent',
      timestamp: Date.now(),
      payload: {},
      category: EventCategory.DOMAIN
    };

    strategy.emit('testEvent', event);

    expect(handlerB).toHaveBeenCalledBefore(handlerC);
    expect(handlerC).toHaveBeenCalledBefore(handlerA);
  });

  it('should allow unsubscribing a specific listener', () => {
    const handler = jasmine.createSpy('handler');

    strategy.subscribe('testEvent', handler, 1);
    strategy.unsubscribe('testEvent', handler);

    const event: BaseEvent<any> = {
      name: 'testEvent',
      timestamp: Date.now(),
      payload: {},
      category: EventCategory.DOMAIN
    };

    strategy.emit('testEvent', event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle multiple event types independently', () => {
    const handlerA = jasmine.createSpy('handlerA');
    const handlerB = jasmine.createSpy('handlerB');

    strategy.subscribe('eventA', handlerA, 1);
    strategy.subscribe('eventB', handlerB, 2);

    const eventA: BaseEvent<any> = {
      name: 'eventA',
      timestamp: Date.now(),
      payload: {},
      category: EventCategory.DOMAIN
    };
    const eventB: BaseEvent<any> = {
      name: 'eventB',
      timestamp: Date.now(),
      payload: {},
      category: EventCategory.DOMAIN
    };

    strategy.emit('eventA', eventA);
    strategy.emit('eventB', eventB);

    expect(handlerA).toHaveBeenCalledWith(eventA);
    expect(handlerB).toHaveBeenCalledWith(eventB);
  });

  it('should handle empty subscriber lists gracefully', () => {
    const event: BaseEvent<any> = {
      name: 'testEvent',
      timestamp: Date.now(),
      payload: {},
      category: EventCategory.DOMAIN
    };

    expect(() => strategy.emit('testEvent', event)).not.toThrow();
  });

  it('should notify subscribers with the same priority in the order they were added', () => {
    const handlerA = jasmine.createSpy('handlerA');
    const handlerB = jasmine.createSpy('handlerB');

    strategy.subscribe('testEvent', handlerA, 1); // Priorytet 1
    strategy.subscribe('testEvent', handlerB, 1); // Priorytet 1

    const event: BaseEvent<any> = {
      name: 'testEvent',
      timestamp: Date.now(),
      payload: {},
      category: EventCategory.DOMAIN
    };

    strategy.emit('testEvent', event);

    expect(handlerA).toHaveBeenCalledBefore(handlerB);
  });
});

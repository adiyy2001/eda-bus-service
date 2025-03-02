import { TestBed } from '@angular/core/testing';
import { BaseEvent } from '../../../models/event.interface';
import { EventCategory } from '../../../models/event-types';
import { PatternMatchingStrategy } from '../../../strategies/resources/pattern-matching-strategy';

describe('PatternMatchingStrategy', () => {
  let strategy: PatternMatchingStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PatternMatchingStrategy],
    });
    strategy = TestBed.inject(PatternMatchingStrategy);
  });

  it('should subscribe and emit events matching a string pattern', () => {
    const handler = jasmine.createSpy('handler');

    strategy.subscribe('testEvent', handler);

    const event: BaseEvent = {
      name: 'testEvent',
      timestamp: Date.now(),
      payload: 'Test payload',
      category: EventCategory.DOMAIN
    };

    strategy.emit('testEvent', event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should subscribe and emit events matching a RegExp pattern', () => {
    const handler = jasmine.createSpy('handler');

    strategy.subscribe(/^user:/, handler);

    const event: BaseEvent = {
      name: 'user:login',
      timestamp: Date.now(),
      payload: { userId: 1 },
      category: EventCategory.DOMAIN
    };

    strategy.emit('user:login', event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should not emit events that do not match the pattern', () => {
    const handler = jasmine.createSpy('handler');

    strategy.subscribe('testEvent', handler);

    const event: BaseEvent = {
      name: 'otherEvent',
      timestamp: Date.now(),
      payload: 'Test payload',
      category: EventCategory.DOMAIN
    };

    strategy.emit('otherEvent', event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should unsubscribe a listener', () => {
    const handler = jasmine.createSpy('handler');

    strategy.subscribe('testEvent', handler);

    const event: BaseEvent = {
      name: 'testEvent',
      timestamp: Date.now(),
      payload: 'Test payload',
      category: EventCategory.DOMAIN
    };

    strategy.unsubscribe('testEvent', handler);
    strategy.emit('testEvent', event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle multiple listeners for the same pattern', () => {
    const handlerA = jasmine.createSpy('handlerA');
    const handlerB = jasmine.createSpy('handlerB');

    strategy.subscribe('testEvent', handlerA);
    strategy.subscribe('testEvent', handlerB);

    const event: BaseEvent = {
      name: 'testEvent',
      timestamp: Date.now(),
      payload: 'Test payload',
      category: EventCategory.DOMAIN
    };

    strategy.emit('testEvent', event);

    expect(handlerA).toHaveBeenCalledWith(event);
    expect(handlerB).toHaveBeenCalledWith(event);
  });
});

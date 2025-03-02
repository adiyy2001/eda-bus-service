import { TestBed } from '@angular/core/testing';
import { MulticastStrategy } from '../../../strategies/resources/multicast.strategy';
import { BaseEvent } from '../../../models/event.interface';
import { EventCategory } from '../../../models/event-types';

describe('MulticastStrategy', () => {
  let strategy: MulticastStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MulticastStrategy],
    });

    strategy = TestBed.inject(MulticastStrategy);
  });

  it('should notify all subscribers of a particular eventType', (done) => {
    const handlerA = jasmine.createSpy('handlerA');
    const handlerB = jasmine.createSpy('handlerB');

    strategy.subscribe('eventX', handlerA);
    strategy.subscribe('eventX', handlerB);

    const event: BaseEvent<string> = {
      name: 'eventX',
      timestamp: Date.now(),
      payload: 'abc',
      category: EventCategory.DOMAIN
    };

    strategy.emit('eventX', event);

    setTimeout(() => {
      expect(handlerA).toHaveBeenCalledWith(event);
      expect(handlerB).toHaveBeenCalledWith(event);
      done();
    }, 0);
  });

  it('should not notify subscribers of different eventType', (done) => {
    const handlerA = jasmine.createSpy('handlerA');
    const handlerB = jasmine.createSpy('handlerB');

    strategy.subscribe('eventX', handlerA);
    strategy.subscribe('eventY', handlerB);

    const event: BaseEvent<string> = {
      name: 'eventX',
      timestamp: Date.now(),
      payload: 'abc',
      category: EventCategory.DOMAIN
    };

    strategy.emit('eventX', event);

    setTimeout(() => {
      expect(handlerA).toHaveBeenCalledWith(event);
      expect(handlerB).not.toHaveBeenCalled();
      done();
    }, 0);
  });

  it('should remove a subscriber properly', () => {
    const handler = jasmine.createSpy('handler');
    strategy.subscribe('testEvent', handler);

    const event: BaseEvent<string> = {
      name: 'testEvent',
      timestamp: Date.now(),
      payload: '',
      category: EventCategory.DOMAIN
    };

    strategy.emit('testEvent', event);
    expect(handler).toHaveBeenCalledTimes(1);

    strategy.unsubscribe('testEvent', handler);
    strategy.emit('testEvent', event);
    expect(handler).toHaveBeenCalledTimes(1); // no change after unsubscribe
  });

  it('should handle multiple subscribers and emit correctly', () => {
    const handlerA = jasmine.createSpy('handlerA');
    const handlerB = jasmine.createSpy('handlerB');

    strategy.subscribe('multiEvent', handlerA);
    strategy.subscribe('multiEvent', handlerB);

    const event: BaseEvent<number> = {
      name: 'multiEvent',
      timestamp: Date.now(),
      payload: 123,
      category: EventCategory.DOMAIN
    };

    strategy.emit('multiEvent', event);

    expect(handlerA).toHaveBeenCalledWith(event);
    expect(handlerB).toHaveBeenCalledWith(event);
  });
});

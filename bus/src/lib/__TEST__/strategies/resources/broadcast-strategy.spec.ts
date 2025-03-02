import { TestBed } from '@angular/core/testing';
import { BaseEvent } from '../../../models/event.interface';
import { BroadcastStrategy } from '../../../strategies/resources/broadcast.strategy';
import { EventCategory } from '../../../models/event-types';

describe('BroadcastStrategy', () => {
  let strategy: BroadcastStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BroadcastStrategy],
    });

    strategy = TestBed.inject(BroadcastStrategy);
  });

  it('should call all subscribers for any eventType', () => {
    const handlerA = jasmine.createSpy('handlerA');
    const handlerB = jasmine.createSpy('handlerB');
    const handlerC = jasmine.createSpy('handlerC');

    strategy.subscribe('eventA', handlerA);
    strategy.subscribe('eventB', handlerB);
    strategy.subscribe('eventC', handlerC);

    const testEvent: BaseEvent<string> = {
      name: 'eventX',
      timestamp: Date.now(),
      payload: 'abc',
      category: EventCategory.DOMAIN
    };

    strategy.emit('someOtherEvent', testEvent);

    expect(handlerA).toHaveBeenCalledWith(testEvent);
    expect(handlerB).toHaveBeenCalledWith(testEvent);
    expect(handlerC).toHaveBeenCalledWith(testEvent);
  });

  it('should remove a subscriber properly', () => {
    const handler = jasmine.createSpy('handler');
    strategy.subscribe('testEvent', handler);

    const testEvent: BaseEvent<string> = {
      name: 'eventX',
      timestamp: Date.now(),
      payload: 'abc',
            category: EventCategory.DOMAIN
    };

    strategy.emit('testEvent', testEvent);
    expect(handler).toHaveBeenCalledTimes(1);

    strategy.unsubscribe('testEvent', handler);

    strategy.emit('testEvent', testEvent);
    expect(handler).toHaveBeenCalledTimes(1); // No further calls after unsubscribe
  });
});

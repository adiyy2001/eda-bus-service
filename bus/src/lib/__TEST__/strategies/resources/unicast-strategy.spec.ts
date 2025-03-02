import { UnicastStrategy } from '../../../strategies/resources/unicast.strategy';
import { BaseEvent } from '../../../models/event.interface';
import { EventCategory } from '../../../models/event-types';

describe('UnicastStrategy', () => {
  let strategyFirst: UnicastStrategy;
  let strategyRoundRobin: UnicastStrategy;
  let strategyRandom: UnicastStrategy;

  beforeEach(() => {
    strategyFirst = new UnicastStrategy('first');
    strategyRoundRobin = new UnicastStrategy('round-robin');
    strategyRandom = new UnicastStrategy('random');
  });

  it('should always call the first listener in "first" mode', () => {
    const handlerA = jasmine.createSpy('handlerA');
    const handlerB = jasmine.createSpy('handlerB');

    strategyFirst.subscribe('testEvent', handlerA);
    strategyFirst.subscribe('testEvent', handlerB);

    const event: BaseEvent<any> = {
      name: 'testEvent',
      timestamp: Date.now(),
      payload: {},
      category: EventCategory.DOMAIN
    };

    strategyFirst.emit('testEvent', event);

    expect(handlerA).toHaveBeenCalledWith(event);
    expect(handlerB).not.toHaveBeenCalled();
  });

  it('should call listeners in round-robin mode', () => {
    const handlerA = jasmine.createSpy('handlerA');
    const handlerB = jasmine.createSpy('handlerB');

    strategyRoundRobin.subscribe('eventX', handlerA);
    strategyRoundRobin.subscribe('eventX', handlerB);

    const event: BaseEvent<any> = {
      name: 'eventX',
      timestamp: Date.now(),
      payload: {},
      category: EventCategory.DOMAIN
    };

    strategyRoundRobin.emit('eventX', event); // A
    strategyRoundRobin.emit('eventX', event); // B
    strategyRoundRobin.emit('eventX', event); // A again

    expect(handlerA).toHaveBeenCalledTimes(2);
    expect(handlerB).toHaveBeenCalledTimes(1);
  });

  it('should call a random listener in "random" mode', () => {
    const handlerA = jasmine.createSpy('handlerA');
    const handlerB = jasmine.createSpy('handlerB');
    const handlerC = jasmine.createSpy('handlerC');

    strategyRandom.subscribe('evt', handlerA);
    strategyRandom.subscribe('evt', handlerB);
    strategyRandom.subscribe('evt', handlerC);

    const event: BaseEvent<any> = {
      name: 'evt',
      timestamp: Date.now(),
      payload: {},
      category: EventCategory.DOMAIN
    };

    strategyRandom.emit('evt', event);

    const totalCalls =
      handlerA.calls.count() +
      handlerB.calls.count() +
      handlerC.calls.count();

    expect(totalCalls).toBe(1);
  });
});

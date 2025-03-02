import { EventCategory } from "../../../models/event-types";
import { BaseEvent } from "../../../models/event.interface";
import { DelayedStrategy } from "../../../strategies/resources/delayed.strategy";

describe('DelayedStrategy', () => {
  let strategy: DelayedStrategy;

  // Instalujemy zegar symulowany (fake timers)
  beforeEach(() => {
    jasmine.clock().install();
    strategy = new DelayedStrategy();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should call all subscribers after default delay when emit is called', () => {
    const listener = jasmine.createSpy('listener');
    strategy.subscribe<string>('testEvent', listener);

    const event: BaseEvent<string> = {
      name: 'testEvent',
      payload: 'Hello, world!',
      timestamp: Date.now(),
      category: EventCategory.DOMAIN
    };

    strategy.emit('testEvent', event);

    // Przed upływem domyślnego opóźnienia listener nie powinien być wywołany
    jasmine.clock().tick(500);
    expect(listener).not.toHaveBeenCalled();

    // Po upływie 1000ms (domyślne opóźnienie) listener zostanie wywołany
    jasmine.clock().tick(500);
    expect(listener).toHaveBeenCalledWith(event);
  });

  it('should use custom delay from metadata if provided', () => {
    const listener = jasmine.createSpy('listener');
    strategy.subscribe<number>('delayedEvent', listener);

    const customDelay = 2000;
    const event: BaseEvent<number> = {
      name: 'delayedEvent',
      payload: 42,
      timestamp: Date.now(),
      metadata: { delay: customDelay },
      category: EventCategory.DOMAIN

    };

    strategy.emit('delayedEvent', event);

    // Po 1000ms (mniej niż customDelay) nie powinno być wywołania
    jasmine.clock().tick(1000);
    expect(listener).not.toHaveBeenCalled();

    // Po 2000ms powinno być wywołanie
    jasmine.clock().tick(1000);
    expect(listener).toHaveBeenCalledWith(event);
  });

  it('should not throw when emitting an event with no subscribers', () => {
    const event: BaseEvent<any> = {
      name: 'noListenerEvent',
      payload: {},
      timestamp: Date.now(),
      category: EventCategory.DOMAIN

    };

    expect(() => {
      strategy.emit('noListenerEvent', event);
      jasmine.clock().tick(1000);
    }).not.toThrow();
  });

  it('should call all subscribers for an event', () => {
    const listener1 = jasmine.createSpy('listener1');
    const listener2 = jasmine.createSpy('listener2');
    strategy.subscribe<boolean>('multiEvent', listener1);
    strategy.subscribe<boolean>('multiEvent', listener2);

    const event: BaseEvent<boolean> = {
      name: 'multiEvent',
      payload: true,
      timestamp: Date.now(),
      category: EventCategory.DOMAIN

    };

    strategy.emit('multiEvent', event);
    jasmine.clock().tick(1000);

    expect(listener1).toHaveBeenCalledWith(event);
    expect(listener2).toHaveBeenCalledWith(event);
  });

  it('should only remove the specified listener on unsubscribe', () => {
    const listener1 = jasmine.createSpy('listener1');
    const listener2 = jasmine.createSpy('listener2');
    strategy.subscribe<string>('selectiveEvent', listener1);
    strategy.subscribe<string>('selectiveEvent', listener2);

    // Unsubscribe listener1
    strategy.unsubscribe('selectiveEvent', listener1);

    const event: BaseEvent<string> = {
      name: 'selectiveEvent',
      payload: 'test',
      timestamp: Date.now(),
      category: EventCategory.DOMAIN

    };

    strategy.emit('selectiveEvent', event);
    jasmine.clock().tick(1000);

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledWith(event);
  });
});

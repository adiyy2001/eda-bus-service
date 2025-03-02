import { EventCategory } from "../../../models/event-types";
import { BaseEvent } from "../../../models/event.interface";
import { StatefulStrategy } from "../../../strategies/resources/stateful.strategy";

describe('StatefulStrategy', () => {
  let strategy: StatefulStrategy;
  let dummyEvent: BaseEvent<string>;

  beforeEach(() => {
    strategy = new StatefulStrategy();
    dummyEvent = { name: 'test', payload: 'data', timestamp: Date.now(), category: EventCategory.DOMAIN };
  });

  it('should replay history on subscribe', () => {
    // Emitujemy zdarzenie przed subskrypcją.
    strategy.emit('testEvent', dummyEvent);
    const listenerSpy = jasmine.createSpy('listener');
    strategy.subscribe('testEvent', listenerSpy);
    // Listener powinien od razu otrzymać zdarzenie z historii.
    expect(listenerSpy).toHaveBeenCalledWith(dummyEvent);
  });

  it('should call subscribed listeners on emit', () => {
    const listenerSpy = jasmine.createSpy('listener');
    strategy.subscribe('anotherEvent', listenerSpy);
    strategy.emit('anotherEvent', dummyEvent);
    expect(listenerSpy).toHaveBeenCalledWith(dummyEvent);
  });

  it('should unsubscribe listeners properly', () => {
    const listenerSpy = jasmine.createSpy('listener');
    strategy.subscribe('testEvent', listenerSpy);
    strategy.unsubscribe('testEvent', listenerSpy);
    strategy.emit('testEvent', dummyEvent);
    expect(listenerSpy).not.toHaveBeenCalled();
  });

  it('should store event history on emit', () => {
    strategy.emit('historyEvent', dummyEvent);
    strategy.emit('historyEvent', dummyEvent);
    const history = strategy.getEventHistory('historyEvent');
    expect(history.length).toBe(2);
    expect(history[0]).toEqual(dummyEvent);
  });

  it('should clear event history', () => {
    strategy.emit('historyEvent', dummyEvent);
    strategy.clearEventHistory('historyEvent');
    const history = strategy.getEventHistory('historyEvent');
    expect(history.length).toBe(0);
  });

  it('should clean up listeners and history', () => {
    const listenerSpy = jasmine.createSpy('listener');
    strategy.subscribe('cleanupEvent', listenerSpy);
    strategy.emit('cleanupEvent', dummyEvent);
    expect(strategy.getEventHistory('cleanupEvent').length).toBe(1);
    strategy.cleanUp('cleanupEvent');
    expect(strategy.getEventHistory('cleanupEvent').length).toBe(0);
    // Po cleanUp listener nie powinien zostać wywołany
    strategy.emit('cleanupEvent', dummyEvent);
    expect(listenerSpy).toHaveBeenCalledTimes(1); // Tylko pierwszy raz, przed cleanUp
  });
});

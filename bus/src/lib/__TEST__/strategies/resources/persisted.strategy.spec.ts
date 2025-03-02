import { FakeLocalStorage } from '../../../helpers/fake-local-storage';
import { EventCategory } from '../../../models/event-types';
import { BaseEvent } from '../../../models/event.interface';
import { PersistedStrategy } from '../../../strategies/resources/persisted.strategy';

describe('PersistedStrategy', () => {
  let strategy: PersistedStrategy;
  let dummyEvent: BaseEvent<string>;

  beforeEach(() => {
    const fakeLocalStorage = new FakeLocalStorage();

    // Używamy Object.defineProperty, aby podmienić window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: fakeLocalStorage,
      writable: true,
      configurable: true
    });

    strategy = new PersistedStrategy();
    (strategy as any).logger = { handle: jasmine.createSpy('handle') };
    // Nadpisujemy logger, aby handle był no-op (lub spy)
    (strategy as any).logger = { handle: jasmine.createSpy('handle') };

    dummyEvent = {
      name: 'persistedTest',
      payload: 'value',
      timestamp: Date.now(),
      category: EventCategory.DOMAIN
    };
  });

  it('should initialize persisted storage as an empty array', () => {
    expect(localStorage.getItem('persisted_events')).toEqual(JSON.stringify([]));
  });

  it('should call logger.handle on subscribe', () => {
    const listenerSpy = jasmine.createSpy('listener');
    strategy.subscribe('persistedEvent', listenerSpy);
    expect((strategy as any).logger.handle).toHaveBeenCalledWith('persistedEvent', {}, 'emit', 'INFO');
  });

  it('should call listener on emit and persist the event', () => {
    const listenerSpy = jasmine.createSpy('listener');
    strategy.subscribe('persistedEvent', listenerSpy);
    strategy.emit('persistedEvent', dummyEvent);
    expect(listenerSpy).toHaveBeenCalledWith(dummyEvent);

    // Sprawdzenie, czy zdarzenie zostało zapisane w localStorage.
    const stored = localStorage.getItem('persisted_events');
    const events = stored ? JSON.parse(stored) : [];
    expect(events.length).toBe(1);
    expect(events[0]).toEqual(dummyEvent);
  });

  it('should unsubscribe listener properly and call logger.handle', () => {
    const listenerSpy = jasmine.createSpy('listener');
    strategy.subscribe('persistedEvent', listenerSpy);
    strategy.unsubscribe('persistedEvent', listenerSpy);
    strategy.emit('persistedEvent', dummyEvent);
    expect(listenerSpy).not.toHaveBeenCalled();
    expect((strategy as any).logger.handle).toHaveBeenCalledWith('persistedEvent', {}, 'emit', 'INFO');
  });

  it('drain() should return persisted events and clear storage', () => {
    strategy.emit('persistedEvent', dummyEvent);
    strategy.emit('persistedEvent', dummyEvent);
    let stored = localStorage.getItem('persisted_events');
    let events = stored ? JSON.parse(stored) : [];
    expect(events.length).toBe(2);

    const drained = strategy.drain();
    expect(drained.length).toBe(2);
    stored = localStorage.getItem('persisted_events');
    events = stored ? JSON.parse(stored) : [];
    expect(events.length).toBe(0);
  });
});

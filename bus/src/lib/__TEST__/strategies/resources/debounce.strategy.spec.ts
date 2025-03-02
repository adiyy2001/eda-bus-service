import { EventCategory } from "../../../models/event-types";
import { DebounceStrategy } from "../../../strategies/resources/debounce.strategy";

describe('DebounceStrategy', () => {
  let debounceStrategy: DebounceStrategy;
  let callback: jasmine.Spy;

  beforeEach(() => {
    jasmine.clock().install();
    debounceStrategy = new DebounceStrategy();
    callback = jasmine.createSpy('callback');
    debounceStrategy.subscribe('testEvent', callback);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should emit only the last event after the debounce delay', () => {
    const now = Date.now();
    // Emit three events in quick succession.
    debounceStrategy.emit('testEvent', { name: 'testEvent', payload: 'first', timestamp: now, metadata: {}, category: EventCategory.DOMAIN });
    debounceStrategy.emit('testEvent', { name: 'testEvent', payload: 'second', timestamp: now, metadata: {}, category: EventCategory.DOMAIN });
    debounceStrategy.emit('testEvent', { name: 'testEvent', payload: 'third', timestamp: now, metadata: {}, category: EventCategory.DOMAIN });

    // Before the debounce delay (default 300ms) expires, nothing should be emitted.
    jasmine.clock().tick(200);
    expect(callback).not.toHaveBeenCalled();

    // After the debounce delay, only the last event should be delivered.
    jasmine.clock().tick(150);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(jasmine.objectContaining({ payload: 'third' }));
  });
});

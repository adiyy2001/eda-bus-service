import { EventCategory } from "../../../models/event-types";
import { ThrottleStrategy } from "../../../strategies/resources/throttle.strategy";

describe('ThrottleStrategy', () => {
  let throttleStrategy: ThrottleStrategy;
  let callback: jasmine.Spy;

  beforeEach(() => {
    jasmine.clock().install();
    throttleStrategy = new ThrottleStrategy();
    callback = jasmine.createSpy('callback');
    throttleStrategy.subscribe('testEvent', callback);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });


  it('should emit the first event immediately and ignore subsequent events until the throttle period expires', () => {
    const now = Date.now();
    // Emit the first event.
    throttleStrategy.emit('testEvent', { name: 'testEvent', payload: 'first', timestamp: now, metadata: {}, category: EventCategory.DOMAIN });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(jasmine.objectContaining({ payload: 'first' }));

    // Emit a second event immediately; it should be ignored.
    throttleStrategy.emit('testEvent', { name: 'testEvent', payload: 'second', timestamp: now, metadata: {}, category: EventCategory.DOMAIN });
    expect(callback).toHaveBeenCalledTimes(1);

    // Advance time by 500ms (still within the throttle period).
    jasmine.clock().tick(500);
    throttleStrategy.emit('testEvent', { name: 'testEvent', payload: 'third', timestamp: now, metadata: {}, category: EventCategory.DOMAIN });
    expect(callback).toHaveBeenCalledTimes(1);

    // Advance time to pass the throttle delay (default 1000ms).
    jasmine.clock().tick(600);
    throttleStrategy.emit('testEvent', { name: 'testEvent', payload: 'fourth', timestamp: now, metadata: {}, category: EventCategory.DOMAIN });
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(jasmine.objectContaining({ payload: 'fourth' }));
  });
});

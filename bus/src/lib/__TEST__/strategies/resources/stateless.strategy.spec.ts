import { EventCategory } from "../../../models/event-types";
import { BaseEvent } from "../../../models/event.interface";
import { StatelessStrategy } from "../../../strategies/resources/stateless.strategy";

describe('StatelessStrategy', () => {
  let strategy: StatelessStrategy;
  let dummyEvent: BaseEvent<string>;

  beforeEach(() => {
    strategy = new StatelessStrategy();
    dummyEvent = {
      name: 'statelessTest',
      payload: 'info',
      timestamp: Date.now(),
      category: EventCategory.DOMAIN
    };
  });

  it('should call listener on emit', () => {
    const listenerSpy = jasmine.createSpy('listener');
    strategy.subscribe('testStateless', listenerSpy);
    strategy.emit('testStateless', dummyEvent);
    expect(listenerSpy).toHaveBeenCalledWith(dummyEvent);
  });

  it('should unsubscribe listener properly', () => {
    const listenerSpy = jasmine.createSpy('listener');
    strategy.subscribe('testStateless', listenerSpy);
    strategy.unsubscribe('testStateless', listenerSpy);
    strategy.emit('testStateless', dummyEvent);
    expect(listenerSpy).not.toHaveBeenCalled();
  });
});

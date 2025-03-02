import { TestBed } from '@angular/core/testing';
import { EmitEvent } from '../../decorators/emit-event.decorator';
import { EventBusService } from '../../services/event-bus.service';

describe('@EmitEvent Decorator', () => {
  let eventBus: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventBusService],
    });
    eventBus = TestBed.inject(EventBusService);
  });

  it('should emit an event when the decorated method is called', () => {
    spyOn(eventBus, 'emit').and.callThrough();

    class TestClass {
      constructor(public eventBus: EventBusService) {}

      @EmitEvent('testEvent')
      testMethod() {
        return { key: 'value' };
      }
    }

    const instance = new TestClass(eventBus);
    instance.testMethod();

    expect(eventBus.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'testEvent',
        payload: { key: 'value' },
        timestamp: jasmine.any(Number),
      })
    );
  });

  it('should throw an error if EventBusService is missing', () => {
    class TestClass {
      @EmitEvent('testEvent')
      testMethod() {
        return { key: 'value' };
      }
    }

    const instance = new TestClass();

    expect(() => instance.testMethod()).toThrowError(
      '@EmitEvent: Missing or invalid EventBusService in the class where testMethod is used. Ensure EventBusService is injected as "eventBus".'
    );
  });
});

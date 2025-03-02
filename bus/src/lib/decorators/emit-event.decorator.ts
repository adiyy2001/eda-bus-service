// File: src/app/event-bus/decorators/emit-event.decorator.ts
import { EventCategory } from '../models/event-types';
import { EventBusService } from '../services/event-bus.service';

export function EmitEvent(eventName: string): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const eventBus: EventBusService = (this as any).eventBus;
      if (!eventBus || !(eventBus instanceof EventBusService)) {
        throw new Error(
          `@EmitEvent: Missing or invalid EventBusService in the class where ${String(
            propertyKey
          )} is used. Ensure EventBusService is injected as "eventBus".`
        );
      }

      // Call the original method
      const result = originalMethod.apply(this, args);

      // Emit the event using the EventBusService
      eventBus.emit({
        name: eventName,
        payload: result, // Use the return value as the payload
        timestamp: Date.now(),
        category: EventCategory.DOMAIN
      });

      // Return the original method's result
      return result;
    };
  };
}

export function ListenToEvent(eventName: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const instance = this as any;

      // Weryfikacja obecności i typu eventBus
      console.log('qwe', JSON.stringify(instance.eventBus))
      if (!('eventBus' in instance)) {
        throw new Error(
          `@ListenToEvent: Missing or invalid EventBusService in the class where ${String(
            propertyKey
          )} is used. Ensure EventBusService is injected as "eventBus".`
        );
      }

      // Inicjalizacja `subscriptions` jeśli nie istnieje
      if (!Array.isArray(instance.subscriptions)) {
        instance.subscriptions = [];
      }

      // Zapobieganie podwójnym subskrypcjom
      const isAlreadySubscribed = instance.subscriptions.some(
        (sub: any) => sub.eventName === eventName
      );

      if (!isAlreadySubscribed) {
        const subscription = instance.eventBus.on(eventName).subscribe({
          next: (event: any) => {
            try {
              originalMethod.call(instance, event, ...args);
            } catch (err) {
              console.error(`[ListenToEvent] Error handling event "${eventName}":`, err);
            }
          },
          error: (err: any) => {
            console.error(`[ListenToEvent] Error in event stream for "${eventName}":`, err);
          },
        });

        // Dodanie subskrypcji do listy
        instance.subscriptions.push({ eventName, subscription });
      }
    };

    // Rozszerzenie `ngOnDestroy` dla czyszczenia
    const originalNgOnDestroy = target.ngOnDestroy;

    target.ngOnDestroy = function (...args: any[]) {
      const instance = this as any;

      if (Array.isArray(instance.subscriptions)) {
        instance.subscriptions.forEach((sub: any) => {
          if (sub.subscription && typeof sub.subscription.unsubscribe === 'function') {
            sub.subscription.unsubscribe();
          }
        });
        instance.subscriptions = [];
      }

      // Wywołanie oryginalnego `ngOnDestroy` (jeśli istnieje)
      if (typeof originalNgOnDestroy === 'function') {
        originalNgOnDestroy.apply(this, args);
      }
    };
  };
}

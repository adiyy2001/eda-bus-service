import { BaseEvent } from '../../models/event.interface';
import { EventBusStrategy } from './event-bus-strategy.interface';

/**
 * RoundRobinStrategy
 *  - Rozsyła zdarzenia do subskrybentów w kolejce "round-robin".
 *  - Pierwsze emitowane zdarzenie trafia do pierwszego zarejestrowanego listenera,
 *    kolejne do następnego, itd. Gdy dojdziemy do końca listy subskrybentów,
 *    wracamy do początku.
 *  - Jeśli w danej chwili żaden subskrybent nie jest dostępny (np. pusta lista),
 *    to emit nic nie robi.
 */
export class RoundRobinStrategy implements EventBusStrategy {
  /**
   * Mapa zawierająca listy słuchaczy dla poszczególnych typów zdarzeń.
   * Kluczem jest `eventType` (string), a wartością – tablica subskrybentów (callbacków).
   */
  private subscribers: Map<string, Array<(event: BaseEvent) => void>> = new Map();

  /**
   * Mapa przechowująca aktualny indeks (w tablicy listenerów) dla danego eventType.
   * Ten indeks będzie inkrementowany przy każdym `emit`, a potem resetowany do 0,
   * jeśli dojdziemy do końca tablicy.
   */
  private currentIndexMap: Map<string, number> = new Map();

  /**
   * Rejestruje nowego listenera (subskrybenta) w strategii round-robin
   * dla określonego typu zdarzenia.
   *
   * @param eventType - Typ zdarzenia (np. 'user:login').
   * @param listener - Funkcja, która będzie wywołana, gdy nadejdzie event o podanym typie.
   */
  public subscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
      // Inicjalnie ustawiamy indeks na 0 dla tego eventType
      this.currentIndexMap.set(eventType, 0);
    }

    // Dodajemy listener do listy dla danego typu zdarzenia
    const subscribersForType = this.subscribers.get(eventType)!;
    subscribersForType.push(listener);
  }

  /**
   * Usuwa podanego listenera z listy subskrybentów dla danego typu zdarzenia.
   * Jeśli listener nie istnieje w tablicy, metoda nic nie robi.
   *
   * @param eventType - Typ zdarzenia, z którego usuwamy subskrybenta.
   * @param listener - Funkcja, którą chcemy wyrejestrować.
   */
  public unsubscribe(eventType: string, listener: (event: BaseEvent) => void): void {
    if (this.subscribers.has(eventType)) {
      const subscribersForType = this.subscribers.get(eventType)!;
      const filtered = subscribersForType.filter((l) => l !== listener);

      // Nadpisujemy zaktualizowaną listą
      this.subscribers.set(eventType, filtered);

      // Jeśli po usunięciu listenera lista stała się pusta, możemy wyczyścić indeks
      if (filtered.length === 0) {
        this.currentIndexMap.delete(eventType);
      }
      // W przeciwnym wypadku, jeśli indeks wykracza poza nowy rozmiar tablicy,
      // resetujemy go do 0, aby nie było out-of-range.
      else {
        const currentIndex = this.currentIndexMap.get(eventType) ?? 0;
        if (currentIndex >= filtered.length) {
          this.currentIndexMap.set(eventType, 0);
        }
      }
    }
  }

  /**
   * Emituje zdarzenie do *jednego* listenera dla danego eventType – konkretnie
   * do tego, który jest wskazywany przez aktualny indeks w mapie currentIndexMap.
   * Następnie zwiększamy ten indeks (modulo liczba subskrybentów), tak aby kolejny
   * emit trafił do następnego słuchacza.
   *
   * @param eventType - Typ zdarzenia (np. 'user:login').
   * @param event - Obiekt zdarzenia (zawiera np. payload, timestamp).
   */
  public emit(eventType: string, event: BaseEvent): void {
    const subscribersForType = this.subscribers.get(eventType);

    // Jeśli nie mamy subskrybentów, nie robimy nic
    if (!subscribersForType || subscribersForType.length === 0) {
      return;
    }

    const currentIndex = this.currentIndexMap.get(eventType)!;
    // Wywołujemy listener z indeksu currentIndex
    subscribersForType[currentIndex](event);

    // Zwiększamy indeks
    const nextIndex = (currentIndex + 1) % subscribersForType.length;
    this.currentIndexMap.set(eventType, nextIndex);
  }
}

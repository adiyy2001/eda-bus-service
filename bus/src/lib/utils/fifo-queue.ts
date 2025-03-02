/**
 * Uniwersalna kolejka FIFO (First-In-First-Out).
 * Może przechowywać zdarzenia, obiekty i prymitywy.
 */
export class FIFOQueue<T> {
  private items: T[] = [];

  /** Dodaje element na koniec kolejki. */
  enqueue(item: T): void {
    this.items.push(item);
  }

  /** Usuwa i zwraca element z początku kolejki (lub `undefined`, jeśli pusta). */
  dequeue(): T | undefined {
    return this.items.shift();
  }

  /** Podgląda pierwszy element bez usuwania (lub `undefined`, jeśli pusta). */
  peek(): T | undefined {
    return this.items[0];
  }

  /** Zwraca true, jeśli kolejka jest pusta. */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /** Liczba elementów w kolejce. */
  size(): number {
    return this.items.length;
  }

  /** Opróżnia kolejkę. */
  clear(): void {
    this.items = [];
  }
}

export class PriorityQueue<T extends { priority: number }> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    const item = this.items.pop();
    return item;
  }

  peek(): T | undefined {
    const item = this.items[this.items.length - 1];
    return item;
  }

  isEmpty(): boolean {
    const empty = this.items.length === 0;
    return empty;
  }

  size(): number {
    const size = this.items.length;
    return size;
  }

  clear(): void {
    this.items = [];
  }
}

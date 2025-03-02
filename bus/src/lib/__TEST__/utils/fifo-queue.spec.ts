import { FIFOQueue } from "../../utils/fifo-queue";

describe('FIFOQueue', () => {
  let queue: FIFOQueue<number>;

  beforeEach(() => {
    queue = new FIFOQueue<number>();
  });

  it('should enqueue and dequeue items in FIFO order', () => {
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);

    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
    expect(queue.dequeue()).toBeUndefined(); // pusta kolejka
  });

  it('should peek the first item without removing it', () => {
    queue.enqueue(10);
    queue.enqueue(20);

    expect(queue.peek()).toBe(10);
    expect(queue.dequeue()).toBe(10);
  });

  it('should be empty initially', () => {
    expect(queue.isEmpty()).toBeTrue();
    expect(queue.size()).toBe(0);
  });

  it('should clear all items', () => {
    queue.enqueue(5);
    queue.enqueue(6);
    queue.clear();
    expect(queue.isEmpty()).toBeTrue();
  });
});

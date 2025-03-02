import { PriorityQueue } from "../../utils/priority-queue";

interface TestItem {
  priority: number;
  value: string;
}

describe('PriorityQueue', () => {
  let pq: PriorityQueue<TestItem>;

  beforeEach(() => {
    pq = new PriorityQueue<TestItem>();
  });

  it('should dequeue items in order of descending priority', () => {
    pq.enqueue({ priority: 5, value: 'middle' });
    pq.enqueue({ priority: 10, value: 'highest' });
    pq.enqueue({ priority: 1, value: 'lowest' });

    expect(pq.dequeue()!.value).toBe('highest');
    expect(pq.dequeue()!.value).toBe('middle');
    expect(pq.dequeue()!.value).toBe('lowest');
    expect(pq.dequeue()).toBeUndefined();
  });

  it('should peek highest priority without removing it', () => {
    pq.enqueue({ priority: 2, value: 'A' });
    pq.enqueue({ priority: 5, value: 'B' });
    expect(pq.peek()!.value).toBe('B');
    expect(pq.dequeue()!.value).toBe('B');
  });

  it('should handle empty queue', () => {
    expect(pq.isEmpty()).toBeTrue();
    expect(pq.peek()).toBeUndefined();
    expect(pq.dequeue()).toBeUndefined();
  });

  it('should clear the queue', () => {
    pq.enqueue({ priority: 3, value: 'X' });
    pq.clear();
    expect(pq.isEmpty()).toBeTrue();
  });
});

/**
 * Fixed-capacity append log. Trims in batches once it overshoots `capacity`
 * by `trimTo`, instead of shifting on every push, so a page that logs at
 * high frequency doesn't pay an O(n) cost per console call.
 */
export class RingBuffer<T> {
  private items: T[] = [];

  constructor(
    private readonly capacity: number,
    private readonly trimTo: number = capacity,
  ) {}

  push(item: T): void {
    this.items.push(item);
    if (this.items.length > this.capacity) {
      this.items = this.items.slice(this.items.length - this.trimTo);
    }
  }

  /** Last `count` items, oldest first. */
  recent(count: number): T[] {
    if (count <= 0) return [];
    return this.items.slice(Math.max(0, this.items.length - count));
  }

  clear(): void {
    this.items = [];
  }

  get size(): number {
    return this.items.length;
  }
}

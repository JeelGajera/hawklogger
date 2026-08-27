import { describe, expect, it } from 'vitest';
import { RingBuffer } from './ringBuffer';

describe('RingBuffer', () => {
  it('returns items in insertion order', () => {
    const buffer = new RingBuffer<number>(5);
    [1, 2, 3].forEach((item) => buffer.push(item));
    expect(buffer.recent(3)).toEqual([1, 2, 3]);
  });

  it('caps size and trims down to trimTo once capacity is exceeded', () => {
    const buffer = new RingBuffer<number>(5, 3);
    for (let i = 1; i <= 6; i++) buffer.push(i);
    expect(buffer.size).toBe(3);
    expect(buffer.recent(10)).toEqual([4, 5, 6]);
  });

  it('recent returns at most the buffered items, oldest first', () => {
    const buffer = new RingBuffer<number>(10);
    [1, 2, 3, 4].forEach((item) => buffer.push(item));
    expect(buffer.recent(2)).toEqual([3, 4]);
    expect(buffer.recent(100)).toEqual([1, 2, 3, 4]);
  });

  it('clear empties the buffer', () => {
    const buffer = new RingBuffer<number>(5);
    buffer.push(1);
    buffer.clear();
    expect(buffer.size).toBe(0);
    expect(buffer.recent(5)).toEqual([]);
  });

  it('recent(0) or negative returns an empty array', () => {
    const buffer = new RingBuffer<number>(5);
    buffer.push(1);
    expect(buffer.recent(0)).toEqual([]);
    expect(buffer.recent(-1)).toEqual([]);
  });
});

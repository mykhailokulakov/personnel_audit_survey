import { describe, it, expect } from 'vitest';
import { deterministicShuffle } from '@/lib/storage/shuffle';

const ITEMS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

describe('deterministicShuffle — determinism', () => {
  it('same seed produces the same order every time', () => {
    const r1 = deterministicShuffle(ITEMS, 'seed-42');
    const r2 = deterministicShuffle(ITEMS, 'seed-42');
    expect(r1).toEqual(r2);
  });

  it('different seeds produce different orders', () => {
    const r1 = deterministicShuffle(ITEMS, 'seed-AAA');
    const r2 = deterministicShuffle(ITEMS, 'seed-ZZZ');
    expect(r1).not.toEqual(r2);
  });

  it('empty string seed is stable', () => {
    const r1 = deterministicShuffle(ITEMS, '');
    const r2 = deterministicShuffle(ITEMS, '');
    expect(r1).toEqual(r2);
  });
});

describe('deterministicShuffle — correctness', () => {
  it('output length equals input length', () => {
    const result = deterministicShuffle(ITEMS, 'test');
    expect(result).toHaveLength(ITEMS.length);
  });

  it('output contains exactly the same elements (no duplicates, no missing)', () => {
    const result = deterministicShuffle(ITEMS, 'test');
    expect([...result].sort()).toEqual([...ITEMS].sort());
  });

  it('does not mutate the input array', () => {
    const original = [...ITEMS];
    deterministicShuffle(ITEMS, 'mutate-test');
    expect(ITEMS).toEqual(original);
  });

  it('handles a single-element array', () => {
    expect(deterministicShuffle(['only'], 'x')).toEqual(['only']);
  });

  it('handles an empty array', () => {
    expect(deterministicShuffle([], 'x')).toEqual([]);
  });
});

describe('deterministicShuffle — distribution', () => {
  it('produces a shuffled order (not identical to input) for a typical seed', () => {
    // Run across multiple seeds; at least one should differ from the original.
    const seeds = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
    const anyDiffers = seeds.some((s) => {
      const r = deterministicShuffle(ITEMS, s);
      return r.join() !== ITEMS.join();
    });
    expect(anyDiffers).toBe(true);
  });

  it('first element differs across at least two distinct seeds (pseudo-random)', () => {
    const firsts = new Set(
      ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'].map(
        (s) => deterministicShuffle(ITEMS, s)[0],
      ),
    );
    expect(firsts.size).toBeGreaterThan(1);
  });
});

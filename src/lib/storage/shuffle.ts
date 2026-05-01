/**
 * Deterministic Fisher-Yates shuffle using a mulberry32 PRNG seeded from a string.
 * Same seed always produces the same output order.
 */

/** FNV-1a 32-bit hash — maps a string to a 32-bit unsigned integer. */
function fnv32a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/** mulberry32 PRNG — returns a function that yields uniform [0, 1) floats. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let z = Math.imul(s ^ (s >>> 15), 1 | s);
    z ^= z + Math.imul(z ^ (z >>> 7), 61 | z);
    return ((z ^ (z >>> 14)) >>> 0) / 0x1_0000_0000;
  };
}

/**
 * Returns a deterministically shuffled copy of `items`.
 * The same `seed` string always produces the same output order;
 * different seeds produce different orders (pseudo-random).
 *
 * @param items - The array to shuffle (not mutated).
 * @param seed  - An arbitrary string used to seed the PRNG (e.g. respondent code).
 * @returns A new array containing all items in a seeded-random order.
 */
export function deterministicShuffle<T>(items: readonly T[], seed: string): T[] {
  const result = [...items];
  const rng = mulberry32(fnv32a(seed));
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = result[i] as T;
    result[i] = result[j] as T;
    result[j] = tmp;
  }
  return result;
}

/**
 * Shuffles items deterministically by seed and then ensures that no two items
 * sharing the same `consistencyPairId` are placed adjacent to each other.
 *
 * Items without a `consistencyPairId` (null) are never considered adjacent violations.
 *
 * @param items - Items that each have a nullable `consistencyPairId` string field.
 * @param seed  - Seed string for the underlying PRNG.
 */
export function shuffleAndSeparatePairs<T extends { consistencyPairId: string | null }>(
  items: readonly T[],
  seed: string,
): T[] {
  const result = deterministicShuffle(items, seed);

  // Iteratively swap adjacent pair-mates apart until no violations remain.
  let changed = true;
  let guard = 0;
  while (changed && guard < result.length) {
    changed = false;
    guard++;
    for (let i = 0; i < result.length - 1; i++) {
      const a = result[i];
      const b = result[i + 1];
      if (
        a !== undefined &&
        b !== undefined &&
        a.consistencyPairId !== null &&
        a.consistencyPairId === b.consistencyPairId
      ) {
        const swapIdx = Math.min(i + 2, result.length - 1);
        if (swapIdx !== i + 1) {
          const tmp = result[i + 1] as T;
          result[i + 1] = result[swapIdx] as T;
          result[swapIdx] = tmp;
          changed = true;
        }
      }
    }
  }

  return result;
}

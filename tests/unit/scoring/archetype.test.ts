import { describe, it, expect } from 'vitest';
import { assignArchetype } from '@/lib/scoring/archetype';
import type { AxisScore } from '@/lib/scoring/types';

function profile(
  leadership: number,
  responsibility: number,
  initiative: number,
  technical: number,
  learnability: number,
  cognitive = 60,
): AxisScore[] {
  return [
    { axis: 'cognitive-proxy', score: cognitive },
    { axis: 'learnability', score: learnability },
    { axis: 'leadership', score: leadership },
    { axis: 'responsibility', score: responsibility },
    { axis: 'initiative', score: initiative },
    { axis: 'technical-readiness', score: technical },
  ];
}

describe('assignArchetype', () => {
  describe('data-unreliable', () => {
    it('returns data-unreliable when validity=unreliable and 4+ axes ≥ 50', () => {
      const p = profile(80, 75, 70, 65, 60, 60);
      expect(assignArchetype(p, 'unreliable')).toBe('data-unreliable');
    });

    it('returns data-unreliable with exactly 4 strong axes', () => {
      const p = profile(80, 80, 80, 30, 50, 50);
      // leadership=80, responsibility=80, initiative=80, learnability=50, cognitive=50 → 5 strong
      expect(assignArchetype(p, 'unreliable')).toBe('data-unreliable');
    });
  });

  describe('not-suitable', () => {
    it('returns not-suitable when validity=unreliable and profile is weak (< 4 strong axes)', () => {
      const p = profile(20, 20, 20, 20, 20, 20);
      expect(assignArchetype(p, 'unreliable')).toBe('not-suitable');
    });

    it('returns not-suitable when ≥3 axes score below 35', () => {
      const p = profile(30, 30, 30, 80, 80, 80);
      expect(assignArchetype(p, 'reliable')).toBe('not-suitable');
    });

    it('returns not-suitable with exactly 3 weak axes', () => {
      const p = profile(34, 34, 34, 80, 80, 80);
      expect(assignArchetype(p, 'reliable')).toBe('not-suitable');
    });

    it('does not return not-suitable with only 2 weak axes', () => {
      const p = profile(34, 34, 50, 80, 80, 80);
      expect(assignArchetype(p, 'reliable')).not.toBe('not-suitable');
    });
  });

  describe('potential-leader', () => {
    it('typical: high leadership, responsibility, initiative', () => {
      const p = profile(75, 70, 65, 50, 60, 60);
      expect(assignArchetype(p, 'reliable')).toBe('potential-leader');
    });

    it('boundary: exactly at the thresholds', () => {
      const p = profile(70, 65, 60, 50, 60, 60);
      expect(assignArchetype(p, 'reliable')).toBe('potential-leader');
    });

    it('does not trigger with leadership=69', () => {
      const p = profile(69, 65, 60, 50, 60, 60);
      expect(assignArchetype(p, 'reliable')).not.toBe('potential-leader');
    });
  });

  describe('technical-executor', () => {
    it('typical: high technical + responsibility, low leadership', () => {
      const p = profile(50, 65, 50, 70, 55, 55);
      expect(assignArchetype(p, 'reliable')).toBe('technical-executor');
    });

    it('boundary: technical=60, responsibility=60, leadership=59', () => {
      const p = profile(59, 60, 50, 60, 55, 55);
      expect(assignArchetype(p, 'reliable')).toBe('technical-executor');
    });

    it('does not trigger when leadership ≥ 60', () => {
      const p = profile(60, 65, 50, 70, 55, 55);
      expect(assignArchetype(p, 'reliable')).not.toBe('technical-executor');
    });
  });

  describe('admin-coordinator', () => {
    it('typical: high responsibility + learnability, mid leadership, low technical', () => {
      const p = profile(55, 70, 50, 30, 60, 60);
      expect(assignArchetype(p, 'reliable')).toBe('admin-coordinator');
    });

    it('boundary: responsibility=65, learnability=55, leadership=40, technical=39', () => {
      const p = profile(40, 65, 50, 39, 55, 55);
      expect(assignArchetype(p, 'reliable')).toBe('admin-coordinator');
    });

    it('does not trigger when technical ≥ 40', () => {
      const p = profile(55, 70, 50, 40, 60, 60);
      expect(assignArchetype(p, 'reliable')).not.toBe('admin-coordinator');
    });

    it('does not trigger when leadership > 65', () => {
      const p = profile(66, 70, 50, 30, 60, 60);
      expect(assignArchetype(p, 'reliable')).not.toBe('admin-coordinator');
    });
  });

  describe('universal-potential', () => {
    it('typical: all axes ≥ 55, spread < 25', () => {
      const p = profile(60, 65, 62, 58, 60, 60);
      expect(assignArchetype(p, 'reliable')).toBe('universal-potential');
    });

    it('boundary: all axes = 55, max-min = 0', () => {
      const p = profile(55, 55, 55, 55, 55, 55);
      expect(assignArchetype(p, 'reliable')).toBe('universal-potential');
    });

    it('boundary: spread = 24 (just within threshold)', () => {
      const p = profile(55, 55, 55, 79, 55, 55);
      expect(assignArchetype(p, 'reliable')).toBe('universal-potential');
    });

    it('does not trigger when spread = 25', () => {
      const p = profile(55, 55, 55, 80, 55, 55);
      expect(assignArchetype(p, 'reliable')).not.toBe('universal-potential');
    });

    it('does not trigger when any axis < 55', () => {
      const p = profile(54, 60, 60, 60, 60, 60);
      expect(assignArchetype(p, 'reliable')).not.toBe('universal-potential');
    });
  });

  describe('basic-executor', () => {
    it('returns basic-executor as default fallback', () => {
      const p = profile(50, 50, 50, 50, 50, 50);
      expect(assignArchetype(p, 'reliable')).toBe('basic-executor');
    });

    it('returns basic-executor for a mediocre profile that does not meet any archetype', () => {
      // medium values, no dominance
      const p = profile(45, 45, 45, 45, 45, 45);
      expect(assignArchetype(p, 'reliable')).toBe('basic-executor');
    });
  });

  describe('cascade order', () => {
    it('unreliable check happens before positive archetypes', () => {
      // Profile would be potential-leader but validity=unreliable → data-unreliable
      const p = profile(75, 70, 65, 60, 60, 60);
      expect(assignArchetype(p, 'unreliable')).toBe('data-unreliable');
    });

    it('not-suitable check (weak axes) happens before positive archetypes', () => {
      // 3 weak axes but would otherwise qualify as basic-executor
      const p = profile(30, 30, 30, 70, 70, 70);
      expect(assignArchetype(p, 'reliable')).toBe('not-suitable');
    });

    it('potential-leader takes priority over technical-executor when both conditions met', () => {
      // leadership=70, responsibility=70, initiative=65, technical=65
      const p = profile(70, 70, 65, 65, 60, 60);
      expect(assignArchetype(p, 'reliable')).toBe('potential-leader');
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  buildBlockQuestions,
  buildPsychometricBlockItems,
  buildScenariosBlockItems,
} from '@/lib/storage/build-block-questions';
import attentionChecksData from '@/data/questions/attention-checks.json';

// Minimal fixture helpers
function makeMain(id: string): { id: string; isAttentionCheck: boolean } {
  return { id, isAttentionCheck: false };
}
function makeAC(id: string): { id: string; isAttentionCheck: boolean } {
  return { id, isAttentionCheck: true };
}

describe('buildBlockQuestions — generic invariants', () => {
  it('returns all items (main + attention checks)', () => {
    const main = [makeMain('q1'), makeMain('q2'), makeMain('q3'), makeMain('q4'), makeMain('q5')];
    const acs = [makeAC('ac1'), makeAC('ac2')];
    const result = buildBlockQuestions(main, acs, 'seed-abc');
    expect(result).toHaveLength(7);
  });

  it('contains every item exactly once', () => {
    const main = [makeMain('q1'), makeMain('q2'), makeMain('q3'), makeMain('q4')];
    const acs = [makeAC('ac1')];
    const result = buildBlockQuestions(main, acs, 'any-seed');
    const ids = result.map((i) => i.id);
    expect(new Set(ids).size).toBe(5);
    ['q1', 'q2', 'q3', 'q4', 'ac1'].forEach((id) => expect(ids).toContain(id));
  });

  it('first item is never an attention check', () => {
    const seeds = ['alpha', 'beta', 'gamma', 'test-001', 'xyz-789'];
    const main = [makeMain('q1'), makeMain('q2'), makeMain('q3'), makeMain('q4'), makeMain('q5')];
    const acs = [makeAC('ac1'), makeAC('ac2')];
    seeds.forEach((seed) => {
      const result = buildBlockQuestions(main, acs, seed);
      expect(result[0]!.isAttentionCheck).toBe(false);
    });
  });

  it('last item is never an attention check', () => {
    const seeds = ['alpha', 'beta', 'gamma', 'test-001', 'xyz-789'];
    const main = [makeMain('q1'), makeMain('q2'), makeMain('q3'), makeMain('q4'), makeMain('q5')];
    const acs = [makeAC('ac1'), makeAC('ac2')];
    seeds.forEach((seed) => {
      const result = buildBlockQuestions(main, acs, seed);
      expect(result[result.length - 1]!.isAttentionCheck).toBe(false);
    });
  });

  it('output is deterministic for the same seed', () => {
    const main = [makeMain('q1'), makeMain('q2'), makeMain('q3'), makeMain('q4')];
    const acs = [makeAC('ac1')];
    const order1 = buildBlockQuestions(main, acs, 'my-seed').map((i) => i.id);
    const order2 = buildBlockQuestions(main, acs, 'my-seed').map((i) => i.id);
    expect(order1).toEqual(order2);
  });

  it('output differs for different seeds', () => {
    const main = [makeMain('q1'), makeMain('q2'), makeMain('q3'), makeMain('q4'), makeMain('q5')];
    const acs = [makeAC('ac1'), makeAC('ac2')];
    const order1 = buildBlockQuestions(main, acs, 'seed-aaa').map((i) => i.id);
    const order2 = buildBlockQuestions(main, acs, 'seed-zzz').map((i) => i.id);
    expect(order1).not.toEqual(order2);
  });
});

describe('buildPsychometricBlockItems', () => {
  it('returns psychometric questions + 2 attention checks', () => {
    const result = buildPsychometricBlockItems('test-code');
    const acCount = attentionChecksData.psychometricChecks.length;
    // Main questions count is from psychometric.json (22-30 range per validity test)
    expect(result.length).toBeGreaterThan(22);
    const acs = result.filter((i) => i.isAttentionCheck);
    expect(acs).toHaveLength(acCount);
  });

  it('first item is not an attention check', () => {
    const result = buildPsychometricBlockItems('code-001');
    expect(result[0]!.isAttentionCheck).toBe(false);
  });

  it('last item is not an attention check', () => {
    const result = buildPsychometricBlockItems('code-001');
    expect(result[result.length - 1]!.isAttentionCheck).toBe(false);
  });

  it('attention-check items carry a non-null attentionCheckTarget', () => {
    const result = buildPsychometricBlockItems('any-code');
    result
      .filter((i) => i.isAttentionCheck)
      .forEach((ac) => {
        expect(ac.attentionCheckTarget).not.toBeNull();
        expect(typeof ac.attentionCheckTarget).toBe('number');
      });
  });

  it('regular items have attentionCheckTarget=null', () => {
    const result = buildPsychometricBlockItems('any-code');
    result
      .filter((i) => !i.isAttentionCheck)
      .forEach((q) => {
        expect(q.attentionCheckTarget).toBeNull();
      });
  });

  it('is deterministic for the same seed', () => {
    const order1 = buildPsychometricBlockItems('resp-abc').map((i) => i.id);
    const order2 = buildPsychometricBlockItems('resp-abc').map((i) => i.id);
    expect(order1).toEqual(order2);
  });
});

describe('buildScenariosBlockItems', () => {
  it('returns 7 scenarios + 2 attention checks = 9 items', () => {
    const result = buildScenariosBlockItems('test-code');
    expect(result).toHaveLength(9);
  });

  it('first item is not an attention check', () => {
    const result = buildScenariosBlockItems('code-001');
    expect(result[0]!.isAttentionCheck).toBe(false);
  });

  it('last item is not an attention check', () => {
    const result = buildScenariosBlockItems('code-001');
    expect(result[result.length - 1]!.isAttentionCheck).toBe(false);
  });

  it('attention-check items have attentionCheckTarget=3', () => {
    const result = buildScenariosBlockItems('any-code');
    result
      .filter((i) => i.isAttentionCheck)
      .forEach((ac) => {
        expect(ac.attentionCheckTarget).toBe(3);
      });
  });

  it('is deterministic for the same seed', () => {
    const order1 = buildScenariosBlockItems('resp-abc').map((i) => i.id);
    const order2 = buildScenariosBlockItems('resp-abc').map((i) => i.id);
    expect(order1).toEqual(order2);
  });

  it('differs for different seeds', () => {
    const order1 = buildScenariosBlockItems('seed-aaa').map((i) => i.id);
    const order2 = buildScenariosBlockItems('seed-zzz').map((i) => i.id);
    expect(order1).not.toEqual(order2);
  });
});

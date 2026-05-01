import { describe, it, expect } from 'vitest';
import scenariosData from '@/data/questions/scenarios.json';
import attentionChecksData from '@/data/questions/attention-checks.json';
import type { SJTScenario, SJTBehaviorType } from '@/lib/types/sjt';

const scenarios = scenariosData.scenarios as SJTScenario[];
const BEHAVIOR_TYPES: SJTBehaviorType[] = ['passive', 'social-desirable', 'impulsive', 'mature'];
const SCORE_MAP: Record<SJTBehaviorType, number> = {
  passive: 0,
  'social-desirable': 1,
  impulsive: 0,
  mature: 3,
};

describe('Scenarios data — structural validity', () => {
  it('has exactly 7 main scenarios', () => {
    expect(scenarios).toHaveLength(7);
  });

  it('every scenario has a non-empty id', () => {
    scenarios.forEach((s) => {
      expect(typeof s.id).toBe('string');
      expect(s.id.trim()).not.toBe('');
    });
  });

  it('all scenario ids are unique', () => {
    const ids = scenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every scenario has a non-empty promptUa', () => {
    scenarios.forEach((s) => {
      expect(typeof s.promptUa).toBe('string');
      expect(s.promptUa.trim()).not.toBe('');
    });
  });

  it('every scenario has at least one axesTested entry', () => {
    scenarios.forEach((s) => {
      expect(Array.isArray(s.axesTested)).toBe(true);
      expect(s.axesTested.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('every scenario has exactly 4 options', () => {
    scenarios.forEach((s) => {
      expect(s.options).toHaveLength(4);
    });
  });

  it('all 4 behavior types are represented in each scenario', () => {
    scenarios.forEach((s) => {
      const types = s.options.map((o) => o.behaviorType).sort();
      expect(types).toEqual([...BEHAVIOR_TYPES].sort());
    });
  });

  it('option scores match convention: passive=0, social-desirable=1, impulsive=0, mature=3', () => {
    scenarios.forEach((s) => {
      s.options.forEach((o) => {
        expect(o.score).toBe(SCORE_MAP[o.behaviorType]);
      });
    });
  });

  it('every option has a unique id within its scenario', () => {
    scenarios.forEach((s) => {
      const ids = s.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(4);
    });
  });

  it('all option ids are globally unique across scenarios', () => {
    const allIds = scenarios.flatMap((s) => s.options.map((o) => o.id));
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('every option has non-empty textUa', () => {
    scenarios.forEach((s) => {
      s.options.forEach((o) => {
        expect(typeof o.textUa).toBe('string');
        expect(o.textUa.trim()).not.toBe('');
      });
    });
  });

  it('axes distribution covers all scored axes', () => {
    const allAxes = new Set(scenarios.flatMap((s) => s.axesTested));
    expect(allAxes).toContain('responsibility');
    expect(allAxes).toContain('leadership');
    expect(allAxes).toContain('learnability');
    expect(allAxes).toContain('initiative');
  });
});

describe('Attention-check scenarios — structural validity', () => {
  const acScenarios = attentionChecksData.scenariosChecks;

  it('has exactly 2 scenario attention checks', () => {
    expect(acScenarios).toHaveLength(2);
  });

  it('each has isAttentionCheck=true and attentionCheckTarget=3', () => {
    acScenarios.forEach((ac) => {
      expect(ac.isAttentionCheck).toBe(true);
      expect(ac.attentionCheckTarget).toBe(3);
    });
  });

  it('each has exactly 4 options with all behavior types', () => {
    acScenarios.forEach((ac) => {
      expect(ac.options).toHaveLength(4);
      const types = ac.options.map((o) => o.behaviorType).sort();
      expect(types).toEqual([...BEHAVIOR_TYPES].sort());
    });
  });

  it('the mature option has score=3 in each attention-check scenario', () => {
    acScenarios.forEach((ac) => {
      const mature = ac.options.find((o) => o.behaviorType === 'mature');
      expect(mature?.score).toBe(3);
    });
  });
});

describe('Attention-check Likert items — structural validity', () => {
  const acLikert = attentionChecksData.psychometricChecks;

  it('has exactly 2 Likert attention checks', () => {
    expect(acLikert).toHaveLength(2);
  });

  it('each has isAttentionCheck=true', () => {
    acLikert.forEach((ac) => {
      expect(ac.isAttentionCheck).toBe(true);
    });
  });

  it('each has attentionCheckTarget in [1,5]', () => {
    acLikert.forEach((ac) => {
      expect(ac.attentionCheckTarget).toBeGreaterThanOrEqual(1);
      expect(ac.attentionCheckTarget).toBeLessThanOrEqual(5);
    });
  });

  it('each has weight=0 (not scored)', () => {
    acLikert.forEach((ac) => {
      expect(ac.weight).toBe(0);
    });
  });
});

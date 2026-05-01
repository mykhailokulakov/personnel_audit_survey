import { deterministicShuffle } from './shuffle';
import type { PsychometricQuestion, PsychometricBlockItem } from '../types/psychometric';
import type { SJTScenario, ScenariosBlockItem } from '../types/sjt';
import psychometricData from '@/data/questions/psychometric.json';
import attentionChecksData from '@/data/questions/attention-checks.json';
import scenariosData from '@/data/questions/scenarios.json';

/**
 * Merges main items with attention-check items, shuffles the combined list
 * deterministically by seed, and guarantees that no attention-check item ends
 * up at position 0 or at the last position.
 *
 * @param mainItems - Core question/scenario items (isAttentionCheck=false).
 * @param attentionCheckItems - Attention-check items (isAttentionCheck=true).
 * @param seed - Deterministic seed derived from the respondent code.
 * @returns Combined, shuffled array with attention checks in valid mid-positions.
 */
export function buildBlockQuestions<T extends { id: string; isAttentionCheck: boolean }>(
  mainItems: readonly T[],
  attentionCheckItems: readonly T[],
  seed: string,
): T[] {
  const combined = deterministicShuffle([...mainItems, ...attentionCheckItems], seed);
  return repositionAttentionChecks(combined);
}

/** Swaps attention-check items away from the first and last positions. */
function repositionAttentionChecks<T extends { id: string; isAttentionCheck: boolean }>(
  items: T[],
): T[] {
  if (items.length < 3) return items;

  const result = [...items];
  const isAC = (item: T): boolean => item.isAttentionCheck;

  if (isAC(result[0]!)) {
    const firstNonAC = result.findIndex((item, idx) => idx > 0 && !isAC(item));
    if (firstNonAC !== -1) {
      const tmp = result[0]!;
      result[0] = result[firstNonAC]!;
      result[firstNonAC] = tmp;
    }
  }

  const lastIdx = result.length - 1;
  if (isAC(result[lastIdx]!)) {
    let lastNonAC = lastIdx - 1;
    while (lastNonAC >= 0 && isAC(result[lastNonAC]!)) lastNonAC--;
    if (lastNonAC >= 0) {
      const tmp = result[lastIdx]!;
      result[lastIdx] = result[lastNonAC]!;
      result[lastNonAC] = tmp;
    }
  }

  return result;
}

/**
 * Builds the ordered question list for Block 4 (Psychometric).
 * Augments each main question with isAttentionCheck=false, then merges with
 * the two Block-4 attention checks and shuffles deterministically.
 *
 * @param seed - Respondent code used as the shuffle seed.
 */
export function buildPsychometricBlockItems(seed: string): PsychometricBlockItem[] {
  const mainItems: PsychometricBlockItem[] = (
    psychometricData.questions as PsychometricQuestion[]
  ).map((q) => ({ ...q, isAttentionCheck: false, attentionCheckTarget: null }));

  const acItems = attentionChecksData.psychometricChecks as PsychometricBlockItem[];

  return buildBlockQuestions(mainItems, acItems, seed);
}

/**
 * Builds the ordered scenario list for Block 5 (SJT Scenarios).
 * Augments each main scenario with isAttentionCheck=false, then merges with
 * the two Block-5 attention checks and shuffles deterministically.
 *
 * @param seed - Respondent code used as the shuffle seed.
 */
export function buildScenariosBlockItems(seed: string): ScenariosBlockItem[] {
  const mainItems: ScenariosBlockItem[] = (scenariosData.scenarios as SJTScenario[]).map((s) => ({
    ...s,
    isAttentionCheck: false,
    attentionCheckTarget: null,
  }));

  const acItems = attentionChecksData.scenariosChecks as ScenariosBlockItem[];

  return buildBlockQuestions(mainItems, acItems, seed);
}

import type { ProfileAxis } from '../types/axes';
import type { TechQualification } from '../types/survey';

/** The seven respondent archetypes produced by the scoring engine. */
export type Archetype =
  | 'potential-leader'
  | 'technical-executor'
  | 'admin-coordinator'
  | 'universal-potential'
  | 'basic-executor'
  | 'not-suitable'
  | 'data-unreliable';

/** Ukrainian display labels for each archetype. */
export const ArchetypeLabel: Record<Archetype, string> = {
  'potential-leader': 'Потенційний лідер',
  'technical-executor': 'Технічний виконавець',
  'admin-coordinator': 'Адміністратор-координатор',
  'universal-potential': 'Універсал з потенціалом',
  'basic-executor': 'Виконавець базового рівня',
  'not-suitable': 'Не підходить',
  'data-unreliable': 'Дані недостовірні — потребує повторного асесменту',
};

/** Short descriptive text for each archetype shown in the report. */
export const ArchetypeDescription: Record<Archetype, string> = {
  'potential-leader':
    'Демонструє розвинені лідерські якості, відповідальність та ініціативність. Здатен приймати рішення та вести за собою команду.',
  'technical-executor':
    'Сильний технічний фахівець з надійністю у виконанні завдань. Перевага — технічна компетентність і стабільність.',
  'admin-coordinator':
    'Ефективний організатор процесів. Добре координує роботу команди, веде документацію, контролює виконання.',
  'universal-potential':
    'Збалансований профіль без яскраво виражених слабких місць. Висока адаптивність до різних ролей.',
  'basic-executor':
    'Надійний виконавець базових завдань. Потребує чіткого керівництва та структурованого середовища.',
  'not-suitable': 'Профіль не відповідає мінімальним вимогам за кількома ключовими параметрами.',
  'data-unreliable':
    'Якість відповідей не дозволяє зробити достовірний висновок. Рекомендується повторне проходження.',
};

/** Three-level validity classification of a respondent session. */
export type ValidityLevel = 'reliable' | 'questionable' | 'unreliable';

/** Detailed result for one consistency pair. */
export type ConsistencyPairResult = {
  /** Shared identifier for the two questions in this pair. */
  pairId: string;
  /** Absolute difference in Likert values (0–4). */
  delta: number;
  /** Normalised score: 0 = identical answers, 100 = maximum contradiction. */
  normalized: number;
};

/** Aggregated validity metrics for a session. */
export type ValidityReport = {
  /** Lie-scale score 0–100 (higher = more social-desirability bias). */
  lieScore: number;
  /** Number of lie-scale questions answered with value ≥ 4. */
  lieCount: number;
  /** Total number of lie-scale questions presented. */
  lieTotal: number;
  /** Consistency score 0–100 (higher = more contradictory answers). */
  consistencyScore: number;
  /** Per-pair consistency results. */
  consistencyPairs: ConsistencyPairResult[];
  /** Attention score 0–100 (higher = more attention checks passed). */
  attentionScore: number;
  /** Number of attention checks passed. */
  attentionPassed: number;
  /** Total number of attention checks presented. */
  attentionTotal: number;
  /** True when median response time is suspiciously fast or answers are uniform. */
  speedFlag: boolean;
  /** Overall validity classification. */
  overall: ValidityLevel;
};

/** Normalised score for one profile axis. */
export type AxisScore = {
  axis: ProfileAxis;
  /** Score in [0, 100]. */
  score: number;
};

/** Qualification status codes used in the report. */
export type QualificationStatus =
  | 'verified'
  | 'partial'
  | 'failed'
  | 'not-declared'
  | 'no-verification';

/** Verification result for a single declared qualification. */
export type QualificationVerificationResult = {
  qualification: TechQualification;
  /** True when the respondent declared this qualification. */
  declared: boolean;
  /** Number of verification questions answered correctly. */
  correctCount: number;
  /** Total number of verification questions for this qualification. */
  totalCount: number;
  /** Scoring multiplier: 0.0, 0.5, or 1.0. */
  coefficient: number;
  /** True when coefficient is 0.0 (declared but answered < 33% correctly). */
  likelyFalseFlag: boolean;
  /** Summary status for UI display. */
  status: QualificationStatus;
};

/** Full scoring output returned by scoreSession(). */
export type ScoringResult = {
  /** Anonymous respondent code. */
  respondentCode: string;
  /** Unix timestamp (ms) when scoring was performed. */
  scoredAt: number;
  /** Total session duration in milliseconds. */
  durationMs: number;
  /** Assigned archetype. */
  archetype: Archetype;
  /** Six-axis profile, each score in [0, 100]. */
  profile: AxisScore[];
  /** Validity metrics and overall classification. */
  validity: ValidityReport;
  /** Verification results for all tracked qualifications. */
  qualifications: QualificationVerificationResult[];
  /** True when at least one declared qualification should be verified with physical documents. */
  needsDocumentVerification: boolean;
};

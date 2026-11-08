/**
 * Nebula Learning — Mathematics Universe data contracts.
 *
 * The curriculum is static, versioned content that runs entirely in the browser.
 * Only learner progress is persisted (FastAPI `/api/v1/universe/progress`).
 */

export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

/** The five cross-grade knowledge systems from the curriculum blueprint (Part III). */
export type DomainId = 'number' | 'operations' | 'relationships' | 'geometry' | 'statistics';

/** Reusable animation engines. One engine serves many knowledge points through `interaction_config`. */
export type EngineType =
  | 'counting' | 'objects' | 'place-value' | 'column' | 'array' | 'division' | 'laws'
  | 'fraction' | 'decimal' | 'number-line' | 'angle' | 'area' | 'circle' | 'solid'
  | 'balance' | 'measure' | 'clock' | 'money' | 'data' | 'probability' | 'percent'
  | 'proportion' | 'coordinate' | 'factor' | 'sorting' | 'transform' | 'reasoning' | 'shapes';

export type EngineConfig = Record<string, string | number | boolean | number[] | string[]>;

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  kind: 'choice' | 'number';
  /** Required for `choice`; the answer must be one of the options. */
  options?: string[];
  answer: string | number;
  /** Absolute tolerance for numeric answers (default exact). */
  tolerance?: number;
  explanation: string;
}

export interface KnowledgePoint {
  id: string;
  grade: Grade;
  domain: DomainId;
  chapter: string;
  title: string;
  title_zh: string;
  description: string;
  /** Curriculum topics (from the blueprint) that this knowledge point covers. */
  topics: string[];
  learning_objectives: string[];
  prerequisites: string[];
  related_concepts: string[];
  animation_id: string;
  animation_type: EngineType;
  interaction_config: EngineConfig;
  misconceptions: string[];
  assessment: AssessmentQuestion[];
  extension_activities: string[];
  /** Formal statement revealed at Level 4 (LaTeX), only after exploration. */
  formula?: string;
}

export interface Chapter {
  id: string;
  grade: Grade;
  order: number;
  title: string;
  title_zh: string;
  objective: string;
}

export interface GradeWorld {
  grade: Grade;
  title: string;
  title_zh: string;
  world: string;
  objective: string;
  motif: string;
}

export interface Domain {
  id: DomainId;
  title: string;
  title_zh: string;
  summary: string;
}

/* ---------- Engine contract (pure, testable logic) ---------- */

export type ScenePurpose = 'introduce' | 'problem' | 'explore' | 'manipulate' | 'discover' | 'explain' | 'apply';

export interface SceneScript {
  id: string;
  title: string;
  purpose: ScenePurpose;
  /** Narration (also used as captions and for optional read-aloud). */
  narration: string;
  /** Seconds at 1× speed. */
  duration: number;
}

export interface Prediction {
  prompt: string;
  options: { id: string; label: string }[];
  answer: string;
  explanation: string;
  /** Scene index that demonstrates the answer. */
  revealScene: number;
}

export interface Challenge {
  prompt: string;
  kind: 'number' | 'choice';
  answer: number | string;
  options?: string[];
  unit?: string;
  tolerance?: number;
  hint: string;
  explanation: string;
}

export interface EngineLogic<C> {
  type: EngineType;
  label: string;
  parse(raw: EngineConfig): C;
  /** Returns mathematical/configuration problems; empty when the config is valid. */
  validate(c: C): string[];
  scenes(c: C): SceneScript[];
  prediction(c: C): Prediction;
  challenge(c: C, rng: () => number): Challenge;
  /** Text alternative for screen readers describing what the animation shows. */
  describe(c: C): string;
}

export const LEVELS = [
  {n: 1, key: 'observe', title: 'Observe', zh: '观察', blurb: 'Watch the mathematics happen.'},
  {n: 2, key: 'explore', title: 'Explore', zh: '探索', blurb: 'Move the objects yourself.'},
  {n: 3, key: 'discover', title: 'Discover', zh: '发现', blurb: 'Predict before you are told.'},
  {n: 4, key: 'understand', title: 'Understand', zh: '理解', blurb: 'Name what you discovered.'},
  {n: 5, key: 'apply', title: 'Apply', zh: '应用', blurb: 'Solve a new problem alone.'},
  {n: 6, key: 'extend', title: 'Extend', zh: '拓展', blurb: 'Follow the idea further.'},
] as const;
export type LevelKey = (typeof LEVELS)[number]['key'];

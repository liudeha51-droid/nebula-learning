import type {AssessmentQuestion, Chapter, DomainId, EngineConfig, EngineType, Grade, KnowledgePoint} from '../types';

type Q = Omit<AssessmentQuestion, 'id'>;
/** Numeric question. */
export const N = (prompt: string, answer: number, explanation: string, tolerance?: number): Q => ({prompt, kind: 'number', answer, explanation, ...(tolerance ? {tolerance} : {})});
/** Multiple-choice question; `answer` must be one of `options`. */
export const M = (prompt: string, options: string[], answer: string, explanation: string): Q => ({prompt, kind: 'choice', options, answer, explanation});

interface Authoring {
  d: string; t: string[]; o: string[]; pre?: string[]; rel?: string[];
  e: EngineType; c: EngineConfig; m: string[]; q: Q[]; x: string[]; f?: string;
}

/** Small authoring DSL: chapters set the context for the knowledge points that follow. */
export function gradeBuilder(grade: Grade) {
  const chapters: Chapter[] = []; const points: KnowledgePoint[] = [];
  let current: Chapter | null = null; let domain: DomainId = 'number';
  return {
    chapter(id: string, title: string, title_zh: string, d: DomainId, objective: string, book?: string) {
      current = {id, grade, order: chapters.length + 1, title, title_zh, objective, ...(book ? {book} : {})}; domain = d; chapters.push(current);
    },
    k(id: string, title: string, title_zh: string, a: Authoring, d?: DomainId) {
      if (!current) throw new Error('chapter first');
      points.push({
        id, grade, domain: d ?? domain, chapter: current.id, title, title_zh, description: a.d, topics: a.t,
        learning_objectives: a.o, prerequisites: a.pre ?? [], related_concepts: a.rel ?? [],
        animation_id: `anim-${id}`, animation_type: a.e, interaction_config: a.c, misconceptions: a.m,
        assessment: a.q.map((q, i) => ({id: `${id}-q${i + 1}`, ...q})), extension_activities: a.x, ...(a.f ? {formula: a.f} : {}),
      });
    },
    done: () => ({chapters, points}),
  };
}

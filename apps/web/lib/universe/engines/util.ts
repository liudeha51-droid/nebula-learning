import type {SceneScript, ScenePurpose, Prediction} from '../types';

export const sc = (id: string, purpose: ScenePurpose, title: string, narration: string, duration = 7): SceneScript => ({id, purpose, title, narration, duration});

/** Prediction helper: options as [id,label] tuples. */
export const predict = (prompt: string, options: [string, string][], answer: string, explanation: string, revealScene: number): Prediction =>
  ({prompt, options: options.map(([id, label]) => ({id, label})), answer, explanation, revealScene});

export const range = (n: number) => Array.from({length: Math.max(0, n)}, (_, i) => i);
export const plural = (n: number, word: string, many = word + 's') => `${n} ${n === 1 ? word : many}`;

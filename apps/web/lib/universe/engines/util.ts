import type {SceneScript, ScenePurpose, Prediction} from '../types';

export const sc = (id: string, purpose: ScenePurpose, title: string, narration: string, duration = 7): SceneScript => ({id, purpose, title, narration, duration});

/** Prediction helper: options as [id,label] tuples. */
export const predict = (prompt: string, options: [string, string][], answer: string, explanation: string, revealScene: number): Prediction =>
  ({prompt, options: options.map(([id, label]) => ({id, label})), answer, explanation, revealScene});

export const range = (n: number) => Array.from({length: Math.max(0, n)}, (_, i) => i);
export const plural = (n: number, word: string, many = word + 's') => `${n} ${n === 1 ? word : many}`;

/**
 * Seven-scene storyboard in the standard order (introduce → apply).
 * Each line is "Title: narration"; the first line is the intro narration.
 */
export function story(title: string, lines: string[]): SceneScript[] {
  const ids = ['intro', 'problem', 'explore', 'manipulate', 'discover', 'explain', 'apply'] as const;
  const purposes: ScenePurpose[] = ['introduce', 'problem', 'explore', 'manipulate', 'discover', 'explain', 'apply'];
  const durations = [5, 6, 9, 9, 7, 8, 5];
  return ids.map((id, i) => {
    const line = lines[i] ?? '';
    if (i === 0) return sc(id, purposes[i], title, line || `${title}: look at the picture first — the formula comes later.`, durations[i]);
    const k = line.indexOf(':');
    return sc(id, purposes[i], k > 0 ? line.slice(0, k) : title, k > 0 ? line.slice(k + 1).trim() : line, durations[i]);
  });
}

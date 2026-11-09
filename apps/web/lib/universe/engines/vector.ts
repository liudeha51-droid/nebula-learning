import type {EngineLogic} from '../types';
import {fmt, int, num, pick, str} from '../math';
import {predict, story} from './util';

export type VectorMode = 'add' | 'dot';
export interface VectorConfig {mode: VectorMode; ax: number; ay: number; bx: number; by: number}
export const dot = (c: VectorConfig) => c.ax * c.bx + c.ay * c.by;
export const len = (x: number, y: number) => Math.hypot(x, y);

export const vector: EngineLogic<VectorConfig> = {
  type: 'vector', label: 'Plane vector laboratory',
  parse: r => ({mode: str(r.mode, 'add'), ax: num(r.ax, 3), ay: num(r.ay, 1), bx: num(r.bx, 1), by: num(r.by, 2)}),
  validate: c => (len(c.ax, c.ay) === 0 || len(c.bx, c.by) === 0 ? ['zero vector'] : []),
  scenes: c => {
    const {ax, ay, bx, by} = c;
    if (c.mode === 'dot') { const d = dot(c), th = (Math.acos(d / (len(ax, ay) * len(bx, by))) * 180) / Math.PI; return story('Work done by a force', [`A force b = (${bx}, ${by}) drags a box along a = (${ax}, ${ay}).`, 'How much of the force helps?: Only the part along the motion does work.', 'Shine a light: Drop a perpendicular from b’s tip onto a — the shadow is the projection.', `Multiply: Shadow length × |a| = ${fmt(d)} — and also ${ax}·${bx} + ${ay}·${by} = ${d}.`, `a · b = |a||b|cos θ: θ ≈ ${fmt(th, 1)}°. Turn b to 90° and the shadow — and the dot product — vanish.`, 'Dot product: a · b = x₁x₂ + y₁y₂ = |a||b|cos θ; a ⊥ b ⇔ a · b = 0; projection of b on a is (a · b)/|a|.', 'Your turn: Compute dot products.']); }
    return story('Two journeys', [`Walk a = (${ax}, ${ay}), then b = (${bx}, ${by}).`, 'Where do you end up?: Is the total just the lengths added?', 'Head to tail: Put b’s tail at a’s head; the sum goes from start to finish.', `Parallelogram: Both orders reach the same point (${ax + bx}, ${ay + by}): a + b = b + a.`, `Lengths do not add: |a| + |b| = ${fmt(len(ax, ay) + len(bx, by), 3)} but |a + b| = ${fmt(len(ax + bx, ay + by), 3)}.`, 'Vector operations: Add and subtract component-wise; ka scales length by |k| and reverses if k < 0.', 'Your turn: Combine vectors.']);
  },
  prediction: c => c.mode === 'dot' ? predict('If a ⊥ b, then a · b is…', [['a', '0'], ['b', '|a||b|'], ['c', 'Undefined']], 'a', 'cos 90° = 0.', 4)
    : predict(`|a + b| compared with |a| + |b|:`, [['a', 'Smaller (unless same direction)'], ['b', 'Always equal'], ['c', 'Larger']], 'a', 'Triangle inequality.', 4),
  challenge: (c, r) => {
    const ax = int(r, -4, 5), ay = int(r, -4, 5), bx = int(r, -4, 5), by = int(r, 1, 5);
    if (c.mode === 'dot') return pick(r, [0, 1]) ? {prompt: `a = (${ax}, ${ay}), b = (${bx}, ${by}). a · b = ?`, kind: 'number', answer: ax * bx + ay * by, hint: 'x₁x₂ + y₁y₂.', explanation: `${ax}·${bx} + ${ay}·${by}.`}
      : {prompt: `a = (${by}, ${ax}) and b = (k, ${by}) are perpendicular. k = ?`, kind: 'number', answer: -ax || 0, hint: 'a · b = 0.', explanation: `${by}k + ${ax}·${by} = 0.`};
    return pick(r, [0, 1]) ? {prompt: `a = (${ax}, ${ay}), b = (${bx}, ${by}). x-coordinate of 2a − b?`, kind: 'number', answer: 2 * ax - bx, hint: 'Component-wise.', explanation: `2·${ax} − ${bx}.`}
      : {prompt: `|(${3 * Math.abs(by)}, ${4 * Math.abs(by)})| = ?`, kind: 'number', answer: 5 * Math.abs(by), hint: '√(x² + y²).', explanation: `${5 * Math.abs(by)}.`};
  },
  describe: c => `Arrows a = (${c.ax}, ${c.ay}) and b = (${c.bx}, ${c.by}) on a grid (${c.mode}).`,
};

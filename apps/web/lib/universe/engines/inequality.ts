import type {EngineLogic} from '../types';
import {fmt, int, num, pick, str} from '../math';
import {predict, story} from './util';

export type IneqMode = 'properties' | 'line' | 'am-gm';
export interface IneqConfig {mode: IneqMode; a: number; b: number}

export const inequality: EngineLogic<IneqConfig> = {
  type: 'inequality', label: 'Inequality laboratory',
  parse: r => ({mode: str(r.mode, 'line'), a: num(r.a, -1), b: num(r.b, 3)}),
  validate: c => (c.mode === 'am-gm' && (c.a <= 0 || c.b <= 0) ? ['AM–GM needs positive numbers'] : c.mode === 'line' && c.a >= c.b ? ['need a < b'] : []),
  scenes: c => {
    const {a, b} = c;
    switch (c.mode) {
      case 'properties': return story('A tipped balance', [`${a} < ${b}: the right pan is heavier.`, 'What keeps the tilt?: Which operations keep a < b true?', `Add the same: ${a} + 3 < ${b} + 3 — still tipped the same way.`, `Multiply by −1: −${a} and −${b}: on the number line the order reverses: −${a} > −${b}.`, 'The flip: Multiplying or dividing by a negative reverses the inequality.', 'Properties of inequalities: a < b ⇒ a + c < b + c; c > 0 ⇒ ac < bc; c < 0 ⇒ ac > bc.', 'Your turn: Apply the properties.']);
      case 'am-gm': { const g = Math.sqrt(a * b); return story('A square and four rectangles', [`Two positive numbers ${a} and ${b}.`, 'Which is bigger?: The average (a + b)/2 or the geometric mean √(ab)?', `Four ${a} × ${b} rectangles: Arrange them inside a square of side a + b = ${a + b}.`, `The hole: A (b − a)² = ${(b - a) ** 2} square is left in the middle.`, `(a + b)² ≥ 4ab: So (a + b)/2 = ${fmt((a + b) / 2)} ≥ √(ab) = ${fmt(g, 3)}; equal only when a = b.`, 'Basic inequality: For a, b > 0, (a + b)/2 ≥ √(ab). Fixed sum → maximum product; fixed product → minimum sum.', 'Your turn: Optimise with AM–GM.']); }
      default: return story('Solution sets', [`x > ${a} and x ≤ ${b}.`, 'All the solutions?: An inequality has infinitely many solutions. How do we show them all?', `Draw each ray: x > ${a}: open circle at ${a}, ray to the right. x ≤ ${b}: filled circle at ${b}, ray to the left.`, 'Overlap: The system’s solutions are where both rays overlap.', `${a} < x ≤ ${b}: Open circle: not included; filled: included.`, 'Linear inequalities: Solve like equations, flipping the sign when multiplying or dividing by a negative.', 'Your turn: Solve and graph.']);
    }
  },
  prediction: c => c.mode === 'properties' ? predict(`If ${c.a} < ${c.b}, then −2 × ${c.a} ? −2 × ${c.b}`, [['a', '>'], ['b', '<']], 'a', 'The order reverses.', 3)
    : c.mode === 'am-gm' ? predict(`Which is larger for ${c.a} and ${c.b}?`, [['a', '(a + b)/2'], ['b', '√(ab)'], ['c', 'Always equal']], 'a', 'The hole in the square.', 3)
      : predict(`How many integers satisfy ${c.a} < x ≤ ${c.b}?`, [['a', String(Math.floor(c.b) - Math.floor(c.a))], ['b', String(Math.floor(c.b) - Math.floor(c.a) + 1)]], 'a', 'Exclude the open end.', 3),
  challenge: (c, r) => {
    if (c.mode === 'am-gm') { const k = pick(r, [4, 9, 16, 25]); return {prompt: `Minimum of x + ${k}/x for x > 0?`, kind: 'number', answer: 2 * Math.sqrt(k), hint: '2√(product).', explanation: `At x = ${Math.sqrt(k)}: ${2 * Math.sqrt(k)}.`}; }
    if (c.mode === 'properties') { const x = int(r, 2, 9); return {prompt: `Solve −3x > ${-3 * x}. x < ?`, kind: 'number', answer: x, hint: 'Divide by −3 and flip.', explanation: `x < ${x}.`}; }
    const lo = int(r, -5, 2), hi = int(r, lo + 2, 8); return {prompt: `How many integers satisfy ${lo} < x ≤ ${hi}?`, kind: 'number', answer: hi - lo, hint: 'List them.', explanation: `${lo + 1} to ${hi}: ${hi - lo}.`};
  },
  describe: c => c.mode === 'am-gm' ? `Four ${c.a}×${c.b} rectangles inside a square showing AM–GM.` : `Number line and balance showing inequalities (${c.mode}).`,
};

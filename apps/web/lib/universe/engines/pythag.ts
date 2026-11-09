import type {EngineLogic} from '../types';
import {fmt, int, num, pick, str} from '../math';
import {predict, story} from './util';

export type PythagMode = 'sqrt' | 'irrational' | 'radical' | 'proof' | 'converse';
export interface PythagConfig {mode: PythagMode; n: number; a: number; b: number}
/** Simplest radical form k√m of √n. */
export function simplifyRoot(n: number): [number, number] { let k = 1, m = n; for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return [k, m]; }
export const rootStr = (n: number) => { const [k, m] = simplifyRoot(n); return m === 1 ? String(k) : k === 1 ? `√${m}` : `${k}√${m}`; };

export const pythag: EngineLogic<PythagConfig> = {
  type: 'pythag', label: 'Squares and roots laboratory',
  parse: r => ({mode: str(r.mode, 'proof'), n: num(r.n, 20), a: num(r.a, 3), b: num(r.b, 4)}),
  validate: c => (c.n <= 0 || c.a <= 0 || c.b <= 0 ? ['positive values'] : []),
  scenes: c => {
    const {a, b, n} = c; const hyp = Math.hypot(a, b);
    switch (c.mode) {
      case 'sqrt': return story('A square garden', [`A square garden has area ${n} m².`, 'How long is a side?: Which number squared gives ' + n + '?', `Try whole numbers: ${Math.floor(Math.sqrt(n))}² = ${Math.floor(Math.sqrt(n)) ** 2} and ${Math.ceil(Math.sqrt(n))}² = ${Math.ceil(Math.sqrt(n)) ** 2}.`, `Zoom in: √${n} lies between ${Math.floor(Math.sqrt(n))} and ${Math.ceil(Math.sqrt(n))}; refine to ${fmt(Math.sqrt(n), 1)}.`, `√${n} ≈ ${fmt(Math.sqrt(n), 3)}: The arithmetic square root is the positive side length.`, 'Square and cube roots: Every positive number has two square roots ±√a; every number has one cube root.', 'Your turn: Find and estimate roots.']);
      case 'irrational': return story('The diagonal of a unit square', ['A square with side 1.', 'How long is its diagonal?: Is it a fraction?', 'Area 2: The square on the diagonal has area 2, so the diagonal is √2.', 'Swing it onto the number line: A compass carries the diagonal to a point between 1 and 2.', '√2 = 1.41421356…: Its decimals never end and never repeat: an irrational number.', 'Real numbers: Rational and irrational numbers together fill the number line.', 'Your turn: Recognise irrational numbers.']);
      case 'radical': return story(`√${n}`, [`A square of area ${n}.`, `Simpler form?: Can √${n} be written with a smaller root?`, `Split the area: write ${n} as a perfect square times the rest, ${simplifyRoot(n)[0] ** 2} × ${simplifyRoot(n)[1]}.`, `Tile with smaller squares: ${simplifyRoot(n)[0] ** 2} squares of area ${simplifyRoot(n)[1]} fit in a ${simplifyRoot(n)[0]} × ${simplifyRoot(n)[0]} pattern.`, `√${n} = ${rootStr(n)}: Each small square has side √${simplifyRoot(n)[1]}.`, 'Radical rules: √(ab) = √a·√b (a, b ≥ 0); only like radicals add: 2√2 + 3√2 = 5√2.', 'Your turn: Simplify radicals.']);
      case 'converse': return story('A knotted rope', ['Ancient builders tied 12 equal knots in a rope.', '3, 4, 5?: Pull the rope into a 3-4-5 triangle. What angle appears?', 'Check the squares: 3² + 4² = 9 + 16 = 25 = 5².', 'Try other triples: 5-12-13 and 8-15-17 also work; 4-5-6 does not.', 'A right angle: If a² + b² = c², the angle opposite c is 90°.', 'Converse of Pythagoras: The converse of a true theorem is not automatically true — this one is proven separately.', 'Your turn: Test triangles.']);
      default: return story('Four identical triangles', [`A right triangle with legs ${a} and ${b}.`, `How long is the hypotenuse?: Measure, or reason?`, 'Zhao Shuang’s square: Four copies around a small hole make a square with side c.', 'Rearrange: Move the same four triangles: now they leave two squares, a² and b².', `a² + b² = c²: The same big square, the same four triangles, so the uncovered areas match: ${a}² + ${b}² = ${fmt(hyp)}².`, 'Pythagorean theorem: In a right triangle, a² + b² = c², c the hypotenuse.', 'Your turn: Find missing sides.']);
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'sqrt': return predict(`√${c.n} lies between…`, [['a', `${Math.floor(Math.sqrt(c.n))} and ${Math.ceil(Math.sqrt(c.n))}`], ['b', `${Math.floor(c.n / 2)} and ${Math.ceil(c.n / 2) + 1}`]], 'a', 'Compare squares.', 3);
      case 'irrational': return predict('Can √2 be written as a fraction?', [['a', 'No'], ['b', 'Yes']], 'a', 'Its decimal never repeats.', 4);
      case 'radical': return predict(`√${c.n} = ?`, [['a', rootStr(c.n)], ['b', `${c.n / 2}√2`], ['c', `√${c.n}`]], 'a', 'Pull out square factors.', 3);
      case 'converse': return predict('Is a 5-12-13 triangle right-angled?', [['a', 'Yes'], ['b', 'No']], 'a', '25 + 144 = 169.', 3);
      default: return predict('After rearranging, the uncovered area…', [['a', 'Stays the same'], ['b', 'Grows'], ['c', 'Shrinks']], 'a', 'Same square, same triangles.', 4);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'sqrt': { const k = int(r, 4, 15); return pick(r, [0, 1]) ? {prompt: `√${k * k} = ?`, kind: 'number', answer: k, hint: 'Which number squared?', explanation: `${k}² = ${k * k}.`} : {prompt: `Cube root of ${-((k % 5 + 1) ** 3)}?`, kind: 'number', answer: -(k % 5 + 1), hint: 'Negative numbers have negative cube roots.', explanation: `${-(k % 5 + 1)}.`}; }
      case 'irrational': { const [x, ans] = pick(r, [['√9', 'Rational'], ['√7', 'Irrational'], ['π', 'Irrational'], ['0.121212…', 'Rational'], ['22/7', 'Rational'], ['√12', 'Irrational']] as const); return {prompt: `${x} is…`, kind: 'choice', options: ['Rational', 'Irrational'], answer: ans, hint: 'Can it be a fraction?', explanation: ans + '.'}; }
      case 'radical': { const k = int(r, 2, 5), m = pick(r, [2, 3, 5]); return {prompt: `√${k * k * m} = ?√${m}`, kind: 'number', answer: k, hint: `Find the square factor ${k * k}.`, explanation: `${k}√${m}.`}; }
      case 'converse': { const [t, ans] = pick(r, [[[6, 8, 10], 'Yes'], [[7, 24, 25], 'Yes'], [[4, 5, 6], 'No'], [[9, 12, 15], 'Yes'], [[5, 6, 8], 'No']] as const); return {prompt: `Is ${t.join(', ')} a right triangle?`, kind: 'choice', options: ['Yes', 'No'], answer: ans, hint: 'Compare a² + b² with c².', explanation: `${t[0] ** 2} + ${t[1] ** 2} ${ans === 'Yes' ? '=' : '≠'} ${t[2] ** 2}.`}; }
      default: { const [a, b] = pick(r, [[3, 4], [5, 12], [8, 15], [6, 8], [9, 12], [7, 24]] as const); return pick(r, [0, 1]) ? {prompt: `Legs ${a} and ${b}. Hypotenuse?`, kind: 'number', answer: Math.hypot(a, b), hint: 'a² + b² = c².', explanation: `√${a * a + b * b} = ${Math.hypot(a, b)}.`} : {prompt: `Hypotenuse ${Math.hypot(a, b)}, one leg ${a}. Other leg?`, kind: 'number', answer: b, hint: 'c² − a².', explanation: `${b}.`}; }
    }
  },
  describe: c => `Area model (${c.mode}): squares on sides, root estimation and rearranged right triangles.`,
};

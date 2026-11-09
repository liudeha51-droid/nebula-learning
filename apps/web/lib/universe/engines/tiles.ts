import type {EngineLogic} from '../types';
import {int, num, pick, str} from '../math';
import {predict, story} from './util';

export type TilesMode = 'like-terms' | 'brackets' | 'expand' | 'diff-squares' | 'factor' | 'simplify' | 'complete-square';
export interface TilesConfig {mode: TilesMode; a: number; b: number; c: number}
const poly = (p: number, q: number) => `x² ${p + q >= 0 ? '+' : '−'} ${Math.abs(p + q)}x ${p * q >= 0 ? '+' : '−'} ${Math.abs(p * q)}`;

export const tiles: EngineLogic<TilesConfig> = {
  type: 'tiles', label: 'Algebra tiles',
  parse: r => ({mode: str(r.mode, 'expand'), a: num(r.a, 2), b: num(r.b, 3), c: num(r.c, 7)}),
  validate: c => (c.mode === 'complete-square' && c.b % 2 !== 0 ? ['use an even b'] : []),
  scenes: c => {
    const {a, b} = c;
    switch (c.mode) {
      case 'like-terms': return story('Tiles of different shapes', ['Long x-rods, big x² squares and small unit squares on a table.', `${a}x + ${b}x + x² + ?: Which tiles can be counted together?`, 'Sort by shape: Group the x-rods, the x² squares and the units.', 'Count each group: Only identical shapes merge into one count.', `${a}x + ${b}x = ${a + b}x: Like terms have the same letters and powers; add their coefficients.`, 'Combining like terms: The coefficient changes; the letter part stays. x² and x are not like terms.', 'Your turn: Simplify expressions.']);
      case 'brackets': return story('A minus sign outside', ['(3x + 2) − (x − 5).', 'What does the minus do?: Does the minus affect only the first term inside?', 'Flip every tile: Subtracting a bracket flips the colour of every tile inside it.', 'Pair zero pairs: A red and a yellow tile of the same shape cancel.', '2x + 7: (3x + 2) − (x − 5) = 3x + 2 − x + 5 = 2x + 7.', 'Removing brackets: + ( ) keeps signs; − ( ) changes every sign inside.', 'Your turn: Remove brackets and simplify.']);
      case 'diff-squares': return story('A square with a bite', [`A big ${a}×${a} square with a ${b}×${b} corner removed.`, 'What area is left?: a² − b² … can it be a rectangle?', 'Cut the L-shape: Slice off the strip on the right.', 'Rotate and slide: Attach the strip along the bottom.', `(a + b)(a − b): A ${a + b} × ${a - b} rectangle: ${a * a - b * b} = ${a * a} − ${b * b}.`, 'Difference of squares: (a + b)(a − b) = a² − b².', 'Your turn: Compute products quickly.']);
      case 'factor': return story('Make a rectangle', [`Tiles: one x², ${a + b} x-rods, ${a * b} units.`, 'Rectangle from tiles?: Can these tiles form one rectangle?', 'Place the x² first: Put the big square in the corner.', 'Arrange rods and units: Rods along two sides, units filling the corner block.', `(x + ${a})(x + ${b}): The sides of the rectangle are the factors of ${poly(a, b)}.`, 'Factorisation: Find two numbers with sum b and product c (cross method).', 'Your turn: Factorise trinomials.']);
      case 'simplify': return story('Cancel a common side', [`(x² − ${a * a}) ÷ (x − ${a}).`, 'Cancel terms?: Can we cross out x and 3?', 'Factor the top: x² − 9 is a (x + 3)(x − 3) rectangle.', 'Divide by a side: Dividing the rectangle by one side leaves the other side.', `x + ${a} (x ≠ ${a}): Cancel common factors, never single terms — and remember where the denominator was zero.`, 'Rational expressions: Factor first, then cancel; the domain still excludes zeros of the original denominator.', 'Your turn: Simplify rational expressions.']);
      case 'complete-square': { const h = b / 2; return story('Almost a square', [`x² + ${b}x = ${c.c}.`, 'Can it be a perfect square?: Rearrange the tiles to look like a square.', `Split the rods: Cut ${b}x into two strips of ${h}x.`, `Fill the corner: The missing corner is ${h}² = ${h * h}. Add it to both sides.`, `(x + ${h})² = ${c.c + h * h}: x + ${h} = ±${Math.sqrt(c.c + h * h)}.`, 'Completing the square: x² + bx + (b/2)² = (x + b/2)².', 'Your turn: Complete the square.']); }
      default: return story('A rectangle of tiles', [`A rectangle with sides x + ${a} and x + ${b}.`, `(x + ${a})(x + ${b}) = ?: What is its area?`, 'Split the rectangle: Four parts: x², two strips, one block.', `Count the tiles: x², ${a}x + ${b}x, and ${a * b} units.`, `${poly(a, b)}: The area adds up the parts.`, 'Multiplying polynomials: (a + b)² = a² + 2ab + b²; (x + p)(x + q) = x² + (p + q)x + pq.', 'Your turn: Expand products.']);
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'like-terms': return predict('3x + 2x² can be combined into…', [['a', 'Nothing simpler'], ['b', '5x²'], ['c', '5x³']], 'a', 'Different shapes.', 3);
      case 'brackets': return predict('−(x − 5) = ?', [['a', '−x + 5'], ['b', '−x − 5']], 'a', 'Every sign flips.', 2);
      case 'diff-squares': return predict(`${c.a}² − ${c.b}² as a rectangle is…`, [['a', `${c.a + c.b} × ${c.a - c.b}`], ['b', `${c.a - c.b} × ${c.a - c.b}`]], 'a', 'Slide the strip.', 3);
      case 'factor': return predict(`${poly(c.a, c.b)} = (x + ?)(x + ?)`, [['a', `${c.a} and ${c.b}`], ['b', `1 and ${c.a * c.b}`]], 'a', `Sum ${c.a + c.b}, product ${c.a * c.b}.`, 3);
      case 'simplify': return predict(`(x² − ${c.a * c.a})/(x − ${c.a}) = ?`, [['a', `x + ${c.a}`], ['b', `x − ${c.a}`], ['c', `x² − ${c.a}`]], 'a', 'Factor and cancel.', 3);
      case 'complete-square': return predict(`To complete x² + ${c.b}x, add…`, [['a', String((c.b / 2) ** 2)], ['b', String(c.b)], ['c', String(c.b * c.b)]], 'a', '(b/2)².', 3);
      default: return predict(`(x + ${c.a})(x + ${c.b}) has how many x-rods?`, [['a', String(c.a + c.b)], ['b', String(c.a * c.b)]], 'a', 'Two strips.', 3);
    }
  },
  challenge: (c, r) => {
    const p = int(r, 1, 6), q = int(r, 1, 6);
    switch (c.mode) {
      case 'like-terms': return {prompt: `Coefficient of x in ${p}x + ${q}x − ${p + 1}x?`, kind: 'number', answer: q - 1, hint: 'Add the coefficients.', explanation: `${p} + ${q} − ${p + 1} = ${q - 1}.`};
      case 'brackets': return {prompt: `(${p}x + ${q}) − (x − ${p}) = ?x + ?. Give the constant term.`, kind: 'number', answer: q + p, hint: 'Flip the signs in the second bracket.', explanation: `${p - 1}x + ${q + p}.`};
      case 'diff-squares': { const n = int(r, 20, 90) * 1; const d = int(r, 1, 5); return {prompt: `${n + d} × ${n - d} = ?`, kind: 'number', answer: n * n - d * d, hint: `${n}² − ${d}².`, explanation: `${n * n} − ${d * d}.`}; }
      case 'factor': return {prompt: `${poly(p, q)} = (x + ${p})(x + ?)`, kind: 'number', answer: q, hint: `Product ${p * q}.`, explanation: `(x + ${p})(x + ${q}).`};
      case 'simplify': { const k = int(r, 2, 9); const x = pick(r, [1, 2, 4, 10]); return {prompt: `Simplify (x² − ${k * k})/(x − ${k}) and evaluate at x = ${x}.`, kind: 'number', answer: x + k, hint: 'x + k.', explanation: `${x} + ${k}.`}; }
      case 'complete-square': { const h = int(r, 1, 6); return {prompt: `x² + ${2 * h}x + ? = (x + ${h})²`, kind: 'number', answer: h * h, hint: '(b/2)².', explanation: `${h * h}.`}; }
      default: return {prompt: `(x + ${p})(x + ${q}) = x² + ?x + ${p * q}`, kind: 'number', answer: p + q, hint: 'Count the x-rods.', explanation: `${p + q}.`};
    }
  },
  describe: c => `Algebra tiles (${c.mode}): x² squares, x rods and unit tiles arranged as area models.`,
};

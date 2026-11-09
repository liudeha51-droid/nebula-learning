import type {EngineLogic} from '../types';
import {fix, int, num, pick, str} from '../math';
import {predict, story} from './util';

export type CombinMode = 'dice' | 'tree' | 'perm-comb' | 'pascal';
export interface CombinConfig {mode: CombinMode; n: number; k: number}
export const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
export const A = (n: number, k: number) => fact(n) / fact(n - k);
export const Cnk = (n: number, k: number) => (k < 0 || k > n ? 0 : Math.round(fact(n) / (fact(k) * fact(n - k))));
export const sumWays = (s: number) => 6 - Math.abs(s - 7);

export const combin: EngineLogic<CombinConfig> = {
  type: 'combin', label: 'Counting laboratory',
  parse: r => ({mode: str(r.mode, 'dice'), n: num(r.n, 5), k: num(r.k, 3)}),
  validate: c => (c.mode !== 'dice' && (c.n < 1 || c.n > 8 || c.k < 0 || c.k > c.n) ? ['need 0 ≤ k ≤ n ≤ 8'] : []),
  scenes: c => {
    const {n, k} = c;
    switch (c.mode) {
      case 'tree': return story('Outfits', [`${n} shirts and ${k} pairs of trousers.`, 'How many outfits?: And how many choices if you wear just one item?', `Branch: Each of the ${n} shirts branches into ${k} trousers.`, `Count the leaves: ${n} × ${k} = ${n * k} outfits.`, `Steps multiply, cases add: One item: ${n} + ${k} = ${n + k}; shirt AND trousers: ${n} × ${k}.`, 'Counting principles: Addition principle for alternative cases; multiplication principle for successive steps.', 'Your turn: Count by adding or multiplying.']);
      case 'perm-comb': return story('Podium and committee', [`${n} runners; ${k} places on the podium.`, `Order matters?: Gold-silver-bronze vs choosing a team of ${k}.`, `Fill the podium: ${Array.from({length: k}, (_, i) => n - i).join(' × ')} = ${A(n, k)} ordered podiums.`, `Forget the order: Each team of ${k} appears ${fact(k)} times among them.`, `C(${n}, ${k}) = ${A(n, k)} ÷ ${fact(k)} = ${Cnk(n, k)}: Divide by the arrangements of the chosen ${k}.`, 'Permutations and combinations: A(n, k) = n!/(n − k)!, C(n, k) = A(n, k)/k! = n!/(k!(n − k)!); C(n, k) = C(n, n − k).', 'Your turn: Count arrangements and selections.']);
      case 'pascal': return story('Yang Hui’s triangle', [`Expand (a + b)^${n}.`, 'Coefficients?: Multiplying out by hand is slow. Is there a pattern?', 'Build the triangle: Each number is the sum of the two above it.', `Row ${n}: ${Array.from({length: n + 1}, (_, i) => Cnk(n, i)).join(', ')} — these are C(${n}, k).`, 'Why: Each term picks b from k of the n brackets: C(n, k) ways.', `Binomial theorem: (a + b)ⁿ = Σ C(n, k) aⁿ⁻ᵏbᵏ; the coefficients in row n add to 2ⁿ = ${2 ** n}.`, 'Your turn: Use binomial coefficients.']);
      default: return story('Two dice', ['Roll a red die and a blue die.', 'Which sum is most likely?: Is 7 more likely than 2?', 'The 6 × 6 table: 36 equally likely ordered outcomes.', 'Colour by sum: Sum 7 fills a whole diagonal — 6 cells. Sum 2 is a single cell.', 'P(7) = 6/36 = 1/6: P(2) = 1/36. List outcomes that are equally likely.', 'Listing and tree methods: Use a table or tree so every outcome is equally likely, then P = favourable/total.', 'Your turn: Find probabilities by listing.']);
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'tree': return predict(`${c.n} shirts, ${c.k} trousers: outfits?`, [['a', String(c.n * c.k)], ['b', String(c.n + c.k)]], 'a', 'Each shirt pairs with every pair of trousers.', 3);
      case 'perm-comb': return predict(`More podiums or more teams of ${c.k}?`, [['a', 'Podiums'], ['b', 'Teams'], ['c', 'Equal']], 'a', `Each team gives ${fact(c.k)} podiums.`, 3);
      case 'pascal': return predict(`Sum of the coefficients of (a + b)^${c.n}?`, [['a', String(2 ** c.n)], ['b', String(c.n + 1)], ['c', String(c.n * c.n)]], 'a', 'Set a = b = 1.', 4);
      default: return predict('Is sum 7 as likely as sum 2?', [['a', 'No, 7 is six times as likely'], ['b', 'Yes, every sum is equally likely']], 'a', '6 cells vs 1 cell.', 3);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'tree': { const a = int(r, 2, 6), b = int(r, 2, 6), d = int(r, 2, 4); return pick(r, [0, 1]) ? {prompt: `${a} roads from X to Y, ${b} from Y to Z. Routes X → Y → Z?`, kind: 'number', answer: a * b, hint: 'Multiply.', explanation: `${a} × ${b}.`} : {prompt: `${a} trains, ${b} buses or ${d} flights. Ways to make the trip with one ticket?`, kind: 'number', answer: a + b + d, hint: 'Add the cases.', explanation: `${a} + ${b} + ${d}.`}; }
      case 'perm-comb': { const n = int(r, 4, 8), k = int(r, 2, 3); return pick(r, [0, 1]) ? {prompt: `A(${n}, ${k}) = ?`, kind: 'number', answer: A(n, k), hint: 'n(n − 1)… k factors.', explanation: `${A(n, k)}.`} : {prompt: `Choose ${k} of ${n} people for a team. Ways?`, kind: 'number', answer: Cnk(n, k), hint: 'C(n, k).', explanation: `${A(n, k)}/${fact(k)}.`}; }
      case 'pascal': { const n = int(r, 4, 7), k = int(r, 1, n - 1); return {prompt: `Coefficient of a^${n - k}b^${k} in (a + b)^${n}?`, kind: 'number', answer: Cnk(n, k), hint: `C(${n}, ${k}).`, explanation: `${Cnk(n, k)}.`}; }
      default: { const s = int(r, 2, 12); return {prompt: `Two dice. P(sum = ${s}) as a fraction?`, kind: 'number', answer: fix(sumWays(s) / 36), tolerance: .001, hint: 'Count cells in the 6 × 6 table.', explanation: `${sumWays(s)}/36.`}; }
    }
  },
  describe: c => `Tables, trees and triangles for counting (${c.mode}).`,
};

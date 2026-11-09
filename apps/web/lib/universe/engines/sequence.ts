import type {EngineLogic} from '../types';
import {fmt, int, num, pick, str} from '../math';
import {predict, story} from './util';

export type SequenceMode = 'arithmetic' | 'geometric' | 'induction';
export interface SequenceConfig {mode: SequenceMode; a1: number; d: number; q: number; n: number}
export const term = (c: SequenceConfig, k: number) => (c.mode === 'geometric' ? c.a1 * c.q ** (k - 1) : c.a1 + (k - 1) * c.d);
export const sum = (c: SequenceConfig, n = c.n) => (c.mode === 'geometric' ? (c.q === 1 ? c.a1 * n : (c.a1 * (1 - c.q ** n)) / (1 - c.q)) : (n * (2 * c.a1 + (n - 1) * c.d)) / 2);

export const sequence: EngineLogic<SequenceConfig> = {
  type: 'sequence', label: 'Sequence laboratory',
  parse: r => ({mode: str(r.mode, 'arithmetic'), a1: num(r.a1, 2), d: num(r.d, 3), q: num(r.q, 2), n: num(r.n, 8)}),
  validate: c => (c.n < 2 || c.n > 12 ? ['n out of range'] : c.mode === 'geometric' && (c.q === 0 || c.a1 === 0) ? ['geometric terms must be non-zero'] : []),
  scenes: c => {
    const {a1, d, q, n} = c;
    if (c.mode === 'induction') return story('Dominoes', [`A row of dominoes: 1 + 3 + 5 + … + (2n − 1) = n²?`, 'Check every n?: We can test n = 1, 2, 3… but never all of them by hand.', 'Base case: n = 1: 1 = 1². The first domino falls.', 'Inductive step: If 1 + … + (2k − 1) = k², add 2k + 1: k² + 2k + 1 = (k + 1)². Each domino knocks the next.', 'All fall: Base case + inductive step ⇒ true for every positive integer n.', 'Mathematical induction: Prove P(1); prove P(k) ⇒ P(k + 1); conclude P(n) for all n ∈ ℕ*.', 'Your turn: Spot the steps of induction.']);
    if (c.mode === 'geometric') return story('Doubling', [`Start with ${a1} and multiply by ${q} each step.`, `How big is the ${n}th term? The sum?: Growth by multiplying feels very different from adding.`, `Bars: ${Array.from({length: Math.min(n, 6)}, (_, i) => fmt(a1 * q ** i)).join(', ')}, … each ${q} times the last.`, `Shift and subtract: S − qS: almost everything cancels, leaving a₁ − a₁qⁿ.`, `aₙ = ${fmt(term(c, n))}, Sₙ = ${fmt(sum(c))}: aₙ = a₁qⁿ⁻¹, Sₙ = a₁(1 − qⁿ)/(1 − q).`, 'Geometric sequences: Constant ratio q; for q ≠ 1, Sₙ = a₁(1 − qⁿ)/(1 − q); for q = 1, Sₙ = na₁.', 'Your turn: Work with geometric sequences.']);
    return story('Staircase', [`Start at ${a1}, add ${d} each step.`, `The ${n}th step and the total?: Can we jump straight to them?`, `Steps: ${Array.from({length: Math.min(n, 6)}, (_, i) => fmt(a1 + i * d)).join(', ')}, … each ${d} more.`, `Gauss’s trick: Write the sum forwards and backwards; each pair adds to a₁ + aₙ = ${fmt(a1 + term(c, n))}.`, `aₙ = ${fmt(term(c, n))}, Sₙ = ${fmt(sum(c))}: Two staircases make a rectangle n × (a₁ + aₙ).`, 'Arithmetic sequences: aₙ = a₁ + (n − 1)d; Sₙ = n(a₁ + aₙ)/2 = na₁ + n(n − 1)d/2.', 'Your turn: Work with arithmetic sequences.']);
  },
  prediction: c => c.mode === 'induction' ? predict('Which two steps prove a statement for all n?', [['a', 'Base case and inductive step'], ['b', 'Check n = 1, 2, 3'], ['c', 'Check a large n']], 'a', 'Like dominoes.', 3)
    : c.mode === 'geometric' ? predict(`Fold a paper ${c.n} times. Layers = ?`, [['a', String(2 ** c.n)], ['b', String(2 * c.n)], ['c', String(c.n * c.n)]], 'a', 'Doubling each time.', 2)
      : predict(`1 + 2 + … + 100 = ?`, [['a', '5050'], ['b', '10100'], ['c', '5000']], 'a', '100 × 101 / 2.', 3),
  challenge: (c, r) => {
    if (c.mode === 'induction') { const [s, ans] = pick(r, [['The first step proves the statement for n = 1.', 'Base case'], ['Assume true for n = k, prove for n = k + 1.', 'Inductive step'], ['Check n = 1, 2, 3, 4 and conclude.', 'Not a proof']] as const); return {prompt: `“${s}” is…`, kind: 'choice', options: ['Base case', 'Inductive step', 'Not a proof'], answer: ans, hint: 'Dominoes.', explanation: ans + '.'}; }
    const a = int(r, 1, 9), k = int(r, 4, 12);
    if (c.mode === 'geometric') { const qq = pick(r, [2, 3]), m = int(r, 3, 6); return pick(r, [0, 1]) ? {prompt: `a₁ = ${a}, q = ${qq}. a${m} = ?`, kind: 'number', answer: a * qq ** (m - 1), hint: 'a₁qⁿ⁻¹.', explanation: `${a} × ${qq}^${m - 1}.`} : {prompt: `a₁ = ${a}, q = ${qq}. S${m} = ?`, kind: 'number', answer: (a * (qq ** m - 1)) / (qq - 1), hint: 'a₁(qⁿ − 1)/(q − 1).', explanation: `${a}(${qq}^${m} − 1)/${qq - 1}.`}; }
    const dd = int(r, -3, 6) || 2; return pick(r, [0, 1]) ? {prompt: `a₁ = ${a}, d = ${dd}. a${k} = ?`, kind: 'number', answer: a + (k - 1) * dd, hint: 'a₁ + (n − 1)d.', explanation: `${a} + ${k - 1} × ${dd}.`} : {prompt: `a₁ = ${a}, d = ${dd}. S${k} = ?`, kind: 'number', answer: (k * (2 * a + (k - 1) * dd)) / 2, hint: 'n(a₁ + aₙ)/2.', explanation: `${k}(${a} + ${a + (k - 1) * dd})/2.`};
  },
  describe: c => `Bars showing the terms of a${c.mode === 'geometric' ? ' geometric' : c.mode === 'induction' ? ' chain of dominoes' : 'n arithmetic'} sequence.`,
};

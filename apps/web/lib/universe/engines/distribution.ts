import type {EngineLogic} from '../types';
import {fix, fmt, int, num, pick, str} from '../math';
import {predict, story} from './util';
import {Cnk} from './combin';

export type DistMode = 'classical' | 'independence' | 'conditional' | 'expectation' | 'binomial' | 'normal';
export interface DistConfig {mode: DistMode; n: number; p: number; q: number}
export const binom = (n: number, p: number, k: number) => Cnk(n, k) * p ** k * (1 - p) ** (n - k);
/** A prize wheel: values and probabilities. */
export const WHEEL: [number, number][] = [[0, .56], [10, .3], [50, .1], [100, .04]];
export const EX = WHEEL.reduce((s, [x, p]) => s + x * p, 0), VX = WHEEL.reduce((s, [x, p]) => s + (x - EX) ** 2 * p, 0);
/** Two factories: share and defect rate. */
export const FACT = {a: .6, b: .4, da: .02, db: .05};

export const distribution: EngineLogic<DistConfig> = {
  type: 'distribution', label: 'Probability laboratory',
  parse: r => ({mode: str(r.mode, 'binomial'), n: num(r.n, 10), p: num(r.p, .5), q: num(r.q, .5)}),
  validate: c => (c.p < 0 || c.p > 1 || c.q < 0 || c.q > 1 ? ['probabilities must be in [0, 1]'] : c.n < 1 || c.n > 16 ? ['n out of range'] : []),
  scenes: c => {
    switch (c.mode) {
      case 'classical': return story('Draw a card', ['A bag holds 3 red and 2 blue balls; draw two.', 'Write every outcome?: What is the sample space, and are the outcomes equally likely?', 'List the sample space: Label the balls R₁ R₂ R₃ B₁ B₂: 10 equally likely pairs.', 'Count the event: Both red: R₁R₂, R₁R₃, R₂R₃ — 3 pairs.', 'P = 3/10: Classical probability is favourable ÷ total when outcomes are equally likely.', 'Classical probability: P(A) = n(A)/n(Ω); P(Ā) = 1 − P(A); for mutually exclusive events P(A ∪ B) = P(A) + P(B).', 'Your turn: Compute classical probabilities.']);
      case 'independence': return story('Two archers', [`Archer A hits with probability ${c.p}, archer B with ${c.q}.`, 'Both hit?: Does A’s shot affect B’s?', `Area model: Split a unit square ${c.p} across for A and ${c.q} down for B.`, `Overlap: Both hit = ${c.p} × ${c.q} = ${fix(c.p * c.q)}.`, 'Independence: P(AB) = P(A)P(B) exactly when knowing A tells nothing about B.', 'Independent events: Multiply for “and”; P(at least one) = 1 − P(neither); frequencies stabilise near probabilities.', 'Your turn: Use independence.']);
      case 'conditional': { const tot = FACT.a * FACT.da + FACT.b * FACT.db; return story('Two factories', ['Factory A makes 60% of the parts (2% faulty), factory B 40% (5% faulty).', 'Chance a random part is faulty?: And if it is faulty, which factory made it?', 'Branch: First the factory, then faulty or not; multiply along each path.', `Total probability: P(faulty) = 0.6 × 0.02 + 0.4 × 0.05 = ${fix(tot)}.`, `Restrict the space: P(B | faulty) = ${fix(FACT.b * FACT.db)} ÷ ${fix(tot)} ≈ ${fmt((FACT.b * FACT.db) / tot, 3)}.`, 'Conditional probability: P(B|A) = P(AB)/P(A); multiplication formula; total probability P(B) = Σ P(Aᵢ)P(B|Aᵢ).', 'Your turn: Use tree diagrams.']); }
      case 'expectation': return story('A prize wheel', ['A wheel pays ¥0, ¥10, ¥50 or ¥100.', 'Worth paying ¥15 to spin?: What do you win on average?', `Distribution list: Values with probabilities ${WHEEL.map(w => w[1]).join(', ')}.`, `Balance point: E(X) = Σ xᵢpᵢ = ${fmt(EX, 2)} — less than the ¥15 price.`, `Spread: D(X) = Σ (xᵢ − E)²pᵢ = ${fmt(VX, 2)}: a risky game.`, 'Expectation and variance: E(X) = Σ xᵢpᵢ; D(X) = Σ (xᵢ − E(X))²pᵢ; E(aX + b) = aE(X) + b, D(aX + b) = a²D(X).', 'Your turn: Compute expectations.']);
      case 'normal': return story('The Galton board', [`Balls fall through ${c.n} rows of pegs.`, 'Where do they land?: Each bounce is left or right with equal chance.', 'Drop the balls: They pile up highest in the middle.', 'A bell appears: Many small random effects add up to a normal curve.', 'The 3σ rule: About 68.3% within μ ± σ, 95.4% within 2σ, 99.7% within 3σ.', 'Normal distribution: X ~ N(μ, σ²): symmetric about μ; larger σ means flatter and wider.', 'Your turn: Use the normal curve.']);
      default: { const m = c.n * c.p; return story('Free throws', [`Take ${c.n} shots, each going in with probability ${c.p}.`, `How many go in?: Exactly ${Math.round(m)} every time?`, `One sequence: A particular pattern of k hits has probability pᵏ(1 − p)ⁿ⁻ᵏ.`, `Count patterns: C(${c.n}, k) patterns give k hits: P(X = k) = C(n, k)pᵏ(1 − p)ⁿ⁻ᵏ.`, `The bars: Peak near np = ${fmt(m)}; variance np(1 − p) = ${fmt(m * (1 - c.p))}.`, 'Binomial distribution: X ~ B(n, p): E = np, D = np(1 − p). Drawing without replacement gives the hypergeometric distribution.', 'Your turn: Use the binomial model.']); }
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'classical': return predict('3 red, 2 blue; draw two. P(both red)?', [['a', '3/10'], ['b', '3/5'], ['c', '9/25']], 'a', '3 of 10 pairs.', 4);
      case 'independence': return predict(`P(both hit) when P(A) = ${c.p}, P(B) = ${c.q}?`, [['a', String(fix(c.p * c.q))], ['b', String(fix(c.p + c.q))], ['c', String(fix((c.p + c.q) / 2))]], 'a', 'Multiply for independent events.', 3);
      case 'conditional': return predict('A part is faulty. More likely from…', [['a', 'Factory B'], ['b', 'Factory A']], 'a', '0.020 vs 0.012.', 4);
      case 'expectation': return predict('Is paying ¥15 per spin a good deal?', [['a', `No: the average win is ¥${fmt(EX)}`], ['b', 'Yes: you might win ¥100']], 'a', `E(X) = ${fmt(EX)} < 15.`, 3);
      case 'normal': return predict('Where do most balls land?', [['a', 'In the middle'], ['b', 'Evenly everywhere'], ['c', 'At the edges']], 'a', 'Many paths lead to the middle.', 3);
      default: return predict(`${c.n} shots at p = ${c.p}: most likely number of hits?`, [['a', String(Math.round(c.n * c.p))], ['b', String(c.n)], ['c', '0']], 'a', 'Peak near np.', 4);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'classical': { const red = int(r, 2, 5), blue = int(r, 1, 4), n = red + blue; return {prompt: `${red} red, ${blue} blue; draw two at once. P(both red)? (decimal or fraction)`, kind: 'number', answer: fix((red * (red - 1)) / (n * (n - 1))), tolerance: .001, hint: 'C(red, 2)/C(total, 2).', explanation: `${(red * (red - 1)) / 2}/${(n * (n - 1)) / 2}.`}; }
      case 'independence': { const a = int(r, 1, 9) / 10, b = int(r, 1, 9) / 10; return pick(r, [0, 1]) ? {prompt: `Independent, P(A) = ${a}, P(B) = ${b}. P(AB)?`, kind: 'number', answer: fix(a * b), tolerance: .001, hint: 'Multiply.', explanation: `${a} × ${b}.`} : {prompt: `Independent, P(A) = ${a}, P(B) = ${b}. P(at least one)?`, kind: 'number', answer: fix(1 - (1 - a) * (1 - b)), tolerance: .001, hint: '1 − P(neither).', explanation: `1 − ${fix(1 - a)} × ${fix(1 - b)}.`}; }
      case 'conditional': { const pa = int(r, 2, 8) / 10, pb = int(r, 1, 9) / 10; return {prompt: `P(A) = ${pa}, P(B|A) = ${pb}. P(AB)?`, kind: 'number', answer: fix(pa * pb), tolerance: .001, hint: 'P(A)P(B|A).', explanation: `${pa} × ${pb}.`}; }
      case 'expectation': { const a = int(r, 1, 5), b = int(r, 0, 9); return pick(r, [0, 1]) ? {prompt: `X takes 0, 1, 2 with probabilities 0.2, 0.5, 0.3. E(X)?`, kind: 'number', answer: 1.1, tolerance: .001, hint: 'Σ xp.', explanation: '0 + 0.5 + 0.6.'} : {prompt: `E(X) = 3, D(X) = 2. E(${a}X + ${b})?`, kind: 'number', answer: 3 * a + b, hint: 'aE(X) + b.', explanation: `${a}·3 + ${b}.`}; }
      case 'normal': { const [k, ans] = pick(r, [[1, .683], [2, .954], [3, .997]] as const); return {prompt: `X ~ N(μ, σ²). P(μ − ${k}σ < X < μ + ${k}σ) ≈ ? (3 d.p.)`, kind: 'number', answer: ans, tolerance: .002, hint: '68–95–99.7.', explanation: `≈ ${ans}.`}; }
      default: { const n = int(r, 3, 8), p = pick(r, [.2, .5]), k = int(r, 0, n); return pick(r, [0, 1]) ? {prompt: `X ~ B(${n}, ${p}). E(X)?`, kind: 'number', answer: fix(n * p), hint: 'np.', explanation: `${n} × ${p}.`} : {prompt: `X ~ B(${n}, ${p}). P(X = ${k}) (3 d.p.)?`, kind: 'number', answer: fix(binom(n, p, k), 3), tolerance: .002, hint: 'C(n, k)pᵏ(1 − p)ⁿ⁻ᵏ.', explanation: `${Cnk(n, k)} × ${p}^${k} × ${fix(1 - p)}^${n - k}.`}; }
    }
  },
  describe: c => `Diagrams and bar charts for probability (${c.mode}).`,
};

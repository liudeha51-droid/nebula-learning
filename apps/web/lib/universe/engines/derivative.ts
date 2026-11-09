import type {EngineLogic} from '../types';
import {fix, fmt, int, num, pick, str} from '../math';
import {predict, story} from './util';

export type DerivMode = 'secant' | 'rules' | 'monotonic' | 'optimize';
export interface DerivConfig {mode: DerivMode; x0: number; side: number}
export const cubic = (x: number) => x ** 3 - 3 * x, dcubic = (x: number) => 3 * x * x - 3;
export const boxV = (s: number, x: number) => x * (s - 2 * x) ** 2;

export const derivative: EngineLogic<DerivConfig> = {
  type: 'derivative', label: 'Calculus laboratory',
  parse: r => ({mode: str(r.mode, 'secant'), x0: num(r.x0, 1), side: num(r.side, 12)}),
  validate: c => (c.side <= 0 ? ['side must be positive'] : []),
  scenes: c => {
    switch (c.mode) {
      case 'rules': return story('Slope as a function', ['f(x) = sin x and a tangent line sliding along it.', 'Can the slopes make a graph?: Record the tangent slope at every x.', 'Trace the slopes: Plot (x, slope) as the tangent moves.', 'Recognise it: The slope graph is cos x — so (sin x)′ = cos x.', 'A table of derivatives: (xⁿ)′ = nxⁿ⁻¹, (sin x)′ = cos x, (cos x)′ = −sin x, (eˣ)′ = eˣ, (ln x)′ = 1/x.', 'Rules: (u ± v)′ = u′ ± v′, (uv)′ = u′v + uv′, (u/v)′ = (u′v − uv′)/v², chain rule y′ₓ = y′ᵤ·u′ₓ.', 'Your turn: Differentiate functions.']);
      case 'monotonic': return story('Uphill and downhill', ['f(x) = x³ − 3x.', 'Where does it climb?: Can we tell without plotting every point?', 'Slope signs: f′(x) = 3x² − 3: positive outside (−1, 1), negative inside.', 'Turning points: f′ changes sign at x = −1 (max f = 2) and x = 1 (min f = −2).', 'Sign changes mark extrema: + to − is a local maximum; − to + is a local minimum.', 'Monotonicity and extrema: f′ > 0 ⇒ increasing; f′ < 0 ⇒ decreasing; check f′ = 0 points and endpoints for max/min.', 'Your turn: Analyse a function.']);
      case 'optimize': { const s = c.side, x = s / 6; return story('The biggest box', [`A ${s} × ${s} sheet; cut squares of side x from the corners and fold.`, 'Which x holds most?: Tiny cuts make a flat tray, big cuts a thin tower.', `Model: V(x) = x(${s} − 2x)², 0 < x < ${s / 2}.`, `Differentiate: V′(x) = (${s} − 2x)(${s} − 6x) = 0 ⇒ x = ${fmt(x)}.`, `Maximum: V(${fmt(x)}) = ${fmt(boxV(s, x))} — V′ changes from + to −.`, 'Optimisation: Build a function, find critical points with f′ = 0, compare with endpoints, check meaning.', 'Your turn: Optimise a real design.']); }
      default: { const x0 = c.x0; return story('Speedometer', [`f(x) = x². How steep is it exactly at x = ${x0}?`, 'One point, no rise over run?: A slope needs two points. What can we do?', `Secant: Through (${x0}, ${x0 * x0}) and (${x0} + h, (${x0} + h)²): slope ${2 * x0} + h.`, 'Shrink h: As h → 0, the secant turns into the tangent.', `f′(${x0}) = ${2 * x0}: The limit of average rates of change is the instantaneous rate.`, 'The derivative: f′(x₀) = lim (h→0) [f(x₀ + h) − f(x₀)]/h, the slope of the tangent.', 'Your turn: Find rates of change.']); }
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'rules': return predict('The slope graph of sin x looks like…', [['a', 'cos x'], ['b', 'sin x'], ['c', '−cos x']], 'a', 'Slope 1 at 0, 0 at π/2.', 3);
      case 'monotonic': return predict('f′(x) changes from + to − at x = a. f(a) is a…', [['a', 'Local maximum'], ['b', 'Local minimum'], ['c', 'Neither']], 'a', 'Climb, then fall.', 4);
      case 'optimize': return predict(`Best cut for a ${c.side} × ${c.side} sheet?`, [['a', fmt(c.side / 6)], ['b', fmt(c.side / 4)], ['c', fmt(c.side / 3)]], 'a', 'V′ = 0 at s/6.', 4);
      default: return predict(`As h → 0, the secant slope of x² at ${c.x0} approaches…`, [['a', String(2 * c.x0)], ['b', String(c.x0 * c.x0)], ['c', '0']], 'a', '2x₀ + h → 2x₀.', 4);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'rules': { const n = int(r, 2, 6), a = int(r, 2, 5), x = int(r, 1, 3); return pick(r, [0, 1]) ? {prompt: `f(x) = ${a}x^${n}. f′(${x}) = ?`, kind: 'number', answer: a * n * x ** (n - 1), hint: 'nxⁿ⁻¹.', explanation: `${a}·${n}·${x}^${n - 1}.`} : {prompt: `f(x) = x·eˣ. f′(0) = ?`, kind: 'number', answer: 1, hint: 'Product rule.', explanation: 'eˣ + xeˣ at 0 is 1.'}; }
      case 'monotonic': { const a = int(r, 1, 4); return {prompt: `f(x) = x³ − ${3 * a * a}x. x-coordinate of the local minimum?`, kind: 'number', answer: a, hint: `f′ = 3x² − ${3 * a * a}.`, explanation: `f′ = 0 at ±${a}; − to + at ${a}.`}; }
      case 'optimize': { const P = int(r, 4, 20) * 2; return {prompt: `A rectangle has perimeter ${P}. Maximum area?`, kind: 'number', answer: (P / 4) ** 2, hint: 'A(x) = x(P/2 − x).', explanation: `Square of side ${P / 4}.`}; }
      default: { const x0 = int(r, -3, 4), a = int(r, 1, 3); return pick(r, [0, 1]) ? {prompt: `f(x) = ${a}x². f′(${x0}) = ?`, kind: 'number', answer: 2 * a * x0, hint: '2ax₀.', explanation: `${2 * a * x0}.`} : {prompt: `Average rate of change of x² from 1 to ${a + 2}?`, kind: 'number', answer: fix(((a + 2) ** 2 - 1) / (a + 1)), hint: 'Δy/Δx.', explanation: `(${(a + 2) ** 2} − 1)/${a + 1}.`}; }
    }
  },
  describe: c => `Graphs and tangent lines illustrating derivatives (${c.mode}).`,
};

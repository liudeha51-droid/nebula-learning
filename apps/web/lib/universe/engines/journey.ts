import type {EngineLogic} from '../types';
import {fix, fmt, int, num, pick, str} from '../math';
import {predict, story} from './util';

/**
 * Journeys: free-flowing, continuously moving sequences. Each one follows a single
 * image as it grows, drifts and morphs, rather than stepping through a diagram.
 */
export type JourneyMode = 'times' | 'pi' | 'epicycles' | 'halving' | 'sunflower';
export interface JourneyConfig {mode: JourneyMode; n: number; m: number}

export const PHI = (1 + Math.sqrt(5)) / 2;
/** 360°(1 − 1/φ) ≈ 137.508°. */
export const GOLDEN_DEG = 360 * (1 - 1 / PHI);
export function fib(k: number): number { let a = 1, b = 1; for (let i = 2; i < k; i++) [a, b] = [b, a + b]; return k <= 2 ? 1 : b; }
/** Perimeter ÷ diameter of the regular n-gon inscribed in / circumscribed about a circle (Liu Hui’s bounds). */
export const inscribed = (n: number) => n * Math.sin(Math.PI / n);
export const circumscribed = (n: number) => n * Math.tan(Math.PI / n);
/** Partial Fourier sum of a square wave: (4/π) Σ sin((2k − 1)x)/(2k − 1). */
export const squareWave = (x: number, terms: number) => { let s = 0; for (let k = 1; k <= terms; k++) s += Math.sin((2 * k - 1) * x) / (2 * k - 1); return (4 / Math.PI) * s; };

export const journey: EngineLogic<JourneyConfig> = {
  type: 'journey', label: 'Journey',
  parse: r => ({mode: str(r.mode, 'times'), n: num(r.n, 60), m: num(r.m, 2)}),
  validate: c => (c.mode === 'times' && (c.n < 6 || c.n > 400 || c.m < 1) ? ['times-circle needs 6 ≤ n ≤ 400 and m ≥ 1'] : []),
  scenes: c => {
    switch (c.mode) {
      case 'pi': return story('Unrolling π', ['A wheel exactly 1 metre across waits at the start of a ruler.', 'One full turn: How far does the wheel travel? A bit more than 3 metres — but how much more?', 'Roll and paint: The rim leaves a painted trail as it rolls: 3.14159… metres. Every circle unrolls to the same multiple of its diameter.', 'Liu Hui’s polygons: Around 263 CE, Liu Hui (刘徽) trapped the circle between polygons: 6 sides, 12, 24, 48, 96…', `The squeeze: With 96 sides, ${fmt(inscribed(96), 4)} < π < ${fmt(circumscribed(96), 4)}. Zu Chongzhi (祖冲之) later pinned it to 3.1415926 < π < 3.1415927.`, 'C = πd: π is the same for every circle: circumference ÷ diameter. Its digits never end and never repeat.', 'Your turn: Roll some wheels.']);
      case 'epicycles': return story('Circles that draw waves', ['One spinning circle. Its tip, followed sideways, draws a sine wave.', 'Corners from circles?: A square wave has sharp corners and flat tops. Can smooth spinning circles ever draw that?', 'A second circle: Ride a circle one third the size, spinning three times as fast, on the tip of the first.', 'More and more circles: Each new circle is smaller and faster: radius 1/5 at 5×, 1/7 at 7×… The wave stiffens into a square.', 'Almost square: The tops flatten and the sides straighten; a small overshoot always hugs each corner.', 'Sums of sine waves: sin x + sin 3x/3 + sin 5x/5 + … approaches a square wave. Sound, light and images are built from waves this way.', 'Your turn: Build waves from circles.']);
      case 'halving': return story('Halving forever', ['Walk halfway to the door, then half of what is left, then half again…', 'Infinitely many steps: You never stop stepping. Do you reach the door, or does the distance pile up forever?', 'Fill the square: Paint 1/2 of a square, then 1/4, then 1/8: each piece fills half of the gap that remains.', 'Dive into the corner: Zoom into the unpainted corner. It looks exactly like the square we started with: the same picture, forever.', 'Sₙ = 1 − 1/2ⁿ: After n pieces, only 1/2ⁿ is unpainted. That gap shrinks below any size you name, so the sum is 1.', 'Infinite geometric series: For |q| < 1, a₁ + a₁q + a₁q² + … = a₁/(1 − q). Infinitely many pieces can add up to a finite amount.', 'Your turn: Sum endless sequences.']);
      case 'sunflower': return story('The sunflower’s secret angle', ['A sunflower grows its seeds one at a time, each turned by the same angle from the last.', 'Which angle?: Which single turning angle packs the seeds most evenly, with no wasted gaps?', 'Simple fractions fail: Half a turn makes two straight arms; a third of a turn makes three. Any fraction of a turn leaves empty gaps.', 'Sweep the angle: Turn the dial slowly through 137°… the spirals swirl, collide and tangle — then suddenly lock into an even pattern.', `${fmt(GOLDEN_DEG, 3)}°: The golden angle, 360°(1 − 1/φ). Count the spirals: 8 one way, 13 the other, 21 in the outer ring.`, 'Fibonacci and φ: 1, 1, 2, 3, 5, 8, 13, 21… with aₙ₊₂ = aₙ₊₁ + aₙ. The ratios aₙ₊₁/aₙ approach φ = (1 + √5)/2 ≈ 1.618.', 'Your turn: Continue the pattern.']);
      default: return story('Times tables on a circle', [`${c.n} points sit around a circle like the hours on a clock.`, 'A drawing rule: Join each point k to point 2 × k (counting round the circle). What picture appears?', 'Draw the threads: One thread at a time — 1 to 2, 2 to 4, 3 to 6 … past the top, we keep counting round.', 'A heart appears: The threads crowd together along a curve: a cardioid. Now let the multiplier drift: 2 … 3 … 4.', 'Petals from multipliers: ×2 gives one cusp, ×3 two, ×4 three: multiplier m gives m − 1 petals.', `Remainders: Point k joins m × k mod ${c.n} — the remainder on dividing by ${c.n}. Simple multiplication, wrapped round a circle, draws curves.`, 'Your turn: Predict the thread.']);
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'pi': return predict('A wheel 1 m across rolls one full turn. How far does it travel?', [['a', 'A little more than 3 m'], ['b', 'Exactly 3 m'], ['c', 'Exactly 4 m']], 'a', 'The rim is π ≈ 3.14 diameters long.', 2);
      case 'epicycles': return predict('Add smaller, faster circles. The curve becomes…', [['a', 'Closer to a square wave'], ['b', 'Closer to a circle'], ['c', 'Random noise']], 'a', 'Each circle sharpens the corners.', 3);
      case 'halving': return predict('1/2 + 1/4 + 1/8 + … forever equals…', [['a', '1'], ['b', 'Infinity'], ['c', '2']], 'a', 'The unpainted gap shrinks to nothing.', 4);
      case 'sunflower': return predict('Turn each new seed by exactly half a turn. The seeds make…', [['a', 'Two straight arms'], ['b', 'An even disc'], ['c', 'One spiral']], 'a', 'Every second seed lands in the same direction.', 2);
      default: return predict('With multiplier 3 instead of 2, how many petals (cusps)?', [['a', '2'], ['b', '3'], ['c', '1']], 'a', 'm − 1 petals.', 4);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'pi': return pick(r, [0, 1]) ? (() => { const d = int(r, 1, 9) / 10 + int(r, 0, 1), turns = int(r, 2, 10); return {prompt: `A wheel ${fmt(d)} m across rolls ${turns} full turns. Distance (π ≈ 3.14, in m)?`, kind: 'number' as const, answer: fix(3.14 * d * turns), tolerance: .01, hint: 'π × d per turn.', explanation: `3.14 × ${fmt(d)} × ${turns} = ${fmt(fix(3.14 * d * turns))}.`}; })()
        : (() => { const R = int(r, 1, 9); return {prompt: `A regular hexagon is inscribed in a circle of radius ${R}. Its perimeter?`, kind: 'number' as const, answer: 6 * R, hint: 'Each side equals the radius.', explanation: `6 × ${R}: so π > 6R ÷ 2R = 3.`}; })();
      case 'epicycles': { const k = int(r, 2, 8); return pick(r, [0, 1]) ? {prompt: `In the square-wave chain, how many times as fast as the first circle does circle number ${k} spin?`, kind: 'number', answer: 2 * k - 1, hint: 'Odd multiples: 1, 3, 5, …', explanation: `2 × ${k} − 1 = ${2 * k - 1}.`} : {prompt: `The first circle has radius 1. Radius of circle number ${k} (as a fraction or decimal)?`, kind: 'number', answer: fix(1 / (2 * k - 1)), tolerance: .001, hint: '1/(2k − 1).', explanation: `1/${2 * k - 1}.`}; }
      case 'halving': { if (pick(r, [0, 1])) { const n = int(r, 2, 8); return {prompt: `1/2 + 1/4 + … + 1/2^${n} = ? (decimal or fraction)`, kind: 'number', answer: fix(1 - 1 / 2 ** n), tolerance: 1e-6, hint: '1 − 1/2ⁿ.', explanation: `${2 ** n - 1}/${2 ** n}.`}; }
        const q = pick(r, [2, 3, 4, 5, 10]); return {prompt: `1/${q} + 1/${q}² + 1/${q}³ + … (forever) = ? (decimal or fraction)`, kind: 'number', answer: fix(1 / (q - 1)), tolerance: .001, hint: 'a₁/(1 − q).', explanation: `(1/${q}) ÷ (1 − 1/${q}) = 1/${q - 1}.`}; }
      case 'sunflower': { const k = int(r, 6, 15); return {prompt: `a₁ = a₂ = 1, aₙ₊₂ = aₙ₊₁ + aₙ. a${k} = ?`, kind: 'number', answer: fib(k), hint: 'Keep adding the last two terms.', explanation: `1, 1, 2, 3, 5, 8, … a${k} = ${fib(k)}.`}; }
      default: { const n = pick(r, [10, 12, 20, 36, 60, 100]), m = int(r, 2, 9), k = int(r, 2, n - 1); return {prompt: `${n} points round a circle, multiplier ${m}. Point ${k} joins point ?`, kind: 'number', answer: (m * k) % n, hint: `${m} × ${k}, then the remainder on dividing by ${n}.`, explanation: `${m * k} = ${Math.floor((m * k) / n)} × ${n} + ${(m * k) % n}.`}; }
    }
  },
  describe: c => ({
    times: `Threads joining point k to point ${c.m}k on a circle of ${c.n} points, forming curves as the multiplier drifts.`,
    pi: 'A wheel rolling out its circumference along a ruler, then polygons squeezing π.',
    epicycles: 'Circles riding on circles whose tip draws a wave that approaches a square wave.',
    halving: 'A square filled by halves while the view zooms endlessly into the remaining corner.',
    sunflower: 'Seeds placed at a turning angle that sweeps until the golden angle forms Fibonacci spirals.',
  })[c.mode],
};

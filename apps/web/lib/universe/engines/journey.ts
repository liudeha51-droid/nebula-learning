import type {EngineLogic} from '../types';
import {fix, fmt, int, num, pick, str} from '../math';
import {predict, story} from './util';

/**
 * Journeys: free-flowing, continuously moving sequences. Each one follows a single
 * image as it grows, drifts and morphs, rather than stepping through a diagram.
 */
export type JourneyMode = 'times' | 'pi' | 'epicycles' | 'halving' | 'sunflower' | 'symmetry' | 'clock' | 'wallpaper' | 'quintic';
export interface JourneyConfig {mode: JourneyMode; n: number; m: number}

/* ---------- abstract-algebra journeys ---------- */
/** An element of the snowflake's symmetry group D6: rotate by 60°·k, then (if flip) reflect. Stored as [k, flip]. */
export type D6 = [number, boolean];
export const D6_ELEMENTS: D6[] = [...Array.from({length: 6}, (_, k) => [k, false] as D6), ...Array.from({length: 6}, (_, k) => [k, true] as D6)];
/** a∘b = "do b, then a" for elements written rᵏ sᶠ. */
export const d6Compose = ([a, fa]: D6, [b, fb]: D6): D6 => [(((fa ? a - b : a + b) % 6) + 6) % 6, fa !== fb];
export const d6Index = ([k, f]: D6) => (f ? 6 : 0) + k;
export const d6Name = ([k, f]: D6) => (k === 0 && !f ? 'e' : `${k ? (k === 1 ? 'r' : `r${'⁰¹²³⁴⁵'[k]}`) : ''}${f ? 's' : ''}`);
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
/** Hops of size k on n points return to the start after n / gcd(n, k) hops. */
export const hopsToReturn = (n: number, k: number) => n / gcd(n, k);
export const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
/** Wallpaper groups shown, with their rotation order and whether they contain mirrors. */
export const WALLPAPER = [
  {id: 'p1', order: 1, mirror: false, hex: false}, {id: 'p2', order: 2, mirror: false, hex: false}, {id: 'p4', order: 4, mirror: false, hex: false},
  {id: 'p4m', order: 4, mirror: true, hex: false}, {id: 'p3', order: 3, mirror: false, hex: true}, {id: 'p6', order: 6, mirror: false, hex: true}, {id: 'p6m', order: 6, mirror: true, hex: true},
] as const;
/** Roots of x⁵ − x − c (complex), refined from a starting guess by Durand–Kerner iteration. */
export type Cx = [number, number];
const cmul = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a: Cx, b: Cx): Cx => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
export function quinticValue(x: Cx, c: Cx): Cx { const x2 = cmul(x, x), x4 = cmul(x2, x2), x5 = cmul(x4, x); return [x5[0] - x[0] - c[0], x5[1] - x[1] - c[1]]; }
export function quinticRoots(c: Cx, guess?: Cx[], iters = 60): Cx[] {
  let z: Cx[] = guess ? guess.map(g => [...g] as Cx) : Array.from({length: 5}, (_, k) => { const a = 0.4 + (k * 2 * Math.PI) / 5; return [0.9 * Math.cos(a), 0.9 * Math.sin(a)] as Cx; });
  for (let it = 0; it < iters; it++) {
    z = z.map((zi, i) => { let den: Cx = [1, 0]; z.forEach((zj, j) => { if (j !== i) den = cmul(den, [zi[0] - zj[0], zi[1] - zj[1]]); }); const d = cdiv(quinticValue(zi, c), den); return [zi[0] - d[0], zi[1] - d[1]] as Cx; });
  }
  return z;
}
/** Points where two roots collide (the discriminant vanishes): c = −(4/5)·x with x⁴ = 1/5. */
export const BRANCH_POINTS: Cx[] = [0, 1, 2, 3].map(k => { const r = 5 ** -0.25, a = (k * Math.PI) / 2; return [-0.8 * r * Math.cos(a), -0.8 * r * Math.sin(a)] as Cx; });
/** Follows the roots continuously while c moves along a path; returns the root positions at each sample. */
export function trackRoots(path: Cx[]): Cx[][] {
  const out: Cx[][] = []; let z = quinticRoots(path[0]);
  for (const c of path) { z = quinticRoots(c, z, 12); out.push(z); }
  return out;
}
/**
 * A "lollipop" loop for c that starts and ends at 1 and winds once around branch point b only:
 * along the unit circle to b's direction, straight in, once round a small circle about b, and back.
 * The unit circle and the radial segment stay clear of the other branch points (all at radius ≈ 0.535).
 */
export function loopAround(b: number, samples = 480, rho = 0.2): Cx[] {
  const B = BRANCH_POINTS[b], ang = Math.atan2(B[1], B[0]), rB = Math.hypot(B[0], B[1]);
  const sweep = ((ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); const turn = sweep > Math.PI ? sweep - 2 * Math.PI : sweep;
  const pts: Cx[] = []; const n = (k: number) => Math.max(8, Math.round(samples * k));
  for (let i = 0; i < n(.15); i++) { const t = (turn * i) / n(.15); pts.push([Math.cos(t), Math.sin(t)]); }
  for (let i = 0; i < n(.1); i++) { const r = 1 - ((1 - (rB + rho)) * i) / n(.1); pts.push([r * Math.cos(ang), r * Math.sin(ang)]); }
  for (let i = 0; i <= n(.5); i++) { const t = ang + (2 * Math.PI * i) / n(.5); pts.push([B[0] + rho * Math.cos(t), B[1] + rho * Math.sin(t)]); }
  for (let i = 1; i <= n(.1); i++) { const r = rB + rho + ((1 - (rB + rho)) * i) / n(.1); pts.push([r * Math.cos(ang), r * Math.sin(ang)]); }
  for (let i = 1; i <= n(.15); i++) { const t = turn - (turn * i) / n(.15); pts.push([Math.cos(t), Math.sin(t)]); }
  return pts;
}
/** Which root ends where: perm[i] = index of the starting root closest to where root i ends. */
export function rootPermutation(start: Cx[], end: Cx[]): number[] { return end.map(e => { let best = 0, bd = Infinity; start.forEach((s0, j) => { const d = Math.hypot(e[0] - s0[0], e[1] - s0[1]); if (d < bd) { bd = d; best = j; } }); return best; }); }
export const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

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
  validate: c => (c.mode === 'times' && (c.n < 6 || c.n > 400 || c.m < 1) ? ['times-circle needs 6 ≤ n ≤ 400 and m ≥ 1'] : c.mode === 'clock' && (c.n < 3 || c.m < 1 || c.m >= c.n) ? ['clock needs 1 ≤ step < n'] : []),
  scenes: c => {
    switch (c.mode) {
      case 'pi': return story('Unrolling π', ['A wheel exactly 1 metre across waits at the start of a ruler.', 'One full turn: How far does the wheel travel? A bit more than 3 metres — but how much more?', 'Roll and paint: The rim leaves a painted trail as it rolls: 3.14159… metres. Every circle unrolls to the same multiple of its diameter.', 'Liu Hui’s polygons: Around 263 CE, Liu Hui (刘徽) trapped the circle between polygons: 6 sides, 12, 24, 48, 96…', `The squeeze: With 96 sides, ${fmt(inscribed(96), 4)} < π < ${fmt(circumscribed(96), 4)}. Zu Chongzhi (祖冲之) later pinned it to 3.1415926 < π < 3.1415927.`, 'C = πd: π is the same for every circle: circumference ÷ diameter. Its digits never end and never repeat.', 'Your turn: Roll some wheels.']);
      case 'epicycles': return story('Circles that draw waves', ['One spinning circle. Its tip, followed sideways, draws a sine wave.', 'Corners from circles?: A square wave has sharp corners and flat tops. Can smooth spinning circles ever draw that?', 'A second circle: Ride a circle one third the size, spinning three times as fast, on the tip of the first.', 'More and more circles: Each new circle is smaller and faster: radius 1/5 at 5×, 1/7 at 7×… The wave stiffens into a square.', 'Almost square: The tops flatten and the sides straighten; a small overshoot always hugs each corner.', 'Sums of sine waves: sin x + sin 3x/3 + sin 5x/5 + … approaches a square wave. Sound, light and images are built from waves this way.', 'Your turn: Build waves from circles.']);
      case 'halving': return story('Halving forever', ['Walk halfway to the door, then half of what is left, then half again…', 'Infinitely many steps: You never stop stepping. Do you reach the door, or does the distance pile up forever?', 'Fill the square: Paint 1/2 of a square, then 1/4, then 1/8: each piece fills half of the gap that remains.', 'Dive into the corner: Zoom into the unpainted corner. It looks exactly like the square we started with: the same picture, forever.', 'Sₙ = 1 − 1/2ⁿ: After n pieces, only 1/2ⁿ is unpainted. That gap shrinks below any size you name, so the sum is 1.', 'Infinite geometric series: For |q| < 1, a₁ + a₁q + a₁q² + … = a₁/(1 − q). Infinitely many pieces can add up to a finite amount.', 'Your turn: Sum endless sequences.']);
      case 'sunflower': return story('The sunflower’s secret angle', ['A sunflower grows its seeds one at a time, each turned by the same angle from the last.', 'Which angle?: Which single turning angle packs the seeds most evenly, with no wasted gaps?', 'Simple fractions fail: Half a turn makes two straight arms; a third of a turn makes three. Any fraction of a turn leaves empty gaps.', 'Sweep the angle: Turn the dial slowly through 137°… the spirals swirl, collide and tangle — then suddenly lock into an even pattern.', `${fmt(GOLDEN_DEG, 3)}°: The golden angle, 360°(1 − 1/φ). Count the spirals: 8 one way, 13 the other, 21 in the outer ring.`, 'Fibonacci and φ: 1, 1, 2, 3, 5, 8, 13, 21… with aₙ₊₂ = aₙ₊₁ + aₙ. The ratios aₙ₊₁/aₙ approach φ = (1 + √5)/2 ≈ 1.618.', 'Your turn: Continue the pattern.']);
      case 'symmetry': return story('A snowflake’s symmetries', ['A snowflake glows in the dark. Turn it by 60° — it is still the same snowflake.', 'Hidden moves: How many different moves leave the snowflake looking exactly the same?', 'Turn: Rotations by 60°, 120°, 180°, 240°, 300° — and 360°, which is the same as doing nothing. Six moves.', 'Flip: Flip it over across any of its six mirror lines. Six more moves.', 'Twelve moves: Do one move, then another: the result is always one of the same twelve. They form a closed family.', 'A group: Combining moves, a do-nothing move, and an undo for every move: that structure is called a group. This one has 12 elements (the dihedral group D6).', 'Your turn: Count symmetries.']);
      case 'clock': { const k = c.m, n = c.n; return story('Clock arithmetic', ['On a clock, 9 o’clock plus 5 hours is 2 o’clock: 9 + 5 = 2.', 'A different addition: Numbers that wrap round are everywhere: hours, weekdays, musical notes. How does this arithmetic work?', `Hop by ${k}: Start at the top and jump ${k} steps at a time around ${n} points. Music does this too: stepping 7 semitones at a time walks the circle of fifths.`, 'Change the step: Try other step sizes. Some stars visit every point; some close up early.', `Back home after ${n} ÷ gcd(${n}, k) hops: Step ${k} returns after ${hopsToReturn(n, k)} hops. Steps 1, 5, 7 and 11 visit all twelve points on a clock.`, `Arithmetic modulo ${n}: Add, then keep the remainder after dividing by ${n}. This number system, ℤ/${n}ℤ, is another group.`, 'Your turn: Calculate on a clock.']); }
      case 'wallpaper': return story('Seventeen ways to repeat', ['A single golden motif floats in the dark.', 'Repeating forever: In how many essentially different ways can a pattern repeat across a whole floor?', 'Slide: Copy the motif and slide it along two directions. The copies tile the plane: pattern p1.', 'Turn: Now spin copies about points: half-turns (p2), quarter-turns (p4), then add mirrors (p4m). On a hexagonal grid: p3, p6, p6m.', 'Only 2, 3, 4 and 6: Rotations in a repeating pattern can only be by halves, thirds, quarters or sixths of a turn. Fivefold tiles always leave gaps.', 'Exactly 17: Every repeating flat pattern belongs to one of exactly 17 symmetry groups (Fedorov, 1891). In three-dimensional crystals there are 230.', 'Your turn: Spot the symmetry.']);
      case 'quintic': return story('Roots that dance', ['The five solutions of x⁵ − x − 1 = 0 shine as five points in the complex plane.', 'A formula?: Quadratics have a formula. So do cubics and quartics. What about equations of degree five?', 'Move the equation: Change the constant: solve x⁵ − x − c = 0 while c travels once round a small loop. The roots move — and two of them swap places.', 'Different loops, different swaps: Circle a different special point and a different pair swaps. Combining loops can produce every rearrangement of the five roots.', 'All 120 rearrangements: The swaps you can make form a group: all 5! = 120 permutations of five roots, called S5.', 'Galois’s idea: Ruffini (1799) and Abel (1824) showed there is no general formula; Galois (1832) explained why: a formula exists only when this group is “solvable”, and S5 is not.', 'Your turn: Count rearrangements.']);
      default: return story('Times tables on a circle', [`${c.n} points sit around a circle like the hours on a clock.`, 'A drawing rule: Join each point k to point 2 × k (counting round the circle). What picture appears?', 'Draw the threads: One thread at a time — 1 to 2, 2 to 4, 3 to 6 … past the top, we keep counting round.', 'A heart appears: The threads crowd together along a curve: a cardioid. Now let the multiplier drift: 2 … 3 … 4.', 'Petals from multipliers: ×2 gives one cusp, ×3 two, ×4 three: multiplier m gives m − 1 petals.', `Remainders: Point k joins m × k mod ${c.n} — the remainder on dividing by ${c.n}. Simple multiplication, wrapped round a circle, draws curves.`, 'Your turn: Predict the thread.']);
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'pi': return predict('A wheel 1 m across rolls one full turn. How far does it travel?', [['a', 'A little more than 3 m'], ['b', 'Exactly 3 m'], ['c', 'Exactly 4 m']], 'a', 'The rim is π ≈ 3.14 diameters long.', 2);
      case 'epicycles': return predict('Add smaller, faster circles. The curve becomes…', [['a', 'Closer to a square wave'], ['b', 'Closer to a circle'], ['c', 'Random noise']], 'a', 'Each circle sharpens the corners.', 3);
      case 'halving': return predict('1/2 + 1/4 + 1/8 + … forever equals…', [['a', '1'], ['b', 'Infinity'], ['c', '2']], 'a', 'The unpainted gap shrinks to nothing.', 4);
      case 'sunflower': return predict('Turn each new seed by exactly half a turn. The seeds make…', [['a', 'Two straight arms'], ['b', 'An even disc'], ['c', 'One spiral']], 'a', 'Every second seed lands in the same direction.', 2);
      case 'symmetry': return predict('Including “do nothing”, how many moves leave the snowflake looking the same?', [['a', '12'], ['b', '6'], ['c', '7']], 'a', '6 rotations and 6 flips.', 4);
      case 'clock': return predict('Hop 4 hours at a time starting from 12. How many hops until you are back at 12?', [['a', '3'], ['b', '4'], ['c', '12']], 'a', '12 ÷ gcd(12, 4) = 3.', 4);
      case 'wallpaper': return predict('How many essentially different symmetry types can a repeating flat pattern have?', [['a', 'Exactly 17'], ['b', 'Infinitely many'], ['c', 'Exactly 6']], 'a', 'The 17 wallpaper groups.', 5);
      case 'quintic': return predict('Move c once round a loop and back to the start. The five roots end up…', [['a', 'With some of them swapped'], ['b', 'Each back exactly where it started'], ['c', 'Gone']], 'a', 'The set of roots is the same, but the roots can trade places.', 2);
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
      case 'symmetry': { const n = int(r, 3, 12); return pick(r, [0, 1]) ? {prompt: `How many symmetries (rotations and flips, including doing nothing) does a regular ${n}-sided polygon have?`, kind: 'number', answer: 2 * n, hint: `${n} rotations and ${n} flips.`, explanation: `2 × ${n} = ${2 * n}.`} : (() => { const a = int(r, 1, 5), b = int(r, 1, 5); return {prompt: `Turn the snowflake by 60° × ${a}, then by 60° × ${b}. What single turn (0–359°) does the same?`, kind: 'number' as const, answer: (60 * (a + b)) % 360, hint: 'Add, then remove full turns.', explanation: `${60 * (a + b)}° − full turns = ${(60 * (a + b)) % 360}°.`}; })(); }
      case 'clock': { if (pick(r, [0, 1])) { const a = int(r, 1, 12), b = int(r, 2, 23); const v = ((a + b - 1) % 12) + 1; return {prompt: `It is ${a} o’clock. What time will it be in ${b} hours? (1–12)`, kind: 'number', answer: v, hint: 'Add, then wrap round past 12.', explanation: `${a} + ${b} = ${a + b} → ${v}.`}; }
        const n = pick(r, [6, 8, 10, 12, 15, 18]), k = int(r, 1, n - 1); return {prompt: `${n} points on a circle, hopping ${k} at a time from point 0. How many hops until you return to 0?`, kind: 'number', answer: hopsToReturn(n, k), hint: 'n ÷ gcd(n, k).', explanation: `${n} ÷ gcd(${n}, ${k}) = ${n} ÷ ${gcd(n, k)} = ${hopsToReturn(n, k)}.`}; }
      case 'wallpaper': { if (pick(r, [0, 1])) { const n = pick(r, [2, 3, 4, 6]); return {prompt: `A pattern looks the same after turning by 360° ÷ ${n}. How many such turns bring a motif back to its start?`, kind: 'number', answer: n, hint: 'Count turns until a full 360°.', explanation: `${n} turns of ${360 / n}°.`}; }
        return {prompt: 'Which rotation can a repeating wallpaper pattern NOT have?', kind: 'choice', options: ['Half turn (2-fold)', 'Third of a turn (3-fold)', 'Fifth of a turn (5-fold)', 'Sixth of a turn (6-fold)'], answer: 'Fifth of a turn (5-fold)', hint: 'Can regular pentagons tile a floor?', explanation: 'Only 2-, 3-, 4- and 6-fold rotations fit a lattice (the crystallographic restriction).'}; }
      case 'quintic': { const n = int(r, 3, 7); return pick(r, [0, 1]) ? {prompt: `In how many ways can ${n} roots be rearranged?`, kind: 'number', answer: factorial(n), hint: `${n}! = ${n} × ${n - 1} × … × 1.`, explanation: `${n}! = ${factorial(n)}.`} : (() => { const p = int(r, 1, 6), q = int(r, 1, 6); return {prompt: `x² − ${p + q}x + ${p * q} = 0 has roots ${p} and ${q}. What is the sum of the roots?`, kind: 'number' as const, answer: p + q, hint: 'Sum of roots = −(coefficient of x).', explanation: `${p} + ${q} = ${p + q}: symmetric expressions in the roots can be read off the coefficients.`}; })(); }
      default: { const n = pick(r, [10, 12, 20, 36, 60, 100]), m = int(r, 2, 9), k = int(r, 2, n - 1); return {prompt: `${n} points round a circle, multiplier ${m}. Point ${k} joins point ?`, kind: 'number', answer: (m * k) % n, hint: `${m} × ${k}, then the remainder on dividing by ${n}.`, explanation: `${m * k} = ${Math.floor((m * k) / n)} × ${n} + ${(m * k) % n}.`}; }
    }
  },
  describe: c => ({
    times: `Threads joining point k to point ${c.m}k on a circle of ${c.n} points, forming curves as the multiplier drifts.`,
    pi: 'A wheel rolling out its circumference along a ruler, then polygons squeezing π.',
    epicycles: 'Circles riding on circles whose tip draws a wave that approaches a square wave.',
    halving: 'A square filled by halves while the view zooms endlessly into the remaining corner.',
    sunflower: 'Seeds placed at a turning angle that sweeps until the golden angle forms Fibonacci spirals.',
    symmetry: 'A glowing snowflake turned and flipped through its 12 symmetries, which fill a coloured group table.',
    clock: `Hops of ${c.m} around ${c.n} points drawing a star, as on a clock or the circle of fifths.`,
    wallpaper: 'A golden motif copied by slides, turns and mirrors into repeating wallpaper patterns.',
    quintic: 'The five roots of x⁵ − x − c moving in the complex plane and swapping places as c circles a loop.',
  })[c.mode],
};

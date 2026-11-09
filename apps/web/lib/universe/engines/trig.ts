import type {EngineLogic} from '../types';
import {fix, fmt, int, num, pick, str} from '../math';
import {predict, story} from './util';

export type TrigMode = 'right' | 'height' | 'radian' | 'unit-circle' | 'wave' | 'transform' | 'sum-formula' | 'laws';
export interface TrigConfig {mode: TrigMode; deg: number; deg2: number; d: number; a: number; b: number; A: number; w: number; phi: number}
export const rad = (d: number) => (d * Math.PI) / 180;
/** Exact values for the special angles. */
export const EXACT: Record<number, [string, string, string]> = {0: ['0', '1', '0'], 30: ['1/2', '√3/2', '√3/3'], 45: ['√2/2', '√2/2', '1'], 60: ['√3/2', '1/2', '√3'], 90: ['1', '0', '—']};
export function radStr(d: number) { const g = (x: number, y: number): number => (y ? g(y, x % y) : x); const k = g(Math.abs(d), 180) || 1; const n = d / k, m = 180 / k; return `${n === 1 ? '' : n === -1 ? '−' : n}π${m === 1 ? '' : '/' + m}`; }

export const trig: EngineLogic<TrigConfig> = {
  type: 'trig', label: 'Trigonometry laboratory',
  parse: r => ({mode: str(r.mode, 'unit-circle'), deg: num(r.deg, 30), deg2: num(r.deg2, 45), d: num(r.d, 20), a: num(r.a, 5), b: num(r.b, 7), A: num(r.A, 2), w: num(r.w, 2), phi: num(r.phi, 30)}),
  validate: c => (c.mode === 'right' || c.mode === 'height') && (c.deg <= 0 || c.deg >= 90) ? ['acute angle needed'] : c.mode === 'laws' && (c.deg <= 0 || c.deg >= 180) ? ['angle out of range'] : [],
  scenes: c => {
    const {deg} = c;
    switch (c.mode) {
      case 'right': return story('Same angle, same ratio', [`Right triangles with a ${deg}° angle.`, 'Does size matter?: Big or small, is opposite ÷ hypotenuse the same?', 'Scale the triangle: Grow it — every side grows, but the ratios stay fixed.', `Measure: sin ${deg}° = opposite/hypotenuse ≈ ${fmt(Math.sin(rad(deg)), 4)}.`, 'Ratios belong to the angle: Similar triangles share ratios, so sin, cos and tan depend only on the angle.', 'Trigonometric ratios: sin A = opp/hyp, cos A = adj/hyp, tan A = opp/adj; memorise 30°, 45°, 60°.', 'Your turn: Use the ratios.']);
      case 'height': return story('How tall is the tower?', [`Stand ${c.d} m from a tower; the top is at ${deg}° elevation.`, 'Without climbing?: Can an angle and a distance give the height?', 'Draw the right triangle: Eye, foot of tower, top of tower.', `tan ${deg}° = h/${c.d}: Opposite over adjacent.`, `h = ${c.d} × tan ${deg}° ≈ ${fmt(c.d * Math.tan(rad(deg)), 2)} m: The angle unlocks the length.`, 'Solving right triangles: Choose the ratio that links the known side and the unknown side.', 'Your turn: Measure the world.']);
      case 'radian': return story('Wrap the radius', [`An angle of ${deg}°.`, 'A natural unit?: Degrees are arbitrary (360). Is there a unit built into the circle?', 'Lay the radius on the arc: One radius of arc = one radian ≈ 57.3°.', `Count radii: A half turn holds π radii, so 180° = π rad and ${deg}° = ${radStr(deg)}.`, 'Arc = rα: In radians, arc length is radius × angle and sector area is ½r²α.', 'Radian measure: 180° = π; l = |α|r, S = ½lr.', 'Your turn: Convert angles.']);
      case 'unit-circle': return story('Around the circle', [`A point on the unit circle at ${deg}°.`, 'Beyond 90°?: Right triangles stop at 90°. How do we define sin 150°?', 'Coordinates: For any angle, the point is (cos α, sin α).', `At ${deg}°: (${fmt(Math.cos(rad(deg)), 3)}, ${fmt(Math.sin(rad(deg)), 3)}) — the signs follow the quadrant.`, 'Symmetry: Reflections give the induction formulas, e.g. sin(π − α) = sin α.', 'Trigonometric functions of any angle: sin²α + cos²α = 1, tan α = sin α / cos α.', 'Your turn: Read the circle.']);
      case 'wave': return story('Unroll the circle', ['A point travels round the unit circle.', 'What does its height look like over time?: Plot sin α as α increases.', 'Trace the height: The circle unrolls into a wave.', 'Repeat: After 2π it starts again — the period is 2π; it stays between −1 and 1.', 'sine and cosine waves: cos x is sin x shifted left by π/2; tan x has period π and asymptotes.', 'Graphs and properties: Period, range, symmetry, monotonic intervals and zeros.', 'Your turn: Read the graphs.']);
      case 'transform': return story('Shape a wave', [`Start from y = sin x; target y = ${c.A} sin(${c.w}x + ${radStr(c.phi)}).`, 'Which dial does what?: Amplitude, period and phase each change the graph differently.', `Shift: sin(x + ${radStr(c.phi)}) moves left by ${radStr(c.phi)}.`, `Squeeze: x → ${c.w}x divides the period by ${c.w}: T = ${radStr(360 / c.w)}.`, `Stretch: Multiply by ${c.A}: range [−${c.A}, ${c.A}].`, 'y = A sin(ωx + φ): Amplitude A, period 2π/ω, initial phase φ.', 'Your turn: Read a transformed graph.']);
      case 'sum-formula': { const s = Math.sin(rad(c.deg + c.deg2)); return story('Adding angles', [`Angles ${c.deg}° and ${c.deg2}°.`, `Is sin(${c.deg}° + ${c.deg2}°) = sin ${c.deg}° + sin ${c.deg2}°?: Let’s measure.`, 'Rotate on the unit circle: Rotating by β after α lands at α + β.', 'Distances: Equal chords give cos(α − β) = cos α cos β + sin α sin β.', `sin(${c.deg + c.deg2}°) ≈ ${fmt(s, 4)}: Not the sum of sines; use sin α cos β + cos α sin β.`, 'Sum and difference formulas: sin(α ± β), cos(α ± β), tan(α ± β); double-angle formulas follow.', 'Your turn: Expand an angle.']); }
      default: { const C2 = c.a ** 2 + c.b ** 2 - 2 * c.a * c.b * Math.cos(rad(deg)); return story('Not a right angle', [`Sides ${c.a} and ${c.b} with ${deg}° between them.`, 'Third side?: Pythagoras needs a right angle. What now?', 'Drop a height: Split the triangle into two right triangles.', `Correction term: c² = a² + b² − 2ab cos C = ${fmt(C2, 3)}.`, `c ≈ ${fmt(Math.sqrt(C2), 3)}: When C = 90° the cosine law becomes Pythagoras.`, 'Laws of sines and cosines: a/sin A = b/sin B = c/sin C = 2R; c² = a² + b² − 2ab cos C.', 'Your turn: Solve triangles.']); }
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'right': return predict(`Double the triangle’s size. sin ${c.deg}° …`, [['a', 'Stays the same'], ['b', 'Doubles'], ['c', 'Halves']], 'a', 'Ratios of similar triangles.', 2);
      case 'height': return predict('Which ratio links height and distance?', [['a', 'tan'], ['b', 'sin'], ['c', 'cos']], 'a', 'Opposite over adjacent.', 3);
      case 'radian': return predict('A half turn is how many radians?', [['a', 'π'], ['b', '180'], ['c', '2π']], 'a', 'π radii fit around half the circle.', 3);
      case 'unit-circle': return predict(`sign of cos ${c.deg}°?`, [['a', Math.cos(rad(c.deg)) < 0 ? 'Negative' : 'Positive'], ['b', Math.cos(rad(c.deg)) < 0 ? 'Positive' : 'Negative']], 'a', 'Read the x-coordinate.', 3);
      case 'wave': return predict('Period of y = sin x?', [['a', '2π'], ['b', 'π'], ['c', '1']], 'a', 'One full turn.', 3);
      case 'transform': return predict(`Period of y = ${c.A} sin(${c.w}x + φ)?`, [['a', radStr(360 / c.w)], ['b', c.w === 1 ? 'π' : '2π'], ['c', radStr(720 * c.w)]], 'a', '2π/ω.', 3);
      case 'sum-formula': return predict(`sin(${c.deg}° + ${c.deg2}°) vs sin ${c.deg}° + sin ${c.deg2}°:`, [['a', 'Smaller'], ['b', 'Equal'], ['c', 'Larger']], 'a', 'Sine is not linear.', 4);
      default: return predict(`a = ${c.a}, b = ${c.b}, C = ${c.deg}°. Is c² = a² + b²?`, [['a', c.deg < 90 ? 'Less than a² + b²' : 'More than a² + b²'], ['b', 'Equal'], ['c', c.deg < 90 ? 'More than a² + b²' : 'Less than a² + b²']], 'a', '−2ab cos C.', 3);
    }
  },
  challenge: (c, r) => {
    const sp = pick(r, [30, 45, 60]);
    switch (c.mode) {
      case 'right': { const f = pick(r, [0, 1, 2]); const name = ['sin', 'cos', 'tan'][f]; return {prompt: `${name} ${sp}° (exact)?`, kind: 'choice', options: ['1/2', '√2/2', '√3/2', '√3', '1', '√3/3'], answer: EXACT[sp][f], hint: 'Picture the 30-60-90 or 45-45-90 triangle.', explanation: `${name} ${sp}° = ${EXACT[sp][f]}.`}; }
      case 'height': { const d = int(r, 10, 40), a = pick(r, [30, 45, 60]); return {prompt: `${d} m away, elevation ${a}°. Height (to 0.1 m)?`, kind: 'number', answer: fix(d * Math.tan(rad(a)), 1), tolerance: .1, hint: 'd · tan θ.', explanation: `${d} × tan ${a}° ≈ ${fmt(d * Math.tan(rad(a)), 2)}.`}; }
      case 'radian': { const d = pick(r, [30, 45, 60, 90, 120, 135, 150, 270]); return {prompt: `${d}° in radians?`, kind: 'choice', options: [radStr(d), radStr(d * 2), radStr(180 - d === 0 ? 90 : 180 - d)].filter((x, i, a) => a.indexOf(x) === i), answer: radStr(d), hint: '× π/180.', explanation: `${d}π/180 = ${radStr(d)}.`}; }
      case 'unit-circle': { const d = pick(r, [120, 135, 150, 210, 240, 300, 330]); const s = Math.sin(rad(d)); return {prompt: `Is sin ${d}° positive or negative?`, kind: 'choice', options: ['Positive', 'Negative'], answer: s > 0 ? 'Positive' : 'Negative', hint: 'Quadrant of the point.', explanation: `sin ${d}° ≈ ${fmt(s, 3)}.`}; }
      case 'wave': { const f = pick(r, ['sin', 'cos', 'tan']); return {prompt: `Smallest positive period of y = ${f} x?`, kind: 'choice', options: ['π', '2π', 'π/2'], answer: f === 'tan' ? 'π' : '2π', hint: 'When does the graph repeat?', explanation: f === 'tan' ? 'tan repeats every π.' : 'One full turn, 2π.'}; }
      case 'transform': { const w = int(r, 2, 6), A = int(r, 2, 5); return pick(r, [0, 1]) ? {prompt: `Maximum of y = ${A} sin(${w}x + π/6) + 1?`, kind: 'number', answer: A + 1, hint: 'Max of sin is 1.', explanation: `${A} + 1.`} : {prompt: `Period of y = sin(${w}x)? (as a multiple of π, e.g. 0.5 for π/2)`, kind: 'number', answer: fix(2 / w), tolerance: .01, hint: '2π/ω.', explanation: `2π/${w}.`}; }
      case 'sum-formula': { const [x, ans] = pick(r, [['cos 15°', '(√6 + √2)/4'], ['sin 15°', '(√6 − √2)/4'], ['sin 75°', '(√6 + √2)/4'], ['cos 75°', '(√6 − √2)/4']] as const); return {prompt: `${x} (exact)?`, kind: 'choice', options: ['(√6 + √2)/4', '(√6 − √2)/4', '√3/2'], answer: ans, hint: '45° ± 30°.', explanation: `${x} = ${ans}.`}; }
      default: { const a = int(r, 3, 8), b = int(r, 3, 8); return {prompt: `a = ${a}, b = ${b}, C = 60°. c² = ?`, kind: 'number', answer: a * a + b * b - a * b, hint: 'cos 60° = 1/2.', explanation: `${a * a} + ${b * b} − ${a * b}.`}; }
    }
  },
  describe: c => `Unit circle, triangles and waves for trigonometry (${c.mode}).`,
};

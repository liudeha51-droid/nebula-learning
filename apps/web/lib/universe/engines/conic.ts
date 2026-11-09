import type {EngineLogic} from '../types';
import {fix, fmt, int, num, pick, str} from '../math';
import {predict, story} from './util';

export type ConicMode = 'line' | 'distance' | 'circle' | 'ellipse' | 'hyperbola' | 'parabola';
export interface ConicConfig {mode: ConicMode; k: number; b: number; x0: number; y0: number; r: number; a: number; p: number}
/** Line used by the distance scene: 3x + 4y − 10 = 0. */
export const LINE = {A: 3, B: 4, C: -10};
export const ptLine = (x: number, y: number) => Math.abs(LINE.A * x + LINE.B * y + LINE.C) / Math.hypot(LINE.A, LINE.B);

export const conic: EngineLogic<ConicConfig> = {
  type: 'conic', label: 'Analytic geometry laboratory',
  parse: r => ({mode: str(r.mode, 'ellipse'), k: num(r.k, 2), b: num(r.b, 1), x0: num(r.x0, 3), y0: num(r.y0, 4), r: num(r.r, 3), a: num(r.a, 5), p: num(r.p, 2)}),
  validate: c => (c.mode === 'ellipse' && c.a <= c.b ? ['ellipse needs a > b'] : c.mode === 'circle' && c.r <= 0 ? ['radius must be positive'] : []),
  scenes: c => {
    switch (c.mode) {
      case 'line': return story('Steepness as a number', [`A road rises ${c.k} for every 1 across.`, 'How do we describe a line?: One point is not enough. What else pins it down?', `Slope: k = rise/run = tan α = ${c.k}: α ≈ ${fmt((Math.atan(c.k) * 180) / Math.PI, 1)}°.`, `Point + slope: Through (0, ${c.b}) with slope ${c.k}: y = ${c.k}x + ${c.b}.`, 'Parallel and perpendicular: Parallel lines share k; perpendicular lines have k₁k₂ = −1.', 'Equations of lines: Point-slope, slope-intercept, two-point, intercept and general Ax + By + C = 0.', 'Your turn: Find equations of lines.']);
      case 'distance': { const d = ptLine(c.x0, c.y0); return story('Shortest path to a road', [`A house at (${c.x0}, ${c.y0}); a road 3x + 4y − 10 = 0.`, 'Shortest way to the road?: Many paths reach the road. Which is shortest?', 'Swing a rope: The shortest segment meets the road at a right angle.', `Formula: d = |Ax₀ + By₀ + C| / √(A² + B²) = |${3 * c.x0 + 4 * c.y0 - 10}| / 5.`, `d = ${fmt(d, 3)}: Two-point distance is Pythagoras; point-to-line uses the perpendicular.`, 'Distance formulas: |P₁P₂| = √((x₂ − x₁)² + (y₂ − y₁)²); d = |Ax₀ + By₀ + C|/√(A² + B²).', 'Your turn: Compute distances.']); }
      case 'circle': return story('A goat on a rope', [`A goat tied at (1, 1) with a rope of ${c.r} m.`, 'Which points can it just reach?: Describe all of them with one equation.', `Distance = r: (x − 1)² + (y − 1)² = ${c.r * c.r}.`, 'A fence (line) moves: Compare the centre-to-line distance d with r.', 'd < r: two crossings; d = r: tangent; d > r: miss.', 'Circles: Standard (x − a)² + (y − b)² = r² and general form; line–circle and circle–circle positions.', 'Your turn: Work with circles.']);
      case 'ellipse': { const f = Math.sqrt(c.a ** 2 - c.b ** 2); return story('String and two pins', [`Two pins ${fmt(2 * f)} apart and a loop of string.`, 'What shape does a pencil trace?: Keep the string tight and go around.', `Constant sum: |PF₁| + |PF₂| = 2a = ${2 * c.a} at every point.`, `Equation: x²/${c.a * c.a} + y²/${c.b * c.b} = 1 with c² = a² − b², c = ${fmt(f)}.`, `Eccentricity e = c/a = ${fmt(f / c.a, 3)}: closer to 0 is rounder, closer to 1 is flatter.`, 'The ellipse: x²/a² + y²/b² = 1 (a > b > 0); foci (±c, 0); e = c/a.', 'Your turn: Read an ellipse.']); }
      case 'hyperbola': { const f = Math.sqrt(c.a ** 2 + c.b ** 2); return story('A constant difference', ['Two listening posts hear a bang at different times.', 'Where could the bang be?: The time gap fixes the difference of distances.', `Constant difference: ||PF₁| − |PF₂|| = 2a = ${2 * c.a}.`, `Equation: x²/${c.a * c.a} − y²/${c.b * c.b} = 1, c² = a² + b², c = ${fmt(f)}.`, `Asymptotes y = ±${fmt(c.b / c.a, 3)}x: The branches hug these lines far away.`, 'The hyperbola: x²/a² − y²/b² = 1; foci (±c, 0); e = c/a > 1; asymptotes y = ±(b/a)x.', 'Your turn: Read a hyperbola.']); }
      default: return story('A satellite dish', [`A focus at (${c.p / 2}, 0) and a directrix x = −${c.p / 2}.`, 'Equal distances?: Which points are as far from the focus as from the line?', `Trace them: All such points form the curve y² = ${2 * c.p}x.`, 'Reflect: A ray parallel to the axis bounces straight to the focus.', 'Focus and directrix: |PF| = distance to the directrix; that is why dishes collect signals.', 'The parabola: y² = 2px (p > 0), focus (p/2, 0), directrix x = −p/2.', 'Your turn: Read a parabola.']);
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'line': return predict(`A line perpendicular to y = ${c.k}x + ${c.b} has slope…`, [['a', fmt(-1 / c.k, 3)], ['b', fmt(c.k)], ['c', fmt(-c.k)]], 'a', 'k₁k₂ = −1.', 4);
      case 'distance': return predict('The shortest path to the road meets it…', [['a', 'At a right angle'], ['b', 'At 45°'], ['c', 'At the y-axis']], 'a', 'The perpendicular is shortest.', 2);
      case 'circle': return predict('Centre-to-line distance equals r. The line…', [['a', 'Touches the circle once'], ['b', 'Crosses twice'], ['c', 'Misses']], 'a', 'Tangent.', 4);
      case 'ellipse': return predict('As the pins move apart (same string), the ellipse becomes…', [['a', 'Flatter'], ['b', 'Rounder'], ['c', 'The same']], 'a', 'e = c/a grows.', 4);
      case 'hyperbola': return predict(`Asymptotes of x²/${c.a * c.a} − y²/${c.b * c.b} = 1?`, [['a', `y = ±${fmt(c.b / c.a, 3)}x`], ['b', `y = ±${fmt(c.a / c.b, 3)}x`]], 'a', 'y = ±(b/a)x.', 4);
      default: return predict('A ray parallel to the axis hits the parabola and reflects…', [['a', 'Through the focus'], ['b', 'Back the same way'], ['c', 'Through the vertex']], 'a', 'Reflective property.', 3);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'line': { const x1 = int(r, -3, 3), y1 = int(r, -3, 3), dx = int(r, 1, 4), dy = int(r, -5, 5); return {prompt: `Slope through (${x1}, ${y1}) and (${x1 + dx}, ${y1 + dy})?`, kind: 'number', answer: fix(dy / dx), tolerance: .01, hint: 'Δy/Δx.', explanation: `${dy}/${dx}.`}; }
      case 'distance': { const [x, y] = pick(r, [[0, 0], [2, 1], [-2, 4], [6, 3], [4, -2]]); return pick(r, [0, 1]) ? {prompt: `Distance from (${x}, ${y}) to 3x + 4y − 10 = 0?`, kind: 'number', answer: fix(ptLine(x, y)), tolerance: .01, hint: '|Ax₀ + By₀ + C|/5.', explanation: `|${3 * x + 4 * y - 10}|/5.`} : {prompt: `Distance from (${x}, ${y}) to (${x + 6}, ${y + 8})?`, kind: 'number', answer: 10, hint: '√(6² + 8²).', explanation: '10.'}; }
      case 'circle': { const R = int(r, 2, 6), d = pick(r, [R - 1, R, R + 2]); return {prompt: `Circle radius ${R}; a line is ${d} from its centre. Position?`, kind: 'choice', options: ['Intersecting', 'Tangent', 'Separate'], answer: d < R ? 'Intersecting' : d === R ? 'Tangent' : 'Separate', hint: 'Compare d with r.', explanation: `d = ${d}, r = ${R}.`}; }
      case 'ellipse': { const [a, b, cc] = pick(r, [[5, 3, 4], [5, 4, 3], [13, 5, 12], [10, 6, 8], [10, 8, 6]]); return {prompt: `x²/${a * a} + y²/${b * b} = 1. Eccentricity?`, kind: 'number', answer: fix(cc / a), tolerance: .01, hint: 'c = √(a² − b²).', explanation: `c = ${cc}, e = ${cc}/${a}.`}; }
      case 'hyperbola': { const [a, b, cc] = pick(r, [[3, 4, 5], [4, 3, 5], [5, 12, 13], [6, 8, 10]]); return {prompt: `x²/${a * a} − y²/${b * b} = 1. Focal distance c?`, kind: 'number', answer: cc, hint: 'c² = a² + b².', explanation: `√(${a * a} + ${b * b}) = ${cc}.`}; }
      default: { const p = int(r, 1, 8); return {prompt: `y² = ${2 * p}x. x-coordinate of the focus?`, kind: 'number', answer: fix(p / 2), hint: '2p = coefficient; focus (p/2, 0).', explanation: `p = ${p}, focus (${p / 2}, 0).`}; }
    }
  },
  describe: c => `Coordinate plane tracing a ${c.mode}.`,
};

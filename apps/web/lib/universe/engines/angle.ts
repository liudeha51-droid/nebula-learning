import type {EngineLogic} from '../types';
import {bool, int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type AngleMode = 'lines' | 'angle' | 'protractor' | 'parallel' | 'triangle' | 'triangle-sum' | 'quadrilateral';
export interface AngleConfig {mode: AngleMode; deg: number; family: boolean; distance: boolean}
export type P = [number, number];

export const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1]);
/** Interior angle at b (degrees) between rays b→a and b→c. */
export const angleAt = (a: P, b: P, c: P) => { const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]]; const cos = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]) || 1); return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI; };
export const classifyAngle = (d: number) => (d < .5 ? 'zero' : d < 89.5 ? 'acute' : d <= 90.5 ? 'right' : d < 179.5 ? 'obtuse' : d <= 180.5 ? 'straight' : d < 359.5 ? 'reflex' : 'full');
export function classifyTriangle(t: [P, P, P]) {
  const angles = [angleAt(t[2], t[0], t[1]), angleAt(t[0], t[1], t[2]), angleAt(t[1], t[2], t[0])];
  const sides = [dist(t[1], t[2]), dist(t[0], t[2]), dist(t[0], t[1])];
  const max = Math.max(...angles); const byAngle = max > 90.5 ? 'obtuse' : max >= 89.5 ? 'right' : 'acute';
  const eq = (x: number, y: number) => Math.abs(x - y) / Math.max(x, y) < .03;
  const bySide = eq(sides[0], sides[1]) && eq(sides[1], sides[2]) ? 'equilateral' : eq(sides[0], sides[1]) || eq(sides[1], sides[2]) || eq(sides[0], sides[2]) ? 'isosceles' : 'scalene';
  return {angles, sides, byAngle, bySide};
}
const dir = (a: P, b: P) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const parallel = (a: P, b: P, c: P, d: P) => { let x = Math.abs(dir(a, b) - dir(c, d)) % Math.PI; x = Math.min(x, Math.PI - x); return x < 2 * Math.PI / 180; };
export function classifyQuad(q: [P, P, P, P]) {
  const pairs = [parallel(q[0], q[1], q[3], q[2]), parallel(q[1], q[2], q[0], q[3])].filter(Boolean).length;
  const angles = q.map((_, i) => angleAt(q[(i + 3) % 4], q[i], q[(i + 1) % 4])); const right = angles.every(a => Math.abs(a - 90) < 1.5);
  const sides = q.map((_, i) => dist(q[i], q[(i + 1) % 4])); const equal = sides.every(s => Math.abs(s - sides[0]) / sides[0] < .03);
  const name = pairs === 2 ? (right ? (equal ? 'square' : 'rectangle') : equal ? 'rhombus (a special parallelogram)' : 'parallelogram') : pairs === 1 ? 'trapezoid' : 'quadrilateral';
  return {pairs, right, equal, angles, sides, name};
}

export const angle: EngineLogic<AngleConfig> = {
  type: 'angle', label: 'Dynamic geometry workshop',
  parse: r => ({mode: str(r.mode, 'angle'), deg: num(r.deg, 60), family: bool(r.family, false), distance: bool(r.distance, false)}),
  validate: c => (c.deg <= 0 || c.deg > 360 ? ['angle 1–360'] : []),
  scenes: c => {
    switch (c.mode) {
      case 'lines': return [
        sc('intro', 'introduce', 'Two points', 'Two stars, A and B, in the night sky.', 5),
        sc('problem', 'problem', 'Join them', c.distance ? 'Of all the paths from A to B, which is shortest?' : 'Draw a straight path from A to B. How far can it go?', 6),
        sc('segment', 'explore', 'Segment, ray, line', 'A segment stops at both points. Extend past B and it becomes a ray with one endpoint. Extend both ways: a line.', 10),
        sc('paths', 'manipulate', c.distance ? 'Try other paths' : 'Measure', c.distance ? 'Curved and bent paths are all longer than the straight segment.' : 'Only a segment can be measured; rays and lines go on forever.', 8),
        sc('discover', 'discover', c.distance ? 'Shortest path' : 'Endpoints decide', c.distance ? 'The segment AB is the shortest path; its length is the distance between A and B.' : 'Two endpoints: segment. One: ray. None: line.', 7),
        sc('explain', 'explain', 'Through two points', 'Exactly one straight line passes through two points.', 6),
        sc('apply', 'apply', 'Your turn', 'Count segments and rays.', 5)];
      case 'protractor': return [
        sc('intro', 'introduce', 'An angle to measure', 'A mystery angle waits on the bench.', 5),
        sc('problem', 'problem', 'Two scales?', 'The protractor has two rows of numbers. Which one do we read?', 6),
        sc('place', 'explore', 'Centre on the vertex', 'Put the protractor’s centre on the vertex and line 0° up with one arm.', 8),
        sc('read', 'manipulate', 'Read from 0', `Follow the scale that starts at 0° on that arm: it reads ${c.deg}°.`, 8),
        sc('discover', 'discover', `${c.deg}°`, `The other scale shows ${180 - c.deg}° — the wrong one. A ${c.deg < 90 ? 'small' : 'wide'} angle must read ${c.deg < 90 ? 'less' : 'more'} than 90°.`, 8),
        sc('explain', 'explain', 'Measuring angles', 'Centre on the vertex, zero on one arm, read the scale that starts at zero, sanity-check with the angle type.', 7),
        sc('apply', 'apply', 'Your turn', 'Measure and draw angles.', 5)];
      case 'parallel': return [
        sc('intro', 'introduce', 'Two straight roads', 'Two lines on a city map.', 5),
        sc('problem', 'problem', 'Will they meet?', 'If the roads go on forever, will they cross?', 5),
        sc('turn', 'explore', 'Turn one line', 'Rotate one line: the crossing point slides away and disappears when the lines are parallel.', 9),
        sc('perp', 'manipulate', 'A square corner', 'Keep turning to a right angle: the lines are perpendicular, making four 90° angles.', 8),
        sc('discover', 'discover', 'Parallel and perpendicular', 'Parallel lines never meet and stay the same distance apart; perpendicular lines meet at 90°.', 8),
        sc('explain', 'explain', 'Symbols', 'We write a ∥ b for parallel and a ⊥ b for perpendicular.', 6),
        sc('apply', 'apply', 'Your turn', 'Identify relationships between lines.', 5)];
      case 'triangle': return [
        sc('intro', 'introduce', 'A triangle', 'Three points joined by three segments.', 5),
        sc('problem', 'problem', 'Sorting triangles', 'How can we sort all the triangles in the world?', 5),
        sc('angles', 'explore', 'By the biggest angle', 'Drag a vertex: all acute, one right angle, or one obtuse angle.', 10),
        sc('sides', 'manipulate', 'By the sides', 'Make two sides equal (isosceles), then all three (equilateral).', 9),
        sc('discover', 'discover', 'Two ways to classify', 'A triangle has an angle name and a side name, like “right isosceles”.', 7),
        sc('explain', 'explain', 'Why at most one', 'A triangle can never have two right or two obtuse angles — the third angle would have nothing left.', 8),
        sc('apply', 'apply', 'Your turn', 'Classify triangles.', 5)];
      case 'triangle-sum': return [
        sc('intro', 'introduce', 'Three corners', 'A paper triangle with coloured corners.', 5),
        sc('problem', 'problem', 'Add the angles', 'Do the three angles always add to the same total?', 5),
        sc('tear', 'explore', 'Tear off the corners', 'Cut off each corner.', 7),
        sc('align', 'manipulate', 'Line them up', 'Put the three corners together at one point.', 9),
        sc('discover', 'discover', 'A straight angle', 'They fit exactly into a straight line: 180°.', 7),
        sc('explain', 'explain', 'Angle sum', '∠A + ∠B + ∠C = 180° for every triangle, big or small.', 7),
        sc('apply', 'apply', 'Your turn', 'Find missing angles.', 5)];
      case 'quadrilateral': return [
        sc('intro', 'introduce', 'Four sides', 'A shape with four straight sides.', 5),
        sc('problem', 'problem', 'Family resemblance', c.family ? 'How are parallelograms, trapezoids, rectangles and squares related?' : 'What makes a rectangle special? And a square?', 6),
        sc('trap', 'explore', 'One pair of parallel sides', 'Slide a vertex until one pair of sides is parallel: a trapezoid.', 8),
        sc('para', 'manipulate', 'Two pairs', 'Make both pairs parallel: a parallelogram. Square the corners: a rectangle. Equal sides too: a square.', 10),
        sc('discover', 'discover', 'Each is a special case', 'Every square is a rectangle, every rectangle is a parallelogram.', 7),
        sc('explain', 'explain', 'Defining properties', 'Trapezoid: exactly one pair of parallel sides. Parallelogram: two pairs. Rectangle: parallelogram with right angles. Square: rectangle with equal sides.', 9),
        sc('apply', 'apply', 'Your turn', 'Classify quadrilaterals.', 5)];
      default: return [
        sc('intro', 'introduce', 'Two rays', 'Two rays share an endpoint: the vertex.', 5),
        sc('problem', 'problem', 'Size of an angle', 'Does a bigger angle have longer arms or a wider opening?', 6),
        sc('open', 'explore', 'Open the angle', 'Turn one arm: acute, right, obtuse, straight, all the way to a full turn.', 12),
        sc('arms', 'manipulate', 'Change the arms', 'Stretch the arms longer. The opening — the angle — does not change.', 7),
        sc('discover', 'discover', 'Angle = amount of turn', `This angle is ${c.deg}°: ${classifyAngle(c.deg)}.`, 6),
        sc('explain', 'explain', 'Angle types', 'acute < 90° = right < obtuse < 180° = straight < 360° = full turn.', 7),
        sc('apply', 'apply', 'Your turn', 'Classify angles.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'lines': return c.distance ? predict('Which path from A to B is shortest?', [['a', 'The straight segment'], ['b', 'A gentle curve'], ['c', 'They are all equal']], 'a', 'Any bend adds length.', 3) : predict('How many endpoints does a ray have?', [['a', '1'], ['b', '2'], ['c', '0']], 'a', 'It starts at one point and never ends.', 2);
      case 'protractor': return predict(`An ${c.deg < 90 ? 'acute' : 'obtuse'} angle shows ${c.deg}° on one scale and ${180 - c.deg}° on the other. Its size is…`, [['a', `${c.deg}°`], ['b', `${180 - c.deg}°`]], 'a', `${c.deg < 90 ? 'Acute' : 'Obtuse'} angles are ${c.deg < 90 ? 'below' : 'above'} 90°.`, 3);
      case 'parallel': return predict('When the lines are parallel, where do they cross?', [['a', 'Nowhere'], ['b', 'Very far away'], ['c', 'At 90°']], 'a', 'Parallel lines never meet.', 3);
      case 'triangle': return predict('Can a triangle have two right angles?', [['a', 'No'], ['b', 'Yes']], 'a', '90 + 90 leaves no angle for the third corner.', 3);
      case 'triangle-sum': return predict('The three torn corners placed together make…', [['a', 'A straight angle (180°)'], ['b', 'A right angle (90°)'], ['c', 'A full turn (360°)']], 'a', 'They line up along a straight line.', 3);
      case 'quadrilateral': return predict('Is every square a rectangle?', [['a', 'Yes'], ['b', 'No']], 'a', 'A square has four right angles — that is enough.', 3);
      default: return predict('If we make the arms twice as long, the angle…', [['a', 'Stays the same'], ['b', 'Doubles'], ['c', 'Halves']], 'a', 'An angle measures turning, not length.', 3);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'lines': { const n = int(r, 3, 6); return {prompt: `${n} points lie on a straight line. How many segments join pairs of them?`, kind: 'number', answer: n * (n - 1) / 2, hint: 'Each point joins every point after it.', explanation: `${Array.from({length: n - 1}, (_, i) => n - 1 - i).join(' + ')} = ${n * (n - 1) / 2}.`}; }
      case 'triangle-sum': { const a = int(r, 25, 80), b = int(r, 25, 150 - a); return {prompt: `A triangle has angles ${a}° and ${b}°. The third angle is?`, kind: 'number', answer: 180 - a - b, unit: '°', hint: 'Angles add to 180°.', explanation: `180 − ${a} − ${b} = ${180 - a - b}.`}; }
      case 'triangle': { const [an, ans] = pick(r, [[[60, 60, 60], 'Acute equilateral'], [[90, 45, 45], 'Right isosceles'], [[120, 30, 30], 'Obtuse isosceles'], [[90, 60, 30], 'Right scalene'], [[70, 70, 40], 'Acute isosceles']] as const); return {prompt: `A triangle has angles ${an.join('°, ')}°. Which name fits?`, kind: 'choice', options: ['Acute equilateral', 'Right isosceles', 'Obtuse isosceles', 'Right scalene', 'Acute isosceles'], answer: ans, hint: 'Biggest angle for the first word; equal angles mean equal sides.', explanation: `${ans}.`}; }
      case 'parallel': return {prompt: 'Two perpendicular lines meet. What is each angle formed?', kind: 'number', answer: 90, unit: '°', hint: 'Perpendicular means square corners.', explanation: '90°.'};
      case 'quadrilateral': { const [q, a] = pick(r, [['Exactly one pair of parallel sides', 'Trapezoid'], ['Two pairs of parallel sides, no right angles', 'Parallelogram'], ['Four right angles, sides not all equal', 'Rectangle'], ['Four right angles and four equal sides', 'Square']] as const); return {prompt: `${q}: which shape?`, kind: 'choice', options: ['Trapezoid', 'Parallelogram', 'Rectangle', 'Square'], answer: a, hint: 'Count parallel pairs, then check corners and sides.', explanation: `${a}.`}; }
      default: { const d = int(r, 1, 35) * 5; return {prompt: `An angle of ${d}° is…`, kind: 'choice', options: ['acute', 'right', 'obtuse', 'straight'], answer: d < 90 ? 'acute' : d === 90 ? 'right' : d < 180 ? 'obtuse' : 'straight', hint: 'Compare with 90° and 180°.', explanation: classifyAngle(d) + '.'}; }
    }
  },
  describe: c => `Interactive geometry (${c.mode}) with draggable points; measurements and classifications update live.`,
};

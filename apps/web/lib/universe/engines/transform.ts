import type {EngineLogic} from '../types';
import {int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type TransformMode = 'translate' | 'rotate' | 'reflect' | 'scale';
export interface TransformConfig {mode: TransformMode; dx: number; dy: number; angle: number; k: number}
/** The flag shape used in every transformation (grid units). */
export const FLAG: [number, number][] = [[0, 0], [1, 0], [1, 2], [2, 2], [2, 3], [0, 3]];
export const rotatePt = ([x, y]: [number, number], [cx, cy]: [number, number], deg: number): [number, number] => { const a = -deg * Math.PI / 180; const dx = x - cx, dy = y - cy; return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)]; };
export const polyArea = (p: [number, number][]) => Math.abs(p.reduce((s, [x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; return s + x * y2 - x2 * y; }, 0)) / 2;

export const transform: EngineLogic<TransformConfig> = {
  type: 'transform', label: 'Transformation studio',
  parse: r => ({mode: str(r.mode, 'translate'), dx: num(r.dx, 5), dy: num(r.dy, -2), angle: num(r.angle, 90), k: num(r.k, 2)}),
  validate: c => (c.k <= 0 ? ['scale factor must be positive'] : []),
  scenes: c => {
    switch (c.mode) {
      case 'rotate': return [
        sc('intro', 'introduce', 'A flag on a pin', 'A flag pinned at one corner.', 5),
        sc('problem', 'problem', 'Turn it', `Turn the flag ${c.angle}° clockwise around the pin. Where does it land?`, 6),
        sc('turn', 'explore', 'Every point turns', `Each point sweeps an arc of ${c.angle}° around the centre.`, 9),
        sc('check', 'manipulate', 'Check distances', 'Every point stays the same distance from the centre.', 7),
        sc('discover', 'discover', 'Same shape, new direction', 'Rotation changes direction only; size and shape stay.', 6),
        sc('explain', 'explain', 'Describing a rotation', 'Give the centre, the direction (clockwise or anticlockwise) and the angle.', 7),
        sc('apply', 'apply', 'Your turn', 'Rotate shapes.', 5)];
      case 'reflect': return [
        sc('intro', 'introduce', 'Half a butterfly', 'Half a pattern beside a mirror line.', 5),
        sc('problem', 'problem', 'Complete it', 'Where does each point go in the mirror?', 5),
        sc('flip', 'explore', 'Fold over the line', 'Fold the paper along the mirror line.', 8),
        sc('measure', 'manipulate', 'Equal distances', 'Each point and its image are the same distance from the line, on opposite sides.', 8),
        sc('discover', 'discover', 'A symmetric figure', 'The shape and its reflection form an axis-symmetric figure.', 6),
        sc('explain', 'explain', 'Reflection', 'Joining a point to its image crosses the mirror line at a right angle, halfway.', 7),
        sc('apply', 'apply', 'Your turn', 'Complete symmetric figures.', 5)];
      case 'scale': return [
        sc('intro', 'introduce', 'A small flag', 'A flag on squared paper.', 5),
        sc('problem', 'problem', `Enlarge × ${c.k}`, `Make every length ${c.k} times as long. What happens to the area?`, 6),
        sc('grow', 'explore', 'Stretch every side', `Each side becomes ${c.k} times as long; angles do not change.`, 9),
        sc('count', 'manipulate', 'Count squares', `The area grows from ${polyArea(FLAG)} to ${polyArea(FLAG) * c.k * c.k} squares.`, 8),
        sc('discover', 'discover', `Area × ${c.k * c.k}`, `Lengths × ${c.k} → area × ${c.k}² = × ${c.k * c.k}.`, 7),
        sc('explain', 'explain', 'Enlargement and reduction', 'Similar shapes: same angles, lengths in proportion. Area scales by the square of the length factor.', 8),
        sc('apply', 'apply', 'Your turn', 'Enlarge and reduce.', 5)];
      default: return [
        sc('intro', 'introduce', 'A flag on a grid', 'A flag shape on squared paper.', 5),
        sc('problem', 'problem', 'Slide it', `Move it ${Math.abs(c.dx)} squares ${c.dx >= 0 ? 'right' : 'left'} and ${Math.abs(c.dy)} ${c.dy >= 0 ? 'up' : 'down'}.`, 6),
        sc('slide', 'explore', 'Every point moves the same', 'Every vertex follows the same arrow.', 9),
        sc('measure', 'manipulate', 'Count from a vertex', 'Count squares from one corner to its image — not the gap between the shapes.', 8),
        sc('discover', 'discover', 'Same size, same direction', 'Translation keeps size, shape and direction.', 6),
        sc('explain', 'explain', 'Translation', 'Describe a translation by its direction and distance.', 6),
        sc('apply', 'apply', 'Your turn', 'Translate shapes.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'rotate': return predict(`After a ${c.angle}° clockwise turn, the flag’s pole (pointing up) points…`, [['a', c.angle === 90 ? 'Right' : c.angle === 180 ? 'Down' : 'Left'], ['b', 'Up'], ['c', c.angle === 90 ? 'Left' : 'Right']], 'a', 'Follow the pole as it turns.', 2);
      case 'reflect': return predict('A point 3 squares left of the mirror lands…', [['a', '3 squares right of it'], ['b', '6 squares right'], ['c', 'on the mirror']], 'a', 'Equal distance on the other side.', 3);
      case 'scale': return predict(`Enlarged × ${c.k}, the area becomes…`, [['a', `× ${c.k * c.k}`], ['b', `× ${c.k}`], ['c', `× ${c.k * 2}`]], 'a', 'Both length and width scale.', 3);
      default: return predict('After a translation, the shape…', [['a', 'Looks exactly the same, only moved'], ['b', 'Is turned'], ['c', 'Is bigger']], 'a', 'Only position changes.', 2);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'rotate': { const [q, a] = pick(r, [['up', 'right'], ['right', 'down'], ['down', 'left'], ['left', 'up']] as const); return {prompt: `An arrow points ${q}. Rotate it 90° clockwise. Where does it point?`, kind: 'choice', options: ['up', 'right', 'down', 'left'], answer: a, hint: 'Like a clock hand moving a quarter turn.', explanation: a + '.'}; }
      case 'reflect': { const d = int(r, 1, 6); return {prompt: `A point is ${d} squares left of a vertical mirror line. How many squares apart are the point and its image?`, kind: 'number', answer: 2 * d, hint: 'Same distance on the other side.', explanation: `${d} + ${d} = ${2 * d}.`}; }
      case 'scale': { const k = int(r, 2, 4), a = int(r, 2, 6), b = int(r, 2, 6); return {prompt: `A ${a} × ${b} rectangle is enlarged × ${k}. New area?`, kind: 'number', answer: a * b * k * k, hint: 'Scale both sides.', explanation: `${a * k} × ${b * k} = ${a * b * k * k}.`}; }
      default: { const x = int(r, 1, 5), y = int(r, 1, 5), dx = int(r, 1, 4), dy = int(r, 1, 3); return {prompt: `Vertex (${x}, ${y}) moves ${dx} right and ${dy} up. New x-coordinate (column)?`, kind: 'number', answer: x + dx, hint: 'Right adds to the column.', explanation: `(${x + dx}, ${y + dy}).`}; }
    }
  },
  describe: c => `Flag shape on a grid undergoing ${c.mode === 'scale' ? `enlargement × ${c.k}` : c.mode === 'rotate' ? `a ${c.angle}° clockwise rotation` : c.mode === 'reflect' ? 'reflection in a vertical mirror line' : `translation by (${c.dx}, ${c.dy})`}.`,
};

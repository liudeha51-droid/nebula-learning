import type {EngineLogic} from '../types';
import {int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type AreaMode = 'grid' | 'perimeter' | 'perimeter-vs-area' | 'parallelogram' | 'triangle' | 'trapezoid' | 'composite' | 'units' | 'irregular';
export interface AreaConfig {mode: AreaMode; l: number; w: number; perimeter: number; base: number; h: number; slant: number; apex: number; a: number; b: number; shape: 'L' | 'house'}

/** Irregular "leaf" region used for estimation: an ellipse-like blob in a 10×7 grid. */
export const inLeaf = (x: number, y: number) => { const dx = (x - 5) / 4.2, dy = (y - 3.5) / 2.6; return dx * dx + dy * dy * (1 + .35 * Math.sin(x * 1.3)) <= 1; };
/** Counts full and partial unit squares of the leaf by sampling each square. */
export function leafCounts(step = 1) {
  let full = 0, partial = 0; const n = 6;
  for (let x = 0; x < 10; x += step) for (let y = 0; y < 7; y += step) { let inside = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (inLeaf(x + (i + .5) * step / n, y + (j + .5) * step / n)) inside++; if (inside === n * n) full++; else if (inside > 0) partial++; }
  return {full, partial, estimate: (full + partial / 2) * step * step};
}

export const area: EngineLogic<AreaConfig> = {
  type: 'area', label: 'Shape transformation laboratory',
  parse: r => ({mode: str(r.mode, 'grid'), l: num(r.l, 5), w: num(r.w, 3), perimeter: num(r.perimeter, 24), base: num(r.base, 8), h: num(r.h, 5), slant: num(r.slant, 3), apex: num(r.apex, 3), a: num(r.a, 4), b: num(r.b, 8), shape: str(r.shape, 'L')}),
  validate: c => { const e: string[] = []; if ((c.mode === 'grid' || c.mode === 'perimeter') && (c.l > 12 || c.w > 7)) e.push('rectangle must fit the stage'); if (c.mode === 'perimeter-vs-area' && c.perimeter % 4 !== 0) e.push('perimeter divisible by 4 for a square'); if (c.mode === 'trapezoid' && c.a >= c.b) e.push('top shorter than bottom'); return e; },
  scenes: c => {
    switch (c.mode) {
      case 'perimeter': return [
        sc('intro', 'introduce', 'A garden fence', `A ${c.l} m by ${c.w} m garden.`, 5),
        sc('problem', 'problem', 'How much fence?', 'How long is the fence all the way around?', 5),
        sc('walk', 'explore', 'Walk the boundary', `${c.l} + ${c.w} + ${c.l} + ${c.w}: the walker adds each side.`, 9),
        sc('unroll', 'manipulate', 'Straighten the fence', 'Unfold the boundary into one straight line.', 8),
        sc('discover', 'discover', `${2 * (c.l + c.w)} m`, `Two lengths and two widths: ${2 * (c.l + c.w)} m.`, 6),
        sc('explain', 'explain', 'Perimeter formula', `C = (l + w) × 2 = (${c.l} + ${c.w}) × 2 = ${2 * (c.l + c.w)}. For a square, C = 4a.`, 7),
        sc('apply', 'apply', 'Your turn', 'Find perimeters.', 5)];
      case 'perimeter-vs-area': { const s = c.perimeter / 4; return [
        sc('intro', 'introduce', `${c.perimeter} m of fence`, `We have exactly ${c.perimeter} m of fence for a rectangular pen.`, 5),
        sc('problem', 'problem', 'Same fence, same space?', 'Will every rectangle we make enclose the same area?', 6),
        sc('morph', 'explore', 'Reshape the pen', `Long and thin: 1 × ${c.perimeter / 2 - 1}. Wider: 3 × ${c.perimeter / 2 - 3}…`, 11),
        sc('chart', 'manipulate', 'Record the areas', 'Each rectangle has the same perimeter but a different area.', 8),
        sc('discover', 'discover', 'The square wins', `${s} × ${s} = ${s * s} m² is the largest.`, 6),
        sc('explain', 'explain', 'Boundary vs surface', 'Perimeter measures length around (m); area measures surface inside (m²). They are different properties.', 8),
        sc('apply', 'apply', 'Your turn', 'Compare perimeter and area.', 5)]; }
      case 'parallelogram': return [
        sc('intro', 'introduce', 'A slanted field', `A parallelogram with base ${c.base} and height ${c.h}.`, 5),
        sc('problem', 'problem', 'Base × side?', `Is its area ${c.base} × (slanted side)? Predict the shape it can become.`, 6),
        sc('height', 'explore', 'Drop the height', 'Draw a perpendicular height from the top to the base.', 7),
        sc('cut', 'manipulate', 'Cut and slide', 'Cut off the triangle along the height and slide it to the other side.', 10),
        sc('discover', 'discover', 'A rectangle!', `A ${c.base} × ${c.h} rectangle: ${c.base * c.h} square units. Nothing was added or lost.`, 7),
        sc('explain', 'explain', 'S = a × h', 'Parallelogram area = base × height (the perpendicular height, not the slanted side).', 7),
        sc('apply', 'apply', 'Your turn', 'Find parallelogram areas.', 5)];
      case 'triangle': return [
        sc('intro', 'introduce', 'A triangle', `Base ${c.base}, height ${c.h}.`, 5),
        sc('problem', 'problem', 'Which shape is it half of?', 'Can two copies make a shape we already know?', 6),
        sc('copy', 'explore', 'Make a copy', 'Duplicate the triangle.', 6),
        sc('rotate', 'manipulate', 'Rotate and join', 'Turn the copy 180° and join it along a side.', 10),
        sc('discover', 'discover', 'A parallelogram', `Two triangles make a ${c.base} by ${c.h} parallelogram (${c.base * c.h}); one triangle is half: ${c.base * c.h / 2}.`, 7),
        sc('explain', 'explain', 'S = a × h ÷ 2', 'Triangle area = base × height ÷ 2. Moving the top point sideways keeps base and height, so the area stays the same.', 8),
        sc('apply', 'apply', 'Your turn', 'Find triangle areas.', 5)];
      case 'trapezoid': return [
        sc('intro', 'introduce', 'A trapezoid', `Top ${c.a}, bottom ${c.b}, height ${c.h}.`, 5),
        sc('problem', 'problem', 'Two different bases', 'Which base do we use? Predict the combined shape.', 6),
        sc('copy', 'explore', 'Duplicate', 'Make an identical copy.', 6),
        sc('rotate', 'manipulate', 'Rotate 180° and join', `The copy fits upside down: the new base is ${c.a} + ${c.b} = ${c.a + c.b}.`, 10),
        sc('discover', 'discover', 'A parallelogram', `Parallelogram: ${c.a + c.b} × ${c.h} = ${(c.a + c.b) * c.h}. One trapezoid is half: ${(c.a + c.b) * c.h / 2}.`, 7),
        sc('explain', 'explain', 'S = (a + b) × h ÷ 2', 'Trapezoid area = (top + bottom) × height ÷ 2.', 7),
        sc('apply', 'apply', 'Your turn', 'Find trapezoid areas.', 5)];
      case 'composite': return c.shape === 'house' ? [
        sc('intro', 'introduce', 'A house shape', 'A wall with a roof.', 5),
        sc('problem', 'problem', 'No single formula', 'No formula fits this shape directly. What can we do?', 5),
        sc('split', 'explore', 'Split into known shapes', 'A 6 × 4 rectangle and a triangle with base 6 and height 3.', 8),
        sc('parts', 'manipulate', 'Area of each part', '6 × 4 = 24 and 6 × 3 ÷ 2 = 9.', 8),
        sc('discover', 'discover', 'Add the parts', '24 + 9 = 33 square units.', 6),
        sc('explain', 'explain', 'Decompose or subtract', 'Composite area = sum of the parts (or a big shape minus the missing part).', 7),
        sc('apply', 'apply', 'Your turn', 'Find composite areas.', 5)] : [
        sc('intro', 'introduce', 'An L-shaped room', 'An L-shaped floor on a grid.', 5),
        sc('problem', 'problem', 'Rectangles hidden inside?', 'How can we find its area without counting every square?', 5),
        sc('split', 'explore', 'Cut it one way', 'Cut it into a 4 × 2 and a 2 × 3 rectangle: 8 + 6.', 8),
        sc('other', 'manipulate', 'Or another way', 'Or complete a 4 × 5 rectangle and subtract the missing 2 × 3: 20 − 6.', 9),
        sc('discover', 'discover', 'Same answer: 14', 'Both methods give 14 square units — rearranging never changes area.', 6),
        sc('explain', 'explain', 'Composite areas', 'Split into rectangles and add, or complete a rectangle and subtract.', 7),
        sc('apply', 'apply', 'Your turn', 'Find areas of L-shapes.', 5)];
      case 'units': return [
        sc('intro', 'introduce', 'Three square units', 'Square centimetre, square decimetre, square metre.', 5),
        sc('problem', 'problem', 'How many cm² in 1 dm²?', '1 dm = 10 cm. Is 1 dm² = 10 cm²?', 6),
        sc('fill', 'explore', 'Fill a square decimetre', 'One row holds 10 cm², and there are 10 rows.', 9),
        sc('zoom', 'manipulate', 'Zoom out to a metre', '1 m² is a 10 × 10 grid of dm².', 8),
        sc('discover', 'discover', '× 100, not × 10', '1 dm² = 100 cm²; 1 m² = 100 dm² = 10 000 cm².', 7),
        sc('explain', 'explain', 'Why 100', 'Area units are squares: 10 along × 10 down = 100.', 6),
        sc('apply', 'apply', 'Your turn', 'Convert area units.', 5)];
      case 'irregular': { const k = leafCounts(1); return [
        sc('intro', 'introduce', 'A leaf', 'A leaf on centimetre grid paper.', 5),
        sc('problem', 'problem', 'No formula for leaves', 'How can we estimate its area?', 5),
        sc('full', 'explore', 'Count full squares', `${k.full} squares are completely covered.`, 8),
        sc('partial', 'manipulate', 'Count partial squares', `${k.partial} squares are partly covered. On average, count each as half.`, 8),
        sc('discover', 'discover', `About ${k.estimate} cm²`, `${k.full} + ${k.partial} ÷ 2 ≈ ${k.estimate}.`, 6),
        sc('explain', 'explain', 'Estimating area', 'Full squares + half of the partial squares. A finer grid gives a better estimate.', 7),
        sc('apply', 'apply', 'Your turn', 'Estimate irregular areas.', 5)]; }
      default: return [
        sc('intro', 'introduce', 'A rectangle', `A rectangle ${c.l} units long and ${c.w} units wide.`, 5),
        sc('problem', 'problem', 'How much surface?', 'How can we measure how much flat space it covers?', 5),
        sc('tile', 'explore', 'Cover with unit squares', 'Tile it with 1 × 1 squares, no gaps, no overlaps.', 9),
        sc('rows', 'manipulate', 'Rows and columns', `${c.w} rows with ${c.l} squares in each.`, 7),
        sc('discover', 'discover', `${c.l * c.w} square units`, `${c.l} × ${c.w} = ${c.l * c.w}.`, 6),
        sc('explain', 'explain', 'Area of a rectangle', `S = l × w. A square: S = a × a. Units: cm², m².`, 7),
        sc('apply', 'apply', 'Your turn', 'Find areas.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'perimeter': return predict('The fence length is…', [['a', `${2 * (c.l + c.w)} m`], ['b', `${c.l + c.w} m`], ['c', `${c.l * c.w} m`]], 'a', 'Two lengths and two widths.', 4);
      case 'perimeter-vs-area': return predict('Which pen encloses the most area?', [['a', 'The long thin one'], ['b', 'The square one'], ['c', 'They are all equal']], 'b', 'Closer to a square means more area for the same fence.', 4);
      case 'parallelogram': return predict('After cutting and sliding, the shape becomes a…', [['a', `Rectangle ${c.base} × ${c.h}`], ['b', `Rectangle ${c.base} × ${Math.round(Math.hypot(c.slant, c.h) * 10) / 10}`], ['c', 'Triangle']], 'a', 'The height becomes the width.', 3);
      case 'triangle': return predict('Two identical triangles together make a…', [['a', 'Parallelogram'], ['b', 'Circle'], ['c', 'Bigger triangle always']], 'a', 'Rotated 180° they fit into a parallelogram.', 3);
      case 'trapezoid': return predict('Two identical trapezoids joined make a parallelogram with base…', [['a', `${c.a + c.b}`], ['b', `${c.b}`], ['c', `${c.b - c.a}`]], 'a', 'Top and bottom line up.', 3);
      case 'composite': return predict('Will splitting a different way change the total?', [['a', 'No'], ['b', 'Yes']], 'a', 'Area does not depend on how we cut.', 3);
      case 'units': return predict('1 dm² = ? cm²', [['a', '100'], ['b', '10'], ['c', '1000']], 'a', '10 rows of 10.', 2);
      case 'irregular': return predict('A partly covered square should count as…', [['a', 'About half'], ['b', 'Always 1'], ['c', 'Always 0']], 'a', 'Over many squares, partial pieces average about half.', 3);
      default: return predict(`How many unit squares fit in ${c.l} × ${c.w}?`, [['a', String(c.l * c.w)], ['b', String(2 * (c.l + c.w))], ['c', String(c.l + c.w)]], 'a', 'Rows × columns.', 3);
    }
  },
  challenge: (c, r) => {
    const a = int(r, 3, 12), b = int(r, 2, 9), h = int(r, 2, 9);
    switch (c.mode) {
      case 'perimeter': return pick(r, [0, 1]) ? {prompt: `Perimeter of a ${a} × ${b} rectangle?`, kind: 'number', answer: 2 * (a + b), hint: '(l + w) × 2', explanation: `(${a} + ${b}) × 2 = ${2 * (a + b)}.`} : {prompt: `A square has perimeter ${4 * a}. Side length?`, kind: 'number', answer: a, hint: '÷ 4', explanation: `${4 * a} ÷ 4 = ${a}.`};
      case 'perimeter-vs-area': { const s = int(r, 3, 9); return {prompt: `Largest rectangular area with ${4 * s} m of fence?`, kind: 'number', answer: s * s, unit: 'm²', hint: 'Make a square.', explanation: `${s} × ${s} = ${s * s}.`}; }
      case 'parallelogram': return {prompt: `Parallelogram: base ${a}, height ${h}. Area?`, kind: 'number', answer: a * h, hint: 'base × height', explanation: `${a} × ${h} = ${a * h}.`};
      case 'triangle': return {prompt: `Triangle: base ${a}, height ${h}. Area?`, kind: 'number', answer: a * h / 2, tolerance: 1e-9, hint: 'base × height ÷ 2', explanation: `${a} × ${h} ÷ 2 = ${a * h / 2}.`};
      case 'trapezoid': { const top = Math.min(a, b), bot = Math.max(a, b) + 1; return {prompt: `Trapezoid: top ${top}, bottom ${bot}, height ${h}. Area?`, kind: 'number', answer: (top + bot) * h / 2, tolerance: 1e-9, hint: '(a + b) × h ÷ 2', explanation: `(${top} + ${bot}) × ${h} ÷ 2 = ${(top + bot) * h / 2}.`}; }
      case 'composite': { const W1 = a + 2, H1 = b, cut = int(r, 1, a), cutH = int(r, 1, b - 1); return {prompt: `A ${W1} × ${H1} rectangle has a ${cut} × ${cutH} corner removed. Area?`, kind: 'number', answer: W1 * H1 - cut * cutH, hint: 'Big rectangle minus the missing part.', explanation: `${W1 * H1} − ${cut * cutH} = ${W1 * H1 - cut * cutH}.`}; }
      case 'units': { const [q, ans] = pick(r, [[`${a} dm² = ? cm²`, a * 100], [`${a} m² = ? dm²`, a * 100], [`${a * 100} cm² = ? dm²`, a], [`${a} m² = ? cm²`, a * 10000]] as const); return {prompt: q, kind: 'number', answer: ans, hint: 'Each step between area units is × 100.', explanation: `${ans}.`}; }
      case 'irregular': { const f = int(r, 10, 30), p = int(r, 4, 16) * 2; return {prompt: `${f} full squares and ${p} partial squares. Estimated area?`, kind: 'number', answer: f + p / 2, hint: 'Count partial squares as half.', explanation: `${f} + ${p} ÷ 2 = ${f + p / 2}.`}; }
      default: return {prompt: `Area of a ${a} cm × ${b} cm rectangle?`, kind: 'number', answer: a * b, unit: 'cm²', hint: 'length × width', explanation: `${a} × ${b} = ${a * b}.`};
    }
  },
  describe: c => `Shape transformation (${c.mode}) on a unit grid; pieces are cut, rotated and translated while staying visible.`,
};

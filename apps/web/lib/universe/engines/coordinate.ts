import type {EngineLogic} from '../types';
import {int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type CoordMode = 'pairs' | 'directions' | 'bearing';
export interface CoordConfig {mode: CoordMode; x: number; y: number; angle: number; distance: number}
export const DIRS: Record<string, [number, number]> = {N: [0, 1], S: [0, -1], E: [1, 0], W: [-1, 0]};
export const ROUTE: [keyof typeof DIRS, number][] = [['E', 3], ['N', 2], ['E', 2], ['S', 1]];

export const coordinate: EngineLogic<CoordConfig> = {
  type: 'coordinate', label: 'Coordinate universe',
  parse: r => ({mode: str(r.mode, 'pairs'), x: num(r.x, 3), y: num(r.y, 5), angle: num(r.angle, 30), distance: num(r.distance, 300)}),
  validate: c => (c.mode === 'pairs' && (c.x < 0 || c.y < 0 || c.x > 9 || c.y > 7) ? ['point must lie on the grid'] : []),
  scenes: c => {
    switch (c.mode) {
      case 'directions': return [
        sc('intro', 'introduce', 'The geometric city', 'A city map with north at the top.', 5),
        sc('problem', 'problem', 'Find the library', 'How do we tell a robot how to get from home to the library?', 5),
        sc('compass', 'explore', 'Four directions', 'North up, south down, east right, west left — on every map.', 7),
        sc('route', 'manipulate', 'Follow the route', `Go ${ROUTE.map(([d, n]) => `${n} blocks ${({N: 'north', S: 'south', E: 'east', W: 'west'} as const)[d]}`).join(', then ')}.`, 10),
        sc('discover', 'discover', 'Directions are fixed', 'Turning around does not change where north is; left and right do change.', 7),
        sc('explain', 'explain', 'Describing routes', 'Give a direction and a distance for each part of the route.', 7),
        sc('apply', 'apply', 'Your turn', 'Plan routes.', 5)];
      case 'bearing': return [
        sc('intro', 'introduce', 'The lighthouse', 'A boat sees a lighthouse across the bay.', 5),
        sc('problem', 'problem', 'Exactly where?', '“North-east” is too vague. How can we be precise?', 5),
        sc('north', 'explore', 'Start facing north', 'Point at north, then turn towards east.', 8),
        sc('turn', 'manipulate', `Turn ${c.angle}°`, `Turn ${c.angle}° towards east and walk ${c.distance} m.`, 8),
        sc('discover', 'discover', `北偏东${c.angle}°, ${c.distance} m`, `${c.angle}° east of north, ${c.distance} metres away.`, 7),
        sc('explain', 'explain', 'Direction + angle + distance', 'Name the starting direction (north or south), the turn towards east or west, and the distance.', 8),
        sc('apply', 'apply', 'Your turn', 'Describe and follow positions.', 5)];
      default: return [
        sc('intro', 'introduce', 'The classroom grid', 'Desks arranged in columns and rows.', 5),
        sc('problem', 'problem', 'Where is the star?', 'How can two numbers pin down one seat?', 5),
        sc('column', 'explore', `Column ${c.x}`, `Count columns from the left: ${c.x}.`, 7),
        sc('row', 'manipulate', `Row ${c.y}`, `Then count rows from the bottom: ${c.y}.`, 7),
        sc('discover', 'discover', `(${c.x}, ${c.y})`, `The ordered pair (${c.x}, ${c.y}) means column ${c.x}, row ${c.y}. (${c.y}, ${c.x}) is a different place!`, 7),
        sc('explain', 'explain', 'Ordered pairs', 'Write (column, row). The order matters.', 6),
        sc('apply', 'apply', 'Your turn', 'Plot and read points.', 5)];
    }
  },
  prediction: c => c.mode === 'pairs' ? predict(`Are (${c.x}, ${c.y}) and (${c.y}, ${c.x}) the same place?`, [['a', 'No'], ['b', 'Yes']], c.x === c.y ? 'b' : 'a', 'Column first, then row.', 4)
    : c.mode === 'bearing' ? predict(`北偏东${c.angle}° is measured from…`, [['a', 'North, turning east'], ['b', 'East, turning north']], 'a', 'The first word is the starting direction.', 3)
      : predict('On a map, east is on the…', [['a', 'Right'], ['b', 'Left'], ['c', 'Top']], 'a', 'North up, east right.', 2),
  challenge: (c, r) => {
    if (c.mode === 'pairs') { const x = int(r, 1, 8), y = int(r, 1, 7); return {prompt: `Start at (${x}, ${y}). Move 2 columns right and 1 row up. New column number?`, kind: 'number', answer: x + 2, hint: 'Columns are the first number.', explanation: `(${x + 2}, ${y + 1}).`}; }
    if (c.mode === 'bearing') { const a = pick(r, [30, 40, 45, 60]); return {prompt: `A point is 北偏东${a}°. What angle does that direction make with east?`, kind: 'number', answer: 90 - a, unit: '°', hint: 'North to east is 90°.', explanation: `90 − ${a} = ${90 - a}°.`}; }
    const n = int(r, 2, 6), e = int(r, 2, 6); return {prompt: `Walk ${n} blocks north, then ${e} blocks east, then ${n} blocks south. How many blocks from the start are you?`, kind: 'number', answer: e, hint: 'North and south cancel.', explanation: `${e} blocks east.`};
  },
  describe: c => c.mode === 'pairs' ? `Grid with columns and rows; point (${c.x}, ${c.y}).` : c.mode === 'bearing' ? `Compass rose with a direction ${c.angle}° east of north at ${c.distance} m.` : 'City map with compass directions and a route.',
};

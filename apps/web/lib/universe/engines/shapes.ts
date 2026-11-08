import type {EngineLogic} from '../types';
import {pick, str} from '../math';
import {sc, predict} from './util';

export type ShapesMode = 'classify' | 'compose' | 'position' | 'city';
export interface ShapesConfig {mode: ShapesMode}
export const PLANE = [
  {name: 'square', sides: 4, corners: 4}, {name: 'rectangle', sides: 4, corners: 4}, {name: 'triangle', sides: 3, corners: 3},
  {name: 'circle', sides: 0, corners: 0}, {name: 'parallelogram', sides: 4, corners: 4},
] as const;
export const CITY_PARTS = [{shape: 'rectangle', n: 3}, {shape: 'square', n: 4}, {shape: 'triangle', n: 2}, {shape: 'circle', n: 1}, {shape: 'parallelogram', n: 1}];

export const shapes: EngineLogic<ShapesConfig> = {
  type: 'shapes', label: 'Shape world',
  parse: r => ({mode: str(r.mode, 'classify')}),
  validate: () => [],
  scenes: c => {
    switch (c.mode) {
      case 'compose': return [
        sc('intro', 'introduce', 'A box of pieces', 'Triangles, squares and rectangles in a puzzle box.', 5),
        sc('problem', 'problem', 'What can we build?', 'Which pieces fit together to make a square? A house? A rocket?', 6),
        sc('two', 'explore', 'Two triangles', 'Two identical triangles meet along their long sides: a square.', 8),
        sc('rocket', 'manipulate', 'Build a rocket', 'A rectangle body, a triangle nose and two triangle fins.', 9),
        sc('discover', 'discover', 'Shapes combine and split', 'Big shapes can be made of smaller ones, and split back into them.', 6),
        sc('explain', 'explain', 'Composing shapes', 'Turning or sliding a piece does not change its shape — only its position.', 7),
        sc('apply', 'apply', 'Your turn', 'Build and split shapes.', 5)];
      case 'position': return [
        sc('intro', 'introduce', 'A toy shelf', 'A cat, a ball, a box and a teddy on a shelf.', 5),
        sc('problem', 'problem', 'Where is the ball?', 'How can we tell a friend exactly where the ball is?', 5),
        sc('updown', 'explore', 'Above and below', 'The cat is above the box; the box is below the cat.', 8),
        sc('leftright', 'manipulate', 'Left and right', 'The ball is left of the box — from our side. From the teddy’s side it is on the right!', 9),
        sc('discover', 'discover', 'Position is a relationship', 'Every position word compares two things and depends on who is looking.', 7),
        sc('explain', 'explain', 'Position words', 'above/below, left/right, in front of/behind: always say “compared with what”.', 7),
        sc('apply', 'apply', 'Your turn', 'Describe positions.', 5)];
      case 'city': return [
        sc('intro', 'introduce', 'The geometric city', 'Buildings, roads and a sun in the sky.', 5),
        sc('problem', 'problem', 'What is it made of?', 'Which basic shapes build this city?', 5),
        sc('explode', 'explore', 'Take a building apart', 'Pieces slide apart: rectangles, squares, triangles…', 9),
        sc('count', 'manipulate', 'Count each shape', CITY_PARTS.map(p => `${p.n} ${p.shape}${p.n > 1 ? 's' : ''}`).join(', ') + '.', 8),
        sc('discover', 'discover', 'Complex = simple pieces', 'Even complicated pictures decompose into a few basic shapes.', 6),
        sc('explain', 'explain', 'Composition and decomposition', 'A square is a special rectangle; overlapping lines can hide shapes — look carefully.', 7),
        sc('apply', 'apply', 'Your turn', 'Count shapes in pictures.', 5)];
      default: return [
        sc('intro', 'introduce', 'Faces of solids', 'Press the faces of blocks into clay.', 5),
        sc('problem', 'problem', 'Name the prints', 'What flat shapes appear?', 5),
        sc('prints', 'explore', 'Prints', 'Square, rectangle, triangle, circle, parallelogram.', 8),
        sc('turn', 'manipulate', 'Turn a square', 'A square turned on its corner is still a square — four equal sides, four right angles.', 8),
        sc('discover', 'discover', 'Sides and corners', 'Triangles: 3 sides, 3 corners. Four-sided shapes: 4 and 4. Circles: no straight sides.', 7),
        sc('explain', 'explain', 'Classifying shapes', 'Name shapes by their sides and corners, not by how they are turned or how big they are.', 7),
        sc('apply', 'apply', 'Your turn', 'Classify shapes.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'compose': return predict('Two identical right triangles can make a…', [['a', 'Square'], ['b', 'Circle'], ['c', 'Nothing']], 'a', 'Joined along the long side.', 2);
      case 'position': return predict('The ball is on our left. For the teddy facing us, the ball is on its…', [['a', 'Right'], ['b', 'Left']], 'a', 'Facing each other swaps left and right.', 3);
      case 'city': return predict('Which shape is used most in this city?', [['a', 'Square'], ['b', 'Circle'], ['c', 'Triangle']], 'a', '4 squares.', 3);
      default: return predict('A square turned on its corner is a…', [['a', 'Square'], ['b', 'Diamond, not a square']], 'a', 'Turning does not change sides or angles.', 3);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'compose': return pick(r, [0, 1]) ? {prompt: 'Two equal squares side by side make a…', kind: 'choice', options: ['Rectangle', 'Triangle', 'Circle'], answer: 'Rectangle', hint: 'Twice as long as wide.', explanation: 'A rectangle.'} : {prompt: 'Cutting a square corner to corner once makes how many triangles?', kind: 'number', answer: 2, hint: 'One cut, two pieces.', explanation: '2.'};
      case 'position': { const [q, a] = pick(r, [['The lamp hangs over the table. The table is ___ the lamp.', 'below'], ['A bird sits on a roof. The bird is ___ the roof.', 'above'], ['You stand in front of a door. The door is ___ you.', 'behind']] as const); return {prompt: q, kind: 'choice', options: ['above', 'below', 'behind'], answer: a, hint: 'Swap the viewpoint.', explanation: a + '.'}; }
      case 'city': return {prompt: 'A house is a square with a triangle roof and a rectangle door. How many shapes?', kind: 'number', answer: 3, hint: 'Count each piece.', explanation: '3.'};
      default: { const s = pick(r, PLANE.filter(p => p.sides > 0)); return {prompt: `How many corners does a ${s.name} have?`, kind: 'number', answer: s.corners, hint: 'Count where sides meet.', explanation: `${s.corners}.`}; }
    }
  },
  describe: c => `Shape world (${c.mode}): flat shapes that move, turn, combine and split.`,
};

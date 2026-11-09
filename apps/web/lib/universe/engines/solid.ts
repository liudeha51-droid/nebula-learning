import type {EngineLogic} from '../types';
import {fix, fmt, int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type SolidMode = 'explore' | 'views' | 'unit-cubes' | 'fev' | 'net' | 'surface' | 'capacity' | 'cylinder-net' | 'cylinder-volume' | 'cone-pour';
export interface SolidConfig {mode: SolidMode; shape: string; l: number; w: number; h: number; r: number}
export type V3 = [number, number, number];

/** Cuboid net folded by angle t (0 = flat, 1 = closed). Base l×w on the ground; returns labelled faces. */
export function foldNet(l: number, w: number, h: number, t: number): {name: string; pts: V3[]; area: number}[] {
  const a = t * Math.PI / 2, c = Math.cos(a), s = Math.sin(a), c2 = Math.cos(2 * a), s2 = Math.sin(2 * a);
  const quad = (f: (u: number, v: number) => V3, U: number, Vv: number): V3[] => [f(0, 0), f(U, 0), f(U, Vv), f(0, Vv)];
  return [
    {name: 'bottom', pts: quad((u, v) => [u, v, 0], l, w), area: l * w},
    {name: 'right', pts: quad((u, v) => [l + u * c, v, u * s], h, w), area: h * w},
    {name: 'top', pts: quad((u, v) => [l + h * c + u * c2, v, h * s + u * s2], l, w), area: l * w},
    {name: 'left', pts: quad((u, v) => [-u * c, v, u * s], h, w), area: h * w},
    {name: 'back', pts: quad((u, v) => [u, w + v * c, v * s], l, h), area: l * h},
    {name: 'front', pts: quad((u, v) => [u, -v * c, v * s], l, h), area: l * h},
  ];
}
export const surfaceArea = (l: number, w: number, h: number) => 2 * (l * w + l * h + w * h);
const PI = 3.14;

export const solid: EngineLogic<SolidConfig> = {
  type: 'solid', label: '3D construction laboratory',
  parse: r => ({mode: str(r.mode, 'explore'), shape: str(r.shape, 'cube'), l: num(r.l, 4), w: num(r.w, 3), h: num(r.h, 2), r: num(r.r, 3)}),
  validate: c => (c.l * c.w * c.h > 1000 || c.r <= 0 ? ['solid too large or radius invalid'] : []),
  scenes: c => {
    const {l, w, h, r} = c;
    switch (c.mode) {
      case 'views': return [
        sc('intro', 'introduce', 'An object on the table', c.shape === 'stack' ? 'A small stack of cubes.' : 'A cylinder standing upright.', 5),
        sc('problem', 'problem', 'Different views', 'What do you see from the front, from the side and from the top?', 5),
        sc('front', 'explore', 'From the front', 'Walk round to the front: only the front faces show.', 7),
        sc('side', 'manipulate', 'From the side and the top', 'Now the left side, and from directly above.', 9),
        sc('discover', 'discover', 'Three flat views', c.shape === 'stack' ? 'Each view is a flat pattern of squares; hidden cubes do not appear.' : 'Front and side: rectangles. Top: a circle.', 7),
        sc('explain', 'explain', 'Views carry information', 'Combining views tells us about the 3D object, but one view alone can fit many objects.', 7),
        sc('apply', 'apply', 'Your turn', 'Match views to objects.', 5)];
      case 'unit-cubes': case 'capacity': { const cap = c.mode === 'capacity'; return [
        sc('intro', 'introduce', cap ? 'A water tank' : 'Unit cubes', cap ? `A tank ${l} × ${w} × ${h} dm inside.` : 'Cubes 1 cm on each side: 1 cm³ each.', 5),
        sc('problem', 'problem', cap ? 'How much water?' : 'How much space?', cap ? 'How many litres can the tank hold?' : `How many unit cubes fill a ${l} × ${w} × ${h} box?`, 5),
        sc('layer', 'explore', 'One layer', `The bottom layer is ${l} × ${w} = ${l * w} cubes.`, 8),
        sc('stack', 'manipulate', 'Stack the layers', `${h} layers of ${l * w}.`, 8),
        sc('discover', 'discover', `${l * w * h} cubes`, `${l} × ${w} × ${h} = ${l * w * h}.`, 6),
        sc('explain', 'explain', cap ? 'Capacity' : 'V = l × w × h', cap ? `${l * w * h} dm³ = ${l * w * h} L. 1 L = 1 dm³ = 1000 mL = 1000 cm³.` : `Volume = length × width × height. For a cube, V = a³. 1 dm³ = 1000 cm³.`, 8),
        sc('apply', 'apply', 'Your turn', 'Find volumes.', 5)]; }
      case 'fev': return [
        sc('intro', 'introduce', 'A cuboid', 'A box shape: a cuboid.', 5),
        sc('problem', 'problem', 'Count its parts', 'How many faces, edges and vertices?', 5),
        sc('faces', 'explore', 'Faces', '6 rectangular faces, opposite faces identical.', 7),
        sc('edges', 'manipulate', 'Edges and vertices', '12 edges in three groups of 4 equal edges; 8 corners.', 8),
        sc('discover', 'discover', '6 · 12 · 8', `Faces 6, edges 12, vertices 8. Total edge length = (${l} + ${w} + ${h}) × 4 = ${(l + w + h) * 4}.`, 7),
        sc('explain', 'explain', 'Cubes too', 'A cube is a special cuboid with 6 equal square faces and 12 equal edges.', 6),
        sc('apply', 'apply', 'Your turn', 'Use faces and edges.', 5)];
      case 'net': case 'surface': { const s = c.mode === 'surface'; const L = s ? l : 1, Wd = s ? w : 1, Hh = s ? h : 1; return [
        sc('intro', 'introduce', s ? 'A gift box' : 'A cube', s ? `A ${l} × ${w} × ${h} box.` : 'A cube made of thin card.', 5),
        sc('problem', 'problem', s ? 'How much paper?' : 'Can it lie flat?', s ? 'How much wrapping paper covers every face exactly once?' : 'Cut some edges and unfold it. What flat shape appears?', 6),
        sc('unfold', 'explore', 'Unfold', 'The faces swing open along their hinges.', 9),
        sc('net', 'manipulate', 'The net', s ? `Six rectangles: two ${l}×${w}, two ${l}×${h}, two ${w}×${h}.` : 'Six squares in a cross shape — one of 11 possible cube nets.', 8),
        sc('discover', 'discover', s ? `${surfaceArea(L, Wd, Hh)} square units` : 'Fold it back', s ? `2 × (${l * w} + ${l * h} + ${w * h}) = ${surfaceArea(l, w, h)}. Volume is ${l * w * h} cubes — a different quantity.` : 'Every face finds its place; opposite faces are never neighbours in the net.', 8),
        sc('explain', 'explain', s ? 'Surface area' : 'Nets', s ? 'Surface area = 2(lw + lh + wh) counts squares on the outside; volume counts cubes inside.' : 'A net is a flat pattern that folds into a solid without overlaps.', 7),
        sc('apply', 'apply', 'Your turn', s ? 'Calculate surface areas.' : 'Spot valid nets.', 5)]; }
      case 'cylinder-net': return [
        sc('intro', 'introduce', 'A can', `A cylinder: radius ${r}, height ${h}.`, 5),
        sc('problem', 'problem', 'Peel the label', 'If we cut the label straight down and unroll it, what shape is it?', 6),
        sc('unroll', 'explore', 'Unroll the curved surface', 'It unrolls into a rectangle.', 9),
        sc('match', 'manipulate', 'Match the edges', `The rectangle’s length wraps once around the base: C = 2πr = ${fmt(2 * PI * r)}. Its width is the height ${h}.`, 9),
        sc('discover', 'discover', 'Lateral area', `${fmt(2 * PI * r)} × ${h} = ${fmt(fix(2 * PI * r * h))}.`, 6),
        sc('explain', 'explain', 'Surface area', `Lateral 2πrh plus two circles 2πr²: total ${fmt(fix(2 * PI * r * h + 2 * PI * r * r))}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Find cylinder surface areas.', 5)];
      case 'cylinder-volume': return [
        sc('intro', 'introduce', 'A cylinder', `Radius ${r}, height ${h}.`, 5),
        sc('problem', 'problem', 'Volume without corners', 'We know cuboid volume. Can a cylinder become a cuboid?', 6),
        sc('slice', 'explore', 'Slice like a cake', 'Cut it into many thin wedges from top to bottom.', 8),
        sc('arrange', 'manipulate', 'Rearrange', 'Alternate the wedges: an almost-cuboid with length πr, width r, height h.', 9),
        sc('discover', 'discover', 'Base × height', `πr × r × h = πr²h = 3.14 × ${r * r} × ${h} = ${fmt(fix(PI * r * r * h))}.`, 7),
        sc('explain', 'explain', 'V = Sh', 'Cylinder volume = base area × height. Irregular objects: sink them in water and measure how much the level rises.', 8),
        sc('apply', 'apply', 'Your turn', 'Calculate cylinder volumes.', 5)];
      case 'cone-pour': return [
        sc('intro', 'introduce', 'Cone and cylinder', 'A transparent cone and cylinder with the same base and the same height.', 6),
        sc('problem', 'problem', 'How many cones?', 'How many cones of water will fill the cylinder?', 6),
        sc('pour1', 'explore', 'First pour', 'Fill the cone and pour it in.', 8),
        sc('pour23', 'manipulate', 'Keep pouring', 'Again… and again.', 10),
        sc('discover', 'discover', 'Exactly three', 'Three full cones fill the cylinder: the cone holds one third.', 7),
        sc('explain', 'explain', 'V = ⅓Sh', `Cone volume = ⅓ × base area × height = ⅓ × 3.14 × ${r * r} × ${h} = ${fmt(fix(PI * r * r * h / 3))}. Only true when base and height are equal.`, 9),
        sc('apply', 'apply', 'Your turn', 'Calculate cone volumes.', 5)];
      default: return [
        sc('intro', 'introduce', 'Four solids', 'A cube, a cuboid, a cylinder and a sphere.', 5),
        sc('problem', 'problem', 'How are they different?', 'Which can roll? Which can stack?', 5),
        sc('rotate', 'explore', 'Turn them around', 'Rotate each solid and look at its faces.', 9),
        sc('trace', 'manipulate', 'Trace the faces', 'Press each flat face on paper: squares, rectangles, circles. A sphere has no flat face.', 8),
        sc('discover', 'discover', 'Flat faces stack, curves roll', 'Cubes and cuboids stack; spheres roll in every direction; cylinders roll one way and stack.', 7),
        sc('explain', 'explain', 'Names', 'Cube: 6 equal squares. Cuboid: 6 rectangles. Cylinder: 2 circles and a curved surface. Sphere: one curved surface.', 8),
        sc('apply', 'apply', 'Your turn', 'Name solids.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'views': return predict(c.shape === 'stack' ? 'Can you see every cube from the front?' : 'Seen from the top, the cylinder looks like a…', c.shape === 'stack' ? [['a', 'No, some hide behind others'], ['b', 'Yes, always']] : [['a', 'Circle'], ['b', 'Rectangle']], 'a', 'A view only shows what faces the viewer.', 2);
      case 'unit-cubes': case 'capacity': return predict(`How many cubes in a ${c.l} × ${c.w} × ${c.h} box?`, [['a', String(c.l * c.w * c.h)], ['b', String(surfaceArea(c.l, c.w, c.h))], ['c', String(c.l + c.w + c.h)]], 'a', 'Layers × cubes per layer.', 3);
      case 'fev': return predict('How many edges does a cuboid have?', [['a', '12'], ['b', '8'], ['c', '6']], 'a', '4 on top, 4 on the bottom, 4 upright.', 3);
      case 'net': return predict('Unfolded, a cube becomes…', [['a', '6 connected squares'], ['b', '4 squares'], ['c', 'One big square']], 'a', 'One square per face.', 2);
      case 'surface': return predict('Do surface area and volume measure the same thing?', [['a', 'No'], ['b', 'Yes']], 'a', 'Squares outside vs cubes inside.', 3);
      case 'cylinder-net': return predict('The unrolled label is a…', [['a', 'Rectangle'], ['b', 'Circle'], ['c', 'Triangle']], 'a', 'Straight cut, straight edges.', 2);
      case 'cylinder-volume': return predict('The rearranged wedges look like a…', [['a', 'Cuboid'], ['b', 'Cone'], ['c', 'Sphere']], 'a', 'Like the circle-to-rectangle trick, in 3D.', 3);
      case 'cone-pour': return predict('How many cones of water fill the cylinder?', [['a', '2'], ['b', '3'], ['c', '4']], 'b', 'Equal base and height: three cones.', 2);
      default: return predict('Which solid can roll in every direction?', [['a', 'Sphere'], ['b', 'Cylinder'], ['c', 'Cube']], 'a', 'It is curved everywhere.', 3);
    }
  },
  challenge: (c, r) => {
    const a = int(r, 2, 8), b = int(r, 2, 6), d = int(r, 2, 5), rr = int(r, 1, 5), hh = int(r, 2, 10);
    switch (c.mode) {
      case 'unit-cubes': return {prompt: `Volume of a ${a} × ${b} × ${d} cuboid (cm³)?`, kind: 'number', answer: a * b * d, hint: 'l × w × h', explanation: `${a * b * d}.`};
      case 'capacity': return pick(r, [0, 1]) ? {prompt: `A tank is ${a} dm × ${b} dm × ${d} dm inside. Capacity in litres?`, kind: 'number', answer: a * b * d, hint: '1 dm³ = 1 L', explanation: `${a * b * d} L.`} : {prompt: `${a}.${b} L = ? mL`, kind: 'number', answer: a * 1000 + b * 100, hint: '× 1000', explanation: `${a * 1000 + b * 100} mL.`};
      case 'fev': return {prompt: `Total edge length of a ${a} × ${b} × ${d} cuboid?`, kind: 'number', answer: 4 * (a + b + d), hint: '(l + w + h) × 4', explanation: `${4 * (a + b + d)}.`};
      case 'net': return {prompt: 'How many faces must a cube net have?', kind: 'number', answer: 6, hint: 'One per face.', explanation: '6.'};
      case 'surface': return {prompt: `Surface area of a ${a} × ${b} × ${d} cuboid?`, kind: 'number', answer: surfaceArea(a, b, d), hint: '2(lw + lh + wh)', explanation: `2 × (${a * b} + ${a * d} + ${b * d}) = ${surfaceArea(a, b, d)}.`};
      case 'cylinder-net': return {prompt: `Cylinder r = ${rr}, h = ${hh}. Lateral area (π = 3.14)?`, kind: 'number', answer: fix(2 * PI * rr * hh), tolerance: .001, hint: '2πr × h', explanation: `${fmt(fix(2 * PI * rr * hh))}.`};
      case 'cylinder-volume': return {prompt: `Cylinder r = ${rr}, h = ${hh}. Volume (π = 3.14)?`, kind: 'number', answer: fix(PI * rr * rr * hh), tolerance: .001, hint: 'πr²h', explanation: `${fmt(fix(PI * rr * rr * hh))}.`};
      case 'cone-pour': return pick(r, [0, 1]) ? {prompt: `A cylinder holds ${3 * a * 10} mL. A cone with the same base and height holds?`, kind: 'number', answer: a * 10, unit: 'mL', hint: 'One third.', explanation: `${a * 10} mL.`} : {prompt: `Cone r = 3, h = ${3 * d}. Volume (π = 3.14)?`, kind: 'number', answer: fix(PI * 9 * 3 * d / 3), tolerance: .001, hint: '⅓πr²h', explanation: `${fmt(fix(PI * 9 * d))}.`};
      case 'views': return {prompt: 'An upright cylinder seen from the front looks like a…', kind: 'choice', options: ['Rectangle', 'Circle', 'Triangle'], answer: 'Rectangle', hint: 'Look at it from the side.', explanation: 'Rectangle.'};
      default: return {prompt: 'Which solid has 6 equal square faces?', kind: 'choice', options: ['Cube', 'Cuboid', 'Cylinder', 'Sphere'], answer: 'Cube', hint: 'All faces equal squares.', explanation: 'A cube.'};
    }
  },
  describe: c => `3D solid (${c.mode}${c.shape ? `, ${c.shape}` : ''}) drawn with a rotatable projection; drag to rotate.`,
};

import type {EngineLogic} from '../types';
import {fix, fmt, int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type CircleMode = 'parts' | 'circumference' | 'area' | 'cake' | 'annulus';
export interface CircleConfig {mode: CircleMode; r: number; d1: number; d2: number; R: number}
export const PI = 3.14;
export const circleArea = (r: number) => fix(PI * r * r);

export const circle: EngineLogic<CircleConfig> = {
  type: 'circle', label: 'Circular geometry laboratory',
  parse: raw => ({mode: str(raw.mode, 'parts'), r: num(raw.r, 3), d1: num(raw.d1, 15), d2: num(raw.d2, 30), R: num(raw.R, 5)}),
  validate: c => { const e: string[] = []; if (c.r <= 0) e.push('radius > 0'); if (c.mode === 'cake' && c.d2 <= c.d1) e.push('second cake larger'); if (c.mode === 'annulus' && c.R <= c.r) e.push('R > r'); return e; },
  scenes: c => {
    switch (c.mode) {
      case 'circumference': return [
        sc('intro', 'introduce', 'A wheel', `A wheel with diameter ${2 * c.r}.`, 5),
        sc('problem', 'problem', 'Around the edge', 'How long is the edge compared with the diameter?', 5),
        sc('roll', 'explore', 'Roll one turn', 'Roll the wheel exactly one full turn and mark the distance.', 9),
        sc('measure', 'manipulate', 'Lay diameters along it', 'Lay copies of the diameter along the unrolled edge: 1, 2, 3… and a little more.', 9),
        sc('discover', 'discover', 'A bit more than 3', 'For every circle, circumference ÷ diameter is the same number: π ≈ 3.14.', 7),
        sc('explain', 'explain', 'C = πd = 2πr', `C = 3.14 × ${2 * c.r} = ${fmt(PI * 2 * c.r)}.`, 7),
        sc('apply', 'apply', 'Your turn', 'Find circumferences.', 5)];
      case 'area': return [
        sc('intro', 'introduce', 'A circular garden', `A circle of radius ${c.r}.`, 5),
        sc('problem', 'problem', 'No straight sides', 'How can we find the area of a shape with no straight sides?', 5),
        sc('cut', 'explore', 'Cut into sectors', 'Cut the circle into equal sectors like pizza slices.', 8),
        sc('arrange', 'manipulate', 'Alternate the slices', 'Lay them point up, point down. With more slices the shape becomes more like a rectangle.', 11),
        sc('discover', 'discover', 'Length πr, width r', 'The long side is half the circumference (πr); the short side is the radius (r).', 7),
        sc('explain', 'explain', 'S = πr²', `πr × r = πr². Here 3.14 × ${c.r}² = ${fmt(circleArea(c.r))}.`, 7),
        sc('apply', 'apply', 'Your turn', 'Find circle areas.', 5)];
      case 'cake': { const k = (c.d2 / c.d1) ** 2; return [
        sc('intro', 'introduce', 'Two cakes', 'Two round cakes on the table.', 5),
        sc('problem', 'problem', 'Which has more?', 'Which cake has more cake on top? Estimate before measuring.', 6),
        sc('diameters', 'explore', 'Measure across', `Diameters: ${c.d1} cm and ${c.d2} cm. The big cake is ${fmt(c.d2 / c.d1)} times as wide.`, 7),
        sc('grid', 'explore', 'Square grids', `Lay a square grid over each cake: roughly ${fmt(Math.round(circleArea(c.d1 / 2)))} cm² and ${fmt(Math.round(circleArea(c.d2 / 2)))} cm².`, 8),
        sc('rearrange', 'manipulate', 'Re-shape the cakes', 'Cut each cake into thin sectors and rearrange into near-rectangles: length πr, width r. Both dimensions grow.', 10),
        sc('discover', 'discover', `${fmt(k)} small cakes`, `The big rectangle is ${fmt(c.d2 / c.d1)} times longer AND ${fmt(c.d2 / c.d1)} times wider, so ${fmt(k)} small rectangles fill it.`, 9),
        sc('explain', 'explain', 'Area scales with the square', `S = πr². Area ratio = (${c.d2} ÷ ${c.d1})² = ${fmt(k)}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Compare pizzas and value for money.', 5)]; }
      case 'annulus': return [
        sc('intro', 'introduce', 'A ring', `A running track: outer radius ${c.R}, inner radius ${c.r}.`, 5),
        sc('problem', 'problem', 'Area of a ring?', `Is it π(${c.R} − ${c.r})²?`, 5),
        sc('big', 'explore', 'The whole disc', `Big circle: 3.14 × ${c.R}² = ${fmt(circleArea(c.R))}.`, 7),
        sc('hole', 'manipulate', 'Remove the hole', `Small circle: 3.14 × ${c.r}² = ${fmt(circleArea(c.r))}. Take it away.`, 7),
        sc('discover', 'discover', 'Ring = big − small', `${fmt(circleArea(c.R))} − ${fmt(circleArea(c.r))} = ${fmt(circleArea(c.R) - circleArea(c.r))}.`, 7),
        sc('explain', 'explain', 'Rings, semicircles, sectors', 'Ring: π(R² − r²). Semicircle: half a circle. A sector with angle n°: n/360 of the circle.', 8),
        sc('apply', 'apply', 'Your turn', 'Find composite circular areas.', 5)];
      default: return [
        sc('intro', 'introduce', 'A round cake', 'A perfectly round cake.', 5),
        sc('problem', 'problem', 'What makes it round?', 'What is the same about every point on the edge?', 5),
        sc('radii', 'explore', 'Spin a radius', `Every point on the edge is ${c.r} units from the centre.`, 8),
        sc('diameter', 'manipulate', 'Two radii in a line', 'A diameter passes through the centre: two radii end to end.', 7),
        sc('discover', 'discover', 'd = 2r', `Diameter ${2 * c.r} = 2 × radius ${c.r}. Every diameter is a line of symmetry.`, 7),
        sc('explain', 'explain', 'Centre, radius, diameter', 'A compass keeps the radius fixed, so it draws a circle. There are infinitely many radii and diameters.', 8),
        sc('apply', 'apply', 'Your turn', 'Use d = 2r.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'circumference': return predict('How many diameters fit around the edge?', [['a', 'About 2'], ['b', 'A bit more than 3'], ['c', 'Exactly 4']], 'b', 'π ≈ 3.14.', 3);
      case 'area': return predict('The rearranged shape is about how long?', [['a', 'Half the circumference (πr)'], ['b', 'The whole circumference'], ['c', 'The diameter']], 'a', 'Half the crust is on top, half on the bottom.', 4);
      case 'cake': return predict(`How many ${c.d1} cm cakes have as much top area as one ${c.d2} cm cake?`, [['a', `${fmt(c.d2 / c.d1)}`], ['b', `${fmt((c.d2 / c.d1) ** 2)}`], ['c', `${fmt((c.d2 / c.d1) * 3)}`]], 'b', 'Both length and width of the rearranged cake scale.', 2);
      case 'annulus': return predict('Ring area equals…', [['a', 'Big circle − small circle'], ['b', 'π × (R − r)²']], 'a', 'Remove the hole from the disc.', 3);
      default: return predict('Is every point on the edge the same distance from the centre?', [['a', 'Yes'], ['b', 'No']], 'a', 'That distance is the radius.', 2);
    }
  },
  challenge: (c, r) => {
    const rr = int(r, 1, 10);
    switch (c.mode) {
      case 'circumference': return pick(r, [0, 1]) ? {prompt: `Diameter ${2 * rr} cm. Circumference (π = 3.14)?`, kind: 'number', answer: fix(PI * 2 * rr), tolerance: .001, unit: 'cm', hint: 'C = πd', explanation: `3.14 × ${2 * rr} = ${fmt(PI * 2 * rr)}.`} : {prompt: `Radius ${rr} m. Circumference (π = 3.14)?`, kind: 'number', answer: fix(2 * PI * rr), tolerance: .001, unit: 'm', hint: 'C = 2πr', explanation: `2 × 3.14 × ${rr} = ${fmt(2 * PI * rr)}.`};
      case 'area': return {prompt: `Radius ${rr} cm. Area (π = 3.14)?`, kind: 'number', answer: circleArea(rr), tolerance: .001, unit: 'cm²', hint: 'S = πr²', explanation: `3.14 × ${rr * rr} = ${fmt(circleArea(rr))}.`};
      case 'cake': { const k = int(r, 2, 4); const d = int(r, 6, 12); return {prompt: `One pizza is ${d} cm across, another is ${d * k} cm. How many times as much area does the big one have?`, kind: 'number', answer: k * k, hint: 'Square the ratio of diameters.', explanation: `(${k})² = ${k * k}.`}; }
      case 'annulus': { const R = int(r, 4, 10), s = int(r, 1, R - 1); return {prompt: `Ring with R = ${R}, r = ${s}. Area (π = 3.14)?`, kind: 'number', answer: fix(PI * (R * R - s * s)), tolerance: .001, hint: 'π(R² − r²)', explanation: `3.14 × ${R * R - s * s} = ${fmt(PI * (R * R - s * s))}.`}; }
      default: return pick(r, [0, 1]) ? {prompt: `Radius ${rr} cm. Diameter?`, kind: 'number', answer: 2 * rr, hint: 'd = 2r', explanation: `${2 * rr}.`} : {prompt: `Diameter ${2 * rr} m. Radius?`, kind: 'number', answer: rr, hint: 'r = d ÷ 2', explanation: `${rr}.`};
    }
  },
  describe: c => c.mode === 'cake' ? `Two cakes, ${c.d1} cm and ${c.d2} cm across, compared with grids and sector rearrangements into rectangles.` : `Circle laboratory (${c.mode}) with radius ${c.r}: radii, unrolling and sector rearrangement.`,
};

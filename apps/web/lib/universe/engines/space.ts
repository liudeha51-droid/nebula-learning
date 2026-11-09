import type {EngineLogic} from '../types';
import {fmt, int, pick, str} from '../math';
import {predict, story} from './util';

export type SpaceMode = 'pyramid' | 'relations' | 'perpendicular' | 'vectors' | 'normal';
export interface SpaceConfig {mode: SpaceMode}
export type P3 = [number, number, number];
export const sub3 = (a: P3, b: P3): P3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const dot3 = (a: P3, b: P3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross3 = (a: P3, b: P3): P3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len3 = (a: P3) => Math.hypot(...a);
/** Unit cube ABCD-A₁B₁C₁D₁ with A at the origin. */
export const CUBE: Record<string, P3> = {A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0], A1: [0, 0, 1], B1: [1, 0, 1], C1: [1, 1, 1], D1: [0, 1, 1]};
export function relation(e1: [string, string], e2: [string, string]): 'Intersecting' | 'Parallel' | 'Skew' {
  const [p, q] = e1.map(k => CUBE[k]), [r, s] = e2.map(k => CUBE[k]); const u = sub3(q, p), v = sub3(s, r);
  if (len3(cross3(u, v)) < 1e-9) return 'Parallel';
  return Math.abs(dot3(sub3(r, p), cross3(u, v))) < 1e-9 ? 'Intersecting' : 'Skew';
}
const EDGES: [string, string][] = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A1', 'B1'], ['B1', 'C1'], ['C1', 'D1'], ['D1', 'A1'], ['A', 'A1'], ['B', 'B1'], ['C', 'C1'], ['D', 'D1']];
const nm = (k: string) => k.replace('1', '₁');

export const space: EngineLogic<SpaceConfig> = {
  type: 'space', label: 'Solid geometry laboratory',
  parse: r => ({mode: str(r.mode, 'pyramid')}),
  validate: () => [],
  scenes: c => {
    switch (c.mode) {
      case 'pyramid': return story('Three pyramids in a prism', ['A triangular prism with base area S and height h.', 'How big is a pyramid?: A pyramid with the same base and height — what fraction of the prism?', 'Cut the prism: Slice it into three pyramids.', 'Equal volumes: Each pair shares a base and height, so all three are equal.', 'V = ⅓Sh: One pyramid is a third of the prism. A frustum is a big pyramid minus a small one.', 'Surface area and volume: Prism Sh, pyramid ⅓Sh, frustum ⅓h(S + √(SS′) + S′), sphere 4/3πR³ and 4πR².', 'Your turn: Compute volumes.']);
      case 'relations': return story('Lines in a cube', ['A cube has 12 edges.', 'Can two lines miss without being parallel?: In a plane, non-parallel lines always meet. In space?', 'Intersecting: AB and AD meet at A.', 'Parallel: AB and D₁C₁ never meet and point the same way.', 'Skew: AB and CC₁ never meet and are not parallel — they lie in no common plane.', 'Positions in space: Lines intersect, are parallel or skew; a line lies in, meets or is parallel to a plane.', 'Your turn: Classify pairs of lines.']);
      case 'perpendicular': return story('A flagpole', ['A flagpole stands on flat ground.', 'Perpendicular to every line?: How can we check the pole is perpendicular to the whole ground?', 'Two lines suffice: If the pole is perpendicular to two intersecting lines on the ground…', 'Sweep: …then it is perpendicular to every line through its foot.', 'Line ⊥ plane theorem: Perpendicular to two intersecting lines in the plane ⇒ perpendicular to the plane.', 'Parallel and perpendicular: Theorems for line–plane and plane–plane parallelism and perpendicularity; dihedral angles.', 'Your turn: Apply the theorems.']);
      case 'vectors': return story('Coordinates in a cube', ['A unit cube with A at the origin.', 'How do we describe AC₁?: In space we need a third direction.', 'Three basis vectors: AB, AD, AA₁ — along x, y and z.', 'Head to tail: AC₁ = AB + AD + AA₁ = (1, 1, 1).', `Length and angle: |AC₁| = √3 ≈ ${fmt(Math.sqrt(3), 3)}; dot products work just as in the plane.`, 'Space vectors: Any vector is xi + yj + zk; a · b = x₁x₂ + y₁y₂ + z₁z₂.', 'Your turn: Compute in coordinates.']);
      default: return story('Standing up straight', ['The plane through B, D and A₁ in a unit cube.', 'How tilted is AC₁ to this plane?: Angles with planes are hard to see. Can vectors help?', 'Find a normal: n = (1, 1, 1) is perpendicular to BD and BA₁, so to the whole plane.', 'Compare directions: The line’s direction is u = AC₁ = (1, 1, 1).', 'sin θ = |cos⟨u, n⟩|: Here u ∥ n, so AC₁ is perpendicular to the plane.', 'Angles and distances by vectors: Line–plane: sin θ = |u·n|/(|u||n|); point–plane distance = |AP·n|/|n|.', 'Your turn: Use normal vectors.']);
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'pyramid': return predict('Same base, same height: pyramid volume is ___ of the prism.', [['a', '1/3'], ['b', '1/2'], ['c', '2/3']], 'a', 'Three equal pyramids fill it.', 4);
      case 'relations': return predict('Two lines that never meet must be parallel?', [['a', 'No — they may be skew'], ['b', 'Yes']], 'a', 'AB and CC₁.', 4);
      case 'perpendicular': return predict('How many lines in the plane must the pole be perpendicular to?', [['a', 'Two intersecting lines'], ['b', 'One line'], ['c', 'Every line, checked one by one']], 'a', 'The line–plane perpendicular theorem.', 4);
      case 'vectors': return predict('AC₁ in the unit cube = ?', [['a', '(1, 1, 1)'], ['b', '(1, 1, 0)'], ['c', '(0, 0, 1)']], 'a', 'AB + AD + AA₁.', 3);
      default: return predict('Is AC₁ perpendicular to plane A₁BD?', [['a', 'Yes'], ['b', 'No']], 'a', 'AC₁ is parallel to the normal.', 4);
    }
  },
  challenge: (c, r) => {
    const v = (): P3 => [int(r, -3, 3), int(r, -3, 3), int(r, -3, 3)];
    switch (c.mode) {
      case 'pyramid': { const k = pick(r, [0, 1, 2]); if (k === 0) { const S = int(r, 2, 12) * 3, h = int(r, 2, 10); return {prompt: `Pyramid: base area ${S}, height ${h}. Volume?`, kind: 'number', answer: S * h / 3, hint: '⅓Sh.', explanation: `${S}×${h}/3.`}; }
        if (k === 1) { const R = int(r, 1, 6); return {prompt: `Sphere of radius ${R}: surface area as a multiple of π?`, kind: 'number', answer: 4 * R * R, hint: '4πR².', explanation: `4 × ${R}² = ${4 * R * R}.`}; }
        const a = int(r, 1, 3), b = a * 2, h = 3; return {prompt: `Frustum: base areas ${a * a} and ${b * b}, height ${h}. Volume?`, kind: 'number', answer: (h * (a * a + a * b + b * b)) / 3, hint: '⅓h(S + √(SS′) + S′).', explanation: `${h}/3 × (${a * a} + ${a * b} + ${b * b}).`}; }
      case 'relations': { const e1 = pick(r, EDGES), e2 = pick(r, EDGES.filter(e => e !== e1)); const ans = relation(e1, e2); return {prompt: `In cube ABCD-A₁B₁C₁D₁, ${nm(e1[0])}${nm(e1[1])} and ${nm(e2[0])}${nm(e2[1])} are…`, kind: 'choice', options: ['Intersecting', 'Parallel', 'Skew'], answer: ans, hint: 'Do they share a point? A direction?', explanation: ans + '.'}; }
      case 'perpendicular': { const [q, ans] = pick(r, [['A line perpendicular to one line in a plane is perpendicular to the plane.', 'False'], ['Two lines perpendicular to the same plane are parallel.', 'True'], ['If a line ⊥ plane α and the line lies in plane β, then α ⊥ β.', 'True'], ['Two planes parallel to the same line are parallel.', 'False']] as const); return {prompt: q, kind: 'choice', options: ['True', 'False'], answer: ans, hint: 'Try it with a cube.', explanation: ans + '.'}; }
      case 'vectors': { const a = v(), b = v(); return pick(r, [0, 1]) ? {prompt: `a = (${a.join(', ')}), b = (${b.join(', ')}). a · b = ?`, kind: 'number', answer: dot3(a, b), hint: 'Sum of products.', explanation: `${dot3(a, b)}.`} : {prompt: `|a|² for a = (${a.join(', ')})?`, kind: 'number', answer: dot3(a, a), hint: 'x² + y² + z².', explanation: `${dot3(a, a)}.`}; }
      default: { const n: P3 = [int(r, 1, 3), int(r, 1, 3), int(r, 1, 3)], u: P3 = [n[1], -n[0], 0]; const isN = pick(r, [0, 1]); const w: P3 = isN ? u : [u[0] + 1, u[1], 1]; return {prompt: `Plane with normal n = (${n.join(', ')}). Is the line with direction (${w.join(', ')}) parallel to the plane (or in it)?`, kind: 'choice', options: ['Yes', 'No'], answer: dot3(n, w) === 0 ? 'Yes' : 'No', hint: 'u · n = 0?', explanation: `u · n = ${dot3(n, w)}.`}; }
    }
  },
  describe: c => `Rotatable 3D model for solid geometry (${c.mode}).`,
};

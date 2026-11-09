import {describe, expect, it} from 'vitest';
import {D6_ELEMENTS, d6Compose, d6Index, d6Name, gcd, hopsToReturn, quinticRoots, quinticValue, BRANCH_POINTS, loopAround, trackRoots, rootPermutation, factorial} from './engines/journey';

describe('abstract-algebra journeys', () => {
  it('the snowflake moves form a group of order 12', () => {
    const e = D6_ELEMENTS[0]; expect(D6_ELEMENTS.length).toBe(12); expect(new Set(D6_ELEMENTS.map(d6Name)).size).toBe(12);
    for (const a of D6_ELEMENTS) { expect(d6Compose(e, a)).toEqual(a); expect(D6_ELEMENTS.some(b => d6Index(d6Compose(a, b)) === 0)).toBe(true);
      for (const b of D6_ELEMENTS) { expect(D6_ELEMENTS.map(d6Index)).toContain(d6Index(d6Compose(a, b)));
        for (const c of D6_ELEMENTS) expect(d6Compose(d6Compose(a, b), c)).toEqual(d6Compose(a, d6Compose(b, c))); } }
    // flips are their own inverse; rotations and flips do not commute
    expect(d6Compose([0, true], [0, true])).toEqual([0, false]); expect(d6Compose([1, false], [0, true])).not.toEqual(d6Compose([0, true], [1, false]));
  });
  it('clock hops return after n / gcd(n, k) hops', () => {
    expect(gcd(12, 8)).toBe(4); expect(hopsToReturn(12, 7)).toBe(12); expect(hopsToReturn(12, 4)).toBe(3);
    for (let k = 1; k < 12; k++) { let pos = 0, hops = 0; do { pos = (pos + k) % 12; hops++; } while (pos !== 0); expect(hops).toBe(hopsToReturn(12, k)); }
  });
  it('finds the five roots of x⁵ − x − 1', () => {
    const z = quinticRoots([1, 0]); for (const r of z) { const v = quinticValue(r, [1, 0]); expect(Math.hypot(...v)).toBeLessThan(1e-9); }
    expect(z.filter(r => Math.abs(r[1]) < 1e-9).map(r => r[0])[0]).toBeCloseTo(1.1673, 3);
  });
  it('each branch-point loop swaps exactly two roots, and together they generate all 120 permutations', () => {
    const start = quinticRoots([1, 0]); const perms: number[][] = [];
    for (let b = 0; b < BRANCH_POINTS.length; b++) {
      const path = loopAround(b); expect(Math.hypot(path[0][0] - 1, path[0][1])).toBeLessThan(1e-9); expect(Math.hypot(path[path.length - 1][0] - 1, path[path.length - 1][1])).toBeLessThan(1e-9);
      const tr = trackRoots(path); const p = rootPermutation(start, tr[tr.length - 1]);
      expect(new Set(p).size).toBe(5); expect(p.filter((v, i) => v !== i).length, `loop ${b}`).toBe(2); perms.push(p);
    }
    // closure of the generated permutations
    const key = (p: number[]) => p.join(''); const seen = new Map([[key([0, 1, 2, 3, 4]), [0, 1, 2, 3, 4]]]); const queue = [[0, 1, 2, 3, 4]];
    while (queue.length) { const g = queue.pop()!; for (const p of perms) { const h = g.map(i => p[i]); if (!seen.has(key(h))) { seen.set(key(h), h); queue.push(h); } } }
    expect(seen.size).toBe(factorial(5));
  });
});

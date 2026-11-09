import {describe, expect, it} from 'vitest';
import {
  primeCounts, li, subsetSum, q, ecAdd, onCurve, qstr, pointsModP, piConvergents, piError, egyptianGreedy, lpfRisingShare,
  divisorSequence, imoP4Answer, threeLargestProperDivisors, isSunny, covers, sunnyConstruction, bonzaViolation, bonzaExtremal,
  inekoalaty, moserSpindle, properColouring, qadd, qdiv,
} from './frontier-math';

describe('frontier maths', () => {
  it('counts primes and approximates them with Li(x)', () => {
    const c = primeCounts(100000);
    expect([c[10], c[100], c[1000], c[100000]]).toEqual([4, 25, 168, 9592]);
    expect(Math.abs(li(100000) - 9629.8)).toBeLessThan(2);
  });
  it('solves small subset-sum instances by search', () => {
    const s = subsetSum([3, 34, 4, 12, 5, 2], 9)!; expect(s.map(i => [3, 34, 4, 12, 5, 2][i]).reduce((a, b) => a + b, 0)).toBe(9);
    expect(subsetSum([2, 4, 6], 5)).toBeNull();
  });
  it('adds rational points on y² = x³ − 2 exactly', () => {
    const A = q(0n), B = q(-2n), P = {x: q(3n), y: q(5n)};
    const P2 = ecAdd(P, P, A)!; expect([qstr(P2.x), qstr(P2.y)]).toEqual(['129/100', '-383/1000']); expect(onCurve(P2, A, B)).toBe(true);
    const P3 = ecAdd(P2, P, A)!; expect(onCurve(P3, A, B)).toBe(true);
    expect(ecAdd(P, {x: P.x, y: q(-5n)}, A)).toBeNull();
    expect(qstr(qdiv(qadd(q(1n, 2n), q(1n, 3n)), q(5n)))).toBe('1/6');
    expect(pointsModP(0, -2, 5)).toBe(6); // y² = x³ − 2 over the field with 5 elements
  });
  it('finds the classical convergents of π', () => {
    const c = piConvergents(5).map(([p, d]) => `${p}/${d}`);
    expect(c).toEqual(['3/1', '22/7', '333/106', '355/113', '103993/33102']);
    expect(piError(355n, 113n)).toBeCloseTo(2.667e-7, 9);
  });
  it('expands fractions greedily into distinct unit fractions', () => {
    expect(egyptianGreedy(4n, 13n).map(String)).toEqual(['4', '18', '468']);
    expect(egyptianGreedy(2n, 3n).map(String)).toEqual(['2', '6']);
  });
  it('estimates how often the largest prime factor rises', () => {
    const s = lpfRisingShare(100000); expect(s).toBeGreaterThan(.45); expect(s).toBeLessThan(.55);
  });
  it('matches the IMO 2025 Problem 4 answer by simulation', () => {
    expect(threeLargestProperDivisors(12)).toEqual([6, 4, 3]);
    expect(divisorSequence(72).terms.slice(0, 3)).toEqual([72, 78, 78]);
    for (let a = 1; a < 6000; a++) { if (!threeLargestProperDivisors(a)) continue; expect(divisorSequence(a, 200).fate === 'cycle', String(a)).toBe(imoP4Answer(a)); }
  });
  it('builds sunny-line configurations with 0, 1 and 3 sunny lines (IMO 2025 Problem 1)', () => {
    for (let n = 3; n <= 8; n++) for (const k of [0, 1, 3] as const) { const L = sunnyConstruction(n, k); expect(L.length).toBe(n); expect(covers(L, n), `${n}/${k}`).toBe(true); expect(L.filter(isSunny).length).toBe(k); expect(new Set(L.map(l => `${l.a},${l.b},${l.c}`)).size).toBe(n); }
  });
  it('checks bonza functions (IMO 2025 Problem 3)', () => {
    expect(bonzaViolation(n => n, 40)).toBeNull(); expect(bonzaViolation(() => 1, 40)).toBeNull();
    expect(bonzaViolation(bonzaExtremal, 60)).toBeNull(); expect(bonzaExtremal(4)).toBe(16); expect(bonzaExtremal(8)).toBe(32);
    expect(bonzaViolation(n => n * n, 20)).not.toBeNull();
  });
  it('plays the inekoalaty game with the known strategies (IMO 2025 Problem 5)', () => {
    expect(inekoalaty(.6).winner).toBe('Bazza'); expect(inekoalaty(.8).winner).toBe('Alice'); expect(inekoalaty(Math.SQRT1_2, 2000).winner).toBeNull();
  });
  it('builds a Moser spindle that cannot be properly 3-coloured', () => {
    const {pts, edges} = moserSpindle();
    for (const [a, b] of edges) expect(Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1])).toBeCloseTo(1, 9);
    let found3 = false; for (let m = 0; m < 3 ** 7; m++) { const c = Array.from({length: 7}, (_, i) => Math.floor(m / 3 ** i) % 3); if (properColouring(edges, c)) found3 = true; }
    expect(found3).toBe(false); expect(properColouring(edges, [0, 1, 2, 0, 1, 2, 3])).toBe(true);
  });
});

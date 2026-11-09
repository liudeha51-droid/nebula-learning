import {describe, expect, it} from 'vitest';
import {LEARNING_JOURNEYS, journeysThrough, earthCircumference, earthRadius, diceWays, diceGame, simulateDice, gardenArea, gardenSlope, gardenBest, balanceAfter, doublingTime, savingsAfter, trilaterate} from './learning-journeys';
import {getPoint, ancestry} from './curriculum';

describe('learning journeys', () => {
  it('use real knowledge points, in an order the prerequisite graph allows', () => {
    expect(new Set(LEARNING_JOURNEYS.map(j => j.id)).size).toBe(LEARNING_JOURNEYS.length);
    for (const j of LEARNING_JOURNEYS) {
      expect(j.stations.length, j.id).toBeGreaterThanOrEqual(5);
      expect(new Set(j.stations.map(s => s.id)).size, j.id).toBe(j.stations.length);
      const grades = j.stations.map(s => { const p = getPoint(s.id); expect(p, `${j.id} → ${s.id}`).toBeDefined(); return p!.grade; });
      // The journey starts in primary school and only climbs from there.
      expect(grades[0], j.id).toBeLessThanOrEqual(6);
      for (let i = 1; i < grades.length; i++) expect(grades[i], `${j.id} station ${i + 1}`).toBeGreaterThanOrEqual(grades[i - 1]);
      // No station may depend (directly or indirectly) on a station that comes after it.
      j.stations.forEach((s, i) => { const anc = new Set(ancestry(s.id).map(p => p.id)); j.stations.slice(i + 1).forEach(later => expect(anc.has(later.id), `${j.id}: ${s.id} needs later ${later.id}`).toBe(false)); });
      for (const s of j.stations) for (const t of [s.tool, s.rule, s.why]) expect(t.length).toBeGreaterThan(3);
    }
    expect(journeysThrough('g9-arc-length').map(x => x.journey.id)).toEqual(['measure-earth']);
  });
  it('Eratosthenes: 7.2° and 800 km give 40,000 km', () => {
    expect(earthCircumference(7.2, 800)).toBeCloseTo(40000, 6); expect(earthRadius(40000)).toBeCloseTo(6366.2, 1);
  });
  it('dice games: sum 7 paying ¥6 for a ¥1 game is exactly fair', () => {
    expect([2, 7, 12].map(diceWays)).toEqual([1, 6, 1]); expect(Array.from({length: 11}, (_, i) => diceWays(i + 2)).reduce((a, b) => a + b, 0)).toBe(36);
    expect(diceGame(7, 6, 1).ev).toBeCloseTo(0, 12); expect(diceGame(7, 6, 1).verdict).toBe('fair');
    expect(diceGame(2, 20, 1).verdict).toBe('good for the stall'); expect(diceGame(7, 8, 1).verdict).toBe('good for players');
    expect(simulateDice(36000, 7) / 36000).toBeCloseTo(1 / 6, 2);
  });
  it('garden: the table, the vertex and the derivative agree', () => {
    for (const L of [20, 40, 60]) { const b = gardenBest(L); expect(gardenSlope(L, b.x)).toBe(0); expect(gardenArea(L, b.x)).toBeCloseTo(b.area);
      const table = Array.from({length: 1001}, (_, i) => (i / 1000) * (L / 2)); const best = table.reduce((m, x) => (gardenArea(L, x) > gardenArea(L, m) ? x : m), 0); expect(best).toBeCloseTo(b.x, 1); }
  });
  it('growth: logarithms give the doubling time, and the series adds yearly deposits', () => {
    const t = doublingTime(.05); expect(t).toBeCloseTo(14.2067, 3); expect(balanceAfter(1000, .05, t)).toBeCloseTo(2000, 6);
    let total = 0; for (let y = 0; y < 10; y++) total = (total + 1000) * 1.05; expect(savingsAfter(1000, .05, 10)).toBeCloseTo(total, 6);
  });
  it('GPS: three distances locate the phone exactly', () => {
    const phone = {x: 2.5, y: -1.25}; const towers = [{x: -3, y: 2}, {x: 4, y: 3}, {x: 0, y: -4}].map(t => ({...t, r: Math.hypot(phone.x - t.x, phone.y - t.y)})) as [never, never, never];
    const {point} = trilaterate(towers); expect(point!.x).toBeCloseTo(phone.x, 9); expect(point!.y).toBeCloseTo(phone.y, 9);
  });
});

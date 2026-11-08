import type {EngineLogic} from '../types';
import {fix, fmt, int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type LineMode = 'round' | 'signed' | 'unified';
export interface LineConfig {mode: LineMode; value: number; to: number; context: 'temperature' | 'elevation' | 'money'; n: number; d: number}

export const roundTo = (v: number, to: number) => fix(Math.round(fix(v / to)) * to);
export const bounds = (v: number, to: number) => { const lo = fix(Math.floor(fix(v / to)) * to); return [lo, fix(lo + to)] as const; };
const unitWord: Record<string, string> = {temperature: '°C', elevation: 'm', money: 'yuan'};
export const toWord = (to: number) => (to >= 1e8 ? 'hundred million' : to >= 1e4 ? `${fmt(to)} (${fmt(to / 1e4)}万)` : to >= 1 ? fmt(to) : to === .1 ? 'tenth' : to === .01 ? 'hundredth' : fmt(to));

export const numberLine: EngineLogic<LineConfig> = {
  type: 'number-line', label: 'Dynamic number line',
  parse: r => ({mode: str(r.mode, 'round'), value: num(r.value, 487), to: num(r.to, 100), context: str(r.context, 'temperature'), n: num(r.n, 1), d: num(r.d, 4)}),
  validate: c => { const e: string[] = []; if (c.mode === 'round' && (c.to <= 0 || fix(c.value / c.to) === Math.round(c.value / c.to))) e.push('round value must not already be a multiple'); if (c.mode === 'unified' && (c.n > c.d || c.d < 1)) e.push('unified expects a proper fraction'); return e; },
  scenes: c => {
    switch (c.mode) {
      case 'signed': { const u = unitWord[c.context]; const opp = -c.value; const story = c.context === 'temperature' ? 'a winter thermometer' : c.context === 'elevation' ? 'a cliff above the sea and a diver below it' : 'a wallet that earns and spends'; return [
        sc('intro', 'introduce', 'Above and below zero', `Look at ${story}.`, 5),
        sc('problem', 'problem', 'Below zero?', `How do we describe ${Math.abs(c.value)} ${u} ${c.context === 'temperature' ? 'below freezing' : c.context === 'elevation' ? 'below sea level' : 'spent'}?`, 6),
        sc('move', 'explore', 'Move past zero', `The marker passes 0 and keeps going: ${fmt(c.value)} ${u}.`, 9),
        sc('opposite', 'manipulate', 'Opposites', `${fmt(c.value)} and ${fmt(opp)} are the same distance from 0 in opposite directions.`, 7),
        sc('discover', 'discover', 'Negative numbers', `Negative numbers are written with “−”; further below zero means smaller: ${fmt(c.value)} < ${fmt(c.value + Math.abs(c.value) / 2)} < 0.`, 8),
        sc('explain', 'explain', 'The full number line', 'On a horizontal number line, numbers increase to the right. Every negative number is less than 0, and 0 is less than every positive number.', 8),
        sc('apply', 'apply', 'Your turn', 'Compare and use signed numbers.', 5)]; }
      case 'unified': { const v = c.n / c.d; return [
        sc('intro', 'introduce', 'One amount', `A bar with ${c.n}/${c.d} shaded.`, 5),
        sc('problem', 'problem', 'Other names?', `Can the same amount be written as a decimal or a percentage?`, 5),
        sc('fraction', 'explore', 'Fraction view', `Cut 0 to 1 into ${c.d} equal steps; walk ${c.n}.`, 7),
        sc('decimal', 'manipulate', 'Decimal view', `Cut the same line into 10, 100, 1000 steps: the point lands on ${fmt(v)}.`, 8),
        sc('discover', 'discover', 'One point, many names', `${c.n}/${c.d} = ${fmt(v)} = ${fmt(v * 100)}%.`, 7),
        sc('explain', 'explain', 'Converting', `${c.n} ÷ ${c.d} = ${fmt(v)}; × 100 gives the percentage ${fmt(v * 100)}%.`, 7),
        sc('apply', 'apply', 'Your turn', 'Convert between forms.', 5)]; }
      default: { const [lo, hi] = bounds(c.value, c.to); const mid = fix((lo + hi) / 2); const r = roundTo(c.value, c.to); return [
        sc('intro', 'introduce', `${fmt(c.value)}`, `Where does ${fmt(c.value)} live on the number line?`, 5),
        sc('problem', 'problem', `Nearest ${toWord(c.to)}?`, `Which ${toWord(c.to)} is ${fmt(c.value)} closest to?`, 5),
        sc('locate', 'explore', 'Between two landmarks', `${fmt(c.value)} sits between ${fmt(lo)} and ${fmt(hi)}.`, 8),
        sc('halfway', 'manipulate', 'Find the halfway mark', `The halfway point is ${fmt(mid)}. ${fmt(c.value)} is ${c.value >= mid ? 'at or past' : 'before'} it.`, 8),
        sc('discover', 'discover', `About ${fmt(r)}`, `${fmt(c.value)} is closer to ${fmt(r)}.`, 6),
        sc('explain', 'explain', 'Rounding rule', `Look at the digit after the rounding place: 5 or more rounds up, 4 or less rounds down. ${fmt(c.value)} ≈ ${fmt(r)}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Round new numbers.', 5)]; }
    }
  },
  prediction: c => {
    if (c.mode === 'signed') return predict(`Which is greater: ${fmt(c.value)} or ${fmt(c.value / 2)}?`, [['a', fmt(c.value)], ['b', fmt(c.value / 2)]], c.value > c.value / 2 ? 'a' : 'b', 'Closer to zero (further right) is greater for negatives.', 4);
    if (c.mode === 'unified') return predict(`${c.n}/${c.d} as a decimal is…`, [['a', fmt(c.n / c.d)], ['b', `${c.n}.${c.d}`], ['c', fmt(c.d / c.n / 10)]], 'a', `${c.n} ÷ ${c.d}.`, 3);
    const [lo, hi] = bounds(c.value, c.to); const r = roundTo(c.value, c.to);
    return predict(`${fmt(c.value)} rounded to the nearest ${toWord(c.to)}:`, [['a', fmt(lo)], ['b', fmt(hi)]], r === lo ? 'a' : 'b', `Compare with the halfway point ${fmt(fix((lo + hi) / 2))}.`, 3);
  },
  challenge: (c, r) => {
    if (c.mode === 'signed') { const a = int(r, -15, 10), b = int(r, -15, 10); if (a === b) return {prompt: `${a} + 5 = ?`, kind: 'number', answer: a + 5, hint: 'Move 5 to the right.', explanation: `${a + 5}.`};
      return {prompt: pick(r, [`Choose: ${a} ? ${b}`]), kind: 'choice', options: ['>', '<'], answer: a > b ? '>' : '<', hint: 'Further right is greater.', explanation: `${a} ${a > b ? '>' : '<'} ${b}.`}; }
    if (c.mode === 'unified') { const [n, d] = pick(r, [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 8], [1, 8], [7, 10], [3, 20]] as const); return {prompt: `${n}/${d} as a decimal?`, kind: 'number', answer: n / d, tolerance: 1e-9, hint: `${n} ÷ ${d}.`, explanation: `${fmt(n / d)} = ${fmt(n / d * 100)}%.`}; }
    const to = c.to; let v = to >= 1 ? int(r, to + 1, to * 999) : fix(int(r, 1001, 99999) * to / 10);
    if (fix(v / to) === Math.round(v / to)) v = fix(v + (to >= 1 ? 1 : to / 10));
    const val = fix(v); return {prompt: `Round ${fmt(val)} to the nearest ${toWord(to)}.`, kind: 'number', answer: roundTo(val, to), tolerance: to < 1 ? 1e-9 : 0, hint: 'Find the halfway point between the two landmarks.', explanation: `${fmt(val)} ≈ ${fmt(roundTo(val, to))}.`};
  },
  describe: c => c.mode === 'signed' ? `Number line through zero for ${c.context}, with ${c.value} marked.` : c.mode === 'unified' ? `Number line from 0 to 1 showing ${c.n}/${c.d} as a fraction, decimal and percentage.` : `Number line between landmarks showing ${c.value} rounded to the nearest ${c.to}.`,
};

import type {EngineLogic} from '../types';
import {fix, fmt, int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type DecimalMode = 'subdivide' | 'compare' | 'shift' | 'multiply' | 'divide' | 'money';
export interface DecimalConfig {mode: DecimalMode; places: number; value: number; a: number; b: number}
export const dp = (v: number) => (String(fix(v)).split('.')[1] ?? '').length;

export const decimal: EngineLogic<DecimalConfig> = {
  type: 'decimal', label: 'Decimal subdivision machine',
  parse: r => ({mode: str(r.mode, 'subdivide'), places: num(r.places, 1), value: num(r.value, .7), a: num(r.a, .7), b: num(r.b, .65)}),
  validate: c => {
    const e: string[] = [];
    if (c.mode === 'subdivide' && (c.value <= 0 || c.value >= 1 || dp(c.value) > c.places)) e.push('subdivide value between 0 and 1 with matching places');
    if (c.mode === 'multiply' && (dp(c.a) > 1 || (c.b < 1 && dp(c.b) > 1))) e.push('multiply uses tenths');
    if (c.mode === 'divide' && c.b === 0) e.push('divide by non-zero');
    if (c.mode === 'compare' && c.a === c.b) e.push('compare different numbers');
    return e;
  },
  scenes: c => {
    switch (c.mode) {
      case 'compare': { const big = Math.max(c.a, c.b), small = Math.min(c.a, c.b); return [
        sc('intro', 'introduce', 'Two decimals', `${c.a} and ${c.b}. One looks longer.`, 5),
        sc('problem', 'problem', 'Which is greater?', `Is ${dp(c.a) > dp(c.b) ? c.a : c.b} bigger because it has more digits?`, 6),
        sc('grid', 'explore', 'Shade both on hundred grids', `${fmt(c.a * 100)} hundredths and ${fmt(c.b * 100)} hundredths.`, 8),
        sc('place', 'manipulate', 'Compare place by place', `Tenths first: ${Math.floor(c.a * 10)} tenths vs ${Math.floor(c.b * 10)} tenths.`, 7),
        sc('discover', 'discover', `${big} > ${small}`, 'More digits does not mean bigger; the highest place decides.', 6),
        sc('explain', 'explain', 'Comparing decimals', `Line up the decimal points (write ${c.a.toFixed(2)} and ${c.b.toFixed(2)}) and compare from the left.`, 7),
        sc('apply', 'apply', 'Your turn', 'Order decimals.', 5)]; }
      case 'shift': return [
        sc('intro', 'introduce', `${c.value}`, `${c.value} in a place-value chart.`, 5),
        sc('problem', 'problem', '× 10?', 'When we multiply by 10, does the point jump, or do the digits move?', 6),
        sc('times', 'explore', '× 10, × 100', `Every digit moves one place left for × 10: ${fmt(c.value * 10)}, then ${fmt(c.value * 100)}.`, 9),
        sc('divide', 'manipulate', '÷ 10, ÷ 100', `Every digit moves right for ÷ 10: ${fmt(c.value / 10)}, then ${fmt(c.value / 100)}.`, 8),
        sc('discover', 'discover', 'Digits move, the point stays', 'The value changes because each digit lands in a place worth 10 times more (or less).', 7),
        sc('explain', 'explain', 'Powers of ten', `${c.value} × 10ⁿ moves digits n places left; ÷ 10ⁿ moves them n places right.`, 7),
        sc('apply', 'apply', 'Your turn', 'Predict ×10, ×100, ÷10 results.', 5)];
      case 'multiply': { const prod = fix(c.a * c.b); const grid = c.b < 1; return [
        sc('intro', 'introduce', `${c.a} × ${c.b}`, grid ? 'A hundred grid is one whole.' : `${c.b} groups of ${c.a}.`, 5),
        sc('problem', 'problem', 'Bigger or smaller?', `Will ${c.a} × ${c.b} be bigger or smaller than ${c.a}?`, 6),
        sc('first', 'explore', grid ? `Shade ${c.a}` : `One group of ${c.a}`, grid ? `${Math.round(c.a * 10)} tenths shaded as columns.` : `${Math.round(c.a * 10)} tenths in each group.`, 7),
        sc('second', 'manipulate', grid ? `Take ${c.b} of it` : `${c.b} groups`, grid ? `Shade ${Math.round(c.b * 10)} tenths as rows: the overlap is ${Math.round(prod * 100)} hundredths.` : `${c.b} × ${Math.round(c.a * 10)} tenths = ${Math.round(prod * 10)} tenths.`, 9),
        sc('discover', 'discover', `${fmt(prod)}`, grid ? `${Math.round(prod * 100)} hundredths = ${fmt(prod)}, smaller than both factors.` : `${Math.round(prod * 10)} tenths = ${fmt(prod)}.`, 7),
        sc('explain', 'explain', 'Counting decimal places', `${Math.round(c.a * 10)} × ${Math.round(c.b * (grid ? 10 : 1))} = ${Math.round(prod * (grid ? 100 : 10))}; the product has ${grid ? 2 : 1} decimal place${grid ? 's' : ''}: ${fmt(prod)}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Multiply decimals.', 5)]; }
      case 'divide': { const q = fix(c.a / c.b); const k = 10 ** Math.max(dp(c.a), dp(c.b)); return [
        sc('intro', 'introduce', `${c.a} ÷ ${c.b}`, `How many ${c.b}s fit into ${c.a}?`, 5),
        sc('problem', 'problem', 'Decimal divisor', 'Dividing by a decimal feels hard. Can we change the question without changing the answer?', 6),
        sc('bars', 'explore', 'Fit the pieces', `Lay ${c.b} pieces along ${c.a}.`, 8),
        sc('scale', 'manipulate', `Scale both by ${k}`, `${c.a} ÷ ${c.b} = ${fmt(c.a * k)} ÷ ${fmt(c.b * k)}: zooming in changes the units, not the number of pieces.`, 9),
        sc('discover', 'discover', `${fmt(q)} pieces`, `${fmt(c.a * k)} ÷ ${fmt(c.b * k)} = ${fmt(q)}.`, 6),
        sc('explain', 'explain', 'Quotient unchanged', 'Multiplying dividend and divisor by the same number keeps the quotient the same.', 7),
        sc('apply', 'apply', 'Your turn', 'Divide decimals.', 5)]; }
      case 'money': { const y = Math.floor(c.value), j = Math.floor(fix(c.value * 10) % 10), f = Math.round(fix(c.value * 100) % 10); return [
        sc('intro', 'introduce', 'A price tag', `A toy costs ${c.value.toFixed(2)} yuan.`, 5),
        sc('problem', 'problem', 'What do the digits mean?', 'What does each digit after the point stand for?', 5),
        sc('coins', 'explore', 'Make it with money', `${y} yuan notes, ${j} jiao coins, ${f} fen coins.`, 8),
        sc('split', 'manipulate', 'Tenths and hundredths of a yuan', `1 jiao = 0.1 yuan; 1 fen = 0.01 yuan.`, 7),
        sc('discover', 'discover', 'Places match coins', `${c.value.toFixed(2)} = ${y} + ${j} × 0.1 + ${f} × 0.01.`, 7),
        sc('explain', 'explain', 'Decimal money', `${c.value.toFixed(2)} yuan = ${y} 元 ${j} 角 ${f} 分.`, 6),
        sc('apply', 'apply', 'Your turn', 'Write prices as decimals.', 5)]; }
      default: return [
        sc('intro', 'introduce', 'One whole', 'One whole square.', 5),
        sc('problem', 'problem', 'Smaller than one', `How can we write an amount like ${c.value} of the square?`, 5),
        sc('tenths', 'explore', 'Cut into 10', 'Ten equal strips: each is one tenth, 0.1.', 8),
        sc('hundredths', 'manipulate', c.places > 1 ? 'Cut again into 100' : 'Shade the tenths', c.places > 1 ? 'Each tenth splits into ten hundredths, 0.01.' : `Shade ${Math.round(c.value * 10)} strips.`, 8),
        sc('discover', 'discover', `${c.value}`, c.places > 1 ? `${Math.round(c.value * 100)} hundredths = ${Math.floor(c.value * 10)} tenths and ${Math.round(c.value * 100) % 10} hundredths = ${c.value}.` : `${Math.round(c.value * 10)} tenths = ${c.value}.`, 7),
        sc('explain', 'explain', 'Decimal places', `The first place after the point counts tenths, the second counts hundredths. ${c.value} = ${c.places > 1 ? `${Math.round(c.value * 100)}/100` : `${Math.round(c.value * 10)}/10`}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Read and shade decimals.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'compare': return predict('Which is greater?', [['a', String(c.a)], ['b', String(c.b)]], c.a > c.b ? 'a' : 'b', 'Compare tenths first.', 3);
      case 'shift': return predict(`${c.value} × 10 = ?`, [['a', fmt(c.value * 10)], ['b', `${c.value}0`], ['c', fmt(c.value + 10)]], 'a', 'Digits move one place left.', 2);
      case 'multiply': return predict(`${c.a} × ${c.b} compared with ${c.a}:`, [['a', 'Bigger'], ['b', 'Smaller']], c.b > 1 ? 'a' : 'b', c.b > 1 ? 'Several groups make more.' : 'Taking part of something gives less.', 3);
      case 'divide': return predict(`${c.a} ÷ ${c.b} = ?`, [['a', fmt(c.a / c.b)], ['b', fmt(c.a * c.b)], ['c', fmt(c.a / c.b / 10)]], 'a', 'Count how many pieces fit.', 3);
      case 'money': return predict('In 3.45 yuan, the 4 stands for…', [['a', '4 jiao'], ['b', '4 fen'], ['c', '4 yuan']], 'a', 'Tenths of a yuan are jiao.', 3);
      default: return predict('One tenth cut into ten equal parts makes pieces of…', [['a', '0.01'], ['b', '0.1'], ['c', '0.11']], 'a', 'One hundredth.', 3);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'compare': { const a = int(r, 1, 99) / 100, b = int(r, 1, 9) / 10; return {prompt: `Choose: ${a} ? ${b}`, kind: 'choice', options: ['>', '<', '='], answer: a > b ? '>' : a < b ? '<' : '=', hint: 'Write both with two decimal places.', explanation: `${a.toFixed(2)} vs ${b.toFixed(2)}.`}; }
      case 'shift': { const v = int(r, 101, 999) / 100; const op = pick(r, [10, 100, 1000, -10, -100] as const); const ans = op > 0 ? fix(v * op) : fix(v / -op); return {prompt: `${v} ${op > 0 ? '×' : '÷'} ${Math.abs(op)} = ?`, kind: 'number', answer: ans, tolerance: 1e-9, hint: `Move each digit ${String(Math.abs(op)).length - 1} place(s) ${op > 0 ? 'left' : 'right'}.`, explanation: `${fmt(ans)}.`}; }
      case 'multiply': { const a = int(r, 1, 9) / 10, b = c.b < 1 ? int(r, 1, 9) / 10 : int(r, 2, 9); return {prompt: `${a} × ${b} = ?`, kind: 'number', answer: fix(a * b), tolerance: 1e-9, hint: 'Multiply as whole numbers, then count decimal places.', explanation: `${fmt(a * b)}.`}; }
      case 'divide': { const b = int(r, 2, 9) / 10, q = int(r, 2, 12); return {prompt: `${fmt(b * q)} ÷ ${b} = ?`, kind: 'number', answer: q, hint: 'Multiply both by 10.', explanation: `${fmt(b * q * 10)} ÷ ${b * 10} = ${q}.`}; }
      case 'money': { const y = int(r, 1, 20), j = int(r, 0, 9), f = int(r, 0, 9); return {prompt: `${y} yuan ${j} jiao ${f} fen = ? yuan`, kind: 'number', answer: fix(y + j / 10 + f / 100), tolerance: 1e-9, hint: 'jiao are tenths, fen are hundredths.', explanation: `${(y + j / 10 + f / 100).toFixed(2)} yuan.`}; }
      default: { const n = int(r, 1, 99); return {prompt: `${n} hundredths written as a decimal?`, kind: 'number', answer: n / 100, tolerance: 1e-9, hint: 'Hundredths are the second place after the point.', explanation: `${(n / 100).toFixed(2)}.`}; }
    }
  },
  describe: c => `Decimal model (${c.mode}): ${c.mode === 'subdivide' || c.mode === 'money' || c.mode === 'shift' ? c.value : `${c.a} and ${c.b}`} on hundred grids, place-value charts and money.`,
};

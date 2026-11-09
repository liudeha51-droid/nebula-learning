import type {EngineLogic} from '../types';
import {fix, fmt, int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type PercentMode = 'grid' | 'convert' | 'of-quantity' | 'change' | 'discount' | 'interest';
export interface PercentConfig {mode: PercentMode; pct: number; n: number; d: number; whole: number; base: number; price: number; principal: number; rate: number; years: number}

export const percent: EngineLogic<PercentConfig> = {
  type: 'percent', label: 'Percentage visualiser',
  parse: r => ({mode: str(r.mode, 'grid'), pct: num(r.pct, 35), n: num(r.n, 3), d: num(r.d, 8), whole: num(r.whole, 240), base: num(r.base, 80), price: num(r.price, 240), principal: num(r.principal, 5000), rate: num(r.rate, 2.75), years: num(r.years, 3)}),
  validate: c => (c.pct < 0 || c.d <= 0 ? ['invalid percentage'] : []),
  scenes: c => {
    switch (c.mode) {
      case 'convert': { const v = c.n / c.d; return [
        sc('intro', 'introduce', `${c.n}/${c.d} of a bar`, `A bar with ${c.n} of ${c.d} equal parts shaded.`, 5),
        sc('problem', 'problem', 'As a percentage?', 'How many hundredths is that?', 5),
        sc('divide', 'explore', 'Divide', `${c.n} ÷ ${c.d} = ${fmt(v)}.`, 7),
        sc('grid', 'manipulate', 'Fill the hundred grid', `${fmt(v)} of 100 cells = ${fmt(v * 100)} cells.`, 9),
        sc('discover', 'discover', `${fmt(v * 100)}%`, `${c.n}/${c.d} = ${fmt(v)} = ${fmt(v * 100)}%.`, 6),
        sc('explain', 'explain', 'Converting', 'Fraction → decimal: divide. Decimal → percentage: × 100 (move digits two places left).', 7),
        sc('apply', 'apply', 'Your turn', 'Convert between forms.', 5)]; }
      case 'of-quantity': { const part = fix(c.whole * c.pct / 100); return [
        sc('intro', 'introduce', `${c.whole} students`, `A school has ${c.whole} students: that is 100%.`, 5),
        sc('problem', 'problem', `${c.pct}% of ${c.whole}?`, `How many students is ${c.pct}%?`, 5),
        sc('ten', 'explore', 'Find 10%', `10% is one tenth: ${fmt(c.whole / 10)}.`, 7),
        sc('build', 'manipulate', `Build ${c.pct}%`, `${c.pct / 10} lots of 10% = ${fmt(part)}.`, 8),
        sc('discover', 'discover', `${fmt(part)} students`, `${c.pct}% of ${c.whole} = ${c.whole} × ${c.pct / 100} = ${fmt(part)}.`, 6),
        sc('explain', 'explain', 'Both directions', `Part = whole × percentage. If ${c.pct}% is ${fmt(part)}, the whole is ${fmt(part)} ÷ ${c.pct / 100} = ${c.whole}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Find parts and wholes.', 5)]; }
      case 'change': { const up = fix(c.base * (1 + c.pct / 100)), down = fix(c.base * (1 - c.pct / 100)); return [
        sc('intro', 'introduce', `${c.base} visitors`, `Last month a museum had ${c.base} thousand visitors.`, 5),
        sc('problem', 'problem', `${c.pct}% more`, `This month there were ${c.pct}% more. How many?`, 5),
        sc('grow', 'explore', 'Grow the bar', `${c.pct}% of ${c.base} = ${fmt(c.base * c.pct / 100)}; ${c.base} + ${fmt(c.base * c.pct / 100)} = ${fmt(up)}.`, 8),
        sc('shrink', 'manipulate', 'Now shrink by the same %', `${c.pct}% less than ${fmt(up)} is ${fmt(fix(up * (1 - c.pct / 100)))} — not back to ${c.base}!`, 9),
        sc('discover', 'discover', 'The base matters', 'A percentage change is always measured from the starting value.', 7),
        sc('explain', 'explain', 'Multipliers', `Increase by ${c.pct}%: × ${fmt(1 + c.pct / 100)}. Decrease by ${c.pct}%: × ${fmt(1 - c.pct / 100)} (${c.base} → ${fmt(down)}). Percentage points compare rates directly (3% → 4% is +1 point but +33%).`, 10),
        sc('apply', 'apply', 'Your turn', 'Calculate changes.', 5)]; }
      case 'discount': { const pay = fix(c.price * c.pct / 100); return [
        sc('intro', 'introduce', 'A sale', `A coat costs ${c.price} yuan. Sign: ${c.pct / 10}折 (${c.pct}% of the price).`, 6),
        sc('problem', 'problem', 'What do we pay?', `Is ${c.pct / 10}折 a ${c.pct}% discount?`, 6),
        sc('bar', 'explore', 'Price bar', `The full bar is 100% = ${c.price} yuan; we pay ${c.pct}% of it.`, 8),
        sc('save', 'manipulate', 'What we save', `We save ${100 - c.pct}%: ${fmt(c.price - pay)} yuan.`, 7),
        sc('discover', 'discover', `${fmt(pay)} yuan`, `${c.price} × ${c.pct / 100} = ${fmt(pay)}.`, 6),
        sc('explain', 'explain', 'Discount, tax, profit', 'Pay = price × rate paid. Tax adds: price × (1 + tax rate). Profit % = (selling − cost) ÷ cost.', 8),
        sc('apply', 'apply', 'Your turn', 'Compare offers.', 5)]; }
      case 'interest': { const yearly = fix(c.principal * c.rate / 100); return [
        sc('intro', 'introduce', 'Savings', `${fmt(c.principal)} yuan in a bank at ${c.rate}% a year.`, 5),
        sc('problem', 'problem', `After ${c.years} years?`, 'How much interest will it earn?', 5),
        sc('year1', 'explore', 'One year', `${c.rate}% of ${fmt(c.principal)} = ${fmt(yearly)} yuan.`, 7),
        sc('years', 'manipulate', 'Year after year', `Simple interest adds the same ${fmt(yearly)} each year.`, 8),
        sc('discover', 'discover', `${fmt(fix(yearly * c.years))} yuan`, `${fmt(yearly)} × ${c.years} = ${fmt(fix(yearly * c.years))}.`, 6),
        sc('explain', 'explain', 'I = P × r × t', `${fmt(c.principal)} × ${c.rate}% × ${c.years} = ${fmt(fix(yearly * c.years))}. Total = ${fmt(fix(c.principal + yearly * c.years))}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Calculate interest.', 5)]; }
      default: return [
        sc('intro', 'introduce', 'One hundred cells', 'A grid of 100 equal cells: the whole, 100%.', 5),
        sc('problem', 'problem', `${c.pct}%`, `What does ${c.pct}% look like?`, 5),
        sc('fill', 'explore', 'Fill the grid', `Shade ${c.pct} of the 100 cells.`, 8),
        sc('other', 'manipulate', 'Other wholes', `${c.pct}% of a bar, of a circle, of a class: always ${c.pct} parts per hundred of that whole.`, 8),
        sc('discover', 'discover', 'Per hundred', `${c.pct}% = ${c.pct}/100 = ${fmt(c.pct / 100)}.`, 6),
        sc('explain', 'explain', 'Percentages', '% means “out of 100” of a reference quantity. More than 100% means more than the whole reference.', 7),
        sc('apply', 'apply', 'Your turn', 'Read and write percentages.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'convert': return predict(`${c.n}/${c.d} as a percentage is closest to…`, [['a', `${Math.round(c.n / c.d * 100)}%`], ['b', `${c.n}${c.d}%`], ['c', `${c.n * 10}%`]], 'a', `${c.n} ÷ ${c.d} × 100.`, 3);
      case 'of-quantity': return predict(`${c.pct}% of ${c.whole} is…`, [['a', fmt(c.whole * c.pct / 100)], ['b', fmt(c.whole * c.pct)], ['c', fmt(c.whole / c.pct)]], 'a', `${c.whole} × ${c.pct / 100}.`, 3);
      case 'change': return predict(`Up ${c.pct}% then down ${c.pct}%. Back to ${c.base}?`, [['a', 'Lower than the start'], ['b', 'Exactly the start'], ['c', 'Higher']], 'a', 'The decrease is taken from a bigger number.', 3);
      case 'discount': return predict(`${c.pct / 10}折 means you pay…`, [['a', `${c.pct}% of the price`], ['b', `${c.pct / 10}% of the price`], ['c', `${100 - c.pct}% of the price`]], 'a', `${c.pct / 10}折 = ${c.pct}%.`, 2);
      case 'interest': return predict('With simple interest, the yearly interest…', [['a', 'Stays the same'], ['b', 'Grows each year']], 'a', 'Always calculated on the principal.', 3);
      default: return predict(`${c.pct}% as a decimal is…`, [['a', fmt(c.pct / 100)], ['b', fmt(c.pct / 10)], ['c', String(c.pct)]], 'a', 'Divide by 100.', 4);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'convert': { const [n, d] = pick(r, [[1, 4], [3, 5], [7, 8], [1, 8], [9, 20], [3, 25]] as const); return {prompt: `${n}/${d} = ?%`, kind: 'number', answer: fix(n / d * 100), tolerance: 1e-6, hint: `${n} ÷ ${d} × 100`, explanation: `${fmt(n / d * 100)}%.`}; }
      case 'of-quantity': { const p = int(r, 1, 9) * 10 + pick(r, [0, 5]), w = int(r, 2, 20) * 20; return pick(r, [0, 1]) ? {prompt: `${p}% of ${w} = ?`, kind: 'number', answer: fix(w * p / 100), tolerance: 1e-6, hint: `${w} × ${p / 100}`, explanation: `${fmt(w * p / 100)}.`} : {prompt: `${p}% of a number is ${fmt(w * p / 100)}. The number?`, kind: 'number', answer: w, hint: `÷ ${p / 100}`, explanation: `${w}.`}; }
      case 'change': { const b = int(r, 4, 20) * 10, p = int(r, 1, 8) * 5, up = pick(r, [true, false]); return {prompt: `${b} ${up ? 'increased' : 'decreased'} by ${p}% = ?`, kind: 'number', answer: fix(b * (1 + (up ? p : -p) / 100)), tolerance: 1e-6, hint: `× ${fmt(1 + (up ? p : -p) / 100)}`, explanation: `${fmt(b * (1 + (up ? p : -p) / 100))}.`}; }
      case 'discount': { const price = int(r, 5, 40) * 10, z = int(r, 6, 9); return {prompt: `${price} yuan at ${z}折. Price to pay?`, kind: 'number', answer: price * z / 10, tolerance: 1e-6, hint: `${z}折 = ${z * 10}%`, explanation: `${price} × ${z / 10} = ${price * z / 10}.`}; }
      case 'interest': { const P = int(r, 1, 10) * 1000, rate = pick(r, [1.5, 2, 2.5, 3]), t = int(r, 1, 5); return {prompt: `${fmt(P)} yuan at ${rate}% per year for ${t} years. Simple interest?`, kind: 'number', answer: fix(P * rate / 100 * t), tolerance: 1e-6, hint: 'P × r × t', explanation: `${fmt(P * rate / 100 * t)} yuan.`}; }
      default: { const p = int(r, 1, 99); return {prompt: `${p} of 100 cells are shaded. Percentage?`, kind: 'number', answer: p, unit: '%', hint: 'Per hundred.', explanation: `${p}%.`}; }
    }
  },
  describe: c => `Percentage model (${c.mode}) on a 100-cell grid and percentage bars.`,
};

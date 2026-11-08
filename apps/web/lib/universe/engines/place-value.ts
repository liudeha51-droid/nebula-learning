import type {EngineLogic} from '../types';
import {digits, fmt, int, num, str, numericOptions, pick} from '../math';
import {sc, predict} from './util';

export type PlaceMode = 'build' | 'compare' | 'digit' | 'large' | 'shift';
export interface PlaceConfig {mode: PlaceMode; places: number; value: number; other: number; digit: number}
export const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions', 'ten millions', 'hundred millions', 'billions', 'ten billions', 'hundred billions'];
export const PLACE_ZH = ['个', '十', '百', '千', '万', '十万', '百万', '千万', '亿', '十亿', '百亿', '千亿'];

const ZH_DIGIT = '零一二三四五六七八九';
/** Reads a whole number (< 10¹²) the way Chinese textbooks do, e.g. 305060000 → 三亿零五百零六万. */
export function readChinese(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n >= 1e12) throw new Error('readChinese supports 0 ≤ n < 10^12');
  if (n === 0) return '零';
  const sections: number[] = []; let m = n; while (m > 0) { sections.push(m % 10000); m = Math.floor(m / 10000); }
  const unit = ['', '万', '亿']; let out = ''; let needZero = false;
  for (let i = sections.length - 1; i >= 0; i--) {
    const s = sections[i];
    if (s === 0) { if (out) needZero = true; continue; }
    if (out && (needZero || s < 1000)) out += '零';
    out += readSection(s) + unit[i]; needZero = false;
  }
  return out.startsWith('一十') ? out.slice(1) : out;
}
function readSection(s: number) {
  const units = ['', '十', '百', '千']; let out = ''; let zero = false;
  for (let p = 3; p >= 0; p--) {
    const d = Math.floor(s / 10 ** p) % 10;
    if (d === 0) { if (out) zero = true; continue; }
    if (zero) { out += '零'; zero = false; }
    out += ZH_DIGIT[d] + units[p];
  }
  return out;
}
/** Groups digits in fours (Chinese 万/亿 levels), e.g. 3|0506|0000. */
export const groupFours = (n: number) => { const s = String(n); const g: string[] = []; for (let i = s.length; i > 0; i -= 4) g.unshift(s.slice(Math.max(0, i - 4), i)); return g; };

export const placeValue: EngineLogic<PlaceConfig> = {
  type: 'place-value', label: 'Place-value machine',
  parse: r => ({mode: str(r.mode, 'build'), places: num(r.places, 3), value: num(r.value, 254), other: num(r.other, 0), digit: num(r.digit, 3)}),
  validate: c => {
    const e: string[] = [];
    if (c.mode === 'build' && (c.value >= 10 ** c.places || c.value < 0 || c.places < 2 || c.places > 4)) e.push('build value must fit its places (2–4)');
    if (c.mode === 'compare' && (c.value === c.other || c.value >= 10000 || c.other >= 10000)) e.push('compare needs two different numbers < 10000');
    if (c.mode === 'large' && (c.value >= 1e12 || c.value < 1e4)) e.push('large numbers between 10⁴ and 10¹²');
    if ((c.mode === 'digit' || c.mode === 'shift') && (c.digit < 1 || c.digit > 9)) e.push('digit 1–9');
    return e;
  },
  scenes: c => {
    const ds = digits(c.value, c.places);
    switch (c.mode) {
      case 'compare': { const len = Math.max(String(c.value).length, String(c.other).length); const a = digits(c.value, len), b = digits(c.other, len); let k = len - 1; while (k > 0 && a[k] === b[k]) k--; return [
        sc('intro', 'introduce', 'Two numbers', `${fmt(c.value)} and ${fmt(c.other)} look almost the same.`, 5),
        sc('problem', 'problem', 'Which is greater?', 'Where should we start comparing — the left or the right?', 5),
        sc('scan', 'explore', 'Start at the biggest place', 'Compare the highest place first. While digits match, move one place right.', 9),
        sc('stop', 'manipulate', 'The first difference', `The ${PLACE_NAMES[k]} differ: ${a[k]} and ${b[k]}.`, 6),
        sc('discover', 'discover', 'That place decides', `One ${PLACE_NAMES[k].replace(/s$/, '')} is worth more than all the smaller places together, so ${fmt(Math.max(c.value, c.other))} is greater.`, 8),
        sc('explain', 'explain', 'Compare symbol', `${fmt(c.value)} ${c.value > c.other ? '>' : '<'} ${fmt(c.other)}.`, 6),
        sc('apply', 'apply', 'Your turn', 'Order new numbers.', 5)]; }
      case 'digit': return [
        sc('intro', 'introduce', `The digit ${c.digit}`, `Meet the digit ${c.digit}. It can live in different places.`, 5),
        sc('problem', 'problem', 'Does its value change?', `Is the ${c.digit} in ${c.digit}0,000 the same amount as the ${c.digit} in ${c.digit}?`, 6),
        sc('slide', 'explore', 'Move it left', 'Each step left, the digit counts groups ten times as big.', 10),
        sc('blocks', 'manipulate', 'See the amounts', `${c.digit} ones, ${c.digit} tens, ${c.digit} hundreds… the blocks grow ×10 each place.`, 8),
        sc('discover', 'discover', 'Place gives value', 'The digit stays the same; its place decides its value.', 6),
        sc('explain', 'explain', 'Digit × place value', `In the ${PLACE_NAMES[c.places - 1]} place, ${c.digit} is worth ${fmt(c.digit * 10 ** (c.places - 1))}.`, 7),
        sc('apply', 'apply', 'Your turn', 'Find digit values in new numbers.', 5)];
      case 'large': { const g = groupFours(c.value); return [
        sc('intro', 'introduce', 'A huge number', `${fmt(c.value)} has ${String(c.value).length} digits. How do we read it?`, 5),
        sc('problem', 'problem', 'Too many digits?', 'Reading digit by digit is hard. Is there a pattern?', 5),
        sc('group', 'explore', 'Group in fours', `Chinese place value groups digits in fours from the right: ${g.join(' | ')}.`, 8),
        sc('levels', 'manipulate', '个级, 万级, 亿级', 'Each group is a level: ones level (个级), ten-thousands level (万级), hundred-millions level (亿级).', 8),
        sc('discover', 'discover', 'Read level by level', `Read each group, then its level name: ${readChinese(c.value)}.`, 8),
        sc('explain', 'explain', 'Zeros and reading', 'Zeros at the end of a level are not read; zeros inside or before a group are read once as 零.', 8),
        sc('apply', 'apply', 'Your turn', 'Read and compare new large numbers.', 5)]; }
      case 'shift': return [
        sc('intro', 'introduce', 'A digit on a journey', `The digit ${c.digit} starts in the ones place.`, 5),
        sc('problem', 'problem', 'What does ×10 do?', `Multiply ${c.digit} by 10. What happens to the digit?`, 5),
        sc('left', 'explore', '×10 moves it left', `${c.digit} → ${c.digit * 10} → ${c.digit * 100} → ${c.digit * 1000}: each ×10 moves the digit one place left.`, 9),
        sc('right', 'manipulate', '÷10 moves it right', 'Dividing by 10 sends it back one place to the right.', 7),
        sc('discover', 'discover', 'Ten times each place', 'Every place is worth ten of the place to its right. That is the decimal number system.', 7),
        sc('explain', 'explain', 'Base ten', `Place values: 1, 10, 100, 1 000, 10 000 … each ×10.`, 6),
        sc('apply', 'apply', 'Your turn', 'Predict ×10 and ÷10 results.', 5)];
      default: return [
        sc('intro', 'introduce', 'A pile of units', `Unit cubes pour into the machine — ${fmt(c.value)} of them.`, 5),
        sc('problem', 'problem', 'Count them quickly?', 'Counting one by one would take ages. Can grouping help?', 5),
        sc('ten', 'explore', 'Ten ones → one ten', 'Whenever ten unit cubes gather, they lock into one rod: a ten.', 8),
        sc('hundred', 'manipulate', 'Ten tens → one hundred', `Ten rods lock into a flat: a hundred.${c.places > 3 ? ' Ten flats become a thousand cube.' : ''}`, 8),
        sc('discover', 'discover', 'Read the columns', `${fmt(c.value)} = ${ds.map((d, i) => `${d} ${PLACE_NAMES[i]}`).reverse().join(', ')}.`, 8),
        sc('explain', 'explain', 'Expanded form', `${fmt(c.value)} = ${ds.map((d, i) => d * 10 ** i).reverse().filter(v => v > 0).map(v => fmt(v)).join(' + ')}. A zero holds an empty place.`, 8),
        sc('apply', 'apply', 'Your turn', 'Build numbers in the machine.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'compare': return predict(`Which is greater: ${fmt(c.value)} or ${fmt(c.other)}?`, [['a', fmt(c.value)], ['b', fmt(c.other)]], c.value > c.other ? 'a' : 'b', 'The first different place from the left decides.', 3);
      case 'digit': return predict(`How many times as much is the ${c.digit} in ${c.digit}00 compared with the ${c.digit} in ${c.digit}0?`, [['a', '10 times'], ['b', '2 times'], ['c', '100 times']], 'a', 'One place left is ×10.', 3);
      case 'large': return predict(`How many groups of four does ${fmt(c.value)} split into?`, [['a', String(groupFours(c.value).length)], ['b', String(groupFours(c.value).length + 1)], ['c', String(String(c.value).length)]], 'a', `${groupFours(c.value).join(' | ')}.`, 2);
      case 'shift': return predict(`${c.digit * 10} × 10 = ?`, [['a', String(c.digit * 100)], ['b', String(c.digit * 10 + 10)], ['c', String(c.digit * 1000)]], 'a', 'The digit moves one place left.', 2);
      default: return predict('How many unit cubes lock together to make one ten?', [['a', '10'], ['b', '5'], ['c', '100']], 'a', 'Our number system groups in tens.', 2);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'compare': { const a = int(r, 1000, 9999); const b = a + pick(r, [-100, -10, 90, 900, -1]); return {prompt: `Which is greater?`, kind: 'choice', options: [fmt(a), fmt(b)], answer: fmt(Math.max(a, b)), hint: 'Compare from the left.', explanation: `${fmt(Math.max(a, b))} is greater.`}; }
      case 'digit': { const n = int(r, 10000, 99999); const k = int(r, 0, 4); const d = digits(n, 5)[k]; return {prompt: `What is the value of the digit in the ${PLACE_NAMES[k]} place of ${fmt(n)}?`, kind: 'number', answer: d * 10 ** k, hint: `Multiply the digit by ${fmt(10 ** k)}.`, explanation: `${d} × ${fmt(10 ** k)} = ${fmt(d * 10 ** k)}.`}; }
      case 'large': { const n = int(r, 1, 9) * 1e8 + int(r, 0, 9) * 1e6 + int(r, 0, 99) * 1e4 + int(r, 0, 9999); return {prompt: `How is ${fmt(n)} read in Chinese?`, kind: 'choice', options: [readChinese(n), readChinese(n + 10000), readChinese(Math.floor(n / 10))].filter((v, i, a) => a.indexOf(v) === i), answer: readChinese(n), hint: 'Group in fours from the right.', explanation: `${groupFours(n).join(' | ')} → ${readChinese(n)}.`}; }
      case 'shift': { const d = int(r, 1, 9), k = int(r, 1, 3); return {prompt: `${d} × ${fmt(10 ** k)} = ?`, kind: 'number', answer: d * 10 ** k, hint: `Move the digit ${k} place${k > 1 ? 's' : ''} left.`, explanation: `${d} moves to the ${PLACE_NAMES[k]} place.`}; }
      default: { const p = c.places; const ds = Array.from({length: p}, (_, i) => (i === p - 1 ? int(r, 1, 9) : int(r, 0, 9))); const v = ds.reduce((s, d, i) => s + d * 10 ** i, 0);
        return {prompt: `${ds.map((d, i) => `${d} ${PLACE_NAMES[i]}`).reverse().join(', ')} make what number?`, kind: 'choice', options: numericOptions(r, v, [v + 10, v - 1, Number(String(v).split('').reverse().join(''))]), answer: fmt(v), hint: 'Write one digit per place, using 0 for empty places.', explanation: `${fmt(v)}.`}; }
    }
  },
  describe: c => `Place-value machine (${c.mode}) for ${fmt(c.value)}: base-ten blocks — yellow ones, green tens, purple hundreds, coral thousands — in labelled columns with digits.`,
};

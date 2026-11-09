import type {EngineLogic} from '../types';
import {bool, columnAdd, columnSub, fmt, int, num, str} from '../math';
import {sc, predict} from './util';
import {PLACE_NAMES} from './place-value';

export interface ColumnConfig {op: 'add' | 'sub'; a: number; b: number; places: number; check: boolean}

/** Integer representation (scaled by 10^places) so decimals use the same column algorithm. */
export const scaled = (c: ColumnConfig) => ({A: Math.round(c.a * 10 ** c.places), B: Math.round(c.b * 10 ** c.places)});
export const placeName = (i: number, places: number) => (i < places ? ['tenths', 'hundredths', 'thousandths'][places - 1 - i] : PLACE_NAMES[i - places]);
export function steps(c: ColumnConfig) { const {A, B} = scaled(c); return c.op === 'add' ? columnAdd(A, B) : columnSub(A, B); }
export const showNum = (v: number, places: number) => (places ? (v / 10 ** places).toFixed(places) : fmt(v));

export const column: EngineLogic<ColumnConfig> = {
  type: 'column', label: 'Column calculator with base-ten blocks',
  parse: r => ({op: str(r.op, 'add'), a: num(r.a, 47), b: num(r.b, 38), places: num(r.places, 0), check: bool(r.check, false)}),
  validate: c => { const e: string[] = []; if (c.op === 'sub' && c.b > c.a) e.push('subtraction needs a ≥ b'); if (c.a < 0 || c.b < 0) e.push('non-negative only'); if (c.a >= 1e5) e.push('up to five digits'); return e; },
  scenes: c => {
    const s = steps(c); const {A, B} = scaled(c); const res = c.op === 'add' ? A + B : A - B;
    const add = c.op === 'add'; const sign = add ? '+' : '−';
    const exchanges = add ? (s as ReturnType<typeof columnAdd>).carries.filter(x => x).length : (s as ReturnType<typeof columnSub>).borrows.filter(x => x).length;
    const first = placeName(0, c.places);
    return [
      sc('intro', 'introduce', 'Blocks for each number', `${showNum(A, c.places)} and ${showNum(B, c.places)} built from base-ten blocks, one column per place.`, 6),
      sc('problem', 'problem', `${showNum(A, c.places)} ${sign} ${showNum(B, c.places)}`, add ? 'Combine them. What happens when a column gets ten or more?' : 'Take one away from the other. What if a column does not have enough?', 6),
      sc('first', 'explore', `The ${first} column`, add ? `Start with the ${first}: join them. Ten ${first} exchange for one of the next place.` : `Start with the ${first}. If there are not enough, break one unit from the next place into ten.`, 9),
      sc('rest', 'manipulate', 'Column by column', `Move left one column at a time. ${exchanges} exchange${exchanges === 1 ? '' : 's'} happen in this calculation.`, 10),
      sc('discover', 'discover', 'The written digits match the blocks', `Each written digit is what stays in its column: ${showNum(res, c.places)}.`, 7),
      sc('explain', 'explain', add ? 'Carrying' : 'Borrowing', add ? `A carried 1 is one exchanged group of ten. ${showNum(A, c.places)} + ${showNum(B, c.places)} = ${showNum(res, c.places)}.` : `A borrow breaks one unit into ten smaller ones. ${showNum(A, c.places)} − ${showNum(B, c.places)} = ${showNum(res, c.places)}.${c.check ? ` Check: ${showNum(res, c.places)} + ${showNum(B, c.places)} = ${showNum(A, c.places)}.` : ''}`, 9),
      sc('apply', 'apply', 'Your turn', 'Try a new calculation in Explore, then the challenge.', 5)];
  },
  prediction: c => {
    const s = steps(c); const add = c.op === 'add';
    const n = add ? (s as ReturnType<typeof columnAdd>).carries.filter(x => x).length : (s as ReturnType<typeof columnSub>).borrows.filter(x => x).length;
    return predict(`How many ${add ? 'exchanges (carries)' : 'breaks (borrows)'} will this calculation need?`, [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3 or more']], n >= 3 ? '3' : String(n), `There ${n === 1 ? 'is' : 'are'} ${n}: one for each column that ${add ? 'reaches ten' : 'runs short'}.`, 2);
  },
  challenge: (c, r) => {
    const digitsA = Math.max(2, String(scaled(c).A).length);
    const lo = 10 ** (digitsA - 1), hi = 10 ** digitsA - 1;
    let a = int(r, lo, hi), b = int(r, Math.floor(lo / 2), hi);
    if (c.op === 'sub' && b > a) [a, b] = [b, a];
    const k = 10 ** c.places; const res = c.op === 'add' ? a + b : a - b;
    const show = (v: number) => (c.places ? (v / k).toFixed(c.places) : fmt(v));
    return {prompt: `${show(a)} ${c.op === 'add' ? '+' : '−'} ${show(b)} = ?`, kind: 'number', answer: res / k, tolerance: c.places ? 1e-6 : 0, hint: c.op === 'add' ? 'Work from the right; carry tens.' : 'Work from the right; break a unit when a column is short.', explanation: `${show(a)} ${c.op === 'add' ? '+' : '−'} ${show(b)} = ${show(res)}${c.op === 'sub' ? `; check: ${show(res)} + ${show(b)} = ${show(a)}` : ''}.`};
  },
  describe: c => `Vertical ${c.op === 'add' ? 'addition' : 'subtraction'} of ${c.a} and ${c.b}, synchronised with base-ten blocks in place-value columns; exchanges are animated.`,
};

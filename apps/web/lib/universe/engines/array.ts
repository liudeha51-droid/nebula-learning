import type {EngineLogic} from '../types';
import {bool, fmt, int, num, str, numericOptions} from '../math';
import {sc, predict} from './util';

export type ArrayMode = 'groups' | 'commute' | 'table' | 'area' | 'distributive';
export interface ArrayConfig {mode: ArrayMode; rows: number; cols: number; n: number; a: number; b: number; c: number; estimate: boolean; object: 'apple' | 'star' | 'flower' | 'dot'}

/** Splits a number into place-value parts: 234 → [200, 30, 4] (zeros dropped). */
export const parts = (v: number) => String(v).split('').map((d, i, s) => Number(d) * 10 ** (s.length - 1 - i)).filter(x => x > 0);
export const roundLead = (v: number) => { const p = 10 ** (String(v).length - 1); return Math.round(v / p) * p; };

export const array: EngineLogic<ArrayConfig> = {
  type: 'array', label: 'Multiplication universe',
  parse: r => ({mode: str(r.mode, 'groups'), rows: num(r.rows, 3), cols: num(r.cols, 4), n: num(r.n, 6), a: num(r.a, 23), b: num(r.b, 4), c: num(r.c, 2), estimate: bool(r.estimate, false), object: str(r.object, 'dot')}),
  validate: c => {
    const e: string[] = [];
    if ((c.mode === 'groups' || c.mode === 'commute') && (c.rows < 1 || c.cols < 1 || c.rows > 10 || c.cols > 10)) e.push('rows and cols 1–10');
    if (c.mode === 'table' && (c.n < 1 || c.n > 9)) e.push('table 1–9');
    if (c.mode === 'area' && (c.a < 10 || c.b < 1 || c.a > 999 || c.b > 99)) e.push('area model: a 10–999, b 1–99');
    if (c.mode === 'distributive' && (c.a > 10 || c.b + c.c > 12)) e.push('distributive array must fit');
    return e;
  },
  scenes: c => {
    switch (c.mode) {
      case 'commute': return [
        sc('intro', 'introduce', `${c.rows} rows of ${c.cols}`, `An array: ${c.rows} rows with ${c.cols} in each row.`, 5),
        sc('problem', 'problem', `${c.rows} × ${c.cols} or ${c.cols} × ${c.rows}?`, 'Are these two multiplications the same amount?', 5),
        sc('count', 'explore', 'Read it by rows', `${Array(c.rows).fill(c.cols).join(' + ')} = ${c.rows * c.cols}.`, 7),
        sc('rotate', 'manipulate', 'Turn the array', 'Rotate the whole array a quarter turn. Nothing is added or removed.', 8),
        sc('discover', 'discover', 'Same objects, new view', `Now there are ${c.cols} rows of ${c.rows}: ${Array(c.cols).fill(c.rows).join(' + ')} = ${c.rows * c.cols}.`, 7),
        sc('explain', 'explain', 'Commutative property', `${c.rows} × ${c.cols} = ${c.cols} × ${c.rows} = ${c.rows * c.cols}. Order of factors does not change the product.`, 7),
        sc('apply', 'apply', 'Your turn', 'Use one fact to find its partner.', 5)];
      case 'table': return [
        sc('intro', 'introduce', `The ${c.n} times table`, `Groups of ${c.n}, stacked one row at a time.`, 5),
        sc('problem', 'problem', 'A pattern?', `What changes each time we add one more group of ${c.n}?`, 5),
        sc('grow', 'explore', 'Grow the array', `Each new row adds ${c.n}: ${Array.from({length: 9}, (_, i) => (i + 1) * c.n).join(', ')}.`, 12),
        sc('derive', 'manipulate', 'Build from friendly facts', `${c.n} × 7 = ${c.n} × 5 + ${c.n} × 2 = ${c.n * 5} + ${c.n * 2} = ${c.n * 7}.`, 8),
        sc('discover', 'discover', 'Facts are connected', `Every fact is the one before plus ${c.n}.`, 6),
        sc('explain', 'explain', 'Multiplication facts', `${c.n} × k = ${c.n} + ${c.n} + … (k times).`, 6),
        sc('apply', 'apply', 'Your turn', 'Recall facts from the table.', 5)];
      case 'area': { const pa = parts(c.a), pb = parts(c.b); const pp = pa.flatMap(x => pb.map(y => x * y)); return [
        sc('intro', 'introduce', `A ${c.a} by ${c.b} rectangle`, `Picture ${fmt(c.a)} × ${c.b} as a rectangle of unit squares.`, 5),
        sc('problem', 'problem', 'Too many to count', `There are too many squares to count. How can we break the problem up?`, 5),
        sc('split', 'explore', 'Split by place value', `Cut along place values: ${pa.join(' + ')}${pb.length > 1 ? ` by ${pb.join(' + ')}` : ''}.`, 8),
        sc('parts', 'manipulate', 'Easy pieces', `Each piece is an easy multiplication: ${pa.flatMap(x => pb.map(y => `${x} × ${y} = ${fmt(x * y)}`)).join('; ')}.`, 10),
        sc('discover', 'discover', 'Add the pieces', `${pp.map(fmt).join(' + ')} = ${fmt(c.a * c.b)}.`, 7),
        sc('explain', 'explain', 'The written method', `The written algorithm records the same partial products${pb.length > 1 ? ', one row for each digit of the second factor' : ''}.${c.estimate ? ` Estimate: ${roundLead(c.a)} × ${c.b} = ${fmt(roundLead(c.a) * c.b)}, close to ${fmt(c.a * c.b)}.` : ''}`, 9),
        sc('apply', 'apply', 'Your turn', 'Split and multiply a new pair.', 5)]; }
      case 'distributive': return [
        sc('intro', 'introduce', 'One big array', `${c.a} rows of ${c.b + c.c}.`, 5),
        sc('problem', 'problem', `${c.a} × (${c.b} + ${c.c})`, 'Can we split it into friendlier pieces?', 5),
        sc('split', 'explore', 'Cut the array', `Cut between column ${c.b} and ${c.b + 1}.`, 7),
        sc('apart', 'manipulate', 'Two smaller arrays', `${c.a} × ${c.b} = ${c.a * c.b} and ${c.a} × ${c.c} = ${c.a * c.c}.`, 8),
        sc('discover', 'discover', 'Put them back', `${c.a * c.b} + ${c.a * c.c} = ${c.a * (c.b + c.c)}, the same as ${c.a} × ${c.b + c.c}.`, 7),
        sc('explain', 'explain', 'Distributive law', `a × (b + c) = a × b + a × c: ${c.a} × (${c.b} + ${c.c}) = ${c.a} × ${c.b} + ${c.a} × ${c.c}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Use the law to calculate cleverly.', 5)];
      default: return [
        sc('intro', 'introduce', 'Equal groups', `${c.rows} baskets, each holding ${c.cols} ${c.object}s.`, 5),
        sc('problem', 'problem', 'How many altogether?', 'Counting one by one is slow. Is there a faster way?', 5),
        sc('add', 'explore', 'Repeated addition', `${Array(c.rows).fill(c.cols).join(' + ')} = ${c.rows * c.cols}.`, 8),
        sc('array', 'manipulate', 'Groups become rows', 'Line each group up as a row: the groups become a rectangular array.', 8),
        sc('discover', 'discover', 'Rows × columns', `${c.rows} rows of ${c.cols} make ${c.rows * c.cols}.`, 6),
        sc('explain', 'explain', 'Multiplication', `${c.rows} × ${c.cols} = ${c.rows * c.cols}. ${c.rows} and ${c.cols} are factors; ${c.rows * c.cols} is the product.`, 7),
        sc('apply', 'apply', 'Your turn', 'Write a multiplication for a new picture.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'commute': return predict('After rotating the array a quarter turn, the number of objects will be…', [['a', 'More'], ['b', 'Fewer'], ['c', 'The same']], 'c', 'Turning moves objects; it never adds or removes any.', 3);
      case 'table': return predict(`${c.n} × 6 is how much more than ${c.n} × 5?`, [['a', String(c.n)], ['b', '1'], ['c', '6']], 'a', 'One more group of ' + c.n + '.', 3);
      case 'area': return predict(`Roughly how big is ${fmt(c.a)} × ${c.b}?`, [['a', `About ${fmt(roundLead(c.a) * c.b)}`], ['b', `About ${fmt(roundLead(c.a) + c.b)}`], ['c', `About ${fmt(roundLead(c.a) * c.b * 10)}`]], 'a', `${roundLead(c.a)} × ${c.b} = ${fmt(roundLead(c.a) * c.b)}.`, 3);
      case 'distributive': return predict(`${c.a} × ${c.b} + ${c.a} × ${c.c} compared with ${c.a} × ${c.b + c.c}:`, [['a', 'Equal'], ['b', 'Smaller'], ['c', 'Bigger']], 'a', 'The two pieces make the whole array.', 3);
      default: return predict(`${c.rows} groups of ${c.cols}: which matches?`, [['a', `${c.rows} × ${c.cols}`], ['b', `${c.rows} + ${c.cols}`], ['c', `${c.cols} − ${c.rows}`]], 'a', 'Equal groups are multiplication.', 2);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'area': { const a = c.a >= 100 ? int(r, 101, 499) : int(r, 12, 98); const b = c.b >= 10 ? int(r, 12, 49) : int(r, 3, 9); return {prompt: `${a} × ${b} = ?`, kind: 'number', answer: a * b, hint: `Split ${a} into ${parts(a).join(' + ')}.`, explanation: `${parts(a).flatMap(x => parts(b).map(y => fmt(x * y))).join(' + ')} = ${fmt(a * b)}.`}; }
      case 'distributive': { const a = int(r, 3, 9), b = int(r, 10, 99); const near = Math.round(b / 10) * 10; return {prompt: `${a} × ${b} = ${a} × ${near} ${b >= near ? '+' : '−'} ${a} × ${Math.abs(b - near)} = ?`, kind: 'number', answer: a * b, hint: 'Multiply each part, then combine.', explanation: `${a * near} ${b >= near ? '+' : '−'} ${a * Math.abs(b - near)} = ${a * b}.`}; }
      case 'commute': { const x = int(r, 3, 9), y = int(r, 3, 9); return {prompt: `${x} × ${y} = ${x * y}. So ${y} × ${x} = ?`, kind: 'number', answer: x * y, hint: 'Rotate the array in your mind.', explanation: 'Same product.'}; }
      case 'table': { const k = int(r, 2, 9), n = c.n; return {prompt: `${n} × ${k} = ?`, kind: 'choice', options: numericOptions(r, n * k, [n * k + n, n * k - n, n + k]), answer: fmt(n * k), hint: `Count on in ${n}s.`, explanation: `${n} × ${k} = ${n * k}.`}; }
      default: { const g = int(r, 2, 8), s = int(r, 2, 9); return {prompt: `${g} plates with ${s} dumplings on each. How many dumplings?`, kind: 'number', answer: g * s, hint: `${g} × ${s}.`, explanation: `${g} × ${s} = ${g * s}.`}; }
    }
  },
  describe: c => c.mode === 'area' ? `Area model splitting ${c.a} × ${c.b} into place-value rectangles with partial products.` : `Array of dots: ${c.mode === 'distributive' ? `${c.a} × (${c.b} + ${c.c})` : c.mode === 'table' ? `the ${c.n} times table growing row by row` : `${c.rows} rows of ${c.cols}`}.`,
};

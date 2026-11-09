import type {EngineLogic} from '../types';
import {fmt, int, longDivision, num, str} from '../math';
import {sc, predict} from './util';
import {PLACE_NAMES} from './place-value';

export type DivisionMode = 'share' | 'group' | 'remainder' | 'inverse' | 'long';
export interface DivisionConfig {mode: DivisionMode; total: number; divisor: number}

export const division: EngineLogic<DivisionConfig> = {
  type: 'division', label: 'Sharing and grouping machine',
  parse: r => ({mode: str(r.mode, 'share'), total: num(r.total, 12), divisor: num(r.divisor, 3)}),
  validate: c => {
    const e: string[] = [];
    if (c.divisor < 1) e.push('divisor must be positive');
    if (c.mode !== 'long' && c.total > 40) e.push('object modes use at most 40 objects');
    if ((c.mode === 'share' || c.mode === 'group' || c.mode === 'inverse') && c.total % c.divisor !== 0) e.push('this mode needs exact division');
    if (c.mode === 'remainder' && c.total % c.divisor === 0) e.push('remainder mode needs a remainder');
    return e;
  },
  scenes: c => {
    const q = Math.floor(c.total / c.divisor), r = c.total % c.divisor;
    switch (c.mode) {
      case 'group': return [
        sc('intro', 'introduce', `${c.total} eggs`, `${c.total} eggs and empty boxes that hold ${c.divisor} each.`, 5),
        sc('problem', 'problem', 'How many boxes?', `How many boxes of ${c.divisor} can we fill?`, 5),
        sc('fill', 'explore', 'Fill a box at a time', `Each box takes ${c.divisor}. Keep going until the eggs run out.`, 9),
        sc('count', 'manipulate', 'Count the boxes', `${q} full boxes.`, 6),
        sc('discover', 'discover', 'Grouping is division', `${c.total} split into groups of ${c.divisor} gives ${q} groups.`, 6),
        sc('explain', 'explain', 'Grouping division', `${c.total} ÷ ${c.divisor} = ${q}: “how many ${c.divisor}s fit into ${c.total}?”`, 7),
        sc('apply', 'apply', 'Your turn', 'Solve a grouping story.', 5)];
      case 'remainder': return [
        sc('intro', 'introduce', `${c.total} children`, `${c.total} children want to ride boats that seat ${c.divisor}.`, 5),
        sc('problem', 'problem', 'Does it work out exactly?', `Can every boat be full?`, 5),
        sc('fill', 'explore', 'Fill the boats', `Fill boats of ${c.divisor} one by one.`, 9),
        sc('left', 'manipulate', 'Some are left', `${r} ${r === 1 ? 'child is' : 'children are'} left — not enough for another full boat.`, 7),
        sc('discover', 'discover', 'The remainder is smaller', `The remainder ${r} is less than ${c.divisor}; if it reached ${c.divisor} we could fill another boat.`, 8),
        sc('explain', 'explain', 'Quotient and remainder', `${c.total} ÷ ${c.divisor} = ${q} R ${r}, because ${c.divisor} × ${q} + ${r} = ${c.total}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Decide what to do with remainders in stories.', 5)];
      case 'inverse': return [
        sc('intro', 'introduce', 'Sharing', `${c.total} stars shared by ${c.divisor} friends.`, 5),
        sc('problem', 'problem', 'Can we undo it?', 'If we play the sharing backwards, what operation is that?', 5),
        sc('share', 'explore', 'Share', `${c.total} ÷ ${c.divisor} = ${q}: each friend gets ${q}.`, 8),
        sc('reverse', 'manipulate', 'Play it backwards', `Put ${c.divisor} shares of ${q} back together.`, 8),
        sc('discover', 'discover', 'Backwards is multiplication', `${c.divisor} × ${q} = ${c.total}. Division undoes multiplication.`, 7),
        sc('explain', 'explain', 'A fact family', `${c.divisor} × ${q} = ${c.total}, ${q} × ${c.divisor} = ${c.total}, ${c.total} ÷ ${c.divisor} = ${q}, ${c.total} ÷ ${q} = ${c.divisor}.`, 9),
        sc('apply', 'apply', 'Your turn', 'Use a times fact to divide.', 5)];
      case 'long': { const ld = longDivision(c.total, c.divisor); const len = String(c.total).length; const zero = ld.steps.some((s, i) => s.q === 0 && i > 0 && ld.steps.slice(0, i).some(t => t.q > 0)); return [
        sc('intro', 'introduce', `${fmt(c.total)} ÷ ${c.divisor}`, `Share ${fmt(c.total)} into ${c.divisor} equal parts, starting with the biggest place.`, 6),
        sc('problem', 'problem', 'Where does the first digit go?', c.divisor >= 10 ? `Round ${c.divisor} to ${Math.round(c.divisor / 10) * 10} to make a first guess.` : `Can the ${PLACE_NAMES[len - 1]} be shared first?`, 6),
        sc('steps', 'explore', 'Divide, multiply, subtract, bring down', 'Each step shares one place; leftovers are exchanged into the next smaller place.', 12),
        sc('check', 'manipulate', 'Check each step', `Every step is a multiplication fact: ${ld.steps.filter(s => s.q).map(s => `${s.q} × ${c.divisor} = ${s.product}`).join('; ')}.`, 9),
        sc('discover', 'discover', 'The quotient', `${fmt(c.total)} ÷ ${c.divisor} = ${fmt(ld.quotient)}${ld.remainder ? ` R ${ld.remainder}` : ''}.${zero ? ' A place that could not be shared gets a 0 in the quotient.' : ''}`, 7),
        sc('explain', 'explain', 'Verify', `${fmt(ld.quotient)} × ${c.divisor}${ld.remainder ? ` + ${ld.remainder}` : ''} = ${fmt(c.total)}.`, 7),
        sc('apply', 'apply', 'Your turn', 'Carry out a new long division.', 5)]; }
      default: return [
        sc('intro', 'introduce', `${c.total} cookies, ${c.divisor} friends`, `${c.total} cookies to share fairly among ${c.divisor} friends.`, 5),
        sc('problem', 'problem', 'Fair shares?', 'How many does each friend get, if everyone gets the same?', 5),
        sc('deal', 'explore', 'Deal one round at a time', 'Give one to each friend, then another round, until none are left.', 10),
        sc('check', 'manipulate', 'Is it fair?', `Every plate has ${q}.`, 6),
        sc('discover', 'discover', 'Equal sharing', `${c.total} shared equally by ${c.divisor} gives ${q} each.`, 6),
        sc('explain', 'explain', 'Division', `${c.total} ÷ ${c.divisor} = ${q}. ${c.total} is the dividend, ${c.divisor} the divisor, ${q} the quotient.`, 8),
        sc('apply', 'apply', 'Your turn', 'Share in a new story.', 5)];
    }
  },
  prediction: c => {
    const q = Math.floor(c.total / c.divisor), r = c.total % c.divisor;
    switch (c.mode) {
      case 'remainder': return predict(`How many children will be left without a full boat?`, [['a', String(r)], ['b', String(c.divisor)], ['c', '0']], 'a', `${c.divisor} × ${q} = ${c.total - r}; ${r} left.`, 3);
      case 'inverse': return predict(`What do ${c.divisor} shares of ${q} make together?`, [['a', String(c.total)], ['b', String(q + c.divisor)], ['c', String(q)]], 'a', `${c.divisor} × ${q} = ${c.total}.`, 3);
      case 'long': { const ld = longDivision(c.total, c.divisor); return predict(`How many digits will the quotient have?`, [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']], String(String(ld.quotient).length), `The first place that can be shared sets the length: ${fmt(ld.quotient)}.`, 2); }
      case 'group': return predict(`How many boxes of ${c.divisor}?`, [['a', String(q)], ['b', String(c.divisor)], ['c', String(c.total - c.divisor)]], 'a', `${c.total} ÷ ${c.divisor} = ${q}.`, 3);
      default: return predict('After dealing, each friend has…', [['a', String(q)], ['b', String(c.divisor)], ['c', String(c.total - c.divisor)]], 'a', `${c.total} ÷ ${c.divisor} = ${q}.`, 3);
    }
  },
  challenge: (c, r) => {
    if (c.mode === 'long') { const d = c.divisor >= 10 ? int(r, 12, 39) : int(r, 2, 9); const qv = c.divisor >= 10 ? int(r, 12, 39) : int(r, 21, 299); const rem = int(r, 0, d - 1); const t = d * qv + rem;
      return {prompt: `${fmt(t)} ÷ ${d} = ? (give the quotient; remainder ${rem})`, kind: 'number', answer: qv, hint: 'Share the biggest place first.', explanation: `${qv} × ${d} + ${rem} = ${fmt(t)}.`}; }
    const d = int(r, 2, 9), q = int(r, 2, 9);
    if (c.mode === 'remainder') { const rem = int(r, 1, d - 1); return {prompt: `${d * q + rem} ÷ ${d} = ${q} R ?`, kind: 'number', answer: rem, hint: `${d} × ${q} = ${d * q}.`, explanation: `${d * q + rem} − ${d * q} = ${rem}.`}; }
    if (c.mode === 'inverse') return {prompt: `${d} × ${q} = ${d * q}, so ${d * q} ÷ ${q} = ?`, kind: 'number', answer: d, hint: 'Use the fact family.', explanation: `${d * q} ÷ ${q} = ${d}.`};
    if (c.mode === 'group') return {prompt: `${d * q} pencils go in packs of ${d}. How many packs?`, kind: 'number', answer: q, hint: `How many ${d}s make ${d * q}?`, explanation: `${d * q} ÷ ${d} = ${q}.`};
    return {prompt: `${d * q} stickers shared equally by ${d} children. How many each?`, kind: 'number', answer: q, hint: `${d} × ? = ${d * q}.`, explanation: `${d * q} ÷ ${d} = ${q}.`};
  },
  describe: c => c.mode === 'long' ? `Long division of ${c.total} by ${c.divisor}, step by step with each multiplication check.` : `${c.total} objects ${c.mode === 'share' || c.mode === 'inverse' ? `dealt among ${c.divisor} plates` : `packed into groups of ${c.divisor}`}${c.mode === 'remainder' ? ', with a remainder' : ''}.`,
};

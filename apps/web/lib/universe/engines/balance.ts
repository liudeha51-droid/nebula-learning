import type {EngineLogic} from '../types';
import {int, num, str} from '../math';
import {sc, predict} from './util';

export type BalanceMode = 'equation' | 'expression' | 'equality';
export interface BalanceConfig {mode: BalanceMode; a: number; b: number; c: number; coef: number; constant: number}

export const balance: EngineLogic<BalanceConfig> = {
  type: 'balance', label: 'Algebraic balance laboratory',
  parse: r => ({mode: str(r.mode, 'equation'), a: num(r.a, 3), b: num(r.b, 4), c: num(r.c, 19), coef: num(r.coef, 3), constant: num(r.constant, 2)}),
  validate: c => (c.mode === 'equation' && ((c.c - c.b) % c.a !== 0 || c.c <= c.b) ? ['equation must have a positive whole-number solution'] : []),
  scenes: c => {
    const x = (c.c - c.b) / c.a;
    switch (c.mode) {
      case 'expression': return [
        sc('intro', 'introduce', 'A mystery box', 'Each pink box hides the same number, a.', 5),
        sc('problem', 'problem', `${c.coef}a + ${c.constant}`, `${c.coef} boxes and ${c.constant} single weights. How much is that?`, 6),
        sc('try', 'explore', 'Try a value', 'If a = 1, the total is ' + (c.coef + c.constant) + '; if a = 2, it is ' + (2 * c.coef + c.constant) + '.', 8),
        sc('table', 'manipulate', 'A table of values', `Every time a grows by 1, the total grows by ${c.coef}.`, 8),
        sc('discover', 'discover', 'One rule, many numbers', `${c.coef}a + ${c.constant} describes the total for any value of a.`, 7),
        sc('explain', 'explain', 'Letters and substitution', `${c.coef}a means ${c.coef} × a. Substitute a = 5: ${c.coef} × 5 + ${c.constant} = ${5 * c.coef + c.constant}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Evaluate expressions.', 5)];
      case 'equality': return [
        sc('intro', 'introduce', 'A balanced scale', 'x + 3 on the left, 10 on the right: level.', 5),
        sc('problem', 'problem', 'Keep it level', 'What can we do to the scale without tipping it?', 5),
        sc('one', 'explore', 'Change one side', 'Remove 3 from the left only: it tips.', 7),
        sc('both', 'manipulate', 'Change both sides', 'Remove 3 from both sides: still level. Double both sides: still level.', 9),
        sc('discover', 'discover', 'Do the same to both sides', 'Adding, subtracting, multiplying or dividing (not by 0) both sides equally keeps the balance.', 7),
        sc('explain', 'explain', 'Properties of equality', 'If a = b then a + c = b + c, a − c = b − c, ac = bc, a ÷ c = b ÷ c (c ≠ 0).', 8),
        sc('apply', 'apply', 'Your turn', 'Keep equations balanced.', 5)];
      default: return [
        sc('intro', 'introduce', 'The balance', `${c.a} mystery boxes and ${c.b} weights balance ${c.c} weights.`, 6),
        sc('problem', 'problem', `${c.a}x + ${c.b} = ${c.c}`, 'How heavy is one box?', 5),
        sc('remove', 'explore', `Remove ${c.b} from both sides`, `Take ${c.b} single weights off each pan: ${c.a}x = ${c.c - c.b}. Still balanced.`, 9),
        sc('share', 'manipulate', `Split into ${c.a} groups`, `Share both sides into ${c.a} equal groups: one box balances ${x}.`, 9),
        sc('discover', 'discover', `x = ${x}`, `Each box weighs ${x}.`, 6),
        sc('explain', 'explain', 'Solving equations', `${c.a}x + ${c.b} = ${c.c} → ${c.a}x = ${c.c - c.b} → x = ${x}. Check: ${c.a} × ${x} + ${c.b} = ${c.c}.`, 9),
        sc('apply', 'apply', 'Your turn', 'Solve equations.', 5)];
    }
  },
  prediction: c => {
    if (c.mode === 'expression') return predict(`If a = 4, what is ${c.coef}a + ${c.constant}?`, [['a', String(4 * c.coef + c.constant)], ['b', String(c.coef + 4 + c.constant)], ['c', `${c.coef}4${c.constant > 0 ? '+' + c.constant : ''}`]], 'a', `${c.coef} × 4 + ${c.constant}.`, 2);
    if (c.mode === 'equality') return predict('Remove 3 weights from the left pan only. The scale…', [['a', 'Tips'], ['b', 'Stays level']], 'a', 'Only one side changed.', 2);
    return predict(`After removing ${c.b} from both pans, the scale…`, [['a', 'Stays level'], ['b', 'Tips left'], ['c', 'Tips right']], 'a', 'Equal changes keep it balanced.', 2);
  },
  challenge: (c, r) => {
    if (c.mode === 'expression') { const k = int(r, 2, 9), m = int(r, 1, 9), a = int(r, 2, 10); return {prompt: `If a = ${a}, what is ${k}a + ${m}?`, kind: 'number', answer: k * a + m, hint: `${k} × ${a} first.`, explanation: `${k * a} + ${m} = ${k * a + m}.`}; }
    const a = int(r, 2, 9), x = int(r, 2, 12), b = int(r, 1, 20);
    if (c.mode === 'equality') return {prompt: `x + ${b} = ${x + b}. Subtract ${b} from both sides: x = ?`, kind: 'number', answer: x, hint: 'Do the same to both sides.', explanation: `x = ${x}.`};
    return {prompt: `Solve ${a}x + ${b} = ${a * x + b}.`, kind: 'number', answer: x, hint: `Remove ${b} from both sides, then divide by ${a}.`, explanation: `${a}x = ${a * x}, x = ${x}.`};
  },
  describe: c => c.mode === 'equation' ? `Balance scale for ${c.a}x + ${c.b} = ${c.c}; boxes are unknowns, discs are units.` : `Balance scale exploring ${c.mode === 'expression' ? `${c.coef}a + ${c.constant}` : 'properties of equality'}.`,
};

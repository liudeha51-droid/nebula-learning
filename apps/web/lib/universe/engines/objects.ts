import type {EngineLogic} from '../types';
import {int, num, str} from '../math';
import {sc, predict} from './util';

export type ObjectsMode = 'add' | 'subtract' | 'make-ten' | 'break-ten' | 'repeated' | 'mixed';
export interface ObjectsConfig {mode: ObjectsMode; a: number; b: number; c2: number; object: 'star' | 'apple' | 'fish' | 'flower' | 'chick' | 'ball'}

export const objects: EngineLogic<ObjectsConfig> = {
  type: 'objects', label: 'Ten-frame arithmetic',
  parse: r => ({mode: str(r.mode, 'add'), a: num(r.a, 3), b: num(r.b, 2), c2: num(r.c2, 0), object: str(r.object, 'apple')}),
  validate: c => {
    const e: string[] = [];
    if (c.mode === 'add' && c.a + c.b > 10) e.push('add mode stays within 10');
    if (c.mode === 'subtract' && (c.b > c.a || c.a > 10)) e.push('subtract needs b ≤ a ≤ 10');
    if (c.mode === 'make-ten' && (c.a > 10 || c.b > 10 || c.a + c.b <= 10)) e.push('make-ten needs a sum over 10 with addends ≤ 10');
    if (c.mode === 'break-ten' && (c.a <= 10 || c.a > 19 || c.b <= c.a - 10 || c.b > 10)) e.push('break-ten needs 11–19 minus more than its ones');
    if (c.mode === 'repeated' && (c.a * c.b > 20 || c.a < 1 || c.b < 2)) e.push('repeated groups total ≤ 20');
    if (c.mode === 'mixed' && (c.b > c.a || c.a - c.b + c.c2 > 20)) e.push('mixed must stay between 0 and 20');
    return e;
  },
  scenes: c => {
    const o = c.object + 's', {a, b} = c;
    switch (c.mode) {
      case 'subtract': return [
        sc('intro', 'introduce', `${a} ${o}`, `${a} ${o} rest in the ten-frame.`, 5),
        sc('problem', 'problem', 'Some leave', `${b} of them are about to leave. How many will stay?`, 5),
        sc('leave', 'explore', 'Take away', `Watch ${b} ${o} leave, one at a time.`, 8),
        sc('back', 'manipulate', 'Bring them back', `If the ${b} come back, we have ${a} again: adding undoes taking away.`, 7),
        sc('discover', 'discover', `${a - b} stay`, `${a} take away ${b} leaves ${a - b}.`, 6),
        sc('explain', 'explain', 'Subtraction sentence', `${a} − ${b} = ${a - b}, and ${a - b} + ${b} = ${a}.`, 7),
        sc('apply', 'apply', 'Your turn', 'Solve a new take-away story.', 5)];
      case 'make-ten': { const need = 10 - a, rest = b - need; return [
        sc('intro', 'introduce', 'Two ten-frames', `${a} ${o} in one frame, ${b} in the other.`, 5),
        sc('problem', 'problem', `${a} + ${b} = ?`, 'The answer is more than ten. Is there a quicker way than counting every one?', 6),
        sc('gaps', 'explore', 'Look at the gaps', `The first frame has ${need} empty ${need === 1 ? 'space' : 'spaces'}.`, 6),
        sc('move', 'manipulate', 'Fill the frame', `Move ${need} ${o} across to complete the ten.`, 9),
        sc('discover', 'discover', `10 and ${rest}`, `One full ten and ${rest} left over: ${10 + rest}.`, 7),
        sc('explain', 'explain', 'Make ten', `${a} + ${b} = ${a} + ${need} + ${rest} = 10 + ${rest} = ${a + b}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Use make-ten on a new sum, or try counting on.', 5)]; }
      case 'break-ten': { const ones = a - 10, fromTen = b - ones; return [
        sc('intro', 'introduce', `${a} ${o}`, `${a} is one full ten and ${ones} ones.`, 5),
        sc('problem', 'problem', `${a} − ${b} = ?`, `We only have ${ones} loose ones but must take away ${b}.`, 6),
        sc('choose', 'explore', 'Take from the ten', `Take all ${b} from the full ten instead.`, 6),
        sc('take', 'manipulate', 'Break the ten', `${b} leave the ten-frame; ${10 - b} stay in it.`, 8),
        sc('discover', 'discover', 'Put the rest together', `${10 - b} in the frame plus the ${ones} ones make ${a - b}.`, 7),
        sc('explain', 'explain', 'Break ten', `${a} − ${b} = (10 − ${b}) + ${ones} = ${10 - b} + ${ones} = ${a - b}. Another way: take ${ones}, then ${fromTen} more.`, 9),
        sc('apply', 'apply', 'Your turn', 'Break a ten in a new problem.', 5)]; }
      case 'repeated': return [
        sc('intro', 'introduce', 'Equal groups', `Groups of ${a} ${o} arrive one after another.`, 5),
        sc('problem', 'problem', `${b} groups of ${a}`, 'How many altogether when every group is the same size?', 5),
        sc('add', 'explore', 'Add a group each time', `${Array(b).fill(a).join(' + ')} — the total grows by ${a} each time.`, 9),
        sc('back', 'manipulate', 'Take groups away', `Now take ${a} away again and again until none are left.`, 8),
        sc('discover', 'discover', 'Same steps', `Adding ${a} ${b} times reaches ${a * b}; taking ${a} away ${b} times returns to 0.`, 7),
        sc('explain', 'explain', 'Repeated addition', `${Array(b).fill(a).join(' + ')} = ${a * b}. In Grade 2 this becomes ${b} × ${a}.`, 7),
        sc('apply', 'apply', 'Your turn', 'Count equal groups in a new picture.', 5)];
      case 'mixed': return [
        sc('intro', 'introduce', 'The bus', `${a} passengers sit on the bus.`, 5),
        sc('problem', 'problem', 'Off and on', `At the stop, ${b} get off and ${c.c2} get on. How many now?`, 6),
        sc('off', 'explore', 'Some get off', `${b} leave: ${a} − ${b} = ${a - b}.`, 7),
        sc('on', 'manipulate', 'Some get on', `${c.c2} join: ${a - b} + ${c.c2} = ${a - b + c.c2}.`, 7),
        sc('discover', 'discover', 'Step by step', `Working in order gives ${a - b + c.c2} passengers.`, 6),
        sc('explain', 'explain', 'Mixed sentence', `${a} − ${b} + ${c.c2} = ${a - b + c.c2}. Work from left to right.`, 7),
        sc('apply', 'apply', 'Your turn', 'Solve another two-step story.', 5)];
      default: return [
        sc('intro', 'introduce', 'Two groups', `${a} ${o} here and ${b} ${o} there.`, 5),
        sc('problem', 'problem', 'How many altogether?', 'If we put them together, how many will there be?', 5),
        sc('join', 'explore', 'Put together', 'Slide the second group into the frame.', 8),
        sc('swap', 'manipulate', 'Swap the order', `Start with the ${b} instead. Does the total change?`, 7),
        sc('discover', 'discover', `${a + b} altogether`, `${a} and ${b} make ${a + b}, whichever group comes first.`, 6),
        sc('explain', 'explain', 'Addition sentence', `${a} + ${b} = ${a + b} and ${b} + ${a} = ${a + b}.`, 7),
        sc('apply', 'apply', 'Your turn', 'Solve a new joining story.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'subtract': return predict(`${c.a} ${c.object}s, ${c.b} leave. How many stay?`, [['a', String(c.a - c.b)], ['b', String(c.a + c.b)], ['c', String(c.b)]], 'a', `${c.a} − ${c.b} = ${c.a - c.b}.`, 2);
      case 'make-ten': return predict(`How many ${c.object}s must move to fill the first ten-frame?`, [['a', String(10 - c.a)], ['b', String(c.b)], ['c', String(c.a)]], 'a', `${c.a} + ${10 - c.a} = 10.`, 3);
      case 'break-ten': return predict(`After taking ${c.b} from the full ten, how many stay in the frame?`, [['a', String(10 - c.b)], ['b', String(c.b)], ['c', String(c.a - 10)]], 'a', `10 − ${c.b} = ${10 - c.b}.`, 3);
      case 'repeated': return predict(`What is the total of ${c.b} groups of ${c.a}?`, [['a', String(c.a * c.b)], ['b', String(c.a + c.b)], ['c', String(c.a * c.b + c.a)]], 'a', `${Array(c.b).fill(c.a).join(' + ')} = ${c.a * c.b}.`, 2);
      case 'mixed': return predict('After the stop, are there more or fewer passengers than at the start?', [['a', 'More'], ['b', 'Fewer'], ['c', 'The same']], c.c2 > c.b ? 'a' : c.c2 < c.b ? 'b' : 'c', `${c.b} left and ${c.c2} joined.`, 2);
      default: return predict(`If we start with the ${c.b} group instead, the total will be…`, [['a', 'Bigger'], ['b', 'Smaller'], ['c', 'The same']], 'c', 'Joining the same groups in a different order gives the same total.', 3);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'subtract': { const a = int(r, 5, 10), b = int(r, 1, a); return {prompt: `${a} − ${b} = ?`, kind: 'number', answer: a - b, hint: 'Take away, then count what is left.', explanation: `${a} − ${b} = ${a - b}.`}; }
      case 'make-ten': { const a = int(r, 6, 9), b = int(r, 11 - a, 9); return {prompt: `Use make-ten: ${a} + ${b} = ?`, kind: 'number', answer: a + b, hint: `${a} needs ${10 - a} to make ten.`, explanation: `${a} + ${10 - a} = 10, then 10 + ${b - (10 - a)} = ${a + b}.`}; }
      case 'break-ten': { const a = int(r, 11, 18), ones = a - 10, b = int(r, ones + 1, 9); return {prompt: `Break ten: ${a} − ${b} = ?`, kind: 'number', answer: a - b, hint: `Take ${b} from 10 first.`, explanation: `10 − ${b} = ${10 - b}; ${10 - b} + ${ones} = ${a - b}.`}; }
      case 'repeated': { const a = int(r, 2, 5), b = int(r, 2, 4); return {prompt: `${Array(b).fill(a).join(' + ')} = ?`, kind: 'number', answer: a * b, hint: `Count on by ${a}.`, explanation: `${b} groups of ${a} make ${a * b}.`}; }
      case 'mixed': { const a = int(r, 8, 15), b = int(r, 2, 7), d = int(r, 1, 6); return {prompt: `${a} people are on a bus. ${b} get off and ${d} get on. How many now?`, kind: 'number', answer: a - b + d, hint: 'First take away, then add.', explanation: `${a} − ${b} + ${d} = ${a - b + d}.`}; }
      default: { const a = int(r, 1, 6), b = int(r, 1, 10 - a); return {prompt: `${a} + ${b} = ?`, kind: 'number', answer: a + b, hint: 'Start at the bigger number and count on.', explanation: `${a} + ${b} = ${a + b}.`}; }
    }
  },
  describe: c => `Two ten-frames with ${c.object}s showing ${c.mode === 'subtract' || c.mode === 'break-ten' ? `${c.a} − ${c.b}` : c.mode === 'repeated' ? `${c.b} groups of ${c.a}` : c.mode === 'mixed' ? `${c.a} − ${c.b} + ${c.c2}` : `${c.a} + ${c.b}`}; objects move between frames as the story unfolds.`,
};

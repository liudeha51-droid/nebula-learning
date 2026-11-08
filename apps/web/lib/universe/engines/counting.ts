import type {EngineLogic} from '../types';
import {int, num, str, numericOptions, pick} from '../math';
import {sc, predict} from './util';

export type CountingMode = 'count' | 'teen' | 'bond' | 'compare' | 'ordinal' | 'zero';
export interface CountingConfig {mode: CountingMode; n: number; a: number; b: number; object: 'star' | 'apple' | 'fish' | 'flower' | 'chick' | 'ball'}

const word = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export const numberWord = (n: number) => word[n] ?? String(n);
export const ordinal = (n: number) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');

export const counting: EngineLogic<CountingConfig> = {
  type: 'counting', label: 'Counting world',
  parse: r => ({mode: str(r.mode, 'count'), n: num(r.n, 7), a: num(r.a, 5), b: num(r.b, 3), object: str(r.object, 'star')}),
  validate: c => {
    const e: string[] = [];
    if (c.mode === 'count' && (c.n < 1 || c.n > 10)) e.push('count mode needs 1–10 objects');
    if (c.mode === 'teen' && (c.n < 11 || c.n > 20)) e.push('teen mode needs 11–20');
    if (c.mode === 'bond' && (c.n < 2 || c.n > 10)) e.push('bond mode needs 2–10');
    if (c.mode === 'compare' && (c.a < 0 || c.b < 0 || c.a > 10 || c.b > 10)) e.push('compare needs 0–10');
    if (c.mode === 'ordinal' && (c.n < 3 || c.n > 10 || c.a < 1 || c.a > c.n)) e.push('ordinal position must be inside the queue');
    if (c.mode === 'zero' && (c.n < 1 || c.n > 6)) e.push('zero mode starts with 1–6 objects');
    return e;
  },
  scenes: c => {
    const o = c.object + 's';
    switch (c.mode) {
      case 'teen': return [
        sc('intro', 'introduce', 'A pile of ' + o, `${c.n} ${o} have landed in the meadow. That is too many to see at a glance.`, 6),
        sc('problem', 'problem', 'Too many to count at once?', 'Is there a smarter way to see how many there are?', 5),
        sc('frame', 'explore', 'Fill a ten-frame', 'Watch ten of them hop into a ten-frame, one per box.', 9),
        sc('bundle', 'manipulate', 'Ten becomes one ten', 'A full frame is bundled into one ten. The rest stay as ones.', 8),
        sc('discover', 'discover', `1 ten and ${c.n - 10} ones`, `${c.n} is one ten and ${c.n - 10} ones.`, 7),
        sc('explain', 'explain', 'Tens and ones', `The digit 1 means one ten. The digit ${c.n - 10} means ${c.n - 10} ones. Together: ${c.n}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Try building another teen number with tens and ones.', 5)];
      case 'bond': return [
        sc('intro', 'introduce', `${c.n} ${o} in two baskets`, `We have ${c.n} ${o}. Let's share them between two baskets.`, 6),
        sc('problem', 'problem', 'How many ways?', `How many different ways can ${c.n} be split into two parts?`, 5),
        sc('split', 'explore', 'Split and recombine', `One split: ${c.a} and ${c.n - c.a}. Put them back together and we have ${c.n} again.`, 8),
        sc('slide', 'manipulate', 'Slide the divider', 'Move the divider one step at a time. The total never changes.', 10),
        sc('discover', 'discover', 'Every pair makes ' + c.n, `0 and ${c.n}, 1 and ${c.n - 1}, … all make ${c.n}. One part grows when the other shrinks.`, 9),
        sc('explain', 'explain', 'Number bond', `A number bond shows ${c.n} = ${c.a} + ${c.n - c.a}. The whole is made of two parts.`, 7),
        sc('apply', 'apply', 'Your turn', 'Find a missing part.', 5)];
      case 'compare': return [
        sc('intro', 'introduce', 'Two teams', `The top row has ${c.a} ${o}; the bottom row has ${c.b}.`, 6),
        sc('problem', 'problem', 'Which has more?', 'Without counting, can we tell which row has more?', 5),
        sc('match', 'explore', 'Match one to one', 'Pair each top object with one bottom object.', 9),
        sc('left', 'manipulate', 'Who is left over?', 'Objects without a partner show which group is bigger.', 7),
        sc('discover', 'discover', 'More, fewer or equal', c.a === c.b ? 'Everyone has a partner. The rows are equal.' : `${Math.abs(c.a - c.b)} left without a partner, so ${c.a > c.b ? 'the top' : 'the bottom'} row has more.`, 7),
        sc('explain', 'explain', 'Symbols', `We write ${c.a} ${c.a > c.b ? '>' : c.a < c.b ? '<' : '='} ${c.b}. The open side faces the bigger number.`, 8),
        sc('apply', 'apply', 'Your turn', 'Compare two new numbers.', 5)];
      case 'ordinal': return [
        sc('intro', 'introduce', 'The ticket queue', `${c.n} animals wait in a queue for the rocket ride.`, 6),
        sc('problem', 'problem', `“${c.a}” or “${ordinal(c.a)}”?`, `Is “${c.a} animals” the same as “the ${ordinal(c.a)} animal”?`, 6),
        sc('count', 'explore', 'Count from the front', 'Count from the ticket booth: first, second, third…', 9),
        sc('cardinal', 'manipulate', `${c.a} animals`, `“${c.a} animals” is a group: everyone from the front up to number ${c.a}.`, 7),
        sc('discover', 'discover', `The ${ordinal(c.a)} animal`, `“The ${ordinal(c.a)}” names just one animal: the one in position ${c.a}.`, 7),
        sc('explain', 'explain', 'Cardinal and ordinal', 'Cardinal numbers say how many. Ordinal numbers say which position.', 7),
        sc('apply', 'apply', 'Your turn', 'Find positions from the other end.', 5)];
      case 'zero': return [
        sc('intro', 'introduce', 'A full plate', `There are ${c.n} apples on the plate.`, 5),
        sc('problem', 'problem', 'What happens when none are left?', 'If every apple is eaten, what number tells us how many are left?', 5),
        sc('eat', 'explore', 'One by one', 'Each apple eaten makes the count one smaller.', 10),
        sc('empty', 'manipulate', 'Empty plate', 'Nothing is left. The plate still exists — it just holds nothing.', 6),
        sc('discover', 'discover', 'Zero', 'We write “none” as 0. Zero is a number, and it sits before 1 on the number line.', 7),
        sc('explain', 'explain', 'Zero on the number line', 'Counting down: 3, 2, 1, 0. Zero is where counting starts.', 7),
        sc('apply', 'apply', 'Your turn', 'Use zero in a new situation.', 5)];
      default: return [
        sc('intro', 'introduce', `${c.object[0].toUpperCase() + c.object.slice(1)}s appear`, `Some ${o} are floating across the sky.`, 6),
        sc('problem', 'problem', 'How many?', `How many ${o} are there?`, 5),
        sc('count', 'explore', 'Touch and count', 'Touch each one once and say the next number. Each counted object glows.', 10),
        sc('move', 'manipulate', 'Move them around', 'Now line them up. Did the number change?', 7),
        sc('discover', 'discover', 'The last number counted', `The last number we say — ${c.n} — tells how many there are, however they are arranged.`, 7),
        sc('explain', 'explain', `The number ${c.n}`, `${c.n}: the numeral, the word “${numberWord(c.n)}”, and ${c.n} dots on a ten-frame are the same amount.`, 7),
        sc('apply', 'apply', 'Your turn', 'Count a new group by yourself.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'teen': return predict(`After ten ${c.object}s fill the frame, how many are left over?`, [['a', String(c.n - 10)], ['b', String(c.n)], ['c', '10'], ['d', String(c.n - 9)]], 'a', `${c.n} − 10 = ${c.n - 10}: one full ten and ${c.n - 10} ones.`, 3);
      case 'bond': return predict(`How many different splits of ${c.n} into two parts (counting 0 + ${c.n} and order) are there?`, [['a', String(c.n + 1)], ['b', String(c.n)], ['c', String(c.n - 1)], ['d', '2']], 'a', `The first part can be 0, 1, …, ${c.n}: that is ${c.n + 1} splits.`, 4);
      case 'compare': return predict('Which row will have objects without partners?', [['a', 'Top row'], ['b', 'Bottom row'], ['c', 'Neither']], c.a > c.b ? 'a' : c.a < c.b ? 'b' : 'c', 'Matching one to one shows the extra objects in the bigger group.', 3);
      case 'ordinal': return predict(`How many animals are in front of the ${ordinal(c.a)} animal?`, [['a', String(c.a - 1)], ['b', String(c.a)], ['c', String(c.a + 1)]], 'a', `Positions 1 to ${c.a - 1} are in front: ${c.a - 1} animals.`, 4);
      case 'zero': return predict('When all apples are eaten, which number describes the plate?', [['a', '0'], ['b', '1'], ['c', 'No number']], 'a', 'Zero is the number for “none”.', 4);
      default: return predict(`If we line the ${c.object}s up in a row, will there be more, fewer, or the same number?`, [['a', 'More'], ['b', 'Fewer'], ['c', 'The same']], 'c', 'Moving objects does not change how many there are.', 3);
    }
  },
  challenge: (c, r) => {
    const glyph = pick(r, ['★', '●', '♦', '♥']);
    switch (c.mode) {
      case 'teen': { const n = int(r, 11, 19); return {prompt: `How many ones are in ${n}?`, kind: 'number', answer: n - 10, hint: 'Take one full ten away.', explanation: `${n} = 10 + ${n - 10}.`}; }
      case 'bond': { const n = int(r, 5, 10), a = int(r, 1, n - 1); return {prompt: `${n} = ${a} + ?`, kind: 'number', answer: n - a, hint: `Start at ${a} and count up to ${n}.`, explanation: `${a} + ${n - a} = ${n}.`}; }
      case 'compare': { const a = int(r, 0, 20), b = int(r, 0, 20); return {prompt: `Choose the symbol: ${a} ? ${b}`, kind: 'choice', options: ['>', '<', '='], answer: a > b ? '>' : a < b ? '<' : '=', hint: 'Which number comes later when counting?', explanation: `${a} ${a > b ? '>' : a < b ? '<' : '='} ${b}.`}; }
      case 'ordinal': { const n = int(r, 6, 10), k = int(r, 2, n - 1); return {prompt: `${n} children stand in a line. Mia is ${ordinal(k)} from the front. What is her position from the back?`, kind: 'number', answer: n - k + 1, hint: 'Count how many are behind her, then add her.', explanation: `${n - k} are behind her, so she is ${ordinal(n - k + 1)} from the back.`}; }
      case 'zero': { const a = int(r, 2, 9); return {prompt: `${a} − ${a} = ?`, kind: 'number', answer: 0, hint: 'Take everything away.', explanation: `Taking all ${a} away leaves 0.`}; }
      default: { const n = int(r, 4, 10); return {prompt: `How many? ${glyph.repeat(n)}`, kind: 'choice', options: numericOptions(r, n, [n - 1, n + 1, n + 2]), answer: String(n), hint: 'Touch each one once with your eyes.', explanation: `There are ${n}.`}; }
    }
  },
  describe: c => `Counting world, ${c.mode} mode: ${c.mode === 'compare' ? `${c.a} and ${c.b} objects` : `${c.n} ${c.object}s`} shown as friendly objects on a starry meadow, with a number line.`,
};

import type {EngineLogic} from '../types';
import {arrangements, factors, gcd, int, isPrime, lcm, num, pick, primeFactors, str} from '../math';
import {sc, predict} from './util';

export type FactorMode = 'rectangles' | 'primes' | 'multiples' | 'divisibility' | 'gcf' | 'lcm' | 'tree';
export interface FactorConfig {mode: FactorMode; n: number; a: number; b: number}
const digitSum = (n: number) => String(n).split('').reduce((s, d) => s + Number(d), 0);

export const factor: EngineLogic<FactorConfig> = {
  type: 'factor', label: 'Number network',
  parse: r => ({mode: str(r.mode, 'rectangles'), n: num(r.n, 12), a: num(r.a, 12), b: num(r.b, 18)}),
  validate: c => (c.n < 1 || c.a < 1 || c.b < 1 ? ['positive whole numbers only'] : []),
  scenes: c => {
    switch (c.mode) {
      case 'primes': return [
        sc('intro', 'introduce', 'Numbers 1 to 100', 'A hundred chart.', 5),
        sc('problem', 'problem', 'Which numbers are “unbreakable”?', 'Which numbers can only be arranged as a single row?', 6),
        sc('sieve2', 'explore', 'Cross out multiples of 2', 'Keep 2, cross out 4, 6, 8, …', 8),
        sc('sieve', 'manipulate', 'Then 3, 5, 7', 'Keep each new survivor; cross out its multiples.', 10),
        sc('discover', 'discover', '25 primes', '2, 3, 5, 7, 11, … 97 survive: the primes below 100.', 7),
        sc('explain', 'explain', 'Prime and composite', 'A prime has exactly two factors (1 and itself). A composite has more. 1 is neither.', 8),
        sc('apply', 'apply', 'Your turn', 'Test numbers for primality.', 5)];
      case 'multiples': return [
        sc('intro', 'introduce', 'The hundred chart', 'Numbers 1 to 100 in rows of ten.', 5),
        sc('problem', 'problem', `Count by ${c.n}s`, `What pattern do multiples of ${c.n} make?`, 5),
        sc('light', 'explore', 'Light them up', `${c.n}, ${2 * c.n}, ${3 * c.n}, …`, 9),
        sc('pattern', 'manipulate', 'Look for the pattern', c.n === 5 || c.n === 10 ? 'They form straight columns.' : 'They form a regular pattern of diagonals and columns.', 7),
        sc('discover', 'discover', 'Every step the same', `Each multiple is ${c.n} more than the one before.`, 6),
        sc('explain', 'explain', 'Multiples', `Multiples of ${c.n}: ${c.n} × 1, ${c.n} × 2, … They go on forever.`, 6),
        sc('apply', 'apply', 'Your turn', 'Find multiples.', 5)];
      case 'divisibility': return [
        sc('intro', 'introduce', `Is ${c.n} divisible?`, `${c.n} counters to share.`, 5),
        sc('problem', 'problem', 'Without dividing', 'Can we tell if 2, 3 or 5 divide it just by looking at its digits?', 6),
        sc('last', 'explore', 'The last digit', `Tens are always multiples of 2 and 5, so only the ones digit (${c.n % 10}) matters.`, 8),
        sc('sum', 'manipulate', 'The digit sum', `Each ten and hundred leaves remainder 1 when divided by 3, so check the digit sum: ${String(c.n).split('').join(' + ')} = ${digitSum(c.n)}.`, 9),
        sc('discover', 'discover', 'Results', `2: ${c.n % 2 === 0 ? 'yes' : 'no'} · 3: ${c.n % 3 === 0 ? 'yes' : 'no'} · 5: ${c.n % 5 === 0 ? 'yes' : 'no'}.`, 6),
        sc('explain', 'explain', 'Divisibility rules', 'By 2: even last digit. By 5: last digit 0 or 5. By 3: digit sum divisible by 3. Even/odd = divisible by 2 or not.', 8),
        sc('apply', 'apply', 'Your turn', 'Test divisibility.', 5)];
      case 'gcf': { const g = gcd(c.a, c.b); return [
        sc('intro', 'introduce', `A ${c.a} × ${c.b} floor`, 'Tile it with square tiles, no cutting.', 5),
        sc('problem', 'problem', 'Largest square tile?', 'What is the biggest square that fits exactly?', 5),
        sc('try', 'explore', 'Try sizes', 'Size 1, 2, 3, … works only if it divides both sides.', 9),
        sc('common', 'manipulate', 'Common factors', `Factors of ${c.a}: ${factors(c.a).join(', ')}. Of ${c.b}: ${factors(c.b).join(', ')}.`, 8),
        sc('discover', 'discover', `${g} × ${g} tiles`, `The greatest common factor is ${g}.`, 6),
        sc('explain', 'explain', 'Greatest common factor', 'The GCF is the largest number that divides both. It simplifies fractions and solves tiling problems.', 7),
        sc('apply', 'apply', 'Your turn', 'Find greatest common factors.', 5)]; }
      case 'lcm': { const l = lcm(c.a, c.b); return [
        sc('intro', 'introduce', 'Two blinking lights', `One blinks every ${c.a} s, the other every ${c.b} s.`, 5),
        sc('problem', 'problem', 'Together again?', 'They just blinked together. When will they next blink together?', 5),
        sc('blink', 'explore', 'Mark the blinks', `Multiples of ${c.a} and of ${c.b} on a timeline.`, 9),
        sc('match', 'manipulate', 'Common multiples', `Shared marks: ${l}, ${2 * l}, ${3 * l}, …`, 7),
        sc('discover', 'discover', `${l} seconds`, `The least common multiple is ${l}.`, 6),
        sc('explain', 'explain', 'Least common multiple', 'The LCM is the smallest number both divide into. It gives common denominators.', 7),
        sc('apply', 'apply', 'Your turn', 'Find least common multiples.', 5)]; }
      case 'tree': return [
        sc('intro', 'introduce', `${c.n}`, `Let’s break ${c.n} into building blocks.`, 5),
        sc('problem', 'problem', 'Until it cannot break', 'Split into two factors, then split again…', 5),
        sc('split', 'explore', 'Grow the tree', 'Each branch splits a composite into two factors.', 9),
        sc('leaves', 'manipulate', 'Prime leaves', 'Branches stop at primes.', 7),
        sc('discover', 'discover', primeFactors(c.n).join(' × '), `${c.n} = ${primeFactors(c.n).join(' × ')}. Any tree gives the same primes.`, 7),
        sc('explain', 'explain', 'Prime factorization', 'Every composite number is a product of primes in exactly one way (apart from order).', 7),
        sc('apply', 'apply', 'Your turn', 'Factorise numbers.', 5)];
      default: { const arr = arrangements(c.n); return [
        sc('intro', 'introduce', `${c.n} tiles`, `${c.n} square tiles.`, 5),
        sc('problem', 'problem', 'How many rectangles?', `In how many ways can all ${c.n} make a rectangle?`, 5),
        sc('arrange', 'explore', 'Try every width', arr.map(([r, k]) => `${r} × ${k}`).join(', ') + '.', 10),
        sc('pairs', 'manipulate', 'Factor pairs', 'Each rectangle gives two factors that multiply to ' + c.n + '.', 7),
        sc('discover', 'discover', `${factors(c.n).length} factors`, `Factors of ${c.n}: ${factors(c.n).join(', ')}.`, 6),
        sc('explain', 'explain', 'Factors and multiples', `If a × b = ${c.n}, then a and b are factors of ${c.n}, and ${c.n} is a multiple of each.`, 7),
        sc('apply', 'apply', 'Your turn', 'Find factors.', 5)]; }
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'primes': return predict('Is 1 a prime number?', [['a', 'No'], ['b', 'Yes']], 'a', 'A prime has exactly two factors; 1 has one.', 4);
      case 'multiples': return predict(`Is ${7 * c.n} a multiple of ${c.n}?`, [['a', 'Yes'], ['b', 'No']], 'a', `${c.n} × 7.`, 3);
      case 'divisibility': return predict(`Is ${c.n} divisible by 3?`, [['a', 'Yes'], ['b', 'No']], c.n % 3 === 0 ? 'a' : 'b', `Digit sum ${digitSum(c.n)}.`, 3);
      case 'gcf': return predict(`Largest square tile for ${c.a} × ${c.b}?`, [['a', String(gcd(c.a, c.b))], ['b', String(Math.min(c.a, c.b))], ['c', '1']], 'a', 'Must divide both sides.', 3);
      case 'lcm': return predict('They blink together again after…', [['a', `${lcm(c.a, c.b)} s`], ['b', `${c.a * c.b} s`], ['c', `${c.a + c.b} s`]], 'a', 'Smallest common multiple.', 3);
      case 'tree': return predict(`How many prime factors (with repeats) does ${c.n} have?`, [['a', String(primeFactors(c.n).length)], ['b', String(factors(c.n).length)], ['c', '2']], 'a', primeFactors(c.n).join(' × ') + '.', 3);
      default: return predict(`How many different rectangles use all ${c.n} tiles?`, [['a', String(arrangements(c.n).length)], ['b', String(factors(c.n).length)], ['c', '1']], 'a', 'Count factor pairs.', 3);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'primes': { const n = pick(r, [21, 23, 27, 29, 31, 33, 37, 39, 41, 49, 51, 53, 57, 59, 91, 97]); return {prompt: `Is ${n} prime?`, kind: 'choice', options: ['Prime', 'Composite'], answer: isPrime(n) ? 'Prime' : 'Composite', hint: 'Try dividing by 2, 3, 5, 7.', explanation: isPrime(n) ? `${n} has only 1 and itself.` : `${n} = ${primeFactors(n).join(' × ')}.`}; }
      case 'multiples': { const k = int(r, 3, 9), m = int(r, 5, 15); return {prompt: `What is the ${m}th multiple of ${k}?`, kind: 'number', answer: k * m, hint: `${k} × ${m}`, explanation: `${k * m}.`}; }
      case 'divisibility': { const n = int(r, 100, 999); const d = pick(r, [2, 3, 5]); return {prompt: `Is ${n} divisible by ${d}?`, kind: 'choice', options: ['Yes', 'No'], answer: n % d === 0 ? 'Yes' : 'No', hint: d === 3 ? 'Digit sum.' : 'Last digit.', explanation: d === 3 ? `Digit sum ${digitSum(n)}.` : `Last digit ${n % 10}.`}; }
      case 'gcf': { const g = int(r, 2, 9), x = int(r, 2, 5), y = int(r, 2, 7); const a = g * x, b = g * (x === y ? y + 1 : y); return {prompt: `GCF of ${a} and ${b}?`, kind: 'number', answer: gcd(a, b), hint: 'List factors of the smaller number.', explanation: `${gcd(a, b)}.`}; }
      case 'lcm': { const a = int(r, 2, 9), b = int(r, 2, 12); return {prompt: `LCM of ${a} and ${b}?`, kind: 'number', answer: lcm(a, b), hint: 'List multiples of the larger.', explanation: `${lcm(a, b)}.`}; }
      case 'tree': { const n = pick(r, [24, 36, 45, 48, 72, 84, 90, 100]); const pf = primeFactors(n); return {prompt: `${n} = 2^a × … What is the largest prime factor of ${n}?`, kind: 'number', answer: Math.max(...pf), hint: 'Build a factor tree.', explanation: `${n} = ${pf.join(' × ')}.`}; }
      default: { const n = pick(r, [12, 16, 18, 20, 24, 30, 36]); return {prompt: `How many factors does ${n} have?`, kind: 'number', answer: factors(n).length, hint: 'Find factor pairs.', explanation: factors(n).join(', ') + '.'}; }
    }
  },
  describe: c => `Number network (${c.mode}) for ${c.mode === 'gcf' || c.mode === 'lcm' ? `${c.a} and ${c.b}` : c.n}: tile rectangles, hundred chart and factor trees.`,
};

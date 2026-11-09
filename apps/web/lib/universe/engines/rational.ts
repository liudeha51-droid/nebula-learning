import type {EngineLogic} from '../types';
import {fix, fmt, int, num, pick, str} from '../math';
import {predict, story} from './util';

export type RationalMode = 'line' | 'absolute' | 'compare' | 'add' | 'multiply' | 'power';
export interface RationalConfig {mode: RationalMode; a: number; b: number}
const s = (v: number) => (v < 0 ? `(${fmt(v)})` : fmt(v));

export const rational: EngineLogic<RationalConfig> = {
  type: 'rational', label: 'Signed-number line',
  parse: r => ({mode: str(r.mode, 'add'), a: num(r.a, 3), b: num(r.b, -5)}),
  validate: c => (c.mode === 'compare' && c.a === c.b ? ['compare two different numbers'] : []),
  scenes: c => {
    const {a, b} = c;
    switch (c.mode) {
      case 'line': return story('Numbers in both directions', ['A thermometer, a lift shaft and a bank balance all need numbers below zero.', 'Where do they live?: Where do −2.5 and 1.5 go on one line?', 'Integers first: Mark …, −2, −1, 0, 1, 2, … at equal steps.', 'Fractions between: Split the steps: −2.5 sits halfway between −3 and −2.', 'Every rational number has a point: Integers and fractions, positive and negative: the rational numbers.', 'Classification: Rational numbers = integers ∪ fractions; or positive, zero and negative.', 'Your turn: Place and classify numbers.']);
      case 'absolute': return story('Mirror images', [`${fmt(a)} and its twin on the other side of zero.`, `How far from 0?: How far is ${fmt(a)} from 0?`, 'Walk to zero: Count the steps from the point back to 0.', 'Reflect: The point the same distance on the other side is the opposite number.', `|${fmt(a)}| = ${fmt(Math.abs(a))}: Absolute value is distance, so it is never negative.`, 'Opposites and absolute value: The opposite of a is −a; |a| = a if a ≥ 0, −a if a < 0.', 'Your turn: Find opposites and absolute values.']);
      case 'compare': return story('Which is bigger?', [`${fmt(a)} and ${fmt(b)}.`, `Bigger digits, bigger number?: Is ${fmt(Math.min(a, b))} bigger because its digits are bigger?`, 'Place both on the line: Right means greater.', 'Compare distances to zero: For negatives, the one further from 0 is smaller.', `${fmt(Math.max(a, b))} > ${fmt(Math.min(a, b))}: The point further right wins.`, 'Comparing rational numbers: Positives > 0 > negatives; between negatives, larger absolute value means smaller.', 'Your turn: Order rational numbers.']);
      case 'multiply': return story('Multiplication as stretching', [`${s(a)} × ${s(b)}.`, 'Negative times negative?: Why should two negatives give a positive?', `Stretch by ${Math.abs(b)}: Multiplying by ${Math.abs(b)} stretches the arrow.`, 'Multiply by −1 = reflect: A negative factor also flips the arrow through 0.', `Two flips: ${s(a)} × ${s(b)} = ${fmt(a * b)}: Each negative flips once; two flips point the original way.`, 'Sign rules: Same signs → positive, different signs → negative; dividing by b is multiplying by 1/b.', 'Your turn: Multiply and divide signed numbers.']);
      case 'power': return story('Repeated multiplication', [`${a} multiplied by itself again and again.`, 'How fast does it grow?: What is 2¹⁰? And (−2)³?', `Powers of ${a}: ${[1, 2, 3, 4, 5].map(k => fmt(a ** k)).join(', ')}…`, 'Negative bases: An odd number of negative factors stays negative: (−2)³ = −8.', `2¹⁰ = 1024: Doubling ten times passes a thousand.`, 'Powers and scientific notation: aⁿ is n factors of a; large numbers are written a × 10ⁿ with 1 ≤ |a| < 10.', 'Your turn: Evaluate powers and use scientific notation.']);
      default: return story('Moving on the line', [`Start at ${fmt(a)}.`, `${fmt(a)} + ${s(b)}?: What happens when we add a negative number?`, `Adding a positive moves right: Positive steps go right.`, `Adding a negative moves left: ${fmt(a)} + ${s(b)}: walk ${Math.abs(b)} steps ${b < 0 ? 'left' : 'right'}.`, `Land on ${fmt(a + b)}: ${fmt(a)} + ${s(b)} = ${fmt(a + b)}.`, 'Addition and subtraction rules: Subtracting is adding the opposite: a − b = a + (−b).', 'Your turn: Add and subtract signed numbers.']);
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'line': return predict('Where does −2.5 go?', [['a', 'Between −3 and −2'], ['b', 'Between 2 and 3'], ['c', 'Between −2 and −1']], 'a', 'Halfway between −3 and −2.', 3);
      case 'absolute': return predict(`|${fmt(c.a)}| = ?`, [['a', fmt(Math.abs(c.a))], ['b', fmt(-Math.abs(c.a))]], 'a', 'A distance is never negative.', 3);
      case 'compare': return predict('Which is greater?', [['a', fmt(c.a)], ['b', fmt(c.b)]], c.a > c.b ? 'a' : 'b', 'Further right is greater.', 3);
      case 'multiply': return predict(`${s(c.a)} × ${s(c.b)} = ?`, [['a', fmt(c.a * c.b)], ['b', fmt(-c.a * c.b)]], 'a', 'Count the flips.', 3);
      case 'power': return predict('(−2)³ = ?', [['a', '−8'], ['b', '8'], ['c', '−6']], 'a', 'Three negative factors.', 3);
      default: return predict(`${fmt(c.a)} + ${s(c.b)} = ?`, [['a', fmt(c.a + c.b)], ['b', fmt(c.a - c.b)], ['c', fmt(-(c.a + c.b))]], 'a', 'Walk left for a negative.', 3);
    }
  },
  challenge: (c, r) => {
    const a = int(r, -9, 9) || 3, b = int(r, -9, 9) || -4;
    switch (c.mode) {
      case 'absolute': return {prompt: `|${a}| + |${b}| = ?`, kind: 'number', answer: Math.abs(a) + Math.abs(b), hint: 'Distances add.', explanation: `${Math.abs(a)} + ${Math.abs(b)}.`};
      case 'compare': case 'line': { const x = a / 2, y = b / 3; return {prompt: `Choose: ${fmt(x, 3)} ? ${fmt(fix(y), 3)}`, kind: 'choice', options: ['>', '<', '='], answer: x > y ? '>' : x < y ? '<' : '=', hint: 'Right is greater.', explanation: `${fmt(x, 3)} ${x > y ? '>' : x < y ? '<' : '='} ${fmt(y, 3)}.`}; }
      case 'multiply': return {prompt: `${s(a)} × ${s(b)} = ?`, kind: 'number', answer: a * b, hint: 'Same signs positive.', explanation: `${a * b}.`};
      case 'power': { const base = pick(r, [-3, -2, 2, 3]), n = int(r, 2, 4); return {prompt: `(${base})^${n} = ?`, kind: 'number', answer: base ** n, hint: 'Count negative factors.', explanation: `${base ** n}.`}; }
      default: return pick(r, [0, 1]) ? {prompt: `${a} + ${s(b)} = ?`, kind: 'number', answer: a + b, hint: 'Move left for negatives.', explanation: `${a + b}.`} : {prompt: `${a} − ${s(b)} = ?`, kind: 'number', answer: a - b, hint: 'Add the opposite.', explanation: `${a} + ${s(-b)} = ${a - b}.`};
    }
  },
  describe: c => `Number line with signed-number arrows (${c.mode}) for ${fmt(c.a)} and ${fmt(c.b)}.`,
};

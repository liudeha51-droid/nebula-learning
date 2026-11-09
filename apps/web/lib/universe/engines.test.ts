import {describe, expect, it} from 'vitest';
import {orderSteps, evaluate, leftToRight} from './engines/laws';
import {readChinese} from './engines/place-value';
import {columnAdd, columnSub, longDivision, checkAnswer, gcd, lcm, simplify, primeFactors, fix, fmt} from './math';

describe('mathematical helpers used by animations', () => {
  it('rounds values in exponential notation instead of returning NaN', () => {
    expect(fix(3.7e-12, 2)).toBe(0); expect(fmt(3.7e-12, 2)).toBe('0'); expect(fix(1.5e21, 2)).toBe(1.5e21);
    expect(fix(1.005, 2)).toBe(1.01); expect(fix(0.1 + 0.2)).toBe(0.3); expect(fix(-2.5e-8, 3)).toBe(0);
  });
  it('evaluates with the school order of operations', () => {
    expect(evaluate('24-6*3')).toBe(6); expect(evaluate('(24-6)*3')).toBe(54); expect(evaluate('48/(2+6)')).toBe(6);
    expect(evaluate('48/2+6')).toBe(30); expect(evaluate('2*(3+4)*5')).toBe(70); expect(leftToRight('24-6*3')).toBe(54);
    expect(orderSteps('24-6*3').map(s => s.op).filter(Boolean)).toEqual(['6 × 3 = 18', '24 − 18 = 6']);
  });
  it('reads large numbers in Chinese', () => {
    expect(readChinese(305060000)).toBe('三亿零五百零六万'); expect(readChinese(10)).toBe('十'); expect(readChinese(100010)).toBe('十万零一十');
    expect(readChinese(4020)).toBe('四千零二十'); expect(readChinese(120000000)).toBe('一亿二千万'); expect(readChinese(1000001)).toBe('一百万零一');
  });
  it('column algorithms and long division agree with arithmetic', () => {
    for (const [a, b] of [[47, 38], [368, 275], [4867, 3755], [99, 1]]) expect(columnAdd(a, b).result.reduce((s, d, i) => s + d * 10 ** i, 0)).toBe(a + b);
    for (const [a, b] of [[52, 27], [5003, 1847], [80, 34], [503, 268]]) expect(columnSub(a, b).result.reduce((s, d, i) => s + d * 10 ** i, 0)).toBe(a - b);
    expect(columnSub(5003, 1847).borrows).toEqual([1, 1, 1, 0]);
    expect(longDivision(658, 4)).toMatchObject({quotient: 164, remainder: 2}); expect(longDivision(612, 3).steps.map(s => s.q)).toEqual([2, 0, 4]);
    expect(longDivision(864, 32).quotient).toBe(27);
  });
  it('number theory helpers', () => { expect(gcd(12, 18)).toBe(6); expect(lcm(4, 6)).toBe(12); expect(simplify(6, 8)).toEqual([3, 4]); expect(primeFactors(60)).toEqual([2, 2, 3, 5]); });
  it('accepts equivalent answer formats', () => { expect(checkAnswer('3/4', .75)).toBe(true); expect(checkAnswer('0.75', .75)).toBe(true); expect(checkAnswer('2 1/3', 7 / 3)).toBe(true); expect(checkAnswer('37.5%', 37.5)).toBe(true); expect(checkAnswer('1,000', 1000)).toBe(true); expect(checkAnswer('7', 8)).toBe(false); });
});

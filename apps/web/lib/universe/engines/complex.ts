import type {EngineLogic} from '../types';
import {fmt, int, num, pick, str} from '../math';
import {predict, story} from './util';

export type ComplexMode = 'plane' | 'multiply';
export interface ComplexConfig {mode: ComplexMode; a: number; b: number}
export const cstr = (a: number, b: number) => (b === 0 ? fmt(a) : a === 0 ? `${b === 1 ? '' : b === -1 ? '−' : fmt(b)}i` : `${fmt(a)} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : fmt(Math.abs(b))}i`);

export const complex: EngineLogic<ComplexConfig> = {
  type: 'complex', label: 'Complex plane laboratory',
  parse: r => ({mode: str(r.mode, 'plane'), a: num(r.a, 3), b: num(r.b, 4)}),
  validate: () => [],
  scenes: c => {
    const {a, b} = c;
    if (c.mode === 'multiply') return story('Turning by i', [`Start with z = ${cstr(a, b)} in the plane.`, 'What does × i do?: Multiply by i once, twice, four times. Where does z go?', `Rotate: i·z = ${cstr(-b, a)} — the point turns 90° anticlockwise about 0.`, `Again: i²·z = ${cstr(-a, -b)} = −z. Two quarter turns make a half turn, so i² = −1.`, 'Four turns: i⁴ = 1 — back where we started.', 'Complex arithmetic: Add like vectors; (a + bi)(c + di) = (ac − bd) + (ad + bc)i; divide using the conjugate.', 'Your turn: Calculate with i.']);
    return story('Beyond the number line', ['x² = −1 has no real solution.', 'Where could √(−1) live?: The real numbers fill a line. Is there room off the line?', `Add a second axis: ${cstr(a, b)} is the point (${a}, ${b}) — real part across, imaginary part up.`, `Modulus: |z| = √(${a}² + ${b}²) = ${fmt(Math.hypot(a, b), 3)} — its distance from 0.`, `Conjugate: z̄ = ${cstr(a, -b)} is the mirror image in the real axis.`, 'Complex numbers: z = a + bi, i² = −1; equal when real and imaginary parts match; |z| and z̄.', 'Your turn: Locate complex numbers.']);
  },
  prediction: c => c.mode === 'multiply' ? predict('Multiplying by i turns a point by…', [['a', '90° anticlockwise'], ['b', '180°'], ['c', 'It does not move']], 'a', 'i·(a + bi) = −b + ai.', 2)
    : predict(`|${cstr(c.a, c.b)}| = ?`, [['a', fmt(Math.hypot(c.a, c.b), 3)], ['b', fmt(c.a + c.b)], ['c', fmt(c.a * c.a + c.b * c.b)]], 'a', 'Distance from the origin.', 3),
  challenge: (c, r) => {
    const a = int(r, -5, 5), b = int(r, 1, 5), x = int(r, -4, 4), y = int(r, -4, 4);
    if (c.mode === 'multiply') return pick(r, [0, 1, 2]) === 0 ? (() => { const k = int(r, 5, 40); const v = ['1', 'i', '−1', '−i'][k % 4]; return {prompt: `Simplify i^${k} (1, −1, i or −i).`, kind: 'choice' as const, options: ['1', '−1', 'i', '−i'], answer: v, hint: 'Powers of i repeat every 4.', explanation: `${k} = 4·${Math.floor(k / 4)} + ${k % 4}, so i^${k} = ${v}.`}; })()
      : {prompt: `(${cstr(a, b)})(${cstr(x, y)}): real part?`, kind: 'number', answer: a * x - b * y, hint: 'ac − bd.', explanation: `${a}·${x} − ${b}·${y}.`};
    return pick(r, [0, 1]) ? {prompt: `Quadrant of ${cstr(a === 0 ? 1 : a, -b)}?`, kind: 'choice', options: ['I', 'II', 'III', 'IV'], answer: (a === 0 ? 1 : a) > 0 ? 'IV' : 'III', hint: '(real, imaginary).', explanation: `(${a === 0 ? 1 : a}, ${-b}).`}
      : {prompt: `|${cstr(3 * b, 4 * b)}| = ?`, kind: 'number', answer: 5 * b, hint: '√(a² + b²).', explanation: `${5 * b}.`};
  },
  describe: c => `Complex plane showing z = ${cstr(c.a, c.b)} (${c.mode}).`,
};

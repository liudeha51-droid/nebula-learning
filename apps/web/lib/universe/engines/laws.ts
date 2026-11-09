import type {EngineLogic} from '../types';
import {fmt, int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type LawsMode = 'assoc-add' | 'assoc-mul' | 'order' | 'letters';
export interface LawsConfig {mode: LawsMode; a: number; b: number; c: number; expr: string; alt: string}

type Tok = number | '+' | '-' | '*' | '/' | '(' | ')';
const tokenize = (e: string): Tok[] => (e.replace(/\s+/g, '').match(/\d+(?:\.\d+)?|[-+*/()]/g) ?? []).map(t => (/\d/.test(t) ? Number(t) : (t as Tok)));
export const pretty = (e: string) => e.replace(/\*/g, ' × ').replace(/\//g, ' ÷ ').replace(/\+/g, ' + ').replace(/-/g, ' − ').replace(/\(\s/g, '(').replace(/\s\)/g, ')');

/**
 * Evaluates step by step with the school order of operations: innermost parentheses first;
 * inside, × and ÷ from left to right, then + and − from left to right. Returns every intermediate expression.
 */
export function orderSteps(expr: string): {text: string; op: string}[] {
  let toks = tokenize(expr); const out: {text: string; op: string}[] = [{text: render(toks), op: ''}];
  for (let guard = 0; guard < 40 && toks.length > 1; guard++) {
    let lo = 0, hi = toks.length; // innermost parenthesised span
    const close = toks.indexOf(')'); if (close >= 0) { hi = close; lo = toks.lastIndexOf('(', close) + 1; }
    const seg = toks.slice(lo, hi);
    let i = seg.findIndex(t => t === '*' || t === '/'); if (i < 0) i = seg.findIndex(t => t === '+' || t === '-');
    if (i < 0) { toks = [...toks.slice(0, lo - 1), seg[0], ...toks.slice(hi + 1)]; continue; } // drop parentheses around a single number
    const a = seg[i - 1] as number, op = seg[i] as string, b = seg[i + 1] as number;
    const v = op === '*' ? a * b : op === '/' ? a / b : op === '+' ? a + b : a - b;
    seg.splice(i - 1, 3, Number(v.toFixed(10)));
    toks = [...toks.slice(0, lo), ...seg, ...toks.slice(hi)];
    if (close >= 0 && seg.length === 1) toks = [...toks.slice(0, lo - 1), seg[0], ...toks.slice(lo + 2)];
    out.push({text: render(toks), op: `${fmt(a)} ${({'*': '×', '/': '÷', '+': '+', '-': '−'} as Record<string, string>)[op]} ${fmt(b)} = ${fmt(v)}`});
  }
  return out;
}
const render = (toks: Tok[]) => pretty(toks.map(t => (typeof t === 'number' ? fmt(t) : t)).join(''));
export const evaluate = (expr: string) => { const s = orderSteps(expr); return Number(s[s.length - 1].text.replace(/[^\d.-]/g, '')); };
/** Naive left-to-right evaluation (the common misconception) ignoring precedence but honouring nothing else. */
export function leftToRight(expr: string) { const t = tokenize(expr.replace(/[()]/g, '')); let v = t[0] as number; for (let i = 1; i < t.length; i += 2) { const b = t[i + 1] as number; const op = t[i]; v = op === '*' ? v * b : op === '/' ? v / b : op === '+' ? v + b : v - b; } return v; }

export const laws: EngineLogic<LawsConfig> = {
  type: 'laws', label: 'Operation laboratory',
  parse: r => ({mode: str(r.mode, 'order'), a: num(r.a, 37), b: num(r.b, 48), c: num(r.c, 52), expr: str(r.expr, '24-6*3'), alt: str(r.alt, '(24-6)*3')}),
  validate: c => { const e: string[] = []; if (c.mode === 'order') { if (!Number.isFinite(evaluate(c.expr)) || !Number.isFinite(evaluate(c.alt))) e.push('expressions must evaluate'); if (evaluate(c.expr) === evaluate(c.alt)) e.push('alt should differ to show the effect of order'); } return e; },
  scenes: c => {
    const {a, b} = c, cc = c.c;
    switch (c.mode) {
      case 'assoc-add': return [
        sc('intro', 'introduce', 'Three amounts', `${a}, ${b} and ${cc} as bars of length.`, 5),
        sc('problem', 'problem', 'Which pair first?', `${a} + ${b} + ${cc}: does it matter which two we add first?`, 5),
        sc('left', 'explore', 'Left to right', `(${a} + ${b}) + ${cc} = ${a + b} + ${cc} = ${a + b + cc}.`, 7),
        sc('regroup', 'manipulate', 'Regroup', `${a} + (${b} + ${cc}) = ${a} + ${b + cc} = ${a + b + cc}. The bars just change partners.`, 8),
        sc('discover', 'discover', 'Same total', 'Changing the grouping — or swapping the order — never changes the total length.', 6),
        sc('explain', 'explain', 'Associative and commutative laws', '(a + b) + c = a + (b + c) and a + b = b + a. Look for pairs that make round numbers.', 8),
        sc('apply', 'apply', 'Your turn', 'Add cleverly by choosing partners.', 5)];
      case 'assoc-mul': return [
        sc('intro', 'introduce', 'Three factors', `${a} × ${b} × ${cc}.`, 5),
        sc('problem', 'problem', 'A friendly pair?', `Is there a pair that makes a round number?`, 5),
        sc('swap', 'explore', 'Swap two factors', `${a} × ${b} × ${cc} = ${a} × ${cc} × ${b} (commutative law).`, 7),
        sc('group', 'manipulate', 'Group the friends', `(${a} × ${cc}) × ${b} = ${a * cc} × ${b}.`, 7),
        sc('discover', 'discover', 'Easier, same product', `${a * cc} × ${b} = ${a * b * cc}, exactly what left-to-right gives: (${a} × ${b}) × ${cc} = ${a * b} × ${cc} = ${a * b * cc}.`, 8),
        sc('explain', 'explain', 'Associative law', '(a × b) × c = a × (b × c). Like counting a box of cubes layer by layer in any direction.', 7),
        sc('apply', 'apply', 'Your turn', 'Find friendly factors.', 5)];
      case 'letters': return [
        sc('intro', 'introduce', 'Laws for every number', 'We checked laws with particular numbers. Do they always work?', 5),
        sc('problem', 'problem', 'One sentence for all numbers', 'How can we say “for any numbers” in mathematics?', 5),
        sc('commute', 'explore', 'Commutative', 'a + b = b + a and a × b = b × a: the letters stand for any numbers.', 8),
        sc('assoc', 'manipulate', 'Associative', '(a + b) + c = a + (b + c); (a × b) × c = a × (b × c).', 8),
        sc('discover', 'discover', 'Distributive', 'a × (b + c) = a × b + a × c links multiplication and addition.', 7),
        sc('explain', 'explain', 'Using laws', '125 × 8 × 7 = (125 × 8) × 7 = 7 000; 99 × 7 = (100 − 1) × 7 = 693.', 8),
        sc('apply', 'apply', 'Your turn', 'Name the law and calculate cleverly.', 5)];
      default: { const st = orderSteps(c.expr), alt = orderSteps(c.alt); return [
        sc('intro', 'introduce', 'One expression', `Here is one expression: ${pretty(c.expr)}.`, 5),
        sc('problem', 'problem', 'Where do we start?', 'Does it matter which operation we do first?', 5),
        sc('order', 'explore', 'Follow the pathway', `× and ÷ go before + and −: ${st.slice(1).map(s => s.op).join(', then ')}.`, 9),
        sc('alt', 'manipulate', 'Add parentheses', `${pretty(c.alt)} forces another route: ${alt.slice(1).map(s => s.op).join(', then ')}.`, 9),
        sc('discover', 'discover', 'Different routes, different results', `${pretty(c.expr)} = ${fmt(evaluate(c.expr))}, but ${pretty(c.alt)} = ${fmt(evaluate(c.alt))}.`, 7),
        sc('explain', 'explain', 'Order of operations', 'Parentheses first; then × and ÷ from left to right; then + and − from left to right.', 8),
        sc('apply', 'apply', 'Your turn', 'Evaluate new expressions.', 5)]; }
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'assoc-add': return predict(`(${c.a} + ${c.b}) + ${c.c} compared with ${c.a} + (${c.b} + ${c.c}):`, [['a', 'Equal'], ['b', 'First is bigger'], ['c', 'Second is bigger']], 'a', 'Grouping does not change a sum.', 3);
      case 'assoc-mul': return predict('Which pair is the friendliest to multiply first?', [['a', `${c.a} × ${c.c}`], ['b', `${c.a} × ${c.b}`], ['c', `${c.b} × ${c.c}`]], 'a', `${c.a} × ${c.c} = ${c.a * c.c}.`, 3);
      case 'letters': return predict('Does a + b = b + a hold for every pair of numbers?', [['a', 'Yes, always'], ['b', 'Only for small numbers'], ['c', 'Only when a = b']], 'a', 'Swapping two groups never changes the total.', 2);
      default: return predict(`${pretty(c.expr)} = ?`, [['a', fmt(evaluate(c.expr))], ['b', fmt(leftToRight(c.expr))], ['c', fmt(evaluate(c.alt))]].filter((o, i, arr) => arr.findIndex(x => x[1] === o[1]) === i) as [string, string][], 'a', 'Multiplication and division come first.', 2);
    }
  },
  challenge: (c, r) => {
    if (c.mode === 'assoc-add') { const x = int(r, 11, 89); const y = int(r, 11, 89), z = 100 - x; return {prompt: `${x} + ${y} + ${z} = ?`, kind: 'number', answer: x + y + z, hint: `${x} + ${z} = 100.`, explanation: `(${x} + ${z}) + ${y} = 100 + ${y}.`}; }
    if (c.mode === 'assoc-mul') { const [f, g] = pick(r, [[25, 4], [125, 8], [5, 20], [50, 2]] as const); const k = int(r, 3, 19); return {prompt: `${f} × ${k} × ${g} = ?`, kind: 'number', answer: f * g * k, hint: `${f} × ${g} = ${f * g}.`, explanation: `(${f} × ${g}) × ${k} = ${fmt(f * g * k)}.`}; }
    if (c.mode === 'letters') { const law = pick(r, ['comm', 'assoc', 'dist'] as const); const opts = ['Commutative law', 'Associative law', 'Distributive law'];
      const prompt = law === 'comm' ? '38 × 25 = 25 × 38 uses which law?' : law === 'assoc' ? '(46 + 25) + 75 = 46 + (25 + 75) uses which law?' : '12 × (10 + 3) = 12 × 10 + 12 × 3 uses which law?';
      return {prompt, kind: 'choice', options: opts, answer: opts[['comm', 'assoc', 'dist'].indexOf(law)], hint: 'Is the order, the grouping, or the operation changing?', explanation: opts[['comm', 'assoc', 'dist'].indexOf(law)] + '.'}; }
    const a = int(r, 10, 60), b = int(r, 2, 9), d = int(r, 2, 9); const e = pick(r, [`${a}-${b}*${d}`, `${a}+${b}*${d}`, `(${a}-${b})*${d}`, `${a * d}/(${b}+${d})`]);
    const v = evaluate(e); const ok = Number.isInteger(v) && v >= 0 ? e : `${a}+${b}*${d}`;
    return {prompt: `${pretty(ok)} = ?`, kind: 'number', answer: evaluate(ok), hint: 'Parentheses, then × ÷, then + −.', explanation: orderSteps(ok).slice(1).map(s => s.op).join(', then ') + '.'};
  },
  describe: c => c.mode === 'order' ? `Expression pathways for ${pretty(c.expr)} and ${pretty(c.alt)}, highlighting each operation in order.` : `Bars and cards regrouping ${c.a}, ${c.b} and ${c.c} to show arithmetic laws.`,
};

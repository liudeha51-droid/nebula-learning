import type {EngineLogic} from '../types';
import {fmt, gcd, int, lcm, nums, num, pick, simplify, str} from '../math';
import {sc, predict} from './util';

export type FractionMode = 'parts' | 'compare' | 'add-same' | 'equivalent' | 'simplify' | 'common' | 'add-diff' | 'improper' | 'division-link' | 'of-quantity' | 'multiply' | 'divide' | 'whole-from-part';
export interface FractionConfig {mode: FractionMode; n: number; d: number; a: number[]; b: number[]; whole: number; part: number; op: 'add' | 'sub'}

export const fr = (f: number[]) => `${f[0]}/${f[1]}`;
export const frS = (n: number, d: number) => { const [p, q] = simplify(n, d); return q === 1 ? String(p) : `${p}/${q}`; };
export const mixed = (n: number, d: number) => { const w = Math.floor(n / d), r = n % d; return w === 0 ? `${r}/${d}` : r === 0 ? String(w) : `${w} ${r}/${d}`; };
const cmp = (a: number[], b: number[]) => Math.sign(a[0] * b[1] - b[0] * a[1]);

export const fraction: EngineLogic<FractionConfig> = {
  type: 'fraction', label: 'Fraction laboratory',
  parse: r => ({mode: str(r.mode, 'parts'), n: num(r.n, 1), d: num(r.d, 4), a: nums(r.a, [1, 2]), b: nums(r.b, [1, 3]), whole: num(r.whole, 12), part: num(r.part, 15), op: str(r.op, 'add')}),
  validate: c => {
    const e: string[] = [];
    if (c.d < 1 || c.n < 0) e.push('denominator ≥ 1');
    if (['parts', 'equivalent', 'simplify'].includes(c.mode) && c.n > c.d) e.push('proper fraction expected');
    if (c.mode === 'simplify' && gcd(c.n, c.d) === 1) e.push('simplify needs a reducible fraction');
    if (c.mode === 'improper' && c.n <= c.d) e.push('improper needs n > d');
    if (c.mode === 'of-quantity' && c.whole % c.d !== 0) e.push('whole must split evenly');
    if (c.mode === 'whole-from-part' && c.part % c.n !== 0) e.push('part must split evenly');
    if (c.mode === 'add-same' && c.a[1] !== c.b[1]) e.push('same denominators');
    if (c.mode === 'add-diff' && c.op === 'sub' && cmp(c.a, c.b) < 0) e.push('subtraction must stay positive');
    if (c.mode === 'divide' && c.b[0] === 0) e.push('cannot divide by zero');
    return e;
  },
  scenes: c => {
    const [an, ad] = c.a, [bn, bd] = c.b;
    switch (c.mode) {
      case 'compare': case 'common': { const L = lcm(ad, bd); const s = cmp(c.a, c.b); const bigger = s > 0 ? fr(c.a) : fr(c.b); return [
        sc('intro', 'introduce', 'Two chocolate bars', `Two bars of the same size: ${fr(c.a)} of one and ${fr(c.b)} of the other are shaded.`, 5),
        sc('problem', 'problem', 'Which is more?', `Which is greater, ${fr(c.a)} or ${fr(c.b)}?`, 5),
        sc('align', 'explore', 'Line them up', 'Same whole, same starting line: compare the shaded lengths.', 7),
        sc('regrid', 'manipulate', ad === bd ? 'Count equal parts' : 'Cut both into the same parts', ad === bd ? `Both are cut into ${ad}ths, so count the parts: ${an} and ${bn}.` : an === bn ? `Same number of parts (${an}); ${ad > bd ? fr(c.b) : fr(c.a)} has bigger parts.` : `Cut both into ${L} equal parts: ${an * L / ad}/${L} and ${bn * L / bd}/${L}.`, 9),
        sc('discover', 'discover', s === 0 ? 'Equal' : `${bigger} is greater`, s === 0 ? 'They cover the same length.' : `${bigger} covers more of the whole.`, 6),
        sc('explain', 'explain', 'Comparing fractions', ad === bd ? 'Same denominator: the bigger numerator is bigger.' : an === bn ? 'Same numerator: the smaller denominator (bigger parts) is bigger.' : `Common denominator ${L}: compare ${an * L / ad} and ${bn * L / bd}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Compare new fractions.', 5)]; }
      case 'add-same': return [
        sc('intro', 'introduce', `A bar in ${ad}ths`, `${an} pieces and ${bn} pieces, all ${ad}ths of the same bar.`, 5),
        sc('problem', 'problem', `${fr(c.a)} + ${fr(c.b)} = ?`, 'Do we add the denominators too?', 5),
        sc('join', 'explore', 'Slide the pieces together', `${an} + ${bn} pieces of size 1/${ad}.`, 7),
        sc('size', 'manipulate', 'Did the piece size change?', `Every piece is still 1/${ad} of the bar.`, 7),
        sc('discover', 'discover', `${an + bn}/${ad}`, `${an + bn} pieces of 1/${ad} make ${an + bn}/${ad}.`, 6),
        sc('explain', 'explain', 'Same-denominator addition', `${fr(c.a)} + ${fr(c.b)} = ${an + bn}/${ad}. Add numerators; the denominator names the piece size.`, 8),
        sc('apply', 'apply', 'Your turn', 'Add and subtract like fractions.', 5)];
      case 'equivalent': return [
        sc('intro', 'introduce', `${c.n}/${c.d} of a strip`, `A paper strip with ${c.n}/${c.d} shaded.`, 5),
        sc('problem', 'problem', 'Fold it again', 'If we cut every part in two, what happens to the fraction?', 5),
        sc('cut2', 'explore', 'Cut each part in 2', `${c.n * 2}/${c.d * 2}: twice as many parts, each half the size.`, 7),
        sc('cutk', 'manipulate', 'Cut into 3, then 4', `${c.n * 3}/${c.d * 3}, ${c.n * 4}/${c.d * 4}… the shaded length never moves.`, 9),
        sc('discover', 'discover', 'Same amount, new names', `${c.n}/${c.d} = ${c.n * 2}/${c.d * 2} = ${c.n * 3}/${c.d * 3} = ${c.n * 4}/${c.d * 4}.`, 7),
        sc('explain', 'explain', 'Fundamental property', 'Multiplying numerator and denominator by the same non-zero number keeps the value.', 7),
        sc('apply', 'apply', 'Your turn', 'Find missing numbers in equivalent fractions.', 5)];
      case 'simplify': { const [p, q] = simplify(c.n, c.d); const g = gcd(c.n, c.d); return [
        sc('intro', 'introduce', `${c.n}/${c.d}`, `A strip in ${c.d} small parts with ${c.n} shaded.`, 5),
        sc('problem', 'problem', 'Bigger pieces?', 'Can we describe the same amount with fewer, bigger parts?', 5),
        sc('merge', 'explore', `Merge in groups of ${g}`, `Join every ${g} neighbouring parts into one.`, 8),
        sc('count', 'manipulate', 'Count the new parts', `Now there are ${q} parts and ${p} are shaded.`, 7),
        sc('discover', 'discover', `${c.n}/${c.d} = ${p}/${q}`, 'Same shaded length, fewer parts.', 6),
        sc('explain', 'explain', 'Simplifying', `Divide numerator and denominator by their greatest common factor ${g}: ${c.n}÷${g} / ${c.d}÷${g} = ${p}/${q}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Simplify new fractions.', 5)]; }
      case 'add-diff': { const L = lcm(ad, bd); const A = an * L / ad, B = bn * L / bd; const R = c.op === 'sub' ? A - B : A + B; const sign = c.op === 'sub' ? '−' : '+'; return [
        sc('intro', 'introduce', 'Different pieces', `${fr(c.a)} and ${fr(c.b)} use different piece sizes.`, 5),
        sc('problem', 'problem', `${fr(c.a)} ${sign} ${fr(c.b)} = ?`, `Is it ${an + bn}/${ad + bd}? Look at the pieces before deciding.`, 6),
        sc('mismatch', 'explore', 'Pieces do not match', `1/${ad} and 1/${bd} are different sizes, so we cannot just count pieces.`, 7),
        sc('recut', 'manipulate', `Re-cut into ${L}ths`, `${fr(c.a)} = ${A}/${L} and ${fr(c.b)} = ${B}/${L}.`, 9),
        sc('discover', 'discover', 'Now count', `${A}/${L} ${sign} ${B}/${L} = ${R}/${L}${frS(R, L) !== `${R}/${L}` ? ` = ${frS(R, L)}` : ''}.`, 7),
        sc('explain', 'explain', 'Common denominators', `Use a common denominator (here the LCM ${L}), then add or subtract numerators.`, 7),
        sc('apply', 'apply', 'Your turn', 'Add or subtract unlike fractions.', 5)]; }
      case 'improper': return [
        sc('intro', 'introduce', `${c.n} pieces of 1/${c.d}`, `We have ${c.n} pieces, each 1/${c.d} of a pizza.`, 5),
        sc('problem', 'problem', 'More than one pizza?', `${c.n}/${c.d}: how many whole pizzas is that?`, 5),
        sc('fill', 'explore', 'Fill whole pizzas', `Every ${c.d} pieces complete one pizza.`, 9),
        sc('left', 'manipulate', 'Left over', `${Math.floor(c.n / c.d)} whole and ${c.n % c.d}/${c.d} left.`, 6),
        sc('discover', 'discover', `${c.n}/${c.d} = ${mixed(c.n, c.d)}`, 'An improper fraction and a mixed number name the same amount.', 6),
        sc('explain', 'explain', 'Converting', `${c.n} ÷ ${c.d} = ${Math.floor(c.n / c.d)} R ${c.n % c.d}, so ${c.n}/${c.d} = ${mixed(c.n, c.d)}.`, 7),
        sc('apply', 'apply', 'Your turn', 'Convert between the forms.', 5)];
      case 'division-link': return [
        sc('intro', 'introduce', `${c.n} cakes, ${c.d} people`, `${c.n} cakes to share equally among ${c.d} people.`, 5),
        sc('problem', 'problem', 'How much each?', `${c.n} ÷ ${c.d} — fewer cakes than people. Is that possible?`, 5),
        sc('cut', 'explore', 'Cut every cake', `Cut each cake into ${c.d} equal pieces.`, 7),
        sc('deal', 'manipulate', 'Deal the pieces', `Each person takes one piece from each cake: ${c.n} pieces of 1/${c.d}.`, 9),
        sc('discover', 'discover', `${c.n}/${c.d} each`, `Each person gets ${c.n}/${c.d} of a cake.`, 6),
        sc('explain', 'explain', 'Fractions are division', `${c.n} ÷ ${c.d} = ${c.n}/${c.d}: the dividend becomes the numerator, the divisor the denominator.`, 7),
        sc('apply', 'apply', 'Your turn', 'Write quotients as fractions.', 5)];
      case 'of-quantity': { const g = c.whole / c.d; return [
        sc('intro', 'introduce', `${c.whole} sweets`, `A bag of ${c.whole} sweets is the whole.`, 5),
        sc('problem', 'problem', `${c.n}/${c.d} of ${c.whole}?`, `How many sweets are ${c.n}/${c.d} of the bag?`, 5),
        sc('split', 'explore', `Make ${c.d} equal groups`, `${c.whole} ÷ ${c.d} = ${g} in each group.`, 8),
        sc('take', 'manipulate', `Take ${c.n} groups`, `${c.n} groups of ${g}.`, 7),
        sc('discover', 'discover', `${c.n * g} sweets`, `${c.n}/${c.d} of ${c.whole} = ${c.n * g}.`, 6),
        sc('explain', 'explain', 'Fraction × whole number', `${c.n}/${c.d} × ${c.whole} = ${c.whole} ÷ ${c.d} × ${c.n} = ${c.n * g}. The whole here is ${c.whole}, not 1.`, 8),
        sc('apply', 'apply', 'Your turn', 'Find fractions of quantities.', 5)]; }
      case 'whole-from-part': { const unit = c.part / c.n; return [
        sc('intro', 'introduce', 'A part we know', `${c.part} students are ${c.n}/${c.d} of the class.`, 5),
        sc('problem', 'problem', 'How big is the whole?', 'If we know a part, can we rebuild the whole?', 5),
        sc('unit', 'explore', 'Find one part', `${c.n} parts = ${c.part}, so 1 part = ${c.part} ÷ ${c.n} = ${unit}.`, 8),
        sc('build', 'manipulate', 'Rebuild the whole', `${c.d} parts × ${unit} = ${c.d * unit}.`, 8),
        sc('discover', 'discover', `The whole is ${c.d * unit}`, `${c.n}/${c.d} of ${c.d * unit} is ${c.part}. ✓`, 6),
        sc('explain', 'explain', 'Dividing by a fraction', `${c.part} ÷ ${c.n}/${c.d} = ${c.part} × ${c.d}/${c.n} = ${c.d * unit}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Find wholes from parts.', 5)]; }
      case 'multiply': { const pn = an * bn, pd = ad * bd; return [
        sc('intro', 'introduce', 'A square of land', 'One unit square: the whole.', 5),
        sc('problem', 'problem', `${fr(c.b)} of ${fr(c.a)}`, `What is ${fr(c.a)} × ${fr(c.b)}? Bigger or smaller than ${fr(c.a)}?`, 6),
        sc('first', 'explore', `Shade ${fr(c.a)}`, `Cut the square into ${ad} columns and shade ${an}.`, 7),
        sc('second', 'manipulate', `Take ${fr(c.b)} of it`, `Cut into ${bd} rows and take ${bn} of the shaded part.`, 8),
        sc('discover', 'discover', `${pn} of ${pd} small rectangles`, `The overlap is ${pn}/${pd}${frS(pn, pd) !== `${pn}/${pd}` ? ` = ${frS(pn, pd)}` : ''}: smaller than either factor.`, 7),
        sc('explain', 'explain', 'Multiplying fractions', 'Numerators multiply to count the overlap; denominators multiply to count all small rectangles.', 8),
        sc('apply', 'apply', 'Your turn', 'Multiply fractions.', 5)]; }
      case 'divide': { const q = (an / ad) / (bn / bd); return [
        sc('intro', 'introduce', `${an / ad === Math.floor(an / ad) ? an / ad : fr(c.a)} on a number line`, `A ribbon ${ad === 1 ? an : fr(c.a)} metres long.`, 5),
        sc('problem', 'problem', `${ad === 1 ? an : fr(c.a)} ÷ ${fr(c.b)}`, `How many ${fr(c.b)} m pieces can we cut? More or fewer than ${ad === 1 ? an : fr(c.a)}?`, 6),
        sc('jump', 'explore', `Jumps of ${fr(c.b)}`, 'Jump along the number line in steps of ' + fr(c.b) + '.', 9),
        sc('count', 'manipulate', 'Count the jumps', `${fmt(q)} jumps fit.`, 6),
        sc('discover', 'discover', 'Bigger answer!', `Dividing by a number less than 1 asks how many small pieces fit — so the answer is larger: ${fmt(q)}.`, 7),
        sc('explain', 'explain', 'Multiply by the reciprocal', `${ad === 1 ? an : fr(c.a)} ÷ ${fr(c.b)} = ${ad === 1 ? an : fr(c.a)} × ${bd}/${bn} = ${fmt(q)}.`, 8),
        sc('apply', 'apply', 'Your turn', 'Divide by fractions.', 5)]; }
      default: return [
        sc('intro', 'introduce', 'One cake', 'One whole cake, ready to share.', 5),
        sc('problem', 'problem', 'Is every cut fair?', `Is each of these ${c.d} pieces really 1/${c.d}?`, 6),
        sc('unequal', 'explore', 'Unequal cuts', 'Pieces of different sizes cannot be called the same fraction.', 7),
        sc('equal', 'manipulate', `${c.d} equal parts`, `Cut into ${c.d} equal parts: each is 1/${c.d}.`, 8),
        sc('discover', 'discover', `${c.n} of ${c.d} parts`, `Take ${c.n} of the ${c.d} equal parts.`, 6),
        sc('explain', 'explain', 'Numerator and denominator', `${c.n}/${c.d}: the denominator ${c.d} says how many equal parts; the numerator ${c.n} says how many we take.`, 8),
        sc('apply', 'apply', 'Your turn', 'Name and shade fractions.', 5)];
    }
  },
  prediction: c => {
    const [an, ad] = c.a, [bn, bd] = c.b;
    switch (c.mode) {
      case 'compare': case 'common': return predict('Which is greater?', [['a', fr(c.a)], ['b', fr(c.b)], ['c', 'Equal']], cmp(c.a, c.b) > 0 ? 'a' : cmp(c.a, c.b) < 0 ? 'b' : 'c', 'Compare equal-sized parts.', 3);
      case 'add-same': return predict(`${fr(c.a)} + ${fr(c.b)} = ?`, [['a', `${an + bn}/${ad}`], ['b', `${an + bn}/${ad * 2}`], ['c', `${an * bn}/${ad}`]], 'a', 'The piece size stays the same.', 3);
      case 'equivalent': return predict(`Cut every part of ${c.n}/${c.d} in two. The shaded amount…`, [['a', 'Stays the same'], ['b', 'Doubles'], ['c', 'Halves']], 'a', `${c.n}/${c.d} = ${c.n * 2}/${c.d * 2}.`, 2);
      case 'simplify': { const [p, q] = simplify(c.n, c.d); return predict(`${c.n}/${c.d} in simplest form is…`, [['a', `${p}/${q}`], ['b', `${c.n - 1}/${c.d - 1}`], ['c', `${c.n}/${c.d}`]], 'a', `Divide both by ${gcd(c.n, c.d)}.`, 2); }
      case 'add-diff': { const L = lcm(ad, bd); const R = c.op === 'sub' ? an * L / ad - bn * L / bd : an * L / ad + bn * L / bd; return predict(`${fr(c.a)} ${c.op === 'sub' ? '−' : '+'} ${fr(c.b)} = ?`, [['a', frS(R, L)], ['b', c.op === 'sub' ? `${an - bn}/${ad - bd || 1}` : `${an + bn}/${ad + bd}`]], 'a', 'Re-cut into common parts first.', 3); }
      case 'improper': return predict(`How many whole pizzas in ${c.n}/${c.d}?`, [['a', String(Math.floor(c.n / c.d))], ['b', String(c.n)], ['c', String(Math.ceil(c.n / c.d) + 1)]], 'a', `${c.n} ÷ ${c.d}.`, 3);
      case 'division-link': return predict(`Each person gets…`, [['a', `${c.n}/${c.d} of a cake`], ['b', `1/${c.d} of a cake`], ['c', `${c.d}/${c.n} of a cake`]], 'a', `One piece from each of the ${c.n} cakes.`, 3);
      case 'of-quantity': return predict(`${c.n}/${c.d} of ${c.whole} is…`, [['a', String(c.whole / c.d * c.n)], ['b', String(c.whole / c.d)], ['c', String(c.whole * c.n)]], 'a', `${c.whole} ÷ ${c.d} × ${c.n}.`, 3);
      case 'whole-from-part': return predict('The whole class is…', [['a', String(c.part / c.n * c.d)], ['b', String(c.part * c.n / c.d)], ['c', String(c.part + c.d)]], 'a', `1 part = ${c.part / c.n}; ${c.d} parts = ${c.part / c.n * c.d}.`, 3);
      case 'multiply': return predict(`${fr(c.a)} × ${fr(c.b)} compared with ${fr(c.a)}:`, [['a', 'Smaller'], ['b', 'Bigger'], ['c', 'Equal']], 'a', `Taking ${fr(c.b)} of something gives less than it.`, 3);
      case 'divide': { const q = (an / ad) / (bn / bd); return predict(`${ad === 1 ? an : fr(c.a)} ÷ ${fr(c.b)} = ?`, [['a', fmt(q)], ['b', fmt((an / ad) * (bn / bd))], ['c', fmt(an / ad)]], 'a', `${fmt(q)} pieces of ${fr(c.b)} fit.`, 3); }
      default: return predict('A cake is cut into 4 pieces of different sizes. Is each piece 1/4?', [['a', 'Yes'], ['b', 'No']], 'b', 'Fractions need equal parts.', 2);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'compare': case 'common': { const d1 = int(r, 2, 9), d2 = int(r, 2, 9), n1 = int(r, 1, d1 - 1 || 1), n2 = int(r, 1, d2 - 1 || 1); const s = cmp([n1, d1], [n2, d2]); return {prompt: `Choose the symbol: ${n1}/${d1} ? ${n2}/${d2}`, kind: 'choice', options: ['>', '<', '='], answer: s > 0 ? '>' : s < 0 ? '<' : '=', hint: 'Use a common denominator.', explanation: `${n1 * d2}/${d1 * d2} vs ${n2 * d1}/${d1 * d2}.`}; }
      case 'add-same': { const d = int(r, 5, 12), x = int(r, 1, d - 2), y = int(r, 1, d - x - 1); return {prompt: `${x}/${d} + ${y}/${d} = ?/${d}`, kind: 'number', answer: x + y, hint: 'Count the pieces.', explanation: `${x + y}/${d}.`}; }
      case 'equivalent': { const d = int(r, 2, 9), n = int(r, 1, d - 1), k = int(r, 2, 6); return {prompt: `${n}/${d} = ?/${d * k}`, kind: 'number', answer: n * k, hint: `${d} × ${k} = ${d * k}.`, explanation: `Multiply the numerator by ${k} too.`}; }
      case 'simplify': { const p = int(r, 1, 6), q = p + int(r, 1, 6), k = int(r, 2, 6); const [sp, sq] = simplify(p * k, q * k); return {prompt: `Simplify ${p * k}/${q * k}. Numerator of the simplest form?`, kind: 'number', answer: sp, hint: 'Divide by the greatest common factor.', explanation: `${p * k}/${q * k} = ${sp}/${sq}.`}; }
      case 'add-diff': { const [d1, d2] = pick(r, [[2, 3], [3, 4], [4, 6], [2, 5], [3, 5], [6, 8]] as const); const L = lcm(d1, d2); const sub = c.op === 'sub'; const v = sub ? 1 / d1 * (d1 - 1) - 1 / d2 : 1 / d1 + 1 / d2;
        const R = sub ? (d1 - 1) * L / d1 - L / d2 : L / d1 + L / d2; return {prompt: `${sub ? `${d1 - 1}/${d1} − 1/${d2}` : `1/${d1} + 1/${d2}`} = ? (fraction or decimal)`, kind: 'number', answer: v, tolerance: 1e-6, hint: `Common denominator ${L}.`, explanation: `${R}/${L} = ${frS(R, L)}.`}; }
      case 'improper': { const d = int(r, 2, 8), w = int(r, 1, 4), rem = int(r, 1, d - 1); return {prompt: `${w * d + rem}/${d} as a mixed number: ${'?'} ${rem}/${d}. What is the whole-number part?`, kind: 'number', answer: w, hint: `${w * d + rem} ÷ ${d}.`, explanation: `${w * d + rem}/${d} = ${w} ${rem}/${d}.`}; }
      case 'division-link': { const a = int(r, 1, 7), b = int(r, a + 1, 9); return {prompt: `${a} ÷ ${b} as a fraction (type it like a/b)`, kind: 'number', answer: a / b, tolerance: 1e-9, hint: 'Dividend on top.', explanation: `${a}/${b}.`}; }
      case 'of-quantity': { const d = int(r, 2, 8), n = int(r, 1, d - 1), w = d * int(r, 2, 12); return {prompt: `${n}/${d} of ${w} = ?`, kind: 'number', answer: w / d * n, hint: `${w} ÷ ${d} first.`, explanation: `${w} ÷ ${d} × ${n} = ${w / d * n}.`}; }
      case 'whole-from-part': { const d = int(r, 3, 9), n = int(r, 1, d - 1), u = int(r, 2, 12); return {prompt: `${n}/${d} of a number is ${n * u}. What is the number?`, kind: 'number', answer: d * u, hint: `Find 1/${d} first.`, explanation: `${n * u} ÷ ${n} × ${d} = ${d * u}.`}; }
      case 'multiply': { const a = [int(r, 1, 4), int(r, 5, 6)], b = [int(r, 1, 3), int(r, 4, 5)]; return {prompt: `${fr(a)} × ${fr(b)} = ? (fraction or decimal)`, kind: 'number', answer: a[0] * b[0] / (a[1] * b[1]), tolerance: 1e-9, hint: 'Multiply tops, multiply bottoms.', explanation: `${a[0] * b[0]}/${a[1] * b[1]} = ${frS(a[0] * b[0], a[1] * b[1])}.`}; }
      case 'divide': { const w = int(r, 2, 6), d = int(r, 2, 5); return {prompt: `${w} ÷ 1/${d} = ?`, kind: 'number', answer: w * d, hint: `How many 1/${d}s in one whole?`, explanation: `${d} in each whole, ${w} wholes: ${w * d}.`}; }
      default: { const d = int(r, 3, 10), n = int(r, 1, d - 1); return {prompt: `A bar is cut into ${d} equal parts and ${n} are shaded. Type the shaded fraction.`, kind: 'number', answer: n / d, tolerance: 1e-9, hint: 'Parts taken / equal parts.', explanation: `${n}/${d}.`}; }
    }
  },
  describe: c => `Fraction laboratory (${c.mode}): ${['compare', 'common', 'add-same', 'add-diff', 'multiply', 'divide'].includes(c.mode) ? `${fr(c.a)} and ${fr(c.b)}` : `${c.n}/${c.d}`} shown with equal-part bars, circles${c.mode === 'divide' ? ' and a number line' : ''}.`,
};

import type {EngineLogic} from '../types';
import {fix, fmt, gcd, int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type PropMode = 'ratio' | 'simplify' | 'divide' | 'solve' | 'direct' | 'inverse' | 'speed' | 'unit-price';
export interface PropConfig {mode: PropMode; a: number; b: number; c: number; k: number; total: number; product: number; speed: number; time: number; price: number; qty: number}

export const proportion: EngineLogic<PropConfig> = {
  type: 'proportion', label: 'Proportionality laboratory',
  parse: r => ({mode: str(r.mode, 'ratio'), a: num(r.a, 2), b: num(r.b, 3), c: num(r.c, 9), k: num(r.k, 3), total: num(r.total, 35), product: num(r.product, 24), speed: num(r.speed, 60), time: num(r.time, 3), price: num(r.price, 6), qty: num(r.qty, 5)}),
  validate: c => { const e: string[] = []; if (c.mode === 'divide' && c.total % (c.a + c.b) !== 0) e.push('total must split evenly'); if (c.mode === 'solve' && (c.b * c.c) % c.a !== 0) e.push('proportion should have a whole answer'); if (c.mode === 'simplify' && gcd(c.a, c.b) === 1) e.push('simplify needs a reducible ratio'); return e; },
  scenes: c => {
    const {a, b} = c;
    switch (c.mode) {
      case 'simplify': { const g = gcd(a, b); return [
        sc('intro', 'introduce', `${a} : ${b}`, `A class has ${a} girls and ${b} boys.`, 5),
        sc('problem', 'problem', 'Simpler numbers?', 'Can we describe the same comparison with smaller numbers?', 5),
        sc('group', 'explore', `Groups of ${g}`, `Put girls and boys into groups of ${g}: ${a / g} groups and ${b / g} groups.`, 8),
        sc('same', 'manipulate', 'Same comparison', `For every ${a / g} girls there are ${b / g} boys.`, 7),
        sc('discover', 'discover', `${a / g} : ${b / g}`, `${a} : ${b} = ${a / g} : ${b / g}; ratio value ${a} ÷ ${b} = ${fmt(a / b, 4)}.`, 7),
        sc('explain', 'explain', 'Fundamental property', 'Multiplying or dividing both terms by the same non-zero number keeps the ratio.', 7),
        sc('apply', 'apply', 'Your turn', 'Simplify ratios.', 5)]; }
      case 'divide': { const part = c.total / (a + b); return [
        sc('intro', 'introduce', `${c.total} stickers`, `Share ${c.total} stickers in the ratio ${a} : ${b}.`, 5),
        sc('problem', 'problem', 'Not half each', 'How many does each person get?', 5),
        sc('parts', 'explore', `${a + b} equal parts`, `${a} + ${b} = ${a + b} parts; each part is ${c.total} ÷ ${a + b} = ${part}.`, 8),
        sc('share', 'manipulate', 'Hand out the parts', `${a} parts = ${a * part}; ${b} parts = ${b * part}.`, 8),
        sc('discover', 'discover', `${a * part} and ${b * part}`, `${a * part} : ${b * part} = ${a} : ${b}, and ${a * part} + ${b * part} = ${c.total}.`, 6),
        sc('explain', 'explain', 'Sharing in a ratio', 'Total ÷ total parts = one part; multiply for each share. Check both the ratio and the total.', 8),
        sc('apply', 'apply', 'Your turn', 'Share in ratios.', 5)]; }
      case 'solve': { const x = (b * c.c) / a; return [
        sc('intro', 'introduce', 'Two recipes', `${a} cups of flour for ${b} pancakes… how about ${c.c} cups?`, 5),
        sc('problem', 'problem', `${a} : ${b} = ${c.c} : x`, 'Find x so the two ratios are equal.', 6),
        sc('scale', 'explore', 'Scale the recipe', `${c.c} is ${fmt(c.c / a)} times ${a}, so x is ${fmt(c.c / a)} times ${b}.`, 8),
        sc('cross', 'manipulate', 'Outer × outer = inner × inner', `${a} × x = ${b} × ${c.c}.`, 8),
        sc('discover', 'discover', `x = ${x}`, `${a}x = ${b * c.c}, so x = ${x}.`, 6),
        sc('explain', 'explain', 'Properties of proportion', 'In a : b = c : d, a and d are outer terms, b and c inner terms; ad = bc.', 8),
        sc('apply', 'apply', 'Your turn', 'Solve proportions.', 5)]; }
      case 'direct': return [
        sc('intro', 'introduce', 'Pencils and cost', `Each pencil costs ${c.k} yuan.`, 5),
        sc('problem', 'problem', 'How do they change together?', 'When the number doubles, what happens to the cost?', 5),
        sc('table', 'explore', 'Build a table', `1 → ${c.k}, 2 → ${2 * c.k}, 3 → ${3 * c.k}, 4 → ${4 * c.k}…`, 8),
        sc('plot', 'manipulate', 'Plot the points', 'Each pair becomes a point; join them.', 8),
        sc('discover', 'discover', 'A straight line through 0', `cost ÷ number = ${c.k} every time: the points lie on a line through the origin.`, 7),
        sc('explain', 'explain', 'Direct proportion', 'y ÷ x = k (constant) ⇔ y = kx. Graph: a straight line through (0, 0).', 7),
        sc('apply', 'apply', 'Your turn', 'Recognise direct proportion.', 5)];
      case 'inverse': return [
        sc('intro', 'introduce', `A ${c.product} km trip`, `The distance is fixed at ${c.product} km.`, 5),
        sc('problem', 'problem', 'Faster means…?', 'If the speed doubles, what happens to the time?', 5),
        sc('table', 'explore', 'Speed × time', `1 × ${c.product}, 2 × ${c.product / 2}, 3 × ${c.product / 3}, 4 × ${c.product / 4}…`, 8),
        sc('plot', 'manipulate', 'Plot it', 'The points form a curve, not a line.', 8),
        sc('discover', 'discover', 'Constant product', `speed × time = ${c.product} every time.`, 6),
        sc('explain', 'explain', 'Inverse proportion', 'x × y = k (constant). This only holds while the total (here the distance) stays fixed.', 8),
        sc('apply', 'apply', 'Your turn', 'Recognise inverse proportion.', 5)];
      case 'speed': return [
        sc('intro', 'introduce', 'A car on the road', `A car drives at ${c.speed} km per hour.`, 5),
        sc('problem', 'problem', `After ${c.time} hours?`, 'How far will it go?', 5),
        sc('drive', 'explore', 'Hour by hour', `Each hour adds ${c.speed} km.`, 10),
        sc('compare', 'manipulate', 'A slower bus', `A bus at ${c.speed / 2} km/h covers half the distance in the same time.`, 8),
        sc('discover', 'discover', `${c.speed * c.time} km`, `${c.speed} × ${c.time} = ${c.speed * c.time}.`, 6),
        sc('explain', 'explain', 'Speed × time = distance', 'distance = speed × time; speed = distance ÷ time; time = distance ÷ speed.', 7),
        sc('apply', 'apply', 'Your turn', 'Solve speed problems.', 5)];
      case 'unit-price': return [
        sc('intro', 'introduce', 'Notebooks', `One notebook costs ${c.price} yuan.`, 5),
        sc('problem', 'problem', `${c.qty} notebooks?`, 'How much do they cost together?', 5),
        sc('add', 'explore', 'Add them to the basket', `Each notebook adds ${c.price} yuan.`, 9),
        sc('back', 'manipulate', 'Work backwards', `If ${c.qty} cost ${c.price * c.qty}, one costs ${c.price * c.qty} ÷ ${c.qty} = ${c.price}.`, 7),
        sc('discover', 'discover', `${c.price * c.qty} yuan`, `${c.price} × ${c.qty} = ${c.price * c.qty}.`, 6),
        sc('explain', 'explain', 'Price relationships', 'total = unit price × quantity; unit price = total ÷ quantity; quantity = total ÷ unit price.', 7),
        sc('apply', 'apply', 'Your turn', 'Compare value for money.', 5)];
      default: return [
        sc('intro', 'introduce', 'Fruit punch', `Mix ${a} cups of juice with ${b} cups of water.`, 5),
        sc('problem', 'problem', 'Make more, same taste', 'How do we make a bigger jug that tastes the same?', 6),
        sc('double', 'explore', 'Double the recipe', `${2 * a} : ${2 * b} tastes the same; ${a + 1} : ${b + 1} does not.`, 9),
        sc('scale', 'manipulate', 'Any scale', `${3 * a} : ${3 * b}, ${4 * a} : ${4 * b}… multiply both parts by the same number.`, 8),
        sc('discover', 'discover', `${a} : ${b}`, `Juice is ${a}/${a + b} of the punch whatever the size.`, 7),
        sc('explain', 'explain', 'Ratio', `${a} : ${b} = ${a} ÷ ${b} = ${a}/${b} (ratio value ${fmt(a / b, 3)}).`, 7),
        sc('apply', 'apply', 'Your turn', 'Scale recipes.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'simplify': return predict(`${c.a} : ${c.b} in simplest form?`, [['a', `${c.a / gcd(c.a, c.b)} : ${c.b / gcd(c.a, c.b)}`], ['b', `${c.a - 1} : ${c.b - 1}`]], 'a', 'Divide both by the GCF.', 2);
      case 'divide': return predict(`Share ${c.total} in ${c.a} : ${c.b}. The smaller share is…`, [['a', String(c.total / (c.a + c.b) * Math.min(c.a, c.b))], ['b', String(c.total / 2)], ['c', String(Math.floor(c.total / Math.max(c.a, c.b)))]], 'a', 'One part × parts.', 3);
      case 'solve': return predict(`${c.a} : ${c.b} = ${c.c} : x. x = ?`, [['a', String(c.b * c.c / c.a)], ['b', String(c.b + c.c - c.a)]], 'a', 'Scale, not add.', 2);
      case 'direct': return predict('The graph of cost against number is…', [['a', 'A straight line through 0'], ['b', 'A curve'], ['c', 'A flat line']], 'a', 'Constant ratio.', 3);
      case 'inverse': return predict('Doubling the speed makes the time…', [['a', 'Half'], ['b', 'Double'], ['c', 'The same']], 'a', 'Product stays fixed.', 2);
      case 'speed': return predict(`After ${c.time} hours at ${c.speed} km/h:`, [['a', `${c.speed * c.time} km`], ['b', `${c.speed + c.time} km`], ['c', `${c.speed / c.time} km`]], 'a', 'speed × time.', 2);
      case 'unit-price': return predict(`${c.qty} notebooks at ${c.price} yuan cost…`, [['a', String(c.price * c.qty)], ['b', String(c.price + c.qty)]], 'a', 'price × quantity.', 2);
      default: return predict(`Which tastes the same as ${c.a} : ${c.b}?`, [['a', `${2 * c.a} : ${2 * c.b}`], ['b', `${c.a + 1} : ${c.b + 1}`]], 'a', 'Multiply both parts.', 2);
    }
  },
  challenge: (c, r) => {
    const a = int(r, 1, 6), b = int(r, a + 1, 9), k = int(r, 2, 8);
    switch (c.mode) {
      case 'simplify': { const g = gcd(a, b); return {prompt: `Simplify ${a * k} : ${b * k}. First term?`, kind: 'number', answer: a / g, hint: 'Divide by the GCF.', explanation: `${a / g} : ${b / g}.`}; }
      case 'divide': return {prompt: `Share ${(a + b) * k} in the ratio ${a} : ${b}. Larger share?`, kind: 'number', answer: b * k, hint: 'Find one part first.', explanation: `${(a + b) * k} ÷ ${a + b} × ${b} = ${b * k}.`};
      case 'solve': return {prompt: `${a} : ${b} = ${a * k} : x. x = ?`, kind: 'number', answer: b * k, hint: 'Scale both terms.', explanation: `x = ${b * k}.`};
      case 'direct': return {prompt: `y is directly proportional to x; when x = ${a}, y = ${a * k}. When x = ${b}, y = ?`, kind: 'number', answer: b * k, hint: 'y ÷ x is constant.', explanation: `k = ${k}, y = ${b * k}.`};
      case 'inverse': { const P = a * b * k; return {prompt: `x × y = constant. When x = ${a}, y = ${b * k}. When x = ${b}, y = ?`, kind: 'number', answer: P / b, hint: 'Find the product first.', explanation: `${P} ÷ ${b} = ${P / b}.`}; }
      case 'speed': { const v = pick(r, [40, 45, 60, 75, 80]), t = int(r, 2, 6); return pick(r, [0, 1]) ? {prompt: `${v} km/h for ${t} h. Distance?`, kind: 'number', answer: v * t, unit: 'km', hint: 'v × t', explanation: `${v * t} km.`} : {prompt: `${v * t} km in ${t} h. Speed?`, kind: 'number', answer: v, unit: 'km/h', hint: 'distance ÷ time', explanation: `${v} km/h.`}; }
      case 'unit-price': { const p1 = fix(int(r, 20, 60) / 10), q = int(r, 3, 9); return {prompt: `${q} pens cost ${fmt(fix(p1 * q))} yuan. Price of one?`, kind: 'number', answer: p1, tolerance: 1e-6, hint: 'total ÷ quantity', explanation: `${fmt(p1)} yuan.`}; }
      default: return {prompt: `Juice : water = ${a} : ${b}. With ${a * k} cups of juice, how much water?`, kind: 'number', answer: b * k, hint: `× ${k}`, explanation: `${b * k} cups.`};
    }
  },
  describe: c => `Proportional reasoning (${c.mode}) with synchronised objects, tables and graphs.`,
};

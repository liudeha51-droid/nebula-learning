import type {EngineLogic} from '../types';
import {fmt, int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type ReasonMode = 'code' | 'planting' | 'logic' | 'chicken-rabbit' | 'pigeonhole' | 'combinations' | 'work' | 'travel' | 'optimize';
export interface ReasonConfig {mode: ReasonMode; kind: 'seat' | 'student' | 'id'; length: number; gap: number; ends: 'both' | 'one' | 'none' | 'loop'; heads: number; legs: number; items: number; boxes: number; n: number; a: number; b: number; distance: number; v1: number; v2: number; perimeter: number}
export const trees = (length: number, gap: number, ends: ReasonConfig['ends']) => { const g = length / gap; return ends === 'both' ? g + 1 : ends === 'one' || ends === 'loop' ? g : g - 1; };
export const CODES = {
  seat: {code: '0512', parts: [['05', 'row'], ['12', 'seat']]},
  student: {code: '20240315', parts: [['2024', 'year'], ['03', 'class'], ['15', 'number']]},
  id: {code: '110105201203150027', parts: [['110105', 'region'], ['20120315', 'date of birth'], ['002', 'order (odd = male, even = female)'], ['7', 'check digit']]},
} as const;

export const reasoning: EngineLogic<ReasonConfig> = {
  type: 'reasoning', label: 'Mathematical challenge universe',
  parse: r => ({mode: str(r.mode, 'chicken-rabbit'), kind: str(r.kind, 'seat'), length: num(r.length, 20), gap: num(r.gap, 5), ends: str(r.ends, 'both'), heads: num(r.heads, 10), legs: num(r.legs, 28), items: num(r.items, 5), boxes: num(r.boxes, 4), n: num(r.n, 4), a: num(r.a, 6), b: num(r.b, 3), distance: num(r.distance, 300), v1: num(r.v1, 60), v2: num(r.v2, 40), perimeter: num(r.perimeter, 20)}),
  validate: c => { const e: string[] = []; if (c.mode === 'chicken-rabbit' && ((c.legs - 2 * c.heads) % 2 !== 0 || c.legs < 2 * c.heads || c.legs > 4 * c.heads)) e.push('legs must fit the heads'); if (c.mode === 'planting' && c.length % c.gap !== 0) e.push('gap must divide length'); if (c.mode === 'pigeonhole' && c.items <= c.boxes) e.push('more items than boxes'); return e; },
  scenes: c => {
    switch (c.mode) {
      case 'code': { const k = CODES[c.kind]; return [
        sc('intro', 'introduce', 'A number that is a label', `Look at this number: ${k.code}.`, 5),
        sc('problem', 'problem', 'Is it an amount?', 'Does this number count anything, or does it carry information?', 6),
        sc('split', 'explore', 'Split into parts', `${k.parts.map(([d, m]) => `${d} = ${m}`).join('; ')}.`, 9),
        sc('rules', 'manipulate', 'Fixed widths', 'Each part always has the same number of digits, so codes never get mixed up.', 8),
        sc('discover', 'discover', 'Position carries meaning', 'Each digit’s place says what it describes; adding codes makes no sense.', 7),
        sc('explain', 'explain', 'Designing codes', 'Good codes are unique, ordered and have fixed-width parts. A check digit can catch typing mistakes.', 8),
        sc('apply', 'apply', 'Your turn', 'Read and design codes.', 5)]; }
      case 'planting': { const g = c.length / c.gap; return [
        sc('intro', 'introduce', `A ${c.length} m road`, `Trees every ${c.gap} m.`, 5),
        sc('problem', 'problem', 'How many trees?', `Is it ${c.length} ÷ ${c.gap} = ${g}?`, 6),
        sc('draw', 'explore', 'Draw it small', 'Draw the road with gaps and trees.', 8),
        sc('cases', 'manipulate', 'Three cases', `Both ends: ${g + 1}. One end: ${g}. Neither end: ${g - 1}. A closed loop: ${g}.`, 10),
        sc('discover', 'discover', `${trees(c.length, c.gap, c.ends)} trees`, `With ${c.ends === 'both' ? 'both ends planted' : c.ends}, trees = gaps ${c.ends === 'both' ? '+ 1' : c.ends === 'none' ? '− 1' : ''} = ${trees(c.length, c.gap, c.ends)}.`, 7),
        sc('explain', 'explain', 'Gaps and points', 'Count gaps first (length ÷ spacing), then decide: +1, 0 or −1 depending on the ends.', 7),
        sc('apply', 'apply', 'Your turn', 'Solve planting problems.', 5)]; }
      case 'logic': return [
        sc('intro', 'introduce', 'Three friends, three pets', 'A, B and C own a cat, a dog and a fish — one each.', 5),
        sc('problem', 'problem', 'Who owns what?', 'Clues: A has no furry pet. B is not the dog owner.', 6),
        sc('clue1', 'explore', 'Use clue 1', 'A has no fur → A has the fish. Cross out cat and dog for A.', 8),
        sc('clue2', 'manipulate', 'Use clue 2', 'Fish is taken, B is not dog → B has the cat.', 8),
        sc('discover', 'discover', 'C has the dog', 'Only one option is left for C.', 6),
        sc('explain', 'explain', 'Elimination', 'A grid with ✓ and ✗ keeps track; each row and column has exactly one ✓.', 7),
        sc('apply', 'apply', 'Your turn', 'Solve logic puzzles.', 5)];
      case 'pigeonhole': return [
        sc('intro', 'introduce', `${c.items} letters, ${c.boxes} mailboxes`, 'Every letter must go into a box.', 5),
        sc('problem', 'problem', 'Must some box get two?', 'Can we avoid doubling up?', 5),
        sc('spread', 'explore', 'Spread them out', `One per box uses ${c.boxes} letters.`, 8),
        sc('extra', 'manipulate', 'The extra letter', `${c.items - c.boxes} more must go somewhere already used.`, 7),
        sc('discover', 'discover', `At least ${Math.ceil(c.items / c.boxes)}`, `Some box holds at least ⌈${c.items} ÷ ${c.boxes}⌉ = ${Math.ceil(c.items / c.boxes)}.`, 7),
        sc('explain', 'explain', 'Pigeonhole principle', 'More items than boxes → some box has at least 2. Think of the worst case.', 7),
        sc('apply', 'apply', 'Your turn', 'Use worst-case thinking.', 5)];
      case 'combinations': return [
        sc('intro', 'introduce', `${c.n} friends meet`, 'Everyone shakes hands with everyone once.', 5),
        sc('problem', 'problem', 'How many handshakes?', `Is it ${c.n} × ${c.n - 1}?`, 6),
        sc('lines', 'explore', 'Draw the handshakes', 'Each line joins two people.', 9),
        sc('order', 'manipulate', 'Order matters?', `A shaking B is the same as B shaking A, so ${c.n} × ${c.n - 1} counts each twice.`, 8),
        sc('discover', 'discover', `${c.n * (c.n - 1) / 2} handshakes`, `${Array.from({length: c.n - 1}, (_, i) => c.n - 1 - i).join(' + ')} = ${c.n * (c.n - 1) / 2}.`, 7),
        sc('explain', 'explain', 'Combinations and permutations', `Unordered pairs: n(n − 1) ÷ 2. Ordered arrangements of 3 items: 3 × 2 × 1 = 6.`, 8),
        sc('apply', 'apply', 'Your turn', 'Count systematically.', 5)];
      case 'work': { const t = 1 / (1 / c.a + 1 / c.b); return [
        sc('intro', 'introduce', 'Painting a fence', `A paints it alone in ${c.a} days; B in ${c.b} days.`, 5),
        sc('problem', 'problem', 'Together?', 'How long if they work together?', 5),
        sc('rates', 'explore', 'One day’s work', `A does 1/${c.a} per day; B does 1/${c.b}.`, 8),
        sc('together', 'manipulate', 'Add the rates', `Together: 1/${c.a} + 1/${c.b} = ${fmt(1 / c.a + 1 / c.b, 3)} of the fence per day.`, 8),
        sc('discover', 'discover', `${fmt(t, 2)} days`, `1 ÷ ${fmt(1 / c.a + 1 / c.b, 3)} = ${fmt(t, 2)} days.`, 6),
        sc('explain', 'explain', 'Work rate', 'Treat the whole job as 1. Time = 1 ÷ (sum of rates). Never add the times!', 8),
        sc('apply', 'apply', 'Your turn', 'Solve work problems.', 5)]; }
      case 'travel': { const t = c.distance / (c.v1 + c.v2); return [
        sc('intro', 'introduce', `${c.distance} km apart`, `Car A (${c.v1} km/h) and car B (${c.v2} km/h) drive towards each other.`, 6),
        sc('problem', 'problem', 'When do they meet?', 'How long until they meet?', 5),
        sc('hour', 'explore', 'After one hour', `The gap shrinks by ${c.v1} + ${c.v2} = ${c.v1 + c.v2} km.`, 8),
        sc('meet', 'manipulate', 'Keep driving', `${c.distance} ÷ ${c.v1 + c.v2} = ${fmt(t, 2)} hours.`, 9),
        sc('discover', 'discover', `${fmt(t, 2)} h`, `A has driven ${fmt(c.v1 * t)} km and B ${fmt(c.v2 * t)} km; together ${c.distance} km.`, 7),
        sc('explain', 'explain', 'Meeting problems', 'Towards each other: time = distance ÷ (sum of speeds). Same direction: gap ÷ (difference of speeds).', 8),
        sc('apply', 'apply', 'Your turn', 'Solve travel problems.', 5)]; }
      case 'optimize': { const s = c.perimeter / 4; return [
        sc('intro', 'introduce', `${c.perimeter} m of fence`, 'Build the biggest rectangular pen.', 5),
        sc('problem', 'problem', 'Long or square?', 'Which shape gives the sheep the most space?', 5),
        sc('try', 'explore', 'Try them all', `Widths 1, 2, 3, … with length ${c.perimeter / 2} − width.`, 10),
        sc('chart', 'manipulate', 'Compare areas', 'Areas rise, peak, then fall.', 8),
        sc('discover', 'discover', `${s} × ${s} = ${s * s}`, 'The square encloses the most.', 6),
        sc('explain', 'explain', 'Optimization', 'Test cases systematically, record results, and look for the peak.', 7),
        sc('apply', 'apply', 'Your turn', 'Find the best arrangement.', 5)]; }
      default: { const rabbits = (c.legs - 2 * c.heads) / 2; return [
        sc('intro', 'introduce', 'A farmyard', `${c.heads} heads and ${c.legs} legs in a cage of chickens and rabbits.`, 6),
        sc('problem', 'problem', 'How many of each?', 'Can we work it out without counting the animals?', 5),
        sc('assume', 'explore', 'Assume all chickens', `${c.heads} chickens have ${2 * c.heads} legs: ${c.legs - 2 * c.heads} too few.`, 8),
        sc('swap', 'manipulate', 'Swap one at a time', 'Each chicken swapped for a rabbit adds 2 legs.', 10),
        sc('discover', 'discover', `${rabbits} rabbits`, `${c.legs - 2 * c.heads} ÷ 2 = ${rabbits} rabbits and ${c.heads - rabbits} chickens.`, 7),
        sc('explain', 'explain', 'Many strategies', `Listing, assumption or an equation: 2x + 4(${c.heads} − x) = ${c.legs} gives the same answer.`, 8),
        sc('apply', 'apply', 'Your turn', 'Solve a new version.', 5)]; }
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'code': return predict('Does adding two student codes give anything meaningful?', [['a', 'No'], ['b', 'Yes']], 'a', 'Codes are labels.', 2);
      case 'planting': return predict(`How many trees on a ${c.length} m road, every ${c.gap} m, both ends?`, [['a', String(c.length / c.gap + 1)], ['b', String(c.length / c.gap)]], 'a', 'One more tree than gaps.', 3);
      case 'logic': return predict('Who owns the dog?', [['a', 'A'], ['b', 'B'], ['c', 'C']], 'c', 'Eliminate step by step.', 2);
      case 'pigeonhole': return predict(`With ${c.items} letters in ${c.boxes} boxes, some box must hold at least…`, [['a', String(Math.ceil(c.items / c.boxes))], ['b', '1'], ['c', String(c.items)]], 'a', 'Worst case: spread out evenly.', 3);
      case 'combinations': return predict(`Handshakes among ${c.n}?`, [['a', String(c.n * (c.n - 1) / 2)], ['b', String(c.n * (c.n - 1))], ['c', String(c.n)]], 'a', 'Each pair counted once.', 3);
      case 'work': return predict('Together they take…', [['a', `Less than ${Math.min(c.a, c.b)} days`], ['b', `${c.a + c.b} days`], ['c', `${(c.a + c.b) / 2} days`]], 'a', 'Two workers are faster than either alone.', 3);
      case 'travel': return predict('Their gap shrinks each hour by…', [['a', `${c.v1 + c.v2} km`], ['b', `${c.v1 - c.v2} km`]], 'a', 'Both move towards each other.', 2);
      case 'optimize': return predict('The biggest pen is…', [['a', 'The square'], ['b', 'The longest']], 'a', 'Balanced sides.', 3);
      default: return predict('If all were chickens, there would be…', [['a', `${2 * c.heads} legs`], ['b', `${4 * c.heads} legs`]], 'a', '2 legs each.', 2);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'code': return {prompt: 'Class code rule: year (4 digits), class (2 digits), number (2 digits). Code for 2026, class 5, number 9?', kind: 'choice', options: ['20260509', '2026059', '20265009'], answer: '20260509', hint: 'Keep two digits for class and number.', explanation: '2026 | 05 | 09.'};
      case 'planting': { const g = pick(r, [3, 4, 5, 6]), k = int(r, 4, 12); const ends = pick(r, ['both', 'none', 'loop'] as const); return {prompt: `${ends === 'loop' ? `A circular path of ${g * k} m` : `A ${g * k} m path`} has trees every ${g} m${ends === 'both' ? ', at both ends' : ends === 'none' ? ', but not at the ends' : ''}. How many trees?`, kind: 'number', answer: trees(g * k, g, ends), hint: 'Count gaps first.', explanation: `${k} gaps → ${trees(g * k, g, ends)} trees.`}; }
      case 'logic': return {prompt: 'Tom, Ann and Li are 8, 9 and 10. Ann is older than Tom. Li is the youngest. How old is Ann?', kind: 'number', answer: 10, hint: 'Li is 8; then compare Ann and Tom.', explanation: 'Li 8, Tom 9, Ann 10.'};
      case 'pigeonhole': { const b = int(r, 3, 8), k = int(r, 2, 4); return {prompt: `${b * k + 1} pencils go into ${b} cups. At least how many pencils must be in the fullest cup?`, kind: 'number', answer: k + 1, hint: 'Spread them as evenly as possible.', explanation: `${b} × ${k} = ${b * k}, one extra → ${k + 1}.`}; }
      case 'combinations': { const n = int(r, 4, 9); return pick(r, [0, 1]) ? {prompt: `${n} teams play each other once. How many matches?`, kind: 'number', answer: n * (n - 1) / 2, hint: 'n(n − 1) ÷ 2', explanation: `${n * (n - 1) / 2}.`} : {prompt: `How many ways to arrange 4 different books in a row?`, kind: 'number', answer: 24, hint: '4 × 3 × 2 × 1', explanation: '24.'}; }
      case 'work': { const [a, b] = pick(r, [[6, 3], [4, 12], [10, 15], [12, 6], [20, 5]] as const); return {prompt: `A finishes a job in ${a} days, B in ${b} days. Together, how many days?`, kind: 'number', answer: 1 / (1 / a + 1 / b), tolerance: .01, hint: '1 ÷ (1/a + 1/b)', explanation: `${fmt(1 / (1 / a + 1 / b), 2)} days.`}; }
      case 'travel': { const v1 = pick(r, [40, 50, 60]), v2 = pick(r, [30, 40, 50]), t = int(r, 2, 5); return {prompt: `Two cars ${(v1 + v2) * t} km apart drive towards each other at ${v1} and ${v2} km/h. Hours until they meet?`, kind: 'number', answer: t, hint: 'distance ÷ (v1 + v2)', explanation: `${(v1 + v2) * t} ÷ ${v1 + v2} = ${t}.`}; }
      case 'optimize': { const s = int(r, 3, 10); return {prompt: `Largest rectangle area with perimeter ${4 * s}?`, kind: 'number', answer: s * s, hint: 'Make a square.', explanation: `${s} × ${s} = ${s * s}.`}; }
      default: { const h = int(r, 8, 20), rb = int(r, 1, h - 1); return {prompt: `${h} heads and ${2 * h + 2 * rb} legs. How many rabbits?`, kind: 'number', answer: rb, hint: 'Assume all chickens first.', explanation: `(${2 * h + 2 * rb} − ${2 * h}) ÷ 2 = ${rb}.`}; }
    }
  },
  describe: c => `Reasoning challenge (${c.mode}) acted out with animated objects and multiple strategies.`,
};

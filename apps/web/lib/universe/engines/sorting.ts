import type {EngineLogic} from '../types';
import {int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type SortMode = 'sort' | 'multi' | 'pattern' | 'number-pattern' | 'growing';
export interface SortConfig {mode: SortMode; rule: 'color' | 'shape' | 'size'; unit: number; start: number; step: number; first: number}
export type Thing = {color: 'red' | 'blue' | 'yellow'; shape: 'circle' | 'square' | 'triangle'; size: 'big' | 'small'};
/** A fixed, balanced collection of 12 things to sort. */
export const THINGS: Thing[] = Array.from({length: 12}, (_, i) => ({color: (['red', 'blue', 'yellow'] as const)[i % 3], shape: (['circle', 'square', 'triangle'] as const)[Math.floor(i / 3) % 3 === 0 ? (i % 2 ? 1 : 0) : Math.floor(i / 3) % 3], size: i % 4 < 2 ? 'big' : 'small'}));
export const GLYPHS = ['▲', '●', '■', '◆'];
export const patternAt = (unit: number, i: number) => GLYPHS[i % unit];

export const sorting: EngineLogic<SortConfig> = {
  type: 'sorting', label: 'Sorting and pattern laboratory',
  parse: r => ({mode: str(r.mode, 'sort'), rule: str(r.rule, 'color'), unit: num(r.unit, 3), start: num(r.start, 2), step: num(r.step, 2), first: num(r.first, 4)}),
  validate: c => (c.unit < 2 || c.unit > 4 ? ['pattern unit 2–4'] : []),
  scenes: c => {
    switch (c.mode) {
      case 'multi': return [
        sc('intro', 'introduce', 'A mixed box', 'Shapes of different colours and kinds.', 5),
        sc('problem', 'problem', 'Two rules at once', 'Which things are red AND circles?', 5),
        sc('first', 'explore', 'Sort by colour', 'Red things go up, the rest go down.', 8),
        sc('second', 'manipulate', 'Then by shape', 'Inside each group, circles go left, others right.', 8),
        sc('discover', 'discover', 'A two-way table', 'Each thing lands in exactly one of four boxes.', 6),
        sc('explain', 'explain', 'Multiple conditions', '“Red and circle” needs both; “not red” means any other colour.', 7),
        sc('apply', 'apply', 'Your turn', 'Use two conditions.', 5)];
      case 'pattern': return [
        sc('intro', 'introduce', 'A bead necklace', 'Beads strung in a row.', 5),
        sc('problem', 'problem', 'What comes next?', 'Can you predict the next bead — and the 20th?', 6),
        sc('unit', 'explore', 'Find the unit', `The beads repeat every ${c.unit}: ${Array.from({length: c.unit}, (_, i) => GLYPHS[i]).join(' ')}.`, 8),
        sc('group', 'manipulate', 'Circle the units', 'Group the necklace into repeating units.', 8),
        sc('discover', 'discover', 'Position → remainder', `The 20th bead is the same as bead ${20 % c.unit || c.unit}: ${patternAt(c.unit, 19)}.`, 7),
        sc('explain', 'explain', 'Repeating patterns', `Divide the position by ${c.unit}; the remainder tells the place in the unit (remainder 0 = last).`, 8),
        sc('apply', 'apply', 'Your turn', 'Continue patterns.', 5)];
      case 'number-pattern': return [
        sc('intro', 'introduce', 'Hopping frog', `A frog starts at ${c.start}.`, 5),
        sc('problem', 'problem', 'Where next?', 'It hops the same distance each time. Where will it land next?', 5),
        sc('hop', 'explore', 'Watch the hops', `${c.start}, ${c.start + c.step}, ${c.start + 2 * c.step}, ${c.start + 3 * c.step}…`, 9),
        sc('rule', 'manipulate', 'Find the rule', `Each hop adds ${c.step}.`, 6),
        sc('discover', 'discover', `Next: ${c.start + 4 * c.step}`, `${c.start + 3 * c.step} + ${c.step} = ${c.start + 4 * c.step}.`, 6),
        sc('explain', 'explain', 'Number patterns', 'Find the change between neighbours; if it is always the same, keep adding it.', 7),
        sc('apply', 'apply', 'Your turn', 'Continue number patterns.', 5)];
      case 'growing': return [
        sc('intro', 'introduce', 'Matchstick squares', `One square uses ${c.first} matchsticks.`, 5),
        sc('problem', 'problem', 'How many for 10 squares?', 'Do we need to build them all?', 5),
        sc('build', 'explore', 'Add squares', `Each new square shares a side, so it needs only ${c.step} more.`, 10),
        sc('table', 'manipulate', 'Make a table', `1 → ${c.first}, 2 → ${c.first + c.step}, 3 → ${c.first + 2 * c.step}, 4 → ${c.first + 3 * c.step}.`, 8),
        sc('discover', 'discover', 'A rule for any n', `n squares need ${c.first} + ${c.step}(n − 1) = ${c.step}n + ${c.first - c.step} matchsticks.`, 7),
        sc('explain', 'explain', 'Growing patterns', `For 10 squares: ${c.step} × 10 + ${c.first - c.step} = ${c.step * 10 + c.first - c.step}.`, 7),
        sc('apply', 'apply', 'Your turn', 'Predict far terms.', 5)];
      default: return [
        sc('intro', 'introduce', 'The sorting machine', 'Twelve things on a conveyor belt.', 5),
        sc('problem', 'problem', 'Choose a rule', `Sort them by ${c.rule}. Where does each go?`, 5),
        sc('sort', 'explore', `Sort by ${c.rule}`, 'The machine reads the rule and drops each thing in a bin.', 10),
        sc('change', 'manipulate', 'Change the rule', `Now sort by ${c.rule === 'color' ? 'shape' : 'color'}: the same things regroup.`, 9),
        sc('discover', 'discover', 'Rules make groups', 'The objects never change; the rule decides the groups.', 6),
        sc('explain', 'explain', 'Classification', 'Use one clear rule; every object goes in exactly one group; then count each group.', 7),
        sc('apply', 'apply', 'Your turn', 'Sort and count.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'multi': return predict('How many groups do two yes/no conditions make?', [['a', '4'], ['b', '2'], ['c', '3']], 'a', 'Yes/yes, yes/no, no/yes, no/no.', 3);
      case 'pattern': return predict(`What is the 20th bead?`, Array.from({length: c.unit}, (_, i) => [String(i), GLYPHS[i]] as [string, string]), String(19 % c.unit), `20 ÷ ${c.unit} leaves ${20 % c.unit}.`, 4);
      case 'number-pattern': return predict('Where does the frog land after 4 hops?', [['a', String(c.start + 4 * c.step)], ['b', String(c.start + 4)], ['c', String(c.start * 4)]], 'a', `Add ${c.step} four times.`, 3);
      case 'growing': return predict('How many matchsticks for 10 squares?', [['a', String(c.step * 10 + c.first - c.step)], ['b', String(c.first * 10)], ['c', String(c.first + 10)]], 'a', 'Shared sides.', 3);
      default: return predict('If we change the rule, the number of objects…', [['a', 'Stays 12'], ['b', 'Changes']], 'a', 'Only the groups change.', 3);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'pattern': { const u = int(r, 2, 4), pos = int(r, 10, 40); return {prompt: `Pattern ${Array.from({length: u * 2}, (_, i) => GLYPHS[i % u]).join(' ')} … What is position ${pos}?`, kind: 'choice', options: GLYPHS.slice(0, u), answer: GLYPHS[(pos - 1) % u], hint: `Divide ${pos} by ${u}.`, explanation: `remainder ${pos % u || u} → ${GLYPHS[(pos - 1) % u]}.`}; }
      case 'number-pattern': { const s = int(r, 1, 20), d = int(r, 2, 9); return {prompt: `${s}, ${s + d}, ${s + 2 * d}, ${s + 3 * d}, ? `, kind: 'number', answer: s + 4 * d, hint: 'Find the step.', explanation: `+${d}: ${s + 4 * d}.`}; }
      case 'growing': { const n = int(r, 6, 20); return {prompt: `Matchstick squares in a row: 1 square uses 4, each new square adds 3. How many for ${n} squares?`, kind: 'number', answer: 3 * n + 1, hint: '3n + 1', explanation: `3 × ${n} + 1 = ${3 * n + 1}.`}; }
      case 'multi': { const t = pick(r, ['red', 'blue', 'yellow'] as const), s = pick(r, ['circle', 'square', 'triangle'] as const); const n = 0 + THINGSCount(t, s); return {prompt: `In the sorting box, how many things are ${t} AND ${s}s?`, kind: 'number', answer: n, hint: 'Both conditions must hold.', explanation: `${n}.`}; }
      default: { const rule = pick(r, ['color', 'shape', 'size'] as const); const k = rule === 'size' ? 2 : 3; return {prompt: `Sorting the 12 things by ${rule} makes how many groups?`, kind: 'number', answer: k, hint: `How many different ${rule}s are there?`, explanation: `${k} groups.`}; }
    }
  },
  describe: c => `Sorting and pattern lab (${c.mode}).`,
};
function THINGSCount(color: Thing['color'], shape: Thing['shape']) { return THINGS.filter(t => t.color === color && t.shape === shape).length; }

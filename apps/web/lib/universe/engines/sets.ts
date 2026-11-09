import type {EngineLogic} from '../types';
import {int, pick, str} from '../math';
import {predict, story} from './util';

export type SetsMode = 'operations' | 'conditions';
export interface SetsConfig {mode: SetsMode}
export const A = [1, 2, 3, 4, 6, 12], B = [2, 4, 6, 8, 10, 12], U = Array.from({length: 12}, (_, i) => i + 1);

export const sets: EngineLogic<SetsConfig> = {
  type: 'sets', label: 'Venn diagram laboratory',
  parse: r => ({mode: str(r.mode, 'operations')}),
  validate: () => [],
  scenes: c => c.mode === 'conditions' ? story('If … then …', ['Two statements: p “x > 2” and q “x > 1”.', 'Which implies which?: Does p guarantee q? Does q guarantee p?', 'Draw the sets: P = {x | x > 2} sits inside Q = {x | x > 1}.', 'Test a point: x = 1.5 is in Q but not in P.', 'P ⊆ Q ⇔ p ⇒ q: p is sufficient for q; q is necessary for p.', 'Conditions and quantifiers: Sufficient ⇔ subset; necessary ⇔ superset; equal sets ⇔ necessary and sufficient. ¬(∀x p) = ∃x ¬p.', 'Your turn: Classify conditions.'])
    : story('Two clubs', ['A = factors of 12, B = even numbers up to 12; universe 1–12.', 'Shared and combined?: Which numbers are in both? In at least one?', 'Place every number: Each number goes in exactly one region of the Venn diagram.', 'Shade the operations: A ∩ B (both), A ∪ B (either), complement (outside A).', `A ∩ B = {${A.filter(x => B.includes(x)).join(', ')}}: |A ∪ B| = |A| + |B| − |A ∩ B| = ${A.length} + ${B.length} − ${A.filter(x => B.includes(x)).length}.`, 'Set operations: Intersection, union, complement; an n-element set has 2ⁿ subsets.', 'Your turn: Operate on sets.']),
  prediction: c => c.mode === 'conditions' ? predict('“x > 2” is ___ for “x > 1”.', [['a', 'Sufficient but not necessary'], ['b', 'Necessary but not sufficient'], ['c', 'Both']], 'a', '{x > 2} ⊂ {x > 1}.', 3)
    : predict('How many elements are in A ∪ B?', [['a', String(new Set([...A, ...B]).size)], ['b', String(A.length + B.length)]], 'a', 'Do not count shared elements twice.', 3),
  challenge: (c, r) => {
    if (c.mode === 'conditions') { const [p, q, ans] = pick(r, [['x = 2', 'x² = 4', 'Sufficient but not necessary'], ['x² = 4', 'x = 2', 'Necessary but not sufficient'], ['x > 0', 'x ≥ 0 and x ≠ 0', 'Necessary and sufficient'], ['x > 5', 'x > 3', 'Sufficient but not necessary']] as const); return {prompt: `“${p}” is ___ for “${q}”.`, kind: 'choice', options: ['Sufficient but not necessary', 'Necessary but not sufficient', 'Necessary and sufficient'], answer: ans, hint: 'Compare the solution sets.', explanation: ans + '.'}; }
    const a = int(r, 10, 30), b = int(r, 10, 30), both = int(r, 2, Math.min(a, b) - 1); return pick(r, [0, 1]) ? {prompt: `${a} students like maths, ${b} like art, ${both} like both. How many like at least one?`, kind: 'number', answer: a + b - both, hint: 'Inclusion–exclusion.', explanation: `${a} + ${b} − ${both}.`} : (() => { const n = int(r, 2, 6); return {prompt: `How many subsets does a set with ${n} elements have?`, kind: 'number' as const, answer: 2 ** n, hint: 'Each element is in or out.', explanation: `2^${n} = ${2 ** n}.`}; })();
  },
  describe: c => c.mode === 'conditions' ? 'Nested sets showing sufficient and necessary conditions.' : 'Venn diagram of A = factors of 12 and B = even numbers up to 12.',
};

import type {EngineLogic} from '../types';
import {fix, fmt, int, pick, str} from '../math';
import {predict, story} from './util';

export type RegressionMode = 'correlation' | 'least-squares' | 'contingency';
export interface RegressionConfig {mode: RegressionMode}
/** Advertising spend (x) and sales (y). */
export const XS = [1, 2, 3, 4, 5, 6, 7, 8], YS = [3.1, 4.8, 5.2, 7.4, 7.9, 9.6, 10.3, 12.1];
export function fit(xs: number[], ys: number[]) {
  const n = xs.length, mx = xs.reduce((s, x) => s + x, 0) / n, my = ys.reduce((s, y) => s + y, 0) / n;
  let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  const b = sxy / sxx; return {b, a: my - b * mx, r: sxy / Math.sqrt(sxx * syy), mx, my};
}
/** 2×2 table: rows exercise yes/no, cols sleep well yes/no. */
export const TABLE: [[number, number], [number, number]] = [[40, 10], [30, 20]];
export function chi2([[a, b], [c, d]]: [[number, number], [number, number]]) { const n = a + b + c + d; return (n * (a * d - b * c) ** 2) / ((a + b) * (c + d) * (a + c) * (b + d)); }

export const regression: EngineLogic<RegressionConfig> = {
  type: 'regression', label: 'Statistics of relationships laboratory',
  parse: r => ({mode: str(r.mode, 'least-squares')}),
  validate: () => [],
  scenes: c => {
    const f = fit(XS, YS);
    if (c.mode === 'correlation') return story('Do they move together?', ['Eight shops: advertising spend and sales.', 'Related or not?: A scatter plot shows a pattern — how strong is it?', 'Plot the points: They rise from lower left to upper right: positive correlation.', 'Quadrants about the mean: Points in the ++ and −− quadrants push r up; +− and −+ pull it down.', `r = ${fmt(f.r, 3)}: Close to 1 — a strong positive linear relationship.`, 'Correlation coefficient: −1 ≤ r ≤ 1; |r| near 1 means strong linear correlation; r = 0 means no linear relation.', 'Your turn: Judge correlations.']);
    if (c.mode === 'contingency') { const k = chi2(TABLE); return story('Exercise and sleep', ['100 students: do they exercise, do they sleep well?', 'Is there an association?: 80% of exercisers sleep well vs 60% of others. Chance or real?', 'The 2×2 table: Put the counts in a contingency table with row and column totals.', 'Expected counts: If independent, each cell ≈ row total × column total ÷ n.', `χ² = ${fmt(k, 3)}: Compare with 3.841 (α = 0.05): ${k > 3.841 ? 'larger, so we reject independence' : 'smaller, so no evidence'}.`, 'Independence test: χ² = n(ad − bc)² / [(a+b)(c+d)(a+c)(b+d)]; big χ² ⇒ association.', 'Your turn: Run a χ² test.']); }
    return story('The best line', ['Eight shops: spend x, sales y.', 'Which line fits best?: Many lines pass near the points. Which is best?', 'Residuals: Each vertical gap between a point and the line is a residual.', 'Squares: Draw a square on each residual; move the line to make the total area smallest.', `ŷ = ${fmt(f.b, 3)}x + ${fmt(f.a, 3)}: The least-squares line passes through (x̄, ȳ) = (${fmt(f.mx)}, ${fmt(f.my, 3)}).`, 'Linear regression: b̂ = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)², â = ȳ − b̂x̄.', 'Your turn: Predict with a regression line.']);
  },
  prediction: c => c.mode === 'correlation' ? predict('Height and shoe size of adults: r is likely…', [['a', 'Positive, fairly strong'], ['b', 'Close to −1'], ['c', 'Exactly 1']], 'a', 'Taller people tend to have bigger feet, with scatter.', 2)
    : c.mode === 'contingency' ? predict('Does 80% vs 60% prove exercise helps sleep?', [['a', 'Need a χ² test first'], ['b', 'Yes, obviously'], ['c', 'No relation is possible']], 'a', 'Differences can be due to chance.', 4)
      : predict('The least-squares line always passes through…', [['a', '(x̄, ȳ)'], ['b', 'The origin'], ['c', 'The first point']], 'a', 'â = ȳ − b̂x̄.', 4),
  challenge: (c, r) => {
    if (c.mode === 'correlation') { const [d, ans] = pick(r, [['Price of a product and quantity sold', 'Negative'], ['Hours studied and test score', 'Positive'], ['Shoe size and favourite colour', 'None']] as const); return {prompt: `${d}: correlation?`, kind: 'choice', options: ['Positive', 'Negative', 'None'], answer: ans, hint: 'As one rises, what does the other do?', explanation: ans + '.'}; }
    if (c.mode === 'contingency') { const k = fix(int(r, 10, 90) / 10); return {prompt: `χ² = ${k}. At α = 0.05 (critical 3.841), is there evidence of association?`, kind: 'choice', options: ['Yes', 'No'], answer: k > 3.841 ? 'Yes' : 'No', hint: 'Compare with 3.841.', explanation: `${k} ${k > 3.841 ? '>' : '≤'} 3.841.`}; }
    const b = int(r, 2, 5) / 2 + .5, a = int(r, 1, 9), x = int(r, 3, 12); return {prompt: `ŷ = ${b}x + ${a}. Predict y when x = ${x}.`, kind: 'number', answer: fix(b * x + a), tolerance: .01, hint: 'Substitute.', explanation: `${b} × ${x} + ${a} = ${fix(b * x + a)}.`};
  },
  describe: c => `Scatter plot of advertising and sales (${c.mode}).`,
};

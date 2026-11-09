import type {EngineLogic} from '../types';
import {fix, fmt, int, pick, shuffle, str} from '../math';
import {predict, story} from './util';

export type AnalysisMode = 'sampling' | 'histogram' | 'center' | 'variance' | 'stratified' | 'boxplot';
export interface AnalysisConfig {mode: AnalysisMode}
/** Twenty test scores used by every data scene (sorted). */
export const DATA = [62, 68, 71, 73, 75, 76, 78, 79, 80, 81, 82, 83, 84, 85, 86, 88, 90, 92, 95, 98];
export const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
export const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
export const variance = (xs: number[]) => { const m = mean(xs); return mean(xs.map(x => (x - m) ** 2)); };
/** PEP percentile: i = n·p%; integer → mean of i-th and (i+1)-th, else the ⌈i⌉-th. */
export function percentile(xs: number[], p: number) { const s = [...xs].sort((a, b) => a - b), i = (s.length * p) / 100; return Number.isInteger(i) ? (s[i - 1] + s[i]) / 2 : s[Math.ceil(i) - 1]; }
export const BINS = [60, 70, 80, 90, 100];
export const binCounts = (xs: number[]) => BINS.slice(0, -1).map((lo, i) => xs.filter(x => x >= lo && x < BINS[i + 1]).length);

export const analysis: EngineLogic<AnalysisConfig> = {
  type: 'analysis', label: 'Data analysis laboratory',
  parse: r => ({mode: str(r.mode, 'center')}),
  validate: () => [],
  scenes: c => {
    const m = mean(DATA), md = median(DATA), v = variance(DATA);
    switch (c.mode) {
      case 'sampling': return story('A school of 1000', ['We want the average height of 1000 students without measuring everyone.', 'Who do we measure?: Measuring only the basketball team would be unfair. How do we choose?', 'Draw lots: Every student gets a number; a random draw picks 20. Each student has the same chance, 20/1000.', 'Repeat: Different random samples give slightly different means, all near the truth.', 'Random ⇒ representative: Equal chance for everyone removes bias; bigger samples vary less.', 'Simple random sampling: Lottery or random-number method; the sample estimates the population.', 'Your turn: Spot fair and biased samples.']);
      case 'stratified': return story('Three grades', ['A school has 500 Grade 10, 300 Grade 11 and 200 Grade 12 students.', 'Fair across grades?: A sample of 50 should reflect every grade. How many from each?', 'Split into strata: Draw in proportion: 50 × 500/1000 = 25, then 15 and 10.', 'Check: 25 + 15 + 10 = 50, every student still has chance 50/1000.', 'Proportional allocation: Each stratum gets sample size × stratum share.', 'Stratified sampling: Use it when the population has clearly different layers; estimate the mean by weighting the strata.', 'Your turn: Allocate a stratified sample.']);
      case 'histogram': return story('Grouping scores', ['Twenty test scores, 62 to 98.', 'What shape?: A list of numbers hides the pattern. How can we see the distribution?', `Group by tens: Count scores in 60–70, 70–80, 80–90, 90–100: ${binCounts(DATA).join(', ')}.`, 'Bars of frequency/width: The area of each bar is the frequency rate; total area is 1.', 'The shape appears: Most scores sit in 80–90; the distribution is a little left-skewed.', 'Frequency distribution histogram: Height = frequency ÷ class width; areas add to 1.', 'Your turn: Read a histogram.']);
      case 'variance': return story('Two archers', [`Twenty scores with mean ${fmt(m, 2)}.`, 'How spread out?: Two classes can share a mean but differ in consistency. How do we measure spread?', 'Deviations: Draw each score’s distance from the mean.', 'Square and average: Squaring removes signs; the mean of the squares is the variance.', `s² = ${fmt(v, 2)}, s = ${fmt(Math.sqrt(v), 2)}: The standard deviation is in the same units as the data.`, 'Variance and standard deviation: s² = (1/n)Σ(xᵢ − x̄)²; smaller s means more consistent data.', 'Your turn: Compute a variance.']);
      case 'boxplot': return story('Where is the top 25%?', ['Twenty scores in order.', 'Which score beats 75% of the class?: The median splits the data in half. What splits it at 25% or 75%?', `Count positions: For p%, compute i = n × p%. n = 20, p = 25: i = 5, so average the 5th and 6th scores.`, `Quartiles: Q1 = ${fmt(percentile(DATA, 25))}, median = ${fmt(md)}, Q3 = ${fmt(percentile(DATA, 75))}.`, 'Box plot: The box spans Q1 to Q3; whiskers reach the minimum and maximum.', 'Percentiles: If i is an integer, average the i-th and (i+1)-th values; otherwise take the next integer position.', 'Your turn: Find a percentile.']);
      default: return story('Middle of the data', ['Twenty test scores.', 'One number for the class?: Mean, median or mode — what does each tell us?', `Balance point: The mean ${fmt(m, 2)} is where the dot plot balances.`, `Middle position: The median is ${fmt(md)}: half the scores are below, half above.`, 'Outliers pull the mean: Change 98 to 198: the mean jumps, the median barely moves.', 'Measures of centre: Mean uses every value; the median resists extreme values; the mode is the most frequent.', 'Your turn: Compute centres.']);
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'sampling': return predict('Which sample best estimates the school’s average height?', [['a', '20 students drawn by lottery'], ['b', 'The basketball team'], ['c', 'The first 20 at the gate']], 'a', 'Only the lottery gives everyone the same chance.', 2);
      case 'stratified': return predict('Sample 50 from 500/300/200 students. How many from the 500?', [['a', '25'], ['b', '17'], ['c', '50']], 'a', '50 × 500/1000.', 2);
      case 'histogram': return predict('Which class interval has the most scores?', [['a', '80–90'], ['b', '70–80'], ['c', '90–100']], 'a', 'The tallest bar.', 3);
      case 'variance': return predict('Class A: 70, 80, 90. Class B: 79, 80, 81. Which has the larger variance?', [['a', 'A'], ['b', 'B'], ['c', 'Equal (same mean)']], 'a', 'Same mean, wider spread.', 3);
      case 'boxplot': return predict('For n = 20, the 25th percentile is…', [['a', 'Mean of the 5th and 6th values'], ['b', 'The 5th value'], ['c', 'The 6th value']], 'a', 'i = 5 is an integer.', 3);
      default: return predict('If the top score 98 becomes 198, what changes most?', [['a', 'The mean'], ['b', 'The median'], ['c', 'Neither']], 'a', 'The mean uses every value.', 4);
    }
  },
  challenge: (c, r) => {
    const xs = shuffle(r, [int(r, 1, 9), int(r, 1, 9), int(r, 1, 9), int(r, 1, 9), int(r, 1, 9)]);
    switch (c.mode) {
      case 'sampling': { const N = pick(r, [500, 800, 1000, 1200]), n = pick(r, [20, 40, 50]); return {prompt: `Simple random sample of ${n} from ${N}. Each individual’s chance of being chosen (as a fraction or decimal)?`, kind: 'number', answer: fix(n / N), hint: 'n/N.', explanation: `${n}/${N} = ${fix(n / N)}.`}; }
      case 'stratified': { const a = int(r, 2, 6) * 100, b = int(r, 1, 4) * 100, n = pick(r, [20, 40]); const tot = a + b + 100; const ans = fix((n * a) / tot); return {prompt: `Strata of ${a}, ${b} and 100 people; sample ${n} in proportion. How many from the ${a}?`, kind: 'number', answer: ans, tolerance: .01, hint: 'Sample × share.', explanation: `${n} × ${a}/${tot} = ${fmt(ans, 2)}.`}; }
      case 'histogram': { const rate = pick(r, [.01, .02, .03, .04]), w = 10, n = pick(r, [100, 200, 500]); return {prompt: `A histogram bar (class width ${w}) has height ${rate}. Sample size ${n}. Frequency in that class?`, kind: 'number', answer: fix(rate * w * n), hint: 'height × width × n.', explanation: `${rate} × ${w} × ${n} = ${fix(rate * w * n)}.`}; }
      case 'variance': { const m = int(r, 3, 8), d = int(r, 1, 3); const ys = [m - d, m, m + d]; return {prompt: `Variance of ${ys.join(', ')}?`, kind: 'number', answer: fix((2 * d * d) / 3), tolerance: .01, hint: 'Mean of squared deviations.', explanation: `(${d}² + 0 + ${d}²)/3 = ${fmt((2 * d * d) / 3, 3)}.`}; }
      case 'boxplot': { const ys = [...new Set(Array.from({length: 10}, () => int(r, 1, 50)))].sort((a, b) => a - b); while (ys.length < 10) ys.push(ys[ys.length - 1] + 1); const p = pick(r, [30, 40, 70, 80]); return {prompt: `Data (sorted): ${ys.join(', ')}. ${p}th percentile?`, kind: 'number', answer: percentile(ys, p), hint: `i = 10 × ${p}% = ${p / 10}.`, explanation: `Average the ${p / 10}th and ${p / 10 + 1}th values: ${fmt(percentile(ys, p))}.`}; }
      default: return pick(r, [0, 1]) ? {prompt: `Mean of ${xs.join(', ')}?`, kind: 'number', answer: fix(mean(xs)), tolerance: .01, hint: 'Sum ÷ 5.', explanation: `${xs.reduce((s, x) => s + x, 0)}/5.`} : {prompt: `Median of ${xs.join(', ')}?`, kind: 'number', answer: median(xs), hint: 'Sort, take the middle.', explanation: [...xs].sort((a, b) => a - b).join(', ') + '.'};
    }
  },
  describe: c => `Dot plot and charts of twenty test scores (${c.mode}).`,
};

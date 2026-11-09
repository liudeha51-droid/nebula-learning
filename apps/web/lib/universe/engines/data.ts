import type {EngineLogic} from '../types';
import {fix, fmt, int, nums, num, pick, rng, str} from '../math';
import {sc, predict} from './util';

export type DataMode = 'collect' | 'bar' | 'line' | 'pie' | 'mean' | 'compare';
export interface DataConfig {mode: DataMode; topic: string; values: number[]; values2: number[]; labels: string[]; scale: number}
export const mean = (v: number[]) => (v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0);
export const TOPICS: Record<string, string[]> = {animals: ['Chicks', 'Rabbits', 'Fish', 'Birds'], transport: ['Walk', 'Bus', 'Bike', 'Car']};
/** Deterministic stream of observations for a collection scene. */
export function observations(topic: string, n = 24) { const r = rng(topic.length * 97 + n); const weights = topic === 'transport' ? [.35, .3, .15, .2] : [.3, .25, .2, .25]; return Array.from({length: n}, () => { let x = r(), k = 0; while (k < 3 && x > weights[k]) { x -= weights[k]; k++; } return k; }); }
export const tally = (obs: number[], cats = 4) => Array.from({length: cats}, (_, k) => obs.filter(o => o === k).length);

const labelsOf = (c: DataConfig) => (c.labels.length ? c.labels : TOPICS[c.topic] ?? c.values.map((_, i) => `#${i + 1}`));

export const data: EngineLogic<DataConfig> = {
  type: 'data', label: 'Statistics visualiser',
  parse: r => ({mode: str(r.mode, 'bar'), topic: str(r.topic, 'animals'), values: nums(r.values, [6, 9, 4, 7]), values2: nums(r.values2, []), labels: Array.isArray(r.labels) ? (r.labels as string[]) : [], scale: num(r.scale, 1)}),
  validate: c => (c.values.some(v => v < 0) ? ['values must be non-negative'] : []),
  scenes: c => {
    const L = labelsOf(c); const v = c.mode === 'collect' ? tally(observations(c.topic)) : c.values; const max = Math.max(...v), iMax = v.indexOf(max);
    switch (c.mode) {
      case 'collect': return [
        sc('intro', 'introduce', c.topic === 'transport' ? 'The school gate' : 'The pond', c.topic === 'transport' ? 'Children arrive at school in different ways.' : 'Animals visit the pond one at a time.', 5),
        sc('problem', 'problem', 'Which is most common?', 'Can we answer without remembering every one?', 5),
        sc('tally', 'explore', 'Tally as they come', 'Make one mark per observation; every fifth mark crosses the group.', 12),
        sc('table', 'manipulate', 'Organise a table', `Counts: ${L.map((l, i) => `${l} ${v[i]}`).join(', ')}.`, 7),
        sc('discover', 'discover', `${L[iMax]} is most common`, `${L[iMax]}: ${max}, out of ${v.reduce((s, x) => s + x, 0)} observations.`, 6),
        sc('explain', 'explain', 'From data to chart', 'Collect → organise (tally, table) → display (chart) → answer questions with evidence.', 8),
        sc('apply', 'apply', 'Your turn', 'Answer questions from data.', 5)];
      case 'line': return [
        sc('intro', 'introduce', 'Measured over time', `Values recorded: ${v.join(', ')}.`, 5),
        sc('problem', 'problem', 'Rising or falling?', 'How did the values change over time?', 5),
        sc('plot', 'explore', 'Plot the points', 'Each value becomes a point above its time.', 9),
        sc('join', 'manipulate', 'Join them in order', 'Connect the points from left to right.', 7),
        sc('discover', 'discover', 'Trends', 'Steep upward segments show fast growth; downward segments show decreases.', 7),
        sc('explain', 'explain', 'Line charts', 'Line charts show change over time; bar charts compare separate categories.', 7),
        sc('apply', 'apply', 'Your turn', 'Read trends.', 5)];
      case 'pie': { const tot = v.reduce((s, x) => s + x, 0); return [
        sc('intro', 'introduce', 'Parts of a whole', `How a class spends free time (%): ${L.map((l, i) => `${l} ${v[i]}`).join(', ')}.`, 5),
        sc('problem', 'problem', 'Show the whole', 'Which chart shows each part as a share of the whole?', 5),
        sc('bar', 'explore', 'As a bar chart', 'Bars compare categories but hide the whole.', 7),
        sc('pie', 'manipulate', 'As a pie chart', `Each ${tot === 100 ? '1%' : 'part'} is ${fmt(360 / tot)}° of the circle.`, 8),
        sc('discover', 'discover', 'Percent = angle', `${L[0]}: ${v[0]}% → ${fmt(v[0] * 3.6)}°.`, 7),
        sc('explain', 'explain', 'Choosing a chart', 'Pie: parts of one whole. Bar: compare amounts. Line: change over time.', 7),
        sc('apply', 'apply', 'Your turn', 'Read pie charts.', 5)]; }
      case 'mean': { const m = mean(v); return [
        sc('intro', 'introduce', 'Uneven towers', `Towers of ${v.join(', ')} blocks.`, 5),
        sc('problem', 'problem', 'Make them fair', 'If we share the blocks so every tower is equal, how tall is each?', 6),
        sc('move', 'explore', 'Move blocks from tall to short', 'Blocks move without being added or removed.', 10),
        sc('level', 'manipulate', 'All level', `Every tower is now ${fmt(m)}.`, 6),
        sc('discover', 'discover', `Mean = ${fmt(m)}`, `Total ${v.reduce((s, x) => s + x, 0)} ÷ ${v.length} towers = ${fmt(m)}.`, 6),
        sc('explain', 'explain', 'Arithmetic mean', 'Mean = total ÷ number of values. It summarises the group; it need not be one of the values.', 8),
        sc('apply', 'apply', 'Your turn', 'Calculate means.', 5)]; }
      case 'compare': { const m1 = mean(v), m2 = mean(c.values2); return [
        sc('intro', 'introduce', 'Two groups', `Group A: ${v.join(', ')}. Group B: ${c.values2.join(', ')}.`, 6),
        sc('problem', 'problem', 'Which group did better?', 'The groups have different sizes and spreads. How can we compare fairly?', 6),
        sc('dots', 'explore', 'Dot plots', 'Plot every value as a dot.', 8),
        sc('means', 'manipulate', 'Add the means', `Mean A = ${fmt(m1, 2)}, mean B = ${fmt(m2, 2)}.`, 7),
        sc('discover', 'discover', 'Centre and spread', `Means compare centres; B is ${Math.max(...c.values2) - Math.min(...c.values2) > Math.max(...v) - Math.min(...v) ? 'more' : 'less'} spread out than A.`, 7),
        sc('explain', 'explain', 'Interpreting data', 'Use means to compare groups of different sizes, and also look at spread before drawing conclusions.', 8),
        sc('apply', 'apply', 'Your turn', 'Compare datasets.', 5)]; }
      default: return [
        sc('intro', 'introduce', 'A table', `${L.map((l, i) => `${l} ${v[i]}`).join(', ')}.`, 5),
        sc('problem', 'problem', 'See it at a glance', 'Which is biggest, and by how much?', 5),
        sc('grow', 'explore', 'Bars grow', `Each bar rises to its value on a scale of ${c.scale} per grid line.`, 8),
        sc('compare', 'manipulate', 'Compare bars', `${L[iMax]} is tallest at ${max}.`, 7),
        sc('discover', 'discover', 'Differences', `${L[iMax]} − ${L[v.indexOf(Math.min(...v))]} = ${max - Math.min(...v)}.`, 6),
        sc('explain', 'explain', 'Bar charts', 'Same width bars, a scale starting at 0, equal grid steps: then height = amount.', 7),
        sc('apply', 'apply', 'Your turn', 'Read bar charts.', 5)];
    }
  },
  prediction: c => {
    const v = c.mode === 'collect' ? tally(observations(c.topic)) : c.values; const L = labelsOf(c);
    switch (c.mode) {
      case 'mean': return predict('Will the level height be one of the original heights?', [['a', 'Not necessarily'], ['b', 'Always']], 'a', `Here it is ${fmt(mean(v))}.`, 2);
      case 'line': return predict('Overall, the values…', [['a', 'Rise'], ['b', 'Fall']], v[v.length - 1] >= v[0] ? 'a' : 'b', 'Compare the first and last points.', 2);
      case 'pie': return predict(`${v[0]}% of a circle is how many degrees?`, [['a', `${fmt(v[0] * 3.6)}°`], ['b', `${v[0]}°`]], 'a', '1% = 3.6°.', 3);
      case 'compare': return predict('Which group has the higher mean?', [['a', 'A'], ['b', 'B'], ['c', 'Equal']], mean(c.values) > mean(c.values2) ? 'a' : mean(c.values) < mean(c.values2) ? 'b' : 'c', 'Total ÷ count for each.', 3);
      default: return predict('Which category is largest?', L.slice(0, 4).map((l, i) => [String(i), l] as [string, string]), String(v.indexOf(Math.max(...v))), `${L[v.indexOf(Math.max(...v))]}.`, c.mode === 'collect' ? 3 : 2);
    }
  },
  challenge: (c, r) => {
    const v = Array.from({length: 4}, () => int(r, 2, 20));
    switch (c.mode) {
      case 'mean': case 'compare': { const n = int(r, 3, 5); const m = int(r, 4, 15); const vals = Array.from({length: n - 1}, () => int(r, m - 4, m + 4)); vals.push(m * n - vals.reduce((s, x) => s + x, 0)); if (vals[n - 1] < 0) vals[n - 1] = 0; const mm = fix(mean(vals)); return {prompt: `Mean of ${vals.join(', ')}?`, kind: 'number', answer: mm, tolerance: 1e-6, hint: 'Total ÷ count.', explanation: `${vals.reduce((s, x) => s + x, 0)} ÷ ${n} = ${fmt(mm)}.`}; }
      case 'pie': { const deg = pick(r, [36, 72, 90, 108, 180, 54]); return {prompt: `A ${deg}° slice is what percentage of a pie chart?`, kind: 'number', answer: deg / 3.6, tolerance: 1e-6, unit: '%', hint: '÷ 360 × 100', explanation: `${fmt(deg / 3.6)}%.`}; }
      case 'line': return {prompt: `Temperatures: ${v.join(', ')}. Largest rise between neighbouring days?`, kind: 'number', answer: Math.max(0, ...v.slice(1).map((x, i) => x - v[i])), hint: 'Subtract each day from the next.', explanation: `${Math.max(0, ...v.slice(1).map((x, i) => x - v[i]))}.`};
      default: return {prompt: `Counts: A ${v[0]}, B ${v[1]}, C ${v[2]}, D ${v[3]}. How many more in the biggest than the smallest?`, kind: 'number', answer: Math.max(...v) - Math.min(...v), hint: 'Biggest − smallest.', explanation: `${Math.max(...v)} − ${Math.min(...v)} = ${Math.max(...v) - Math.min(...v)}.`};
    }
  },
  describe: c => `Statistics (${c.mode}): ${c.mode === 'collect' ? 'observations become tallies, a table and a bar chart' : `data ${c.values.join(', ')} shown as ${c.mode === 'pie' ? 'a pie chart' : c.mode === 'line' ? 'a line chart' : 'bars'}`}.`,
};

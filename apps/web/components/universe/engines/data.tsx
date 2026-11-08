'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Stepper, Segmented, Obj, Action} from '../stage';
import {data, mean, observations, tally, TOPICS, type DataConfig} from '@/lib/universe/engines/data';
import {eseg, fmt, lerp, seg} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const COLS = [C.ones, C.tens, C.hundreds, C.thousands, C.accent, C.unknown, '#c8e07a'];
const niceMax = (m: number, step: number) => Math.max(step * 4, Math.ceil(m / step) * step);
function Axes({x, y, w, h, max, step}: {x: number; y: number; w: number; h: number; max: number; step: number}) {
  return <g>{range(Math.floor(max / step) + 1).map(i => <g key={i}><line x1={x} x2={x + w} y1={y - (i * step / max) * h} y2={y - (i * step / max) * h} stroke="#fff" strokeOpacity={i ? .08 : .4}/><T x={x - 10} y={y - (i * step / max) * h} size={12} anchor="end" color={C.muted}>{i * step}</T></g>)}</g>;
}
export function BarChart({values, labels, grow = 1, step = 1, x = 120, y = 360, w = 600, h = 260, highlight = -1}: {values: number[]; labels: string[]; grow?: number; step?: number; x?: number; y?: number; w?: number; h?: number; highlight?: number}) {
  const max = niceMax(Math.max(...values, 1), step * Math.max(1, Math.ceil(Math.max(...values) / step / 8))); const bw = w / values.length;
  return <g><Axes x={x} y={y} w={w} h={h} max={max} step={step * Math.max(1, Math.ceil(max / step / 8))}/>{values.map((v, i) => { const bh = (v / max) * h * eseg(grow, i * .1, i * .1 + .6); return <g key={i}><rect x={x + i * bw + bw * .2} y={y - bh} width={bw * .6} height={bh} rx={4} fill={COLS[i % 7]} opacity={highlight < 0 || highlight === i ? .9 : .35}/>
    <T x={x + i * bw + bw / 2} y={y + 18} size={13} color={C.muted}>{labels[i]}</T>{grow >= 1 && <T x={x + i * bw + bw / 2} y={y - bh - 12} size={14}>{v}</T>}</g>; })}</g>;
}
export function LineChart({values, labels, show = 1, join = 1, x = 120, y = 360, w = 600, h = 260}: {values: number[]; labels: string[]; show?: number; join?: number; x?: number; y?: number; w?: number; h?: number}) {
  const max = niceMax(Math.max(...values), 5); const px = (i: number) => x + (i + .5) * (w / values.length), py = (v: number) => y - (v / max) * h; const n = Math.ceil(show * values.length);
  return <g><Axes x={x} y={y} w={w} h={h} max={max} step={5}/>{join > 0 && <polyline points={values.slice(0, Math.max(1, Math.ceil(join * values.length))).map((v, i) => `${px(i)},${py(v)}`).join(' ')} fill="none" stroke={C.tens} strokeWidth={3}/>}
    {values.slice(0, n).map((v, i) => <g key={i}><circle cx={px(i)} cy={py(v)} r={6} fill={C.ones}/><T x={px(i)} y={py(v) - 16} size={13}>{v}</T></g>)}{labels.map((l, i) => <T key={i} x={px(i)} y={y + 18} size={13} color={C.muted}>{l}</T>)}</g>;
}
export function PieChart({values, labels, cx = W / 2, cy = 230, r = 140, t = 1}: {values: number[]; labels: string[]; cx?: number; cy?: number; r?: number; t?: number}) {
  const tot = values.reduce((s, v) => s + v, 0) || 1; const starts = values.map((_, i) => values.slice(0, i).reduce((s, v) => s + v, 0));
  return <g><circle cx={cx} cy={cy} r={r} fill="none" stroke={C.line} strokeWidth={2}/>{values.map((v, i) => { const a0 = (starts[i] / tot) * 360 * t, a1 = ((starts[i] + v) / tot) * 360 * t; const P = (a: number) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)]; const [x0, y0] = P(a0), [x1, y1] = P(a1); const mid = (a0 + a1) / 2; const [lx, ly] = [cx + (r + 34) * Math.sin(mid * Math.PI / 180), cy - (r + 34) * Math.cos(mid * Math.PI / 180)];
    return <g key={i}><path d={`M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1} Z`} fill={COLS[i % 7]} opacity={.85} stroke="#15141d" strokeWidth={2}/>{t >= 1 && <T x={lx} y={ly} size={13}>{labels[i]} {fmt(v / tot * 100, 1)}%</T>}</g>; })}</g>;
}
const tallyMarks = (n: number, x: number, y: number) => <g>{range(n).map(i => { const g = Math.floor(i / 5), k = i % 5; return k < 4 ? <line key={i} x1={x + g * 34 + k * 6} x2={x + g * 34 + k * 6} y1={y - 12} y2={y + 12} stroke={C.ink} strokeWidth={2}/> : <line key={i} x1={x + g * 34 - 4} x2={x + g * 34 + 24} y1={y + 10} y2={y - 10} stroke={C.ink} strokeWidth={2}/>; })}</g>;

function Scene({c, scene, p}: {c: DataConfig; scene: number; p: number}) {
  const labels = c.labels.length ? c.labels : TOPICS[c.topic] ?? c.values.map((_, i) => `#${i + 1}`);
  switch (c.mode) {
    case 'collect': { const obs = observations(c.topic); const seen = scene < 2 ? 0 : scene === 2 ? Math.floor(p * obs.length) : obs.length; const counts = tally(obs.slice(0, seen)); const kinds = ['chick', 'rabbit', 'fish', 'star'] as const;
      if (scene >= 3) return <g><BarChart values={counts} labels={labels} grow={scene === 3 ? p : 1} step={1} x={360} w={400} highlight={scene >= 4 ? counts.indexOf(Math.max(...counts)) : -1}/>{labels.map((l, i) => <g key={i}><T x={60} y={120 + i * 50} size={15} anchor="start">{l}</T>{tallyMarks(counts[i], 160, 120 + i * 50)}<T x={320} y={120 + i * 50} size={16} color={COLS[i]}>{counts[i]}</T></g>)}</g>;
      const cur = obs[seen - 1]; return <g>{seen > 0 && <Obj kind={c.topic === 'transport' ? 'ball' : kinds[cur]} x={lerp(760, 560, seg(p * obs.length % 1, 0, .6))} y={160} r={36} color={COLS[cur]}/>}{seen > 0 && <T x={560} y={225} size={18}>{labels[cur]}</T>}
        {labels.map((l, i) => <g key={i}><T x={60} y={120 + i * 60} size={16} anchor="start" color={COLS[i]}>{l}</T>{tallyMarks(counts[i], 170, 120 + i * 60)}</g>)}<T x={W / 2} y={420} size={16} color={C.muted}>{seen} of {obs.length} observed</T></g>; }
    case 'line': return <LineChart values={c.values} labels={labels} show={scene < 2 ? 0 : scene === 2 ? p : 1} join={scene < 3 ? 0 : scene === 3 ? p : 1}/>;
    case 'pie': return scene <= 2 ? <BarChart values={c.values} labels={labels} grow={scene === 2 ? p : 1} step={5}/> : <PieChart values={c.values} labels={labels} t={scene === 3 ? eseg(p, 0, .8) : 1}/>;
    case 'mean': { const m = mean(c.values); const t = scene < 2 ? 0 : scene === 2 ? eseg(p, .05, .95) : 1; const vals = c.values.map(v => lerp(v, m, t)); const max = niceMax(Math.max(...c.values), 2); const bw = 600 / vals.length;
      return <g><Axes x={120} y={360} w={600} h={260} max={max} step={2}/>{vals.map((v, i) => <g key={i}>{range(Math.ceil(v)).map(k => <rect key={k} x={120 + i * bw + bw * .25} y={360 - ((k + 1) / max) * 260 + 1} width={bw * .5} height={(Math.min(1, v - k) / max) * 260 - 2} fill={COLS[i % 7]} opacity={.85}/>)}<T x={120 + i * bw + bw / 2} y={380} size={13} color={C.muted}>{c.values[i]}</T></g>)}
        {scene >= 3 && <><line x1={110} x2={730} y1={360 - (m / max) * 260} y2={360 - (m / max) * 260} stroke={C.unknown} strokeWidth={2} strokeDasharray="6 4"/><T x={740} y={360 - (m / max) * 260} size={16} color={C.unknown} anchor="start">mean {fmt(m, 2)}</T></>}</g>; }
    case 'compare': { const all = [...c.values, ...c.values2]; const lo = Math.min(...all) - 2, hi = Math.max(...all) + 2; const X = (v: number) => 100 + ((v - lo) / (hi - lo)) * 600;
      const row = (vals: number[], y: number, col: string, name: string) => <g><line x1={90} x2={710} y1={y} y2={y} stroke={C.muted}/><T x={70} y={y} size={18} color={col}>{name}</T>{vals.map((v, i) => { const dup = vals.slice(0, i).filter(x => x === v).length; return scene >= 2 ? <circle key={i} cx={X(v)} cy={y - 14 - dup * 18} r={8} fill={col}/> : null; })}
        {scene >= 3 && <><line x1={X(mean(vals))} x2={X(mean(vals))} y1={y - 80} y2={y + 10} stroke={col} strokeWidth={3}/><T x={X(mean(vals))} y={y + 26} size={14} color={col}>mean {fmt(mean(vals), 2)}</T></>}</g>;
      return <g>{row(c.values, 180, C.ones, 'A')}{row(c.values2, 340, C.tens, 'B')}{range(Math.floor(hi) - Math.ceil(lo) + 1).filter(k => (Math.ceil(lo) + k) % 5 === 0).map(k => <T key={k} x={X(Math.ceil(lo) + k)} y={400} size={12} color={C.muted}>{Math.ceil(lo) + k}</T>)}</g>; }
    default: return <g><BarChart values={c.values} labels={labels} step={c.scale} grow={scene < 2 ? 0 : scene === 2 ? p : 1} highlight={scene >= 3 ? c.values.indexOf(Math.max(...c.values)) : -1}/>{scene <= 1 && labels.map((l, i) => <T key={i} x={W / 2} y={100 + i * 40} size={20}>{l}: {c.values[i]}</T>)}</g>;
  }
}

function Explore({c}: {c: DataConfig}) {
  const labels = c.labels.length ? c.labels : TOPICS[c.topic] ?? c.values.map((_, i) => `#${i + 1}`);
  const [vals, setVals] = useState(c.mode === 'collect' ? tally(observations(c.topic)) : c.values); const [kind, setKind] = useState<'bar' | 'line' | 'pie'>(c.mode === 'line' ? 'line' : c.mode === 'pie' ? 'pie' : 'bar'); const [lev, setLev] = useState(false);
  const set = (i: number, v: number) => setVals(vals.map((x, k) => (k === i ? v : x)));
  if (c.mode === 'compare') return <Stage label="Compare datasets" controls={<Readout>mean A {fmt(mean(c.values), 2)} · mean B {fmt(mean(c.values2), 2)} · range A {Math.max(...c.values) - Math.min(...c.values)} · range B {Math.max(...c.values2) - Math.min(...c.values2)}</Readout>}><Scene c={c} scene={4} p={1}/></Stage>;
  const m = mean(vals);
  return <Stage label={`${kind} chart of ${vals.join(', ')}`} controls={<>{vals.map((v, i) => <Stepper key={i} label={labels[i] ?? `#${i + 1}`} value={v} min={0} max={c.mode === 'pie' ? 100 : 60} onChange={x => set(i, x)}/>)}
    {c.mode === 'mean' ? <Action onClick={() => setLev(!lev)}>{lev ? 'Unlevel' : 'Level the towers'}</Action> : <Segmented label="Chart" value={kind} onChange={setKind} options={[['bar', 'Bar'], ['line', 'Line'], ['pie', 'Pie']]}/>}
    <Readout>total {vals.reduce((s, x) => s + x, 0)} · mean {fmt(m, 2)} · max {Math.max(...vals)} · min {Math.min(...vals)}</Readout></>}>
    {c.mode === 'mean' ? <Scene c={{...c, values: vals}} scene={lev ? 3 : 1} p={1}/> : kind === 'line' ? <LineChart values={vals} labels={labels}/> : kind === 'pie' ? <PieChart values={vals} labels={labels}/> : <BarChart values={vals} labels={labels} step={c.scale}/>}</Stage>;
}

export const dataView: EngineView<DataConfig> = {Scene: props => <Stage label={data.describe(props.c)}><Scene {...props}/></Stage>, Explore};

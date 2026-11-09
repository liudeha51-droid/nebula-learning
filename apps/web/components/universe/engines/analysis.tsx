'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Segmented, Action} from '../stage';
import {analysis, DATA, BINS, binCounts, mean, median, variance, percentile, type AnalysisConfig} from '@/lib/universe/engines/analysis';
import {eseg, fmt, lerp, rng} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const X = (v: number) => 80 + (v - 55) * 13.3; // 55..105 → 80..745
function Dots({xs, y = 330, hi, t = 1}: {xs: number[]; y?: number; hi?: (i: number) => boolean; t?: number}) {
  const seen = new Map<number, number>();
  return <g><line x1={60} x2={760} y1={y} y2={y} stroke={C.muted} strokeWidth={2}/>{[60, 70, 80, 90, 100].map(v => <g key={v}><line x1={X(v)} x2={X(v)} y1={y - 5} y2={y + 5} stroke={C.muted}/><T x={X(v)} y={y + 22} size={12}>{v}</T></g>)}
    {xs.map((x, i) => { const k = seen.get(Math.round(x)) ?? 0; seen.set(Math.round(x), k + 1); return <circle key={i} cx={X(x)} cy={lerp(60, y - 14 - k * 16, t)} r={7} fill={hi?.(i) ? C.unknown : C.ones} opacity={t > 0 ? 1 : 0}/>; })}</g>;
}
function Hist({xs, t = 1}: {xs: number[]; t?: number}) {
  const cnt = binCounts(xs), n = xs.length, base = 380, k = 2400; // px per (rate) unit
  return <g><line x1={60} x2={760} y1={base} y2={base} stroke={C.muted} strokeWidth={2}/>{BINS.map(v => <T key={v} x={X(v)} y={base + 20} size={12}>{v}</T>)}
    {cnt.map((c, i) => { const h = (c / n / 10) * k * t; return <g key={i}><rect x={X(BINS[i])} y={base - h} width={X(BINS[i + 1]) - X(BINS[i])} height={h} fill={C.tens} opacity={.6} stroke={C.tens}/><T x={(X(BINS[i]) + X(BINS[i + 1])) / 2} y={base - h - 12} size={13}>{c} · {fmt(c / n / 10, 3)}</T></g>; })}
    <T x={90} y={60} size={13} color={C.muted} anchor="start">height = frequency ÷ (n × width)</T></g>;
}
function Box({xs, y = 200, t = 1}: {xs: number[]; y?: number; t?: number}) {
  const q1 = percentile(xs, 25), q2 = median(xs), q3 = percentile(xs, 75), lo = Math.min(...xs), hi = Math.max(...xs);
  return <g opacity={t}><line x1={X(lo)} x2={X(q1)} y1={y} y2={y} stroke={C.ink} strokeWidth={2}/><line x1={X(q3)} x2={X(hi)} y1={y} y2={y} stroke={C.ink} strokeWidth={2}/><rect x={X(q1)} y={y - 30} width={X(q3) - X(q1)} height={60} fill={C.hundreds} opacity={.35} stroke={C.hundreds} strokeWidth={2}/><line x1={X(q2)} x2={X(q2)} y1={y - 30} y2={y + 30} stroke={C.unknown} strokeWidth={3}/>
    {[[lo, 'min'], [q1, 'Q1'], [q2, 'M'], [q3, 'Q3'], [hi, 'max']].map(([v, l]) => <T key={l as string} x={X(v as number)} y={y - 44} size={13}>{l} {fmt(v as number)}</T>)}</g>;
}

function Scene({c, scene, p}: {c: AnalysisConfig; scene: number; p: number}) {
  const m = mean(DATA), t = scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .8) : 1;
  switch (c.mode) {
    case 'sampling': case 'stratified': {
      const strat = c.mode === 'stratified'; const cols = 40; const R = rng(scene === 3 ? 7 + Math.floor(p * 3) : 3);
      const pickSet = new Set<number>(); while (pickSet.size < (strat ? 50 : 20)) pickSet.add(Math.floor(R() * 1000));
      const layer = (i: number) => i < 500 ? C.tens : i < 800 ? C.hundreds : C.warn;
      return <g>{range(1000).map(i => { const on = scene >= 2 && pickSet.has(i) && (scene > 2 || i / 1000 < p * 1.2); return <circle key={i} cx={70 + (i % cols) * 16.5} cy={50 + Math.floor(i / cols) * 13.5} r={on ? 5 : 3} fill={on ? C.unknown : strat ? layer(i) : C.faint} opacity={on ? 1 : .55}/>; })}
        <T x={W / 2} y={30} size={16}>{strat ? (scene >= 2 ? '25 from Grade 10 · 15 from Grade 11 · 10 from Grade 12' : '500 · 300 · 200 students') : scene >= 2 ? `20 of 1000 drawn at random — chance 20/1000 each` : '1000 students'}</T></g>;
    }
    case 'histogram': return <g>{scene < 3 && <Dots xs={DATA} y={300} t={1}/>}{scene >= 2 && <Hist xs={DATA} t={scene === 2 ? eseg(p, .3, 1) : 1}/>}</g>;
    case 'variance': return <g><Dots xs={DATA} y={360}/><line x1={X(m)} x2={X(m)} y1={60} y2={370} stroke={C.unknown} strokeWidth={2} strokeDasharray="5 4"/><T x={X(m)} y={46} size={14} color={C.unknown}>x̄ = {fmt(m, 2)}</T>
      {scene >= 2 && DATA.map((x, i) => <line key={i} x1={X(m)} x2={lerp(X(m), X(x), t)} y1={80 + i * 12} y2={80 + i * 12} stroke={x > m ? C.tens : C.warn} strokeWidth={3}/>)}
      {scene >= 4 && <T x={W / 2} y={300} size={20} weight={600}>s² = {fmt(variance(DATA), 2)} · s = {fmt(Math.sqrt(variance(DATA)), 2)}</T>}</g>;
    case 'boxplot': return <g><Dots xs={DATA} y={360} hi={i => scene >= 2 && (i === 4 || i === 5 || i === 14 || i === 15)}/>{scene >= 3 && <Box xs={DATA} t={scene === 3 ? eseg(p, 0, .6) : 1}/>}<T x={W / 2} y={40} size={16}>{scene >= 2 ? 'i = 20 × 25% = 5 → (5th + 6th)/2' : 'twenty sorted scores'}</T></g>;
    default: { const xs = scene === 4 ? DATA.map((x, i) => (i === 19 ? lerp(98, 104, eseg(p, 0, .6)) : x)) : DATA; const mm = scene === 4 ? (m * 20 + 100 * eseg(p, 0, .6)) / 20 : m;
      return <g><Dots xs={xs} t={t || (scene >= 2 ? 1 : 0.0001)}/>{scene >= 2 && <><path d={`M${X(mm)} 345 l-14 24 h28 z`} fill={C.unknown}/><T x={X(mm)} y={392} size={14} color={C.unknown}>mean {fmt(mm, 2)}{scene === 4 ? ' (98 → 198)' : ''}</T></>}{scene >= 3 && <><line x1={X(median(DATA))} x2={X(median(DATA))} y1={120} y2={330} stroke={C.tens} strokeWidth={2} strokeDasharray="5 4"/><T x={X(median(DATA))} y={110} size={14} color={C.tens}>median {fmt(median(DATA))}</T></>}</g>; }
  }
}

function Explore({c}: {c: AnalysisConfig}) {
  const [xs, setXs] = useState(DATA); const [view, setView] = useState<'dots' | 'hist' | 'box'>(c.mode === 'histogram' ? 'hist' : c.mode === 'boxplot' ? 'box' : 'dots'); const [last, setLast] = useState(98);
  const set = (v: number) => { setLast(v); setXs([...DATA.slice(0, 19), v]); };
  return <Stage label="Data explorer" controls={<><Segmented label="View" value={view} onChange={setView} options={[['dots', 'Dot plot'], ['hist', 'Histogram'], ['box', 'Box plot']]}/><Slider label="Top score" value={last} min={60} max={99} onChange={set}/><Action onClick={() => set(98)}>Reset</Action>
    <Readout>mean {fmt(mean(xs), 2)} · median {fmt(median(xs))} · s {fmt(Math.sqrt(variance(xs)), 2)} · Q1 {fmt(percentile(xs, 25))} · Q3 {fmt(percentile(xs, 75))}</Readout></>}>
    {view === 'hist' ? <Hist xs={xs}/> : view === 'box' ? <><Dots xs={xs} y={360}/><Box xs={xs}/></> : <><Dots xs={xs}/><path d={`M${X(mean(xs))} 345 l-14 24 h28 z`} fill={C.unknown}/></>}</Stage>;
}

export const analysisView: EngineView<AnalysisConfig> = {Scene: props => <Stage label={analysis.describe(props.c)}><Scene {...props}/></Stage>, Explore};

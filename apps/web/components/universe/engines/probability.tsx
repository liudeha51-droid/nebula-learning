'use client';
import {useMemo, useState} from 'react';
import {Stage, T, C, W, Readout, Action, Segmented, useSound} from '../stage';
import {probability, theory, trials, type ProbConfig} from '@/lib/universe/engines/probability';
import {fmt, rng} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

function Running({results, n, p, x = 310, y = 360, w = 380, h = 240}: {results: number[]; n: number; p: number; x?: number; y?: number; w?: number; h?: number}) {
  const pts: string[] = []; let hits = 0; const step = Math.max(1, Math.floor(n / 200));
  for (let i = 0; i < n; i++) { hits += results[i]; if (i % step === 0 || i === n - 1) pts.push(`${x + (i + 1) / results.length * w},${y - (hits / (i + 1)) * h}`); }
  return <g><line x1={x} x2={x + w} y1={y} y2={y} stroke={C.muted}/><line x1={x} x2={x} y1={y} y2={y - h} stroke={C.muted}/>
    {[0, .25, .5, .75, 1].map(v => <T key={v} x={x - 8} y={y - v * h} size={11} anchor="end" color={C.muted}>{v}</T>)}
    <line x1={x} x2={x + w} y1={y - p * h} y2={y - p * h} stroke={C.unknown} strokeDasharray="6 4"/><T x={x + w + 6} y={y - p * h} size={12} anchor="start" color={C.unknown}>theory {fmt(p, 3)}</T>
    {pts.length > 1 && <polyline points={pts.join(' ')} fill="none" stroke={C.ones} strokeWidth={2.5}/>}<T x={x + w / 2} y={y + 20} size={12} color={C.muted}>trials →</T></g>;
}
function Device({c, last}: {c: ProbConfig; last: number | null}) {
  if (c.mode === 'dice') { const face = last ?? c.target; const pips: Record<number, [number, number][]> = {1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]};
    return <g><rect x={90} y={150} width={140} height={140} rx={22} fill="#f4f1fb"/>{pips[face].map(([px, py], i) => <circle key={i} cx={160 + px * 38} cy={220 + py * 38} r={12} fill={face === c.target ? C.thousands : '#2a2638'}/>)}</g>; }
  if (c.mode === 'coin') return <g><circle cx={160} cy={220} r={70} fill="#d9b85c"/><T x={160} y={220} size={36} weight={700} color="#15141d">{last === 0 ? 'T' : 'H'}</T></g>;
  const total = c.red + c.blue; return <g><path d="M70 140 Q160 110 250 140 L235 320 Q160 345 85 320 Z" fill="#3a3150" stroke="#5a4f6e" strokeWidth={3}/>{range(total).map(i => <circle key={i} cx={110 + (i % 4) * 32} cy={290 - Math.floor(i / 4) * 32} r={13} fill={i < c.red ? C.thousands : C.accent}/>)}
    {last !== null && <circle cx={160} cy={100} r={20} fill={last ? C.thousands : C.accent} stroke="#fff" strokeWidth={2}/>}</g>;
}

function Scene({c, scene, p}: {c: ProbConfig; scene: number; p: number}) {
  const res = useMemo(() => trials(c), [c]);
  if (c.mode === 'certain') { const bags = [{red: 8, blue: 0, name: 'A'}, {red: 0, blue: 8, name: 'B'}, {red: c.red, blue: c.blue, name: 'C'}]; const draws = scene < 2 ? 0 : scene === 2 ? Math.floor(p * 40) : 40;
    return <g>{bags.map((b, k) => { const r = rng(k * 13 + 5); const reds = range(draws).filter(() => r() < b.red / (b.red + b.blue)).length; const x = 140 + k * 260;
      return <g key={k}><path d={`M${x - 80} 130 Q${x} 105 ${x + 80} 130 L${x + 66} 290 Q${x} 312 ${x - 66} 290 Z`} fill="#3a3150" stroke="#5a4f6e" strokeWidth={3}/>{range(b.red + b.blue).map(i => <circle key={i} cx={x - 45 + (i % 4) * 30} cy={270 - Math.floor(i / 4) * 30} r={12} fill={i < b.red ? C.thousands : C.accent}/>)}
        <T x={x} y={100} size={18} weight={600}>Bag {b.name}</T>{draws > 0 && <T x={x} y={340} size={16}>red {reds}/{draws}</T>}{scene >= 4 && <T x={x} y={380} size={18} color={[C.good, C.bad, C.ones][k]}>{['certain', 'impossible', 'possible'][k]}</T>}</g>; })}</g>; }
  const n = scene < 2 ? 0 : scene === 2 ? Math.max(1, Math.round(p * 10)) : scene === 3 ? 10 + Math.round(p * (res.length - 10)) : res.length;
  const hits = res.slice(0, n).reduce((s, x) => s + x, 0);
  return <g><Device c={c} last={n ? (c.mode === 'dice' ? (res[n - 1] ? c.target : ((n * 7) % 5) + (c.target === 1 ? 2 : 1)) : res[n - 1]) : null}/><Running results={res} n={n} p={theory(c)}/>
    <T x={W / 2} y={40} size={22} weight={600}>{n ? `${hits} / ${n} = ${fmt(hits / n, 3)}` : 'Ready to experiment'}</T></g>;
}

function Explore({c}: {c: ProbConfig}) {
  const sound = useSound();
  const [mode, setMode] = useState<ProbConfig['mode']>(c.mode === 'certain' ? 'balls' : c.mode); const cfg = {...c, mode};
  const [seed] = useState(() => Math.floor(Math.random() * 1e6)); const [res, setRes] = useState<number[]>([]);
  const gen = useMemo(() => rng(seed), [seed]);
  const run = (k: number) => { const p = theory(cfg); const add: number[] = range(k).map(() => (mode === 'dice' ? Math.floor(gen() * 6) + 1 === c.target : gen() < p) ? 1 : 0); setRes([...res, ...add].slice(-5000)); sound('tick'); };
  const hits = res.reduce((s, x) => s + x, 0);
  return <Stage label={`${res.length} trials`} controls={<><Segmented label="Device" value={mode} onChange={m => { setMode(m); setRes([]); }} options={[['coin', 'Coin'], ['dice', 'Die'], ['balls', 'Bag']]}/>
    <Action onClick={() => run(1)}>1 trial</Action><Action onClick={() => run(10)}>10</Action><Action primary onClick={() => run(100)}>100</Action><Action onClick={() => run(1000)}>1000</Action><Action onClick={() => setRes([])}>Reset</Action>
    <Readout>{res.length ? `${hits}/${res.length} = ${fmt(hits / res.length, 3)} · theory ${fmt(theory(cfg), 3)}` : 'Run some trials'}</Readout></>}>
    <Device c={cfg} last={res.length ? (mode === 'dice' ? (res[res.length - 1] ? c.target : 1 + (res.length % 5)) : res[res.length - 1]) : null}/><Running results={res.length ? res : [0]} n={res.length} p={theory(cfg)}/></Stage>;
}

export const probabilityView: EngineView<ProbConfig> = {Scene: props => <Stage label={probability.describe(props.c)}><Scene {...props}/></Stage>, Explore};

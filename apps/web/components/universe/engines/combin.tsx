'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Stepper} from '../stage';
import {combin, A, Cnk, fact, sumWays, type CombinConfig} from '@/lib/universe/engines/combin';
import {eseg, fmt} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const SUMC = ['#3a3550', '#4a3f6b', '#5b4d8a', '#7a63b0', '#9b7fd4', C.unknown];
function Dice({filled, sel}: {filled: number; sel?: number}) {
  const s = 52, x0 = 220, y0 = 60;
  return <g>{range(6).map(i => <T key={'r' + i} x={x0 - 20} y={y0 + i * s + s / 2 + 5} size={14} color={C.bad}>{i + 1}</T>)}{range(6).map(j => <T key={'b' + j} x={x0 + j * s + s / 2} y={y0 - 12} size={14} color={C.accent}>{j + 1}</T>)}
    {range(36).map(q => { const i = Math.floor(q / 6), j = q % 6, sum = i + j + 2; const on = q < filled; const hl = sel !== undefined && sum === sel; return <g key={q} opacity={on ? 1 : .1}><rect x={x0 + j * s} y={y0 + i * s} width={s - 4} height={s - 4} rx={6} fill={hl ? C.ones : SUMC[sumWays(sum) - 1]}/><T x={x0 + j * s + s / 2 - 2} y={y0 + i * s + s / 2 + 3} size={15} color={hl ? '#15141d' : C.ink}>{sum}</T></g>; })}</g>;
}
function Tree({n, k, t = 1}: {n: number; k: number; t?: number}) {
  const leaves = n * k, lh = Math.min(34, 380 / leaves), top = 225 - (leaves * lh) / 2;
  return <g><circle cx={90} cy={225} r={8} fill={C.ink}/>{range(n).map(i => { const y1 = top + (i * k + (k - 1) / 2) * lh; return <g key={i}><line x1={90} y1={225} x2={300} y2={y1} stroke={C.ones} strokeWidth={2} opacity={Math.min(1, t * 2)}/><T x={300} y={y1 - 8} size={12} color={C.ones}>S{i + 1}</T>
    {range(k).map(j => { const y2 = top + (i * k + j) * lh; return <g key={j} opacity={Math.max(0, t * 2 - 1)}><line x1={310} y1={y1} x2={520} y2={y2} stroke={C.tens} strokeWidth={1.5}/><circle cx={526} cy={y2} r={4} fill={C.tens}/><T x={540} y={y2 + 4} size={11} color={C.muted} anchor="start">S{i + 1}T{j + 1}</T></g>; })}</g>; })}</g>;
}
function Pascal({rows, hi}: {rows: number; hi?: number}) {
  const dx = 64, dy = 46;
  return <g>{range(rows + 1).map(r => range(r + 1).map(k => <g key={r + '-' + k}><circle cx={W / 2 + (k - r / 2) * dx} cy={50 + r * dy} r={19} fill={r === hi ? C.ones : '#2a2638'} stroke={C.line}/><T x={W / 2 + (k - r / 2) * dx} y={55 + r * dy} size={14} color={r === hi ? '#15141d' : C.ink}>{Cnk(r, k)}</T></g>))}</g>;
}
function Podium({n, k, t}: {n: number; k: number; t: number}) {
  const pos = range(k); return <g>{range(n).map(i => <g key={i}><circle cx={120 + i * 70} cy={90} r={22} fill={i < k && t > 0 ? C.ones : C.faint}/><T x={120 + i * 70} y={96} size={15} color="#15141d">{String.fromCharCode(65 + i)}</T></g>)}
    {pos.map(i => <g key={i}><rect x={260 + i * 100} y={300 - (k - i) * 30} width={90} height={(k - i) * 30 + 40} fill={C.hundreds} opacity={.35}/><T x={305 + i * 100} y={330} size={16}>{n - i} choices</T></g>)}<T x={W / 2} y={400} size={18}>{range(k).map(i => n - i).join(' × ')} = {A(n, k)}</T></g>;
}

function Scene({c, scene, p}: {c: CombinConfig; scene: number; p: number}) {
  const {n, k} = c;
  switch (c.mode) {
    case 'tree': return <g><Tree n={n} k={k} t={scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .9) : 1}/>{scene >= 3 && <T x={680} y={225} size={22} weight={600}>{n} × {k} = {n * k}</T>}</g>;
    case 'perm-comb': return <g><Podium n={n} k={k} t={scene >= 2 ? 1 : 0}/>{scene >= 3 && <T x={W / 2} y={150} size={18} color={C.unknown}>each team of {k} is counted {k}! = {fact(k)} times</T>}{scene >= 4 && <T x={W / 2} y={186} size={22} weight={600} color={C.good}>C({n}, {k}) = {A(n, k)} ÷ {fact(k)} = {Cnk(n, k)}</T>}</g>;
    case 'pascal': return <g><Pascal rows={scene < 2 ? 1 : scene === 2 ? Math.round(1 + (n - 1) * p) : n} hi={scene >= 3 ? n : undefined}/>{scene >= 4 && <T x={W / 2} y={430} size={16}>row {n}: {range(n + 1).map(i => Cnk(n, i)).join(' + ')} = 2^{n} = {2 ** n}</T>}</g>;
    default: return <g><Dice filled={scene < 2 ? 0 : scene === 2 ? Math.ceil(36 * p) : 36} sel={scene >= 3 ? 7 : undefined}/>{scene >= 3 && <><T x={640} y={180} size={18} color={C.ones}>sum 7: 6 cells</T><T x={640} y={215} size={18}>P(7) = 6/36</T><T x={640} y={250} size={16} color={C.muted}>P(2) = 1/36</T></>}</g>;
  }
}

function Explore({c}: {c: CombinConfig}) {
  const [n, setN] = useState(c.mode === 'dice' ? 7 : c.n), [k, setK] = useState(c.k);
  if (c.mode === 'dice') return <Stage label="Two dice" controls={<><Stepper label="Sum" value={n} min={2} max={12} onChange={setN}/><Readout>sum {n}: {sumWays(n)} of 36 cells · P = {sumWays(n)}/36 ≈ {fmt(sumWays(n) / 36, 3)}</Readout></>}><Dice filled={36} sel={n}/></Stage>;
  if (c.mode === 'pascal') return <Stage label="Yang Hui’s triangle" controls={<><Stepper label="Row n" value={n} min={1} max={8} onChange={setN}/><Readout>(a + b)^{n}: {range(n + 1).map(i => Cnk(n, i)).join(', ')} · sum 2^{n} = {2 ** n}</Readout></>}><Pascal rows={n} hi={n}/></Stage>;
  const kk = Math.min(k, n);
  return <Stage label="Count it" controls={<><Stepper label="n" value={n} min={2} max={c.mode === 'tree' ? 5 : 8} onChange={setN}/><Stepper label="k" value={kk} min={1} max={c.mode === 'tree' ? 5 : n} onChange={setK}/><Readout>{c.mode === 'tree' ? `${n} × ${kk} = ${n * kk} leaves` : `A(${n}, ${kk}) = ${A(n, kk)} · C(${n}, ${kk}) = ${Cnk(n, kk)}`}</Readout></>}>{c.mode === 'tree' ? <Tree n={n} k={k}/> : <Podium n={n} k={kk} t={1}/>}</Stage>;
}

export const combinView: EngineView<CombinConfig> = {Scene: props => <Stage label={combin.describe(props.c)}><Scene {...props}/></Stage>, Explore};

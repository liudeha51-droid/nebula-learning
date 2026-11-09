'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Segmented} from '../stage';
import {rational, type RationalConfig} from '@/lib/universe/engines/rational';
import {eseg, fmt, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const LO = -10, HI = 10; const X = (v: number) => 60 + ((v - LO) / (HI - LO)) * 680; const Y0 = 260;
function Line({lo = LO, hi = HI}: {lo?: number; hi?: number}) {
  return <g><line x1={40} x2={760} y1={Y0} y2={Y0} stroke={C.muted} strokeWidth={2}/>{range(hi - lo + 1).map(i => { const v = lo + i; return <g key={v}><line x1={X(v)} x2={X(v)} y1={Y0 - (v === 0 ? 12 : 7)} y2={Y0 + (v === 0 ? 12 : 7)} stroke={v === 0 ? C.ink : C.muted}/><T x={X(v)} y={Y0 + 24} size={12} color={v < 0 ? C.accent : v > 0 ? C.ones : C.ink}>{v}</T></g>; })}</g>;
}
function Jump({from, to, y, color, label}: {from: number; to: number; y: number; color: string; label?: string}) {
  const mid = (X(from) + X(to)) / 2; return <g><path d={`M${X(from)} ${Y0 - 8} Q${mid} ${y} ${X(to)} ${Y0 - 8}`} fill="none" stroke={color} strokeWidth={3}/><polygon points={`${X(to)},${Y0 - 6} ${X(to) - 6 * Math.sign(to - from || 1)},${Y0 - 18} ${X(to) + 3 * Math.sign(to - from || 1)},${Y0 - 18}`} fill={color}/>{label && <T x={mid} y={y - 12} size={14} color={color}>{label}</T>}</g>;
}
const Dot = ({v, color = C.unknown, label}: {v: number; color?: string; label?: string}) => <g><circle cx={X(v)} cy={Y0} r={8} fill={color}/>{label && <T x={X(v)} y={Y0 - 26} size={15} weight={700} color={color}>{label}</T>}</g>;

function Scene({c, scene, p}: {c: RationalConfig; scene: number; p: number}) {
  const {a, b} = c;
  switch (c.mode) {
    case 'line': return <g><Line/>{scene >= 2 && range(Math.ceil((scene === 2 ? p : 1) * 9)).map(i => <circle key={i} cx={X(i - 4)} cy={Y0} r={4} fill={C.muted}/>)}{scene >= 3 && <><Dot v={a} label={fmt(a)}/><Dot v={b} color={C.tens} label={fmt(b)}/></>}{scene >= 4 && <T x={W / 2} y={360} size={18}>…, −2, −1, 0, 1, 2, … and every fraction between: the rational numbers</T>}</g>;
    case 'absolute': { const walk = scene === 2 ? eseg(p, .1, .9) : scene > 2 ? 1 : 0; return <g><Line/><Dot v={a} label={fmt(a)}/>{walk > 0 && <line x1={X(a)} x2={X(lerp(a, 0, walk))} y1={Y0 + 40} y2={Y0 + 40} stroke={C.ones} strokeWidth={4}/>}
      {scene >= 3 && <Dot v={-a} color={C.tens} label={fmt(-a)}/>}{scene >= 3 && <line x1={X(0)} x2={X(-a)} y1={Y0 + 40} y2={Y0 + 40} stroke={C.tens} strokeWidth={4}/>}<T x={W / 2} y={100} size={26} weight={600}>{scene >= 4 ? `|${fmt(a)}| = |${fmt(-a)}| = ${fmt(Math.abs(a))}` : `distance from 0: ${fmt(Math.abs(a) * walk, 1)}`}</T></g>; }
    case 'compare': return <g><Line/>{scene >= 2 && <><Dot v={a} label={fmt(a)}/><Dot v={b} color={C.tens} label={fmt(b)}/></>}{scene >= 3 && <><line x1={X(0)} x2={X(a)} y1={Y0 + 40} y2={Y0 + 40} stroke={C.unknown} strokeWidth={3}/><line x1={X(0)} x2={X(b)} y1={Y0 + 54} y2={Y0 + 54} stroke={C.tens} strokeWidth={3}/></>}
      <T x={W / 2} y={100} size={28} weight={600}>{scene >= 4 ? `${fmt(Math.max(a, b))} > ${fmt(Math.min(a, b))}` : `${fmt(a)} ? ${fmt(b)}`}</T><T x={W / 2} y={140} size={15} color={C.muted}>← smaller · greater →</T></g>;
    case 'multiply': { const stretch = scene < 2 ? 1 : scene === 2 ? lerp(1, Math.abs(b), eseg(p, 0, .8)) : Math.abs(b); const flip = scene === 3 ? eseg(p, .2, .8) : scene > 3 ? 1 : 0; const end = a * stretch * lerp(1, Math.sign(b), flip);
      return <g><Line/><line x1={X(0)} x2={X(a)} y1={Y0 - 50} y2={Y0 - 50} stroke={C.faint} strokeWidth={4}/><line x1={X(0)} x2={X(end)} y1={Y0 - 25} y2={Y0 - 25} stroke={C.ones} strokeWidth={6} strokeLinecap="round"/><Dot v={end} label={fmt(end, 1)}/>
        <T x={W / 2} y={90} size={24} weight={600}>{scene >= 4 ? `(${fmt(a)}) × (${fmt(b)}) = ${fmt(a * b)}` : `${fmt(a)} × ${Math.abs(b)}${flip > .5 ? ' then flip' : ''}`}</T></g>; }
    case 'power': { const n = scene < 2 ? 1 : scene === 2 ? 1 + Math.floor(p * 9.99) : 10; const vals = range(n).map(k => a ** (k + 1)); const max = a ** 10;
      return <g>{vals.map((v, i) => <g key={i}><rect x={80 + i * 64} y={380 - (v / max) * 300 - 2} width={50} height={Math.max(2, (v / max) * 300)} fill={C.ones} opacity={.8}/><T x={105 + i * 64} y={395} size={11} color={C.muted}>{a}^{i + 1}</T><T x={105 + i * 64} y={370 - (v / max) * 300} size={11}>{fmt(v)}</T></g>)}
        {scene >= 3 && <T x={W / 2} y={60} size={20} color={C.tens}>(−2)¹ = −2, (−2)² = 4, (−2)³ = −8: odd powers stay negative</T>}{scene >= 5 && <T x={W / 2} y={100} size={18}>385 000 km = 3.85 × 10⁵ km</T>}</g>; }
    default: { const t = scene < 2 ? 0 : scene === 2 ? eseg(p, .1, .9) : 1; const u = scene === 3 ? eseg(p, .1, .9) : scene > 3 ? 1 : 0;
      return <g><Line/><Dot v={a} color={C.ones} label={fmt(a)}/>{t > 0 && scene === 2 && <Jump from={0} to={lerp(0, 4, t)} y={170} color={C.ones} label="+4 → right"/>}{u > 0 && <Jump from={a} to={lerp(a, a + b, u)} y={170} color={b < 0 ? C.accent : C.ones} label={`${b < 0 ? '' : '+'}${fmt(b)}`}/>}{u >= 1 && <Dot v={a + b} label={fmt(a + b)}/>}
        <T x={W / 2} y={70} size={26} weight={600}>{fmt(a)} + ({fmt(b)}) = {u >= 1 ? fmt(a + b) : '?'}</T>{scene >= 5 && <T x={W / 2} y={110} size={18} color={C.muted}>a − b = a + (−b)</T>}</g>; }
  }
}

function Explore({c}: {c: RationalConfig}) {
  const [a, setA] = useState(c.a), [b, setB] = useState(c.b); const [op, setOp] = useState<'+' | '−' | '×'>(c.mode === 'multiply' ? '×' : '+');
  const res = op === '+' ? a + b : op === '−' ? a - b : a * b;
  if (c.mode === 'power') return <Stage label="Powers" controls={<Readout>2¹⁰ = 1024 · (−2)³ = −8 · 3.85 × 10⁵ = 385 000</Readout>}><Scene c={c} scene={5} p={1}/></Stage>;
  return <Stage label={`${a} ${op} ${b} = ${res}`} controls={<><Slider label="a" value={a} min={-8} max={8} step={c.mode === 'line' ? .5 : 1} onChange={setA}/><Slider label="b" value={b} min={-8} max={8} step={c.mode === 'line' ? .5 : 1} onChange={setB}/><Segmented label="Operation" value={op} onChange={setOp} options={[['+', '+'], ['−', '−'], ['×', '×']]}/>
    <Readout>{fmt(a)} {op} ({fmt(b)}) = {fmt(res)}{op === '−' ? ` = ${fmt(a)} + (${fmt(-b)})` : ''} · |a| = {fmt(Math.abs(a))} · {a > b ? `${fmt(a)} > ${fmt(b)}` : a < b ? `${fmt(a)} < ${fmt(b)}` : 'equal'}</Readout></>}>
    <Line/><Dot v={a} color={C.ones} label={`a = ${fmt(a)}`}/>{op !== '×' && Math.abs(res) <= 10 && <Jump from={a} to={res} y={170} color={C.accent}/>}{Math.abs(res) <= 10 && <Dot v={res} label={fmt(res)}/>}{Math.abs(res) > 10 && <T x={W / 2} y={140} size={20} color={C.warn}>result {fmt(res)} is off the line</T>}</Stage>;
}

export const rationalView: EngineView<RationalConfig> = {Scene: props => <Stage label={rational.describe(props.c)}><Scene {...props}/></Stage>, Explore};

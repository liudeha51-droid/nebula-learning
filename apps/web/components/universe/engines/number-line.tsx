'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Stepper, Segmented, Arrow} from '../stage';
import {numberLine, bounds, roundTo, type LineConfig} from '@/lib/universe/engines/number-line';
import {eseg, fix, fmt, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

function RoundLine({value, to, show}: {value: number; to: number; show: number}) {
  const [lo, hi] = bounds(value, to); const mid = fix((lo + hi) / 2); const X = (v: number) => 100 + ((v - lo) / (hi - lo)) * 600; const r = roundTo(value, to);
  return <g><line x1={80} x2={720} y1={250} y2={250} stroke={C.muted} strokeWidth={3}/>
    {range(11).map(i => <line key={i} x1={100 + i * 60} x2={100 + i * 60} y1={i % 5 === 0 ? 235 : 242} y2={i % 5 === 0 ? 265 : 258} stroke={C.muted}/>)}
    <T x={100} y={290} size={18}>{fmt(lo)}</T><T x={700} y={290} size={18}>{fmt(hi)}</T>
    {show >= 2 && <><T x={400} y={290} size={15} color={C.accent}>{fmt(mid)}</T><line x1={400} x2={400} y1={200} y2={270} stroke={C.accent} strokeDasharray="4 4"/></>}
    <circle cx={lerp(100, X(value), show >= 1 ? 1 : 0)} cy={250} r={10} fill={C.ones}/><T x={X(value)} y={215} size={20} weight={700} color={C.ones}>{fmt(value)}</T>
    {show >= 3 && <Arrow x1={X(value)} y1={320} x2={X(r)} y2={320} color={C.good} width={3}/>}
    {show >= 3 && <T x={X(r)} y={350} size={22} weight={700} color={C.good}>≈ {fmt(r)}</T>}</g>;
}
function Thermo({value, context, opp = false}: {value: number; context: LineConfig['context']; opp?: boolean}) {
  const span = Math.max(10, Math.ceil(Math.abs(value) / 5) * 5 + 5); const Y = (v: number) => 230 - (v / span) * 170; const unit = context === 'temperature' ? '°C' : context === 'elevation' ? 'm' : '¥';
  return <g>{context === 'elevation' && <><rect x={60} y={Y(0)} width={680} height={400 - Y(0)} fill="#2b5c8a" opacity={.35}/><path d={`M60 ${Y(0)} L60 ${Y(span * .7)} L170 ${Y(span * .7)} L230 ${Y(0)}Z`} fill="#6b5a4a" opacity={.7}/></>}
    <line x1={300} x2={300} y1={Y(span)} y2={Y(-span)} stroke={C.muted} strokeWidth={3}/>
    {range(2 * span / 5 + 1).map(i => { const v = span - i * 5; return <g key={i}><line x1={292} x2={308} y1={Y(v)} y2={Y(v)} stroke={C.muted}/><T x={330} y={Y(v)} size={14} anchor="start" color={v === 0 ? C.ink : v < 0 ? C.accent : C.ones}>{v > 0 ? '+' : ''}{v}</T></g>; })}
    {context === 'temperature' && <><rect x={290} y={Math.min(Y(value), Y(0))} width={20} height={Math.abs(Y(value) - Y(0)) + 1} fill={value < 0 ? C.accent : C.thousands}/><circle cx={300} cy={Y(-span) + 12} r={16} fill={value < 0 ? C.accent : C.thousands}/></>}
    <circle cx={300} cy={Y(value)} r={9} fill={value < 0 ? C.accent : C.ones} stroke="#fff" strokeWidth={2}/>
    <T x={460} y={Y(value)} size={28} weight={700} color={value < 0 ? C.accent : C.ones}>{fmt(value)} {unit}</T>
    {opp && <><circle cx={300} cy={Y(-value)} r={9} fill={C.ones} stroke="#fff" strokeWidth={2}/><T x={460} y={Y(-value)} size={24} color={C.ones}>{fmt(-value)} {unit}</T><path d={`M285 ${Y(value)} Q240 ${Y(0)} 285 ${Y(-value)}`} fill="none" stroke={C.unknown} strokeDasharray="4 4"/></>}
    <T x={600} y={Y(0)} size={14} color={C.muted}>{context === 'elevation' ? 'sea level 0' : context === 'temperature' ? 'freezing 0' : 'balance 0'}</T></g>;
}
function HLine({value, extra}: {value: number; extra?: number}) {
  const span = Math.max(10, Math.ceil(Math.abs(value) / 5) * 5 + 5); const X = (v: number) => W / 2 + (v / span) * 320;
  return <g><Arrow x1={60} y1={240} x2={750} y2={240} color={C.muted}/>{range(2 * span / 5 + 1).map(i => { const v = -span + i * 5; return <g key={i}><line x1={X(v)} x2={X(v)} y1={230} y2={250} stroke={C.muted}/><T x={X(v)} y={272} size={14} color={v < 0 ? C.accent : v > 0 ? C.ones : C.ink}>{v}</T></g>; })}
    <circle cx={X(value)} cy={240} r={9} fill={C.accent}/>{extra !== undefined && <circle cx={X(extra)} cy={240} r={9} fill={C.ones}/>}
    <T x={X(-span)} y={200} size={16} color={C.accent} anchor="start">← smaller</T><T x={X(span)} y={200} size={16} color={C.ones} anchor="end">greater →</T></g>;
}
function Unified({n, d, stage}: {n: number; d: number; stage: number}) {
  const X = (v: number) => 100 + v * 600; const v = n / d;
  return <g><rect x={100} y={100} width={600} height={50} rx={6} fill="#1f1d2b" stroke={C.line}/><rect x={100} y={100} width={600 * v} height={50} rx={6} fill={C.hundreds} opacity={.7}/>
    {range(d - 1).map(i => <line key={i} x1={X((i + 1) / d)} x2={X((i + 1) / d)} y1={100} y2={150} stroke="#fff" strokeOpacity={.4}/>)}
    <line x1={100} x2={700} y1={230} y2={230} stroke={C.muted} strokeWidth={2}/>
    {stage >= 1 && range(d + 1).map(i => <g key={'f' + i}><line x1={X(i / d)} x2={X(i / d)} y1={218} y2={230} stroke={C.hundreds}/><T x={X(i / d)} y={205} size={13} color={C.hundreds}>{i}/{d}</T></g>)}
    {stage >= 2 && range(11).map(i => <g key={'t' + i}><line x1={X(i / 10)} x2={X(i / 10)} y1={230} y2={244} stroke={C.tens}/><T x={X(i / 10)} y={258} size={13} color={C.tens}>{fmt(i / 10)}</T></g>)}
    {stage >= 3 && range(11).map(i => <T key={'p' + i} x={X(i / 10)} y={290} size={13} color={C.ones}>{i * 10}%</T>)}
    <circle cx={X(v)} cy={230} r={9} fill="#fff"/>
    {stage >= 3 && <T x={W / 2} y={350} size={30} weight={700}><tspan fill={C.hundreds}>{n}/{d}</tspan> = <tspan fill={C.tens}>{fmt(v)}</tspan> = <tspan fill={C.ones}>{fmt(v * 100)}%</tspan></T>}</g>;
}

function Scene({c, scene, p}: {c: LineConfig; scene: number; p: number}) {
  if (c.mode === 'signed') {
    if (scene >= 5) return <g><HLine value={c.value} extra={-c.value}/><T x={W / 2} y={70} size={24}>{fmt(c.value)} &lt; 0 &lt; {fmt(-c.value)}</T></g>;
    const v = scene < 2 ? Math.abs(c.value) : scene === 2 ? lerp(Math.abs(c.value), c.value, eseg(p, .1, .9)) : c.value;
    return <g><Thermo value={fix(Math.round(v * 10) / 10)} context={c.context} opp={scene === 3 || scene === 4}/>{scene === 1 && <T x={W / 2} y={40} size={22} color={C.accent}>How do we write a value below zero?</T>}</g>;
  }
  if (c.mode === 'unified') return <g><Unified n={c.n} d={c.d} stage={scene < 2 ? 0 : scene === 2 ? 1 : scene === 3 ? 2 : 3}/><T x={W / 2} y={60} size={26} weight={600}>{scene < 4 ? `${c.n}/${c.d}` : `${c.n}/${c.d} = ${fmt(c.n / c.d)} = ${fmt(c.n / c.d * 100)}%`}</T></g>;
  return <g><RoundLine value={c.value} to={c.to} show={scene < 2 ? 0 : scene === 2 ? 1 : scene === 3 ? 2 : 3}/><T x={W / 2} y={60} size={26} weight={600}>{scene >= 4 ? `${fmt(c.value)} ≈ ${fmt(roundTo(c.value, c.to))}` : `${fmt(c.value)} → nearest ${fmt(c.to)}`}</T></g>;
}

function Explore({c}: {c: LineConfig}) {
  const [v, setV] = useState(c.value); const [ctx, setCtx] = useState(c.context); const [to, setTo] = useState(c.to); const [n, setN] = useState(c.n), [d, setD] = useState(c.d);
  if (c.mode === 'signed') return <Stage label={`${v} on the number line`} controls={<><Slider label="Value" value={v} min={-30} max={30} onChange={setV}/><Segmented label="Context" value={ctx} onChange={setCtx} options={[['temperature', 'Temperature'], ['elevation', 'Elevation'], ['money', 'Money']]}/><Readout>{v < 0 ? `${Math.abs(v)} below zero: ${v}` : v > 0 ? `${v} above zero: +${v}` : 'zero: neither positive nor negative'} · opposite {-v}</Readout></>}><Thermo value={v} context={ctx} opp/></Stage>;
  if (c.mode === 'unified') return <Stage label={`${n}/${d}`} controls={<><Stepper label="Numerator" value={n} min={0} max={d} onChange={setN}/><Stepper label="Denominator" value={d} min={1} max={20} onChange={v2 => { setD(v2); if (n > v2) setN(v2); }}/><Readout>{n}/{d} = {fmt(n / d, 4)} = {fmt(n / d * 100, 2)}%</Readout></>}><Unified n={n} d={d} stage={3}/></Stage>;
  const step = c.to >= 1 ? Math.max(1, c.to / 100) : c.to / 10; const [lo] = bounds(c.value, c.to);
  return <Stage label={`${v} rounds to ${roundTo(v, to)}`} controls={<><Slider label="Number" value={v} min={lo} max={fix(lo + c.to)} step={step} onChange={x => setV(fix(x))} format={x => fmt(x)}/>
    <Segmented label="Round to" value={String(to)} onChange={x => setTo(Number(x))} options={[[String(c.to), `nearest ${fmt(c.to)}`], [String(fix(c.to / 10)), `nearest ${fmt(fix(c.to / 10))}`]]}/><Readout>{fmt(v)} ≈ {fmt(roundTo(v, to))}</Readout></>}>
    <RoundLine value={v} to={to} show={3}/></Stage>;
}

export const numberLineView: EngineView<LineConfig> = {Scene: props => <Stage label={numberLine.describe(props.c)}><Scene {...props}/></Stage>, Explore};

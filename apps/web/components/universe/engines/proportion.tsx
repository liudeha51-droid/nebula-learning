'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Stepper, Obj} from '../stage';
import {proportion, type PropConfig} from '@/lib/universe/engines/proportion';
import {fmt, gcd, lerp, seg} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

function Cups({a, b, scale, x = 120, y = 300}: {a: number; b: number; scale: number; x?: number; y?: number}) {
  const n = a * scale, m = b * scale; const cup = (i: number, col: string, row: number) => <g key={col + i}><path d={`M${x + i * 34} ${y - row * 60} l6 40 h20 l6 -40 z`} fill={col} opacity={.85}/></g>;
  return <g>{range(n).map(i => cup(i, C.thousands, 1))}{range(m).map(i => cup(i, C.accent, 0))}<T x={x - 20} y={y - 40} size={14} anchor="end" color={C.thousands}>juice {n}</T><T x={x - 20} y={y + 20} size={14} anchor="end" color={C.accent}>water {m}</T></g>;
}
function Graph({pts, curve, x = 420, y = 380, w = 330, h = 280, xmax, ymax, lit = 99}: {pts: [number, number][]; curve?: boolean; x?: number; y?: number; w?: number; h?: number; xmax: number; ymax: number; lit?: number}) {
  const X = (v: number) => x + (v / xmax) * w, Y = (v: number) => y - (v / ymax) * h; const shown = pts.slice(0, lit);
  return <g><line x1={x} x2={x + w} y1={y} y2={y} stroke={C.muted}/><line x1={x} x2={x} y1={y} y2={y - h} stroke={C.muted}/><T x={x - 6} y={y + 14} size={12} color={C.muted}>0</T>
    {shown.length > 1 && <polyline points={(curve ? shown : [[0, 0] as [number, number], ...shown]).map(([a, b]) => `${X(a)},${Y(b)}`).join(' ')} fill="none" stroke={C.tens} strokeWidth={2.5}/>}
    {shown.map(([a, b], i) => <g key={i}><circle cx={X(a)} cy={Y(b)} r={6} fill={C.ones}/><T x={X(a) + 10} y={Y(b) - 10} size={11} anchor="start">({fmt(a)}, {fmt(b)})</T></g>)}</g>;
}
function Table({rows, head, x = 80, y = 100, upTo = 99}: {rows: [number, number][]; head: [string, string]; x?: number; y?: number; upTo?: number}) {
  return <g><T x={x + 50} y={y} size={14} color={C.muted}>{head[0]}</T><T x={x + 170} y={y} size={14} color={C.muted}>{head[1]}</T>{rows.slice(0, upTo).map(([a, b], i) => <g key={i}><T x={x + 50} y={y + 34 + i * 34} size={18}>{fmt(a)}</T><T x={x + 170} y={y + 34 + i * 34} size={18} color={C.ones}>{Number.isNaN(b) ? '' : fmt(b)}</T></g>)}</g>;
}

function Scene({c, scene, p}: {c: PropConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'simplify': { const g = gcd(c.a, c.b); const grouped = scene >= 2; const per = 12;
      const dots = (n: number, col: string, y: number) => range(n).map(i => { const grp = Math.floor(i / g), k = i % g; const x = grouped ? 80 + grp * (g * 14 + 20) + k * 14 : 80 + (i % per) * 22; return <circle key={col + i} cx={x} cy={grouped ? y : y + Math.floor(i / per) * 22} r={6} fill={col}/>; });
      return <g>{dots(c.a, C.unknown, 160)}{dots(c.b, C.accent, 280)}<T x={W / 2} y={50} size={24} weight={600}>{scene >= 4 ? `${c.a} : ${c.b} = ${c.a / g} : ${c.b / g}` : `${c.a} : ${c.b}`}</T>{grouped && <T x={W / 2} y={400} size={16} color={C.muted}>{c.a / g} groups : {c.b / g} groups of {g}</T>}</g>; }
    case 'divide': { const part = c.total / (c.a + c.b); const n = c.a + c.b; const share = scene >= 3 ? seg(scene === 3 ? p : 1, 0, .8) : 0;
      return <g>{range(n).map(i => { const mine = i < c.a; const x0 = 100 + i * (600 / n); const tx = mine ? 100 + i * 50 : 460 + (i - c.a) * 50; return <g key={i}><rect x={lerp(x0, tx, share)} y={lerp(170, mine ? 270 : 270, share)} width={Math.min(600 / n - 6, 46)} height={50} rx={6} fill={mine ? C.unknown : C.accent} opacity={scene >= 2 ? .85 : .3}/>{scene >= 2 && <T x={lerp(x0, tx, share) + Math.min(600 / n - 6, 46) / 2} y={lerp(195, 295, share)} size={14} color="#15141d" weight={700}>{part}</T>}</g>; })}
        <T x={W / 2} y={50} size={22} weight={600}>{scene >= 4 ? `${c.a * part} : ${c.b * part} = ${c.a} : ${c.b}` : `${c.total} in the ratio ${c.a} : ${c.b}`}</T>{share > .9 && <><T x={180} y={350} size={18} color={C.unknown}>{c.a * part}</T><T x={560} y={350} size={18} color={C.accent}>{c.b * part}</T></>}</g>; }
    case 'solve': { const x = c.b * c.c / c.a; return <g><Table rows={[[c.a, c.b], [c.c, scene >= 4 ? x : NaN]]} head={['flour (cups)', 'pancakes']} x={180} y={120}/>{scene < 4 && <T x={350} y={188} size={22} color={C.unknown}>x</T>}
      {scene >= 3 && <><path d="M240 150 L360 185" stroke={C.ones} strokeWidth={2}/><path d="M360 150 L240 185" stroke={C.tens} strokeWidth={2}/><T x={W / 2 + 160} y={160} size={18} color={C.ones}>{c.a} × x</T><T x={W / 2 + 160} y={190} size={18} color={C.tens}>{c.b} × {c.c}</T></>}
      <T x={W / 2} y={50} size={24} weight={600}>{c.a} : {c.b} = {c.c} : {scene >= 4 ? x : 'x'}</T>{scene >= 2 && <T x={W / 2} y={320} size={18} color={C.muted}>× {fmt(c.c / c.a)} on both terms</T>}</g>; }
    case 'direct': case 'inverse': { const inv = c.mode === 'inverse'; const rows: [number, number][] = range(inv ? 6 : 5).map(i => inv ? [i + 1, c.product / (i + 1)] : [i + 1, c.k * (i + 1)]); const lit = scene < 2 ? 0 : scene === 2 ? Math.ceil(p * rows.length) : rows.length;
      return <g><Table rows={rows} head={inv ? ['speed', 'time'] : ['number', 'cost']} upTo={lit} y={80}/>{scene >= 3 && <Graph pts={rows} curve={inv} xmax={rows.length + 1} ymax={inv ? c.product * 1.1 : c.k * 6} lit={scene === 3 ? Math.ceil(p * rows.length) : rows.length}/>}
        <T x={W / 2 + 150} y={50} size={20} weight={600}>{scene >= 4 ? (inv ? `x × y = ${c.product}` : `y ÷ x = ${c.k}`) : inv ? 'speed and time' : 'number and cost'}</T></g>; }
    case 'speed': { const hrs = scene < 2 ? 0 : scene === 2 ? p * c.time : c.time; const X = (km: number) => 80 + (km / (c.speed * c.time)) * 620;
      return <g><line x1={80} x2={700} y1={200} y2={200} stroke={C.muted} strokeWidth={6} strokeDasharray="20 12"/>{range(c.time + 1).map(h => <g key={h}><line x1={X(h * c.speed)} x2={X(h * c.speed)} y1={210} y2={226} stroke={C.muted}/><T x={X(h * c.speed)} y={240} size={13} color={C.muted}>{h * c.speed} km</T></g>)}
        <g transform={`translate(${X(hrs * c.speed)} 180)`}><rect x={-30} y={-14} width={60} height={24} rx={8} fill={C.thousands}/><circle cx={-16} cy={12} r={7} fill="#222"/><circle cx={16} cy={12} r={7} fill="#222"/></g>
        {scene >= 3 && <><line x1={80} x2={700} y1={320} y2={320} stroke={C.muted} strokeWidth={6} strokeDasharray="20 12"/><g transform={`translate(${X(hrs * c.speed / 2)} 300)`}><rect x={-34} y={-16} width={68} height={28} rx={6} fill={C.tens}/></g><T x={X(hrs * c.speed / 2)} y={350} size={13} color={C.tens}>bus {c.speed / 2} km/h</T></>}
        <T x={W / 2} y={60} size={22} weight={600}>{fmt(hrs, 1)} h × {c.speed} km/h = {fmt(hrs * c.speed, 0)} km</T></g>; }
    case 'unit-price': { const n = scene < 2 ? 1 : scene === 2 ? Math.max(1, Math.ceil(p * c.qty)) : c.qty;
      return <g>{range(n).map(i => <g key={i}><rect x={120 + i * 80} y={160} width={60} height={80} rx={6} fill={[C.ones, C.tens, C.hundreds][i % 3]}/><T x={150 + i * 80} y={270} size={14}>¥{c.price}</T></g>)}
        <T x={W / 2} y={60} size={24} weight={600}>{n} × ¥{c.price} = ¥{n * c.price}</T>{scene >= 3 && <T x={W / 2} y={340} size={18} color={C.muted}>¥{c.price * c.qty} ÷ {c.qty} = ¥{c.price} each</T>}</g>; }
    default: { const k = scene < 2 ? 1 : scene === 2 ? (p < .5 ? 2 : 1) : scene === 3 ? 1 + Math.min(3, Math.floor(p * 4)) : 3; const wrong = scene === 2 && p >= .5;
      return <g>{wrong ? <Cups a={c.a + 1} b={c.b + 1} scale={1}/> : <Cups a={c.a} b={c.b} scale={k}/>}<T x={W / 2} y={60} size={24} weight={600}>{wrong ? `${c.a + 1} : ${c.b + 1} — different taste!` : `${c.a * k} : ${c.b * k} = ${c.a} : ${c.b}`}</T>
        <Obj kind="ball" x={680} y={260} r={50} color={wrong ? '#e8a36a' : '#f0b98c'}/><T x={680} y={330} size={13} color={C.muted}>juice share {wrong ? `${c.a + 1}/${c.a + c.b + 2}` : `${c.a}/${c.a + c.b}`}</T></g>; }
  }
}

function Explore({c}: {c: PropConfig}) {
  const [a, setA] = useState(c.a), [b, setB] = useState(c.b), [k, setK] = useState(c.mode === 'direct' ? c.k : 2), [x, setX] = useState(c.mode === 'speed' ? c.time : c.mode === 'unit-price' ? c.qty : 3); const [v, setV] = useState(c.mode === 'speed' ? c.speed : c.mode === 'unit-price' ? c.price : c.product);
  switch (c.mode) {
    case 'direct': case 'inverse': { const inv = c.mode === 'inverse'; const y = inv ? v / x : k * x; const rows: [number, number][] = range(6).map(i => inv ? [i + 1, v / (i + 1)] : [i + 1, k * (i + 1)]);
      return <Stage label="Proportion graph" controls={<>{inv ? <Slider label="Product" value={v} min={6} max={60} step={6} onChange={setV}/> : <Slider label="Constant k" value={k} min={1} max={9} onChange={setK}/>}<Slider label="x" value={x} min={1} max={6} onChange={setX}/><Readout>x = {x}, y = {fmt(y, 2)} · {inv ? `x × y = ${v}` : `y ÷ x = ${k}`}</Readout></>}>
        <Table rows={rows} head={['x', 'y']} y={80}/><Graph pts={rows} curve={inv} xmax={7} ymax={inv ? v * 1.1 : k * 7}/></Stage>; }
    case 'speed': return <Stage label="Speed" controls={<><Slider label="Speed (km/h)" value={v} min={10} max={120} step={5} onChange={setV}/><Slider label="Hours" value={x} min={1} max={8} onChange={setX}/><Readout>{v} km/h × {x} h = {v * x} km</Readout></>}><Scene c={{...c, speed: v, time: x}} scene={2} p={1}/></Stage>;
    case 'unit-price': return <Stage label="Unit price" controls={<><Stepper label="Unit price" value={v} min={1} max={20} onChange={setV}/><Stepper label="Quantity" value={x} min={1} max={7} onChange={setX}/><Readout>total = {v} × {x} = {v * x} yuan</Readout></>}><Scene c={{...c, price: v, qty: x}} scene={4} p={1}/></Stage>;
    case 'divide': { const total = (a + b) * k; return <Stage label="Share in a ratio" controls={<><Stepper label="Ratio first" value={a} min={1} max={6} onChange={setA}/><Stepper label="Ratio second" value={b} min={1} max={6} onChange={setB}/><Stepper label="One part" value={k} min={1} max={10} onChange={setK}/><Readout>{total} shared {a} : {b} → {a * k} and {b * k}</Readout></>}><Scene c={{...c, a, b, total}} scene={4} p={1}/></Stage>; }
    default: return <Stage label="Recipe" controls={<><Stepper label="Juice" value={a} min={1} max={6} onChange={setA}/><Stepper label="Water" value={b} min={1} max={6} onChange={setB}/><Slider label="Scale ×" value={k} min={1} max={4} onChange={setK}/><Readout>{a * k} : {b * k} = {a / gcd(a, b)} : {b / gcd(a, b)} · value {fmt(a / b, 3)}</Readout></>}>
      <Cups a={a} b={b} scale={k}/><T x={W / 2} y={60} size={24}>{a * k} : {b * k}</T></Stage>;
  }
}

export const proportionView: EngineView<PropConfig> = {Scene: props => <Stage label={proportion.describe(props.c)}><Scene {...props}/></Stage>, Explore};

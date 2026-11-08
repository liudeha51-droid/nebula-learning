'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Stepper} from '../stage';
import {percent, type PercentConfig} from '@/lib/universe/engines/percent';
import {fix, fmt} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

function Grid100({x, y, s = 26, cells, color = C.hundreds}: {x: number; y: number; s?: number; cells: number; color?: string}) {
  return <g>{range(100).map(i => { const col = i % 10, row = Math.floor(i / 10); const f = Math.max(0, Math.min(1, cells - i)); return <g key={i}><rect x={x + col * s} y={y + row * s} width={s - 2} height={s - 2} rx={2} fill="#26233a"/>{f > 0 && <rect x={x + col * s} y={y + row * s} width={(s - 2) * f} height={s - 2} rx={2} fill={color}/>}</g>; })}</g>;
}
function Bar({x, y, w = 560, h = 40, pct, label, color = C.tens, ticks = true, valueLabel}: {x: number; y: number; w?: number; h?: number; pct: number; label?: string; color?: string; ticks?: boolean; valueLabel?: string}) {
  return <g><rect x={x} y={y} width={w} height={h} rx={6} fill="#1f1d2b" stroke={C.line}/><rect x={x} y={y} width={Math.max(0, w * pct / 100)} height={h} rx={6} fill={color} opacity={.75}/>
    {ticks && range(9).map(i => <line key={i} x1={x + (w * (i + 1)) / 10} x2={x + (w * (i + 1)) / 10} y1={y} y2={y + h} stroke="#fff" strokeOpacity={.15}/>)}
    {label && <T x={x - 12} y={y + h / 2} size={14} anchor="end" color={C.muted}>{label}</T>}{valueLabel && <T x={x + Math.max(40, w * pct / 100) + 8} y={y + h / 2} size={15} anchor="start">{valueLabel}</T>}</g>;
}

function Scene({c, scene, p}: {c: PercentConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'convert': { const v = c.n / c.d; return <g><Bar x={120} y={70} pct={scene >= 0 ? v * 100 : 0} color={C.ones} ticks={false}/>{range(c.d - 1).map(i => <line key={i} x1={120 + 560 * (i + 1) / c.d} x2={120 + 560 * (i + 1) / c.d} y1={70} y2={110} stroke="#fff" strokeOpacity={.4}/>)}
      {scene >= 3 && <Grid100 x={270} y={140} s={26} cells={v * 100 * (scene === 3 ? p : 1)}/>}<T x={W / 2} y={40} size={24} weight={600}>{scene >= 4 ? `${c.n}/${c.d} = ${fmt(v)} = ${fmt(v * 100)}%` : scene >= 2 ? `${c.n} ÷ ${c.d} = ${fmt(v)}` : `${c.n}/${c.d}`}</T></g>; }
    case 'of-quantity': { const tens = scene < 2 ? 0 : scene === 2 ? 1 : scene === 3 ? Math.ceil(p * c.pct / 10) : c.pct / 10;
      return <g><Bar x={120} y={170} pct={0} label="100%"/>{range(10).map(i => <g key={i}><rect x={120 + i * 56} y={170} width={54} height={40} fill={i < tens ? C.tens : 'transparent'} opacity={.75}/><T x={148 + i * 56} y={230} size={12} color={C.muted}>{fmt(c.whole / 10)}</T></g>)}
        <T x={400} y={140} size={18} color={C.muted}>{c.whole} = 100%</T><T x={W / 2} y={60} size={24} weight={600}>{scene >= 4 ? `${c.pct}% of ${c.whole} = ${fmt(fix(c.whole * c.pct / 100))}` : `${Math.min(tens * 10, c.pct)}% = ${fmt(fix(Math.min(tens * 10, c.pct) * c.whole / 100))}`}</T></g>; }
    case 'change': { const up = c.base * (1 + c.pct / 100); const scale = 400 / (c.base * 1.6); const down2 = up * (1 - c.pct / 100);
      return <g><Bar x={160} y={110} w={c.base * scale} pct={100} label="before" ticks={false} color={C.hundreds} valueLabel={fmt(c.base)}/>
        {scene >= 2 && <Bar x={160} y={190} w={up * scale} pct={100} label={`+${c.pct}%`} ticks={false} color={C.tens} valueLabel={fmt(fix(up))}/>}
        {scene >= 3 && <Bar x={160} y={270} w={down2 * scale} pct={100} label={`then −${c.pct}%`} ticks={false} color={C.warn} valueLabel={fmt(fix(down2))}/>}
        {scene >= 3 && <line x1={160 + c.base * scale} x2={160 + c.base * scale} y1={95} y2={320} stroke={C.ink} strokeDasharray="4 4"/>}
        <T x={W / 2} y={50} size={22} weight={600}>{scene >= 3 ? `${fmt(c.base)} → ${fmt(fix(up))} → ${fmt(fix(down2))}` : `${fmt(c.base)} × ${fmt(1 + c.pct / 100)} = ${fmt(fix(up))}`}</T></g>; }
    case 'discount': { const pay = c.price * c.pct / 100; return <g><Bar x={140} y={150} pct={scene >= 2 ? c.pct : 100} label="price" color={C.ones} valueLabel={scene >= 2 ? `${fmt(pay)} yuan (${c.pct}%)` : `${c.price} yuan`}/>
      {scene >= 3 && <rect x={140 + 560 * c.pct / 100} y={150} width={560 * (100 - c.pct) / 100} height={40} fill={C.good} opacity={.35}/>}{scene >= 3 && <T x={140 + 560 * (100 + c.pct) / 200} y={215} size={15} color={C.good}>save {fmt(c.price - pay)}</T>}
      <rect x={300} y={260} width={200} height={90} rx={12} fill="#f2e7c9"/><T x={400} y={290} size={18} color="#b0412f" weight={700}>{c.pct / 10}折</T><T x={400} y={325} size={22} color="#15141d">¥{scene >= 4 ? fmt(pay) : c.price}</T></g>; }
    case 'interest': { const yearly = c.principal * c.rate / 100; const yrs = scene < 2 ? 0 : scene === 2 ? 1 : scene === 3 ? Math.ceil(p * c.years) : c.years; const scale = 260 / (c.principal + yearly * c.years);
      return <g>{range(c.years + 1).map(k => <g key={k}><rect x={170 + k * 120} y={380 - c.principal * scale} width={70} height={c.principal * scale} fill={C.hundreds} opacity={.6}/>{k > 0 && k <= yrs && range(k).map(j => <rect key={j} x={170 + k * 120} y={380 - c.principal * scale - (j + 1) * yearly * scale} width={70} height={yearly * scale - 1} fill={C.ones}/>)}<T x={205 + k * 120} y={400} size={13} color={C.muted}>year {k}</T></g>)}
        <T x={W / 2} y={50} size={22} weight={600}>{scene >= 4 ? `I = ${fmt(c.principal)} × ${c.rate}% × ${c.years} = ${fmt(fix(yearly * c.years))}` : `interest each year: ${fmt(fix(yearly))}`}</T></g>; }
    default: { const cells = scene < 2 ? 0 : scene === 2 ? c.pct * p : c.pct; return <g><Grid100 x={140} y={80} cells={cells}/>{scene >= 3 && <Bar x={460} y={180} w={280} pct={c.pct} color={C.hundreds}/>}
      <T x={W / 2} y={40} size={26} weight={600}>{scene >= 4 ? `${c.pct}% = ${c.pct}/100 = ${fmt(c.pct / 100)}` : `${Math.round(cells)}%`}</T></g>; }
  }
}

function Explore({c}: {c: PercentConfig}) {
  const [pct, setPct] = useState(c.mode === 'discount' ? c.pct : c.pct || 35); const [whole, setWhole] = useState(c.mode === 'change' ? c.base : c.mode === 'discount' ? c.price : c.mode === 'interest' ? c.principal : c.whole); const [n, setN] = useState(c.n), [d, setD] = useState(c.d); const [years, setYears] = useState(c.years);
  if (c.mode === 'convert') return <Stage label={`${n}/${d}`} controls={<><Stepper label="Numerator" value={n} min={0} max={d} onChange={setN}/><Stepper label="Denominator" value={d} min={1} max={25} onChange={setD}/><Readout>{n}/{d} = {fmt(n / d, 4)} = {fmt(n / d * 100, 2)}%</Readout></>}><Scene c={{...c, n, d}} scene={4} p={1}/></Stage>;
  if (c.mode === 'interest') return <Stage label="Interest" controls={<><Slider label="Rate %" value={pct} min={.5} max={5} step={.25} onChange={setPct}/><Slider label="Years" value={years} min={1} max={6} onChange={setYears}/><Readout>I = {fmt(whole)} × {pct}% × {years} = {fmt(fix(whole * pct / 100 * years))} yuan</Readout></>}><Scene c={{...c, rate: pct, years}} scene={4} p={1}/></Stage>;
  const result = c.mode === 'change' ? `${fmt(whole)} +${pct}% = ${fmt(fix(whole * (1 + pct / 100)))}; then −${pct}% = ${fmt(fix(whole * (1 + pct / 100) * (1 - pct / 100)))}` : c.mode === 'discount' ? `${pct / 10}折: pay ${fmt(fix(whole * pct / 100))} of ${fmt(whole)}` : c.mode === 'of-quantity' ? `${pct}% of ${fmt(whole)} = ${fmt(fix(whole * pct / 100))}` : `${pct}% = ${fmt(pct / 100)} = ${pct}/100`;
  return <Stage label={result} controls={<><Slider label="Percentage" value={pct} min={0} max={c.mode === 'grid' ? 150 : 100} step={c.mode === 'of-quantity' || c.mode === 'grid' ? 1 : 5} onChange={setPct}/>{c.mode !== 'grid' && <Stepper label="Base" value={whole} min={10} max={1000} step={10} onChange={setWhole}/>}<Readout>{result}</Readout></>}>
    {c.mode === 'grid' ? <><Grid100 x={140} y={80} cells={Math.min(100, pct)}/>{pct > 100 && <Grid100 x={420} y={80} s={18} cells={pct - 100} color={C.unknown}/>}<T x={W / 2} y={40} size={24}>{pct}%{pct > 100 ? ' — more than the whole' : ''}</T></>
      : <Scene c={{...c, pct, whole, base: whole, price: whole}} scene={c.mode === 'change' ? 4 : 4} p={1}/>}</Stage>;
}

export const percentView: EngineView<PercentConfig> = {Scene: props => <Stage label={percent.describe(props.c)}><Scene {...props}/></Stage>, Explore};

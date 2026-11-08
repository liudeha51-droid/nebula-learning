'use client';
import {useState} from 'react';
import {Stage, T, C, W, Stepper, Readout, Action, Slider} from '../stage';
import {decimal, dp, type DecimalConfig} from '@/lib/universe/engines/decimal';
import {fix, fmt, lerp, seg, eseg} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

/** Hundred grid: `cells` hundredths shaded column by column (tenths are columns). */
function Grid({x, y, s = 240, cells, cols = 10, rows = 10, color = C.hundreds, rowShade = 0, colShade = 0, overlapColor = C.unknown}: {x: number; y: number; s?: number; cells?: number; cols?: number; rows?: number; color?: string; rowShade?: number; colShade?: number; overlapColor?: string}) {
  const cw = s / 10;
  return <g><rect x={x} y={y} width={s} height={s} fill="#1f1d2b" stroke={C.ink} strokeWidth={2}/>
    {cells !== undefined && range(Math.round(cells)).map(i => <rect key={i} x={x + Math.floor(i / 10) * cw} y={y + (i % 10) * cw} width={cw} height={cw} fill={color} opacity={.75}/>)}
    {colShade > 0 && <rect x={x} y={y} width={colShade * cw} height={s} fill={C.ones} opacity={.35}/>}
    {rowShade > 0 && <rect x={x} y={y} width={colShade * cw} height={rowShade * cw} fill={overlapColor} opacity={.7}/>}
    {range(9).map(i => <line key={'c' + i} x1={x + (i + 1) * cw} x2={x + (i + 1) * cw} y1={y} y2={y + s} stroke="#fff" strokeOpacity={.45 * Math.min(1, cols / 10)} strokeWidth={1.5}/>)}
    {range(9).map(i => <line key={'r' + i} x1={x} x2={x + s} y1={y + (i + 1) * cw} y2={y + (i + 1) * cw} stroke="#fff" strokeOpacity={.3 * Math.min(1, rows / 10)}/>)}</g>;
}
const PLACES = ['hundreds', 'tens', 'ones', 'tenths', 'hundredths', 'thousandths'];
function PlaceChart({value, shift = 0}: {value: number; shift?: number}) {
  // digits of value at exponents 2..-3; shift moves digits by `shift` places (positive = left)
  const cw = 100, x0 = 100; const exps = [2, 1, 0, -1, -2, -3]; const colX = (e: number) => x0 + (2 - e) * cw + (e < 0 ? 24 : 0);
  const s = fix(value).toFixed(3); const [ip, fp] = s.split('.'); const ds: [number, number][] = [];
  ip.split('').forEach((d, i) => ds.push([ip.length - 1 - i, Number(d)])); fp.split('').forEach((d, i) => ds.push([-(i + 1), Number(d)]));
  const result = value * 10 ** Math.round(shift);
  const lead = Math.max(...ds.filter(([, d]) => d > 0).map(([e]) => e)), trail = Math.min(...ds.filter(([, d]) => d > 0).map(([e]) => e));
  return <g>{exps.map(e => <g key={e}><rect x={colX(e)} y={140} width={cw - 8} height={110} rx={8} fill={C.panel} stroke={C.line}/><T x={colX(e) + 46} y={160} size={12} color={C.muted}>{PLACES[2 - e]}</T></g>)}
    <circle cx={colX(0) + cw + 4} cy={230} r={7} fill={C.ink}/>
    {ds.filter(([e]) => e <= lead && e >= Math.min(trail, 0)).map(([e, d]) => { const ne = e + shift; if (ne > 2.5 || ne < -3.5) return null; return <T key={e} x={lerp(colX(Math.floor(ne)) + 46, colX(Math.ceil(ne)) + 46, ne - Math.floor(ne))} y={205} size={46} weight={700} color={[C.thousands, C.hundreds, C.ones, C.tens, C.accent, C.unknown][e + 3] ?? C.ink}>{d}</T>; })}
    <T x={W / 2} y={320} size={30} weight={600}>{fmt(fix(result), 6)}</T></g>;
}
function Coins({value}: {value: number}) {
  const y = Math.floor(value), j = Math.floor(fix(value * 10) % 10), f = Math.round(fix(value * 100) % 10);
  return <g>{range(y).map(i => <g key={'y' + i}><rect x={80 + (i % 5) * 34} y={120 + Math.floor(i / 5) * 10} width={110} height={60} rx={6} fill="#c87b6a" stroke="#fff3" transform={`rotate(-4 ${135 + i * 34} 150)`}/><T x={135 + (i % 5) * 34} y={150 + Math.floor(i / 5) * 10} size={16} color="#fff">1元</T></g>)}
    {range(j).map(i => <g key={'j' + i}><circle cx={380 + (i % 5) * 46} cy={130 + Math.floor(i / 5) * 46} r={20} fill="#d9b85c"/><T x={380 + (i % 5) * 46} y={130 + Math.floor(i / 5) * 46} size={12} color="#15141d">1角</T></g>)}
    {range(f).map(i => <g key={'f' + i}><circle cx={640 + (i % 3) * 36} cy={125 + Math.floor(i / 3) * 36} r={15} fill="#bfc6cf"/><T x={640 + (i % 3) * 36} y={125 + Math.floor(i / 3) * 36} size={10} color="#15141d">1分</T></g>)}
    <T x={190} y={260} size={18} color="#e0a090">{y} yuan · ones</T><T x={470} y={260} size={18} color={C.ones}>{j} jiao · tenths</T><T x={676} y={260} size={18} color="#bfc6cf">{f} fen · hundredths</T>
    <T x={W / 2} y={330} size={40} weight={700}><tspan fill="#e0a090">{y}</tspan>.<tspan fill={C.ones}>{j}</tspan><tspan fill="#bfc6cf">{f}</tspan> yuan</T></g>;
}

function Scene({c, scene, p}: {c: DecimalConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'compare': return <g><Grid x={110} y={100} cells={scene >= 2 ? Math.round(c.a * 100) * (scene === 2 ? p : 1) : 0} color={C.ones}/><Grid x={450} y={100} cells={scene >= 2 ? Math.round(c.b * 100) * (scene === 2 ? p : 1) : 0} color={C.tens}/>
      <T x={230} y={370} size={28} color={C.ones}>{c.a}</T><T x={570} y={370} size={28} color={C.tens}>{c.b}</T>
      <T x={W / 2} y={50} size={28} weight={600}>{scene >= 3 ? `${c.a.toFixed(2)} ${c.a > c.b ? '>' : '<'} ${c.b.toFixed(2)}` : `${c.a} ? ${c.b}`}</T></g>;
    case 'shift': { const sh = scene < 2 ? 0 : scene === 2 ? Math.min(2, eseg(p, 0, .45) + eseg(p, .55, 1)) : scene === 3 ? 2 - eseg(p, 0, .4) * 3 - eseg(p, .5, .9) : scene >= 4 ? 1 : 0;
      return <g><PlaceChart value={c.value} shift={sh}/><T x={W / 2} y={60} size={24}>{scene === 3 ? '÷ 10: every digit moves one place right' : scene >= 4 ? 'The point stays; the digits move' : '× 10: every digit moves one place left'}</T></g>; }
    case 'multiply': { const grid = c.b < 1; const A = Math.round(c.a * 10);
      if (grid) { const B = Math.round(c.b * 10); return <g><Grid x={280} y={90} colShade={scene >= 2 ? A * (scene === 2 ? p : 1) : 0} rowShade={scene >= 3 ? B * (scene === 3 ? p : 1) : 0}/>
        <T x={W / 2} y={50} size={26} weight={600}>{c.a} × {c.b} = {scene >= 4 ? fmt(c.a * c.b) : '?'}</T>{scene >= 4 && <T x={W / 2} y={370} size={20} color={C.unknown}>{A * B} of 100 small squares</T>}</g>; }
      const groups = scene < 3 ? 1 : scene === 3 ? Math.max(1, Math.ceil(p * c.b)) : c.b;
      return <g>{range(groups).map(g => <g key={g}>{range(A).map(i => <rect key={i} x={120 + i * 28 + Math.floor((g * A + i) / 10) * 8} y={100 + g * 40} width={24} height={30} rx={3} fill={Math.floor((g * A + i) / 10) % 2 ? C.tens : C.ones}/>)}</g>)}
        <T x={W / 2} y={50} size={26} weight={600}>{c.b} × {c.a} = {groups * A} tenths{scene >= 4 ? ` = ${fmt(c.a * c.b)}` : ''}</T></g>; }
    case 'divide': { const k = 10 ** Math.max(dp(c.a), dp(c.b)); const q = c.a / c.b; const X = (v: number) => 100 + (v / Math.ceil(c.a)) * 600; const fit = scene < 2 ? 0 : scene === 2 ? Math.floor(p * q) : Math.floor(q + 1e-9);
      return <g><rect x={100} y={160} width={X(c.a) - 100} height={40} rx={6} fill={C.hundreds} opacity={.4}/>
        {range(fit).map(i => <rect key={i} x={X(i * c.b) + 1} y={215} width={X(c.b) - 100 - 2} height={30} rx={4} fill={i % 2 ? C.ones : C.tens}/>)}
        {range(Math.ceil(c.a) + 1).map(i => <T key={i} x={X(i)} y={275} size={16}>{i}</T>)}
        <T x={W / 2} y={60} size={26} weight={600}>{scene >= 3 ? `${c.a} ÷ ${c.b} = ${fmt(c.a * k)} ÷ ${fmt(c.b * k)} = ${fmt(q)}` : `${c.a} ÷ ${c.b} = ?`}</T>
        {scene >= 3 && <T x={W / 2} y={340} size={18} color={C.muted}>Measured in {k === 10 ? 'tenths' : 'hundredths'}: {fmt(c.a * k)} units ÷ {fmt(c.b * k)} units — the same number of pieces</T>}</g>; }
    case 'money': return <g>{scene >= 2 ? <Coins value={c.value}/> : <><rect x={300} y={140} width={200} height={110} rx={14} fill="#f2e7c9"/><T x={400} y={195} size={40} weight={700} color="#15141d">¥{c.value.toFixed(2)}</T></>}
      {scene >= 3 && <T x={W / 2} y={390} size={18} color={C.muted}>1 jiao = 0.1 yuan · 1 fen = 0.01 yuan</T>}</g>;
    default: { const cols = scene >= 2 ? (scene === 2 ? seg(p, 0, .6) * 10 : 10) : 0; const rows = c.places > 1 && scene >= 3 ? (scene === 3 ? seg(p, 0, .6) * 10 : 10) : 0;
      const cells = scene >= (c.places > 1 ? 4 : 3) ? Math.round(c.value * 100) * (scene === 3 ? eseg(p, .4, 1) : 1) : 0;
      return <g><Grid x={280} y={90} cells={cells} cols={cols} rows={rows}/>{cols === 0 && <rect x={280} y={90} width={240} height={240} fill="#1f1d2b"/>}
        <T x={W / 2} y={50} size={28} weight={600}>{scene >= 4 ? String(c.value) : scene >= 2 ? (rows > 0 ? 'hundredths: 0.01 each' : 'tenths: 0.1 each') : '1 whole'}</T>
        {scene >= 5 && <T x={W / 2} y={370} size={20} color={C.muted}>{c.places > 1 ? `${Math.round(c.value * 100)}/100` : `${Math.round(c.value * 10)}/10`} = {c.value}</T>}
        <rect x={280} y={90} width={240} height={240} fill="none" stroke={C.ink} strokeWidth={2}/></g>; }
  }
}

function Explore({c}: {c: DecimalConfig}) {
  const [v, setV] = useState(Math.round((c.mode === 'compare' || c.mode === 'multiply' || c.mode === 'divide' ? c.a : c.value) * 100));
  const [w, setW] = useState(Math.round(c.b * 100)); const [shift, setShift] = useState(0);
  if (c.mode === 'shift') { const val = c.value; return <Stage label={`${val} times ten to the ${shift}`} controls={<><Action onClick={() => setShift(Math.min(2, shift + 1))} disabled={shift >= 2}>× 10</Action><Action onClick={() => setShift(Math.max(-2, shift - 1))} disabled={shift <= -2}>÷ 10</Action><Readout>{val} {shift >= 0 ? '×' : '÷'} {10 ** Math.abs(shift)} = {fmt(val * 10 ** shift, 6)}</Readout></>}><g style={{transition: 'all .5s'}}><PlaceChart value={val} shift={shift}/></g></Stage>; }
  if (c.mode === 'money') { const val = v / 100; return <Stage label={`${val} yuan`} controls={<><Slider label="Price (fen)" value={v} min={1} max={999} onChange={setV}/><Readout>{val.toFixed(2)} yuan = {Math.floor(val)} 元 {Math.floor(v / 10) % 10} 角 {v % 10} 分</Readout></>}><Coins value={val}/></Stage>; }
  if (c.mode === 'compare') return <Stage label={`${v / 100} and ${w / 100}`} controls={<><Slider label="A (hundredths)" value={v} min={0} max={100} onChange={setV}/><Slider label="B (hundredths)" value={w} min={0} max={100} onChange={setW}/><Readout>{(v / 100).toFixed(2)} {v > w ? '>' : v < w ? '<' : '='} {(w / 100).toFixed(2)}</Readout></>}><Scene c={{...c, a: v / 100, b: w / 100}} scene={4} p={1}/></Stage>;
  if (c.mode === 'multiply') { const a = Math.max(1, Math.round(v / 10)) / 10; const b = c.b < 1 ? Math.max(1, Math.round(w / 10)) / 10 : c.b; return <Stage label={`${a} times ${b}`} controls={<><Stepper label="First (tenths)" value={a} min={.1} max={.9} step={.1} onChange={x => setV(Math.round(x * 100))} format={x => x.toFixed(1)}/>{c.b < 1 && <Stepper label="Second (tenths)" value={b} min={.1} max={.9} step={.1} onChange={x => setW(Math.round(x * 100))} format={x => x.toFixed(1)}/>}<Readout>{a} × {b} = {fmt(a * b)}</Readout></>}><Scene c={{...c, a, b}} scene={4} p={1}/></Stage>; }
  if (c.mode === 'divide') { const b = Math.max(1, Math.round(w / 10)) / 10; const a = c.a; return <Stage label={`${a} divided by ${b}`} controls={<><Stepper label="Divisor" value={b} min={.1} max={2} step={.1} onChange={x => setW(Math.round(x * 100))} format={x => x.toFixed(1)}/><Readout>{a} ÷ {b} = {fmt(a / b, 4)}</Readout></>}><Scene c={{...c, b}} scene={4} p={1}/></Stage>; }
  const val = v / 100;
  return <Stage label={`${val} of a whole`} controls={<><Slider label="Hundredths shaded" value={v} min={0} max={100} onChange={setV}/><Readout>{val.toFixed(2)} = {Math.floor(v / 10)} tenths + {v % 10} hundredths = {v}/100</Readout></>}>
    <Grid x={280} y={90} cells={v}/><T x={W / 2} y={50} size={30} weight={600}>{val.toFixed(2)}</T></Stage>;
}

export const decimalView: EngineView<DecimalConfig> = {Scene: props => <Stage label={decimal.describe(props.c)}><Scene {...props}/></Stage>, Explore};

'use client';
import {useState} from 'react';
import {Stage, Obj, T, C, W, Stepper, Readout, Action, Slider} from '../stage';
import {array, parts, roundLead, type ArrayConfig} from '@/lib/universe/engines/array';
import {eseg, fmt, lerp, seg} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const GROUP_COLORS = [C.ones, C.tens, C.hundreds, C.thousands, C.accent, C.unknown, '#c8e07a', '#ffd0a0', '#9fd8ff', '#e0b0ff'];

function Dots({rows, cols, cx = W / 2, cy = 230, size = 34, rotate = 0, kind = 'dot', colorBy = 'row', split = -1, gap = 0}: {rows: number; cols: number; cx?: number; cy?: number; size?: number; rotate?: number; kind?: ArrayConfig['object']; colorBy?: 'row' | 'split' | 'none'; split?: number; gap?: number}) {
  return <g transform={`rotate(${rotate} ${cx} ${cy})`}>{range(rows).map(r => range(cols).map(k => {
    const x = cx + (k - (cols - 1) / 2) * size + (split >= 0 ? (k >= split ? gap / 2 : -gap / 2) : 0), y = cy + (r - (rows - 1) / 2) * size;
    const color = colorBy === 'row' ? GROUP_COLORS[r % 10] : colorBy === 'split' ? (k < split ? C.ones : C.tens) : C.ones;
    return <Obj key={r + '-' + k} kind={kind === 'dot' ? 'dot' : kind} x={x} y={y} r={size * .38} color={color}/>;
  }))}</g>;
}

function GroupsScene({c, scene, p}: {c: ArrayConfig; scene: number; p: number}) {
  const {rows, cols} = c; const toArray = scene === 3 ? eseg(p, .1, .8) : scene > 3 ? 1 : 0;
  const shownSum = scene === 2 ? Math.min(rows, Math.floor(p * (rows + .5))) : scene > 2 ? rows : 0;
  const size = Math.min(40, 330 / Math.max(rows, cols));
  const bagX = (g: number) => 110 + (g % 5) * 145, bagY = (g: number) => 140 + Math.floor(g / 5) * 150;
  return <g>
    {range(rows).map(g => <g key={g}>
      <circle cx={bagX(g)} cy={bagY(g)} r={60} fill="none" stroke={GROUP_COLORS[g % 10]} strokeDasharray="5 6" opacity={1 - toArray}/>
      {range(cols).map(k => { const ang = (k / cols) * Math.PI * 2; const bx = bagX(g) + Math.cos(ang) * (cols > 1 ? 32 : 0), by = bagY(g) + Math.sin(ang) * (cols > 1 ? 32 : 0);
        const ax = W / 2 + (k - (cols - 1) / 2) * size, ay = 230 + (g - (rows - 1) / 2) * size;
        return <Obj key={k} kind={c.object === 'dot' ? 'dot' : c.object} x={lerp(bx, ax, toArray)} y={lerp(by, ay, toArray)} r={Math.min(15, size * .4)} color={GROUP_COLORS[g % 10]} glow={scene === 2 && g === shownSum - 1}/>; })}
    </g>)}
    {scene === 2 && <T x={W / 2} y={410} size={24}>{range(shownSum).map(() => cols).join(' + ') || '…'}{shownSum ? ` = ${shownSum * cols}` : ''}</T>}
    {toArray >= 1 && <><T x={W / 2 - (cols * size) / 2 - 30} y={230} size={20} color={C.muted}>{rows} rows</T><T x={W / 2} y={230 - (rows * size) / 2 - 22} size={20} color={C.muted}>{cols} in each row</T></>}
    {scene >= 4 && <T x={W / 2} y={410} size={28} weight={700}>{rows} × {cols} = {rows * cols}</T>}
    {scene === 1 && <T x={W / 2} y={410} size={24} color={C.accent}>How many altogether?</T>}
  </g>;
}
function CommuteScene({c, scene, p}: {c: ArrayConfig; scene: number; p: number}) {
  const rot = scene === 3 ? 90 * eseg(p, .15, .85) : scene > 3 ? 90 : 0; const size = Math.min(44, 300 / Math.max(c.rows, c.cols));
  const rowsNow = rot >= 90 ? c.cols : c.rows, colsNow = rot >= 90 ? c.rows : c.cols;
  return <g><Dots rows={c.rows} cols={c.cols} size={size} rotate={rot} colorBy={scene === 2 ? 'row' : 'none'}/>
    <T x={W / 2} y={50} size={26} weight={600}>{scene >= 5 ? `${c.rows} × ${c.cols} = ${c.cols} × ${c.rows} = ${c.rows * c.cols}` : `${rowsNow} rows of ${colsNow}`}</T>
    {scene === 4 && <T x={W / 2} y={415} size={22}>{Array(c.cols).fill(c.rows).join(' + ')} = {c.rows * c.cols}</T>}
    {scene === 2 && <T x={W / 2} y={415} size={22}>{Array(c.rows).fill(c.cols).join(' + ')} = {c.rows * c.cols}</T>}</g>;
}
function TableScene({c, scene, p}: {c: ArrayConfig; scene: number; p: number}) {
  const k = scene < 2 ? 1 : scene === 2 ? 1 + Math.floor(p * 8.99) : 9; const size = 26;
  return <g><Dots rows={k} cols={c.n} cx={220} cy={50 + (k * size) / 2 + 20} size={size} colorBy={scene === 3 ? 'none' : 'row'}/>
    {range(k).map(i => <T key={i} x={480} y={70 + i * 36} size={20} anchor="start" mono color={i === k - 1 ? C.ones : C.ink}>{c.n} × {i + 1} = {c.n * (i + 1)}</T>)}
    {scene === 3 && <g><rect x={220 - (c.n * size) / 2 - 4} y={70 + 5 * size - 2} width={c.n * size + 8} height={2 * size} fill="none" stroke={C.tens} strokeWidth={2} rx={4}/><T x={680} y={330} size={18} color={C.tens}>{c.n}×5 + {c.n}×2</T></g>}</g>;
}

function AreaModel({a, b, reveal, estimate = false}: {a: number; b: number; reveal: number; estimate?: boolean}) {
  const pa = parts(a), pb = parts(b); const totalW = 560, totalH = 250; const x0 = 140, y0 = 90;
  // Width proportional to value, with a minimum so small parts stay readable.
  const scale = (ps: number[], total: number) => { const raw = ps.map(v => Math.max(v, (ps.reduce((s, x) => s + x, 0)) * .12)); const sum = raw.reduce((s, x) => s + x, 0); return raw.map(v => (v / sum) * total); };
  const wa = scale(pa, totalW), hb = scale(pb, totalH);
  const xs = wa.map((_, i) => x0 + wa.slice(0, i).reduce((s, v) => s + v, 0)); const ys = hb.map((_, j) => y0 + hb.slice(0, j).reduce((s, v) => s + v, 0));
  return <g>{pa.map((va, i) => { const cx = xs[i];
    return <g key={i}>{pb.map((vb, j) => { const cy = ys[j]; const idx = i * pb.length + j; const on = reveal > idx;
      return <g key={j}><rect x={cx} y={cy} width={wa[i] - 3} height={hb[j] - 3} rx={4} fill={[C.hundreds, C.tens, C.ones, C.thousands][(i + j) % 4]} opacity={on ? .55 : .15} stroke="#ffffff33"/>
        {on && <T x={cx + wa[i] / 2} y={cy + hb[j] / 2} size={Math.min(20, wa[i] / 5)} weight={600}>{fmt(va)}×{fmt(vb)}={fmt(va * vb)}</T>}</g>; })}
      <T x={cx + wa[i] / 2} y={y0 - 16} size={18} color={C.ones}>{fmt(va)}</T></g>; })}
    {pb.map((vb, j) => <T key={j} x={x0 - 30} y={y0 + hb.slice(0, j).reduce((s, v) => s + v, 0) + hb[j] / 2} size={18} color={C.tens}>{vb}</T>)}
    {estimate && <rect x={x0} y={y0 - 4} width={totalW * roundLead(a) / a} height={totalH + 6} fill="none" stroke={C.warn} strokeDasharray="6 5" strokeWidth={2}/>}</g>;
}
function AreaScene({c, scene, p}: {c: ArrayConfig; scene: number; p: number}) {
  const n = parts(c.a).length * parts(c.b).length; const reveal = scene < 3 ? 0 : scene === 3 ? Math.ceil(p * n) : n;
  const pp = parts(c.a).flatMap(x => parts(c.b).map(y => x * y));
  return <g>{scene < 2 ? <rect x={140} y={90} width={560} height={250} rx={4} fill={C.hundreds} opacity={.35}/> : <AreaModel a={c.a} b={c.b} reveal={reveal} estimate={c.estimate && scene >= 5}/>}
    {scene < 2 && <><T x={420} y={74} size={18} color={C.ones}>{fmt(c.a)}</T><T x={110} y={215} size={18} color={C.tens}>{c.b}</T></>}
    <T x={W / 2} y={40} size={24} weight={600}>{scene >= 4 ? `${pp.map(fmt).join(' + ')} = ${fmt(c.a * c.b)}` : `${fmt(c.a)} × ${c.b} = ?`}</T>
    {scene >= 5 && c.estimate && <T x={W / 2} y={395} size={18} color={C.warn}>Estimate: {fmt(roundLead(c.a))} × {c.b} = {fmt(roundLead(c.a) * c.b)}</T>}
    {scene === 5 && !c.estimate && <T x={W / 2} y={395} size={17} color={C.muted}>Written method: each line of the vertical calculation is one of these coloured pieces.</T>}</g>;
}
function DistributiveScene({c, scene, p}: {c: ArrayConfig; scene: number; p: number}) {
  const gap = scene === 3 ? 60 * eseg(p, .1, .6) : scene === 4 ? 60 * (1 - eseg(p, .3, .9)) : 0; const size = Math.min(40, 560 / (c.b + c.c + 2));
  return <g><Dots rows={c.a} cols={c.b + c.c} size={size} colorBy={scene >= 2 ? 'split' : 'none'} split={c.b} gap={gap}/>
    {scene >= 2 && <line x1={W / 2 + (c.b - (c.b + c.c) / 2) * size} x2={W / 2 + (c.b - (c.b + c.c) / 2) * size} y1={230 - (c.a * size) / 2 - 10} y2={230 + (c.a * size) / 2 + 10} stroke={C.unknown} strokeWidth={2} strokeDasharray="6 4" opacity={seg(scene === 2 ? p : 1, 0, .4)}/>}
    <T x={W / 2} y={45} size={24} weight={600}>{scene >= 3 ? `${c.a} × ${c.b} + ${c.a} × ${c.c} = ${c.a * c.b} + ${c.a * c.c} = ${c.a * (c.b + c.c)}` : `${c.a} × (${c.b} + ${c.c}) = ?`}</T>
    {scene >= 5 && <T x={W / 2} y={415} size={22} color={C.accent}>a × (b + c) = a × b + a × c</T>}</g>;
}

function GroupsExplore({c}: {c: ArrayConfig}) {
  const [rows, setRows] = useState(c.rows), [cols, setCols] = useState(c.cols), [rot, setRot] = useState(false);
  const size = Math.min(40, 320 / Math.max(rows, cols));
  return <Stage label={`${rows} by ${cols} array`} controls={<><Stepper label="Rows (groups)" value={rows} min={1} max={10} onChange={setRows}/><Stepper label="In each row" value={cols} min={1} max={10} onChange={setCols}/><Action onClick={() => setRot(!rot)}>Rotate ↻</Action>
    <Readout>{rot ? `${cols} rows of ${rows}: ${cols} × ${rows}` : `${rows} rows of ${cols}: ${rows} × ${cols}`} = {rows * cols}</Readout></>}>
    <g style={{transform: rot ? 'rotate(90deg)' : 'rotate(0deg)', transformOrigin: '400px 230px', transition: 'transform .7s ease'}}><Dots rows={rows} cols={cols} size={size} kind={c.object}/></g>
    <T x={W / 2} y={40} size={22}>{Array(rot ? cols : rows).fill(rot ? rows : cols).join(' + ')} = {rows * cols}</T>
  </Stage>;
}
function TableExplore({c}: {c: ArrayConfig}) {
  const [n, setN] = useState(c.n), [k, setK] = useState(5);
  return <Stage label={`${n} times ${k}`} controls={<><Stepper label="Table" value={n} min={1} max={9} onChange={setN}/><Slider label="Groups" value={k} min={1} max={9} onChange={setK}/><Readout>{n} × {k} = {n * k} · {n} × {k + 1} = {n * k} + {n} = {n * (k + 1)}</Readout></>}>
    <Dots rows={k} cols={n} cx={W / 2} cy={225} size={Math.min(38, 340 / Math.max(n, k))} colorBy="row"/>
  </Stage>;
}
function AreaExplore({c}: {c: ArrayConfig}) {
  const [a, setA] = useState(c.a), [b, setB] = useState(c.b);
  const pp = parts(a).flatMap(x => parts(b).map(y => x * y));
  return <Stage label={`${a} times ${b} area model`} controls={<><Stepper label="First factor" value={a} min={10} max={999} onChange={setA}/><Stepper label="Second factor" value={b} min={1} max={99} onChange={setB}/>
    <Readout>{pp.map(fmt).join(' + ')} = {fmt(a * b)} · estimate {fmt(roundLead(a) * roundLead(b))}</Readout></>}>
    <AreaModel a={a} b={b} reveal={99}/><T x={W / 2} y={40} size={24}>{fmt(a)} × {b} = {fmt(a * b)}</T>
  </Stage>;
}
function DistributiveExplore({c}: {c: ArrayConfig}) {
  const [a, setA] = useState(c.a); const total = c.b + c.c; const [split, setSplit] = useState(c.b);
  return <Stage label={`${a} times ${total} split at ${split}`} controls={<><Stepper label="Rows" value={a} min={1} max={10} onChange={setA}/><Slider label="Cut after column" value={split} min={0} max={total} onChange={setSplit}/>
    <Readout>{a} × {total} = {a} × {split} + {a} × {total - split} = {a * split} + {a * (total - split)} = {a * total}</Readout></>}>
    <Dots rows={a} cols={total} size={Math.min(40, 560 / (total + 2))} colorBy="split" split={split} gap={40}/>
  </Stage>;
}

export const arrayView: EngineView<ArrayConfig> = {
  Scene: props => <Stage label={array.describe(props.c)}>{props.c.mode === 'commute' ? <CommuteScene {...props}/> : props.c.mode === 'table' ? <TableScene {...props}/> : props.c.mode === 'area' ? <AreaScene {...props}/> : props.c.mode === 'distributive' ? <DistributiveScene {...props}/> : <GroupsScene {...props}/>}</Stage>,
  Explore: ({c}) => c.mode === 'table' ? <TableExplore c={c}/> : c.mode === 'area' ? <AreaExplore c={c}/> : c.mode === 'distributive' ? <DistributiveExplore c={c}/> : <GroupsExplore c={c}/>,
};

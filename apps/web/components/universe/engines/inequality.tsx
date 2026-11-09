'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Stepper} from '../stage';
import {inequality, type IneqConfig} from '@/lib/universe/engines/inequality';
import {eseg, fmt, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const X = (v: number) => 400 + v * 45;
function NLine({y = 280}: {y?: number}) { return <g><line x1={40} x2={760} y1={y} y2={y} stroke={C.muted} strokeWidth={2}/>{range(17).map(i => { const v = i - 8; return <g key={v}><line x1={X(v)} x2={X(v)} y1={y - 6} y2={y + 6} stroke={C.muted}/><T x={X(v)} y={y + 22} size={12}>{v}</T></g>; })}</g>; }
function Ray({at, dir, closed, y, color, t = 1}: {at: number; dir: 1 | -1; closed: boolean; y: number; color: string; t?: number}) {
  const end = dir > 0 ? lerp(X(at), 760, t) : lerp(X(at), 40, t);
  return <g><line x1={X(at)} x2={end} y1={y} y2={y} stroke={color} strokeWidth={5}/><circle cx={X(at)} cy={y} r={8} fill={closed ? color : '#15141d'} stroke={color} strokeWidth={3}/></g>;
}
function AmGm({a, b, k = 1}: {a: number; b: number; k?: number}) {
  const s = 300 / (a + b); const A = a * s, B = b * s, S = A + B; const x0 = 120, y0 = 60;
  const rects: [number, number, number, number][] = [[0, 0, B, A], [B, 0, A, B], [A, B, B, A], [0, A, A, B]];
  return <g transform={`translate(${x0} ${y0})`}><rect width={S} height={S} fill="#1f1d2b" stroke={C.ink}/>{rects.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={[C.ones, C.tens, C.hundreds, C.accent][i]} opacity={.7 * k} stroke="#15141d"/>)}
    <rect x={A} y={A} width={B - A} height={B - A} fill={C.unknown} opacity={.6}/><T x={S / 2} y={-14} size={14}>a + b = {a + b}</T></g>;
}

function Scene({c, scene, p}: {c: IneqConfig; scene: number; p: number}) {
  const {a, b} = c;
  if (c.mode === 'am-gm') return <g><AmGm a={a} b={b} k={scene < 2 ? .2 : scene === 2 ? eseg(p, 0, .8) : 1}/><T x={620} y={150} size={18}>(a + b)/2 = {fmt((a + b) / 2)}</T><T x={620} y={185} size={18}>√(ab) = {fmt(Math.sqrt(a * b), 3)}</T>{scene >= 3 && <T x={620} y={230} size={16} color={C.unknown}>hole (b − a)² = {(b - a) ** 2}</T>}{scene >= 4 && <T x={620} y={270} size={18} color={C.good}>(a + b)² ≥ 4ab</T>}</g>;
  if (c.mode === 'properties') { const flip = scene >= 3 ? (scene === 3 ? eseg(p, .1, .9) : 1) : 0; const shift = scene === 2 ? 3 * eseg(p, .1, .9) : scene > 2 ? 0 : 0; const va = lerp(a + shift, -a, flip), vb = lerp(b + shift, -b, flip);
    return <g><NLine/><circle cx={X(va)} cy={280} r={9} fill={C.ones}/><T x={X(va)} y={250} size={14} color={C.ones}>{flip > .5 ? `−${a}` : `${fmt(a + shift, 1)}`}</T><circle cx={X(vb)} cy={280} r={9} fill={C.tens}/><T x={X(vb)} y={250} size={14} color={C.tens}>{flip > .5 ? `−${b}` : fmt(b + shift, 1)}</T>
      <T x={W / 2} y={120} size={28} weight={600}>{flip > .5 ? `−${a} > −${b}` : `${fmt(a + shift, 1)} < ${fmt(b + shift, 1)}`}</T>{scene >= 4 && <T x={W / 2} y={170} size={18} color={C.warn}>× negative → the order flips</T>}</g>; }
  const t1 = scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .5) : 1, t2 = scene < 2 ? 0 : scene === 2 ? eseg(p, .5, 1) : 1;
  return <g><NLine y={320}/>{t1 > 0 && <Ray at={a} dir={1} closed={false} y={220} color={C.ones} t={t1}/>}{t2 > 0 && <Ray at={b} dir={-1} closed y={260} color={C.tens} t={t2}/>}{scene >= 3 && <><rect x={X(a)} y={300} width={X(b) - X(a)} height={40} fill={C.good} opacity={.2}/><circle cx={X(a)} cy={320} r={8} fill="#15141d" stroke={C.good} strokeWidth={3}/><circle cx={X(b)} cy={320} r={8} fill={C.good}/></>}
    <T x={W / 2} y={80} size={26} weight={600}>{scene >= 4 ? `${a} < x ≤ ${b}` : `x > ${a} and x ≤ ${b}`}</T></g>;
}

function Explore({c}: {c: IneqConfig}) {
  const [a, setA] = useState(c.a), [b, setB] = useState(c.b);
  if (c.mode === 'am-gm') return <Stage label="AM-GM" controls={<><Slider label="a" value={a} min={1} max={10} step={.5} onChange={setA}/><Slider label="b" value={b} min={1} max={10} step={.5} onChange={setB}/><Readout>(a + b)/2 = {fmt((a + b) / 2, 2)} ≥ √(ab) = {fmt(Math.sqrt(a * b), 3)} {a === b ? '— equal when a = b!' : ''}</Readout></>}><AmGm a={Math.min(a, b)} b={Math.max(a, b)}/></Stage>;
  return <Stage label={`${a} < x ≤ ${b}`} controls={<><Stepper label="Lower (open)" value={a} min={-7} max={b - 1} onChange={setA}/><Stepper label="Upper (closed)" value={b} min={a + 1} max={7} onChange={setB}/><Readout>{a} &lt; x ≤ {b}: integers {range(b - a).map(i => a + 1 + i).join(', ')}</Readout></>}><Scene c={{...c, mode: 'line', a, b}} scene={4} p={1}/></Stage>;
}

export const inequalityView: EngineView<IneqConfig> = {Scene: props => <Stage label={inequality.describe(props.c)}><Scene {...props}/></Stage>, Explore};

'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Stepper} from '../stage';
import {pythag, simplifyRoot, rootStr, type PythagConfig} from '@/lib/universe/engines/pythag';
import {eseg, fmt, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

type P = [number, number];
const poly = (ps: P[]) => ps.map(q => q.join(',')).join(' ');
/** Zhao Shuang arrangement (k = 0) and the two-squares arrangement (k = 1) of four right triangles, legs a < b, scale s. */
function FourTriangles({a, b, s, k, x0, y0}: {a: number; b: number; s: number; k: number; x0: number; y0: number}) {
  const A = a * s, B = b * s, Sd = A + B; // outer square side a + b
  // Arrangement 1: triangles in the corners of the (a+b) square leaving a tilted c² square.
  const t1: P[][] = [[[0, 0], [B, 0], [0, A]], [[Sd, 0], [Sd, B], [B, 0]], [[Sd, Sd], [A, Sd], [Sd, B]], [[0, Sd], [0, A], [A, Sd]]];
  // Arrangement 2: two rectangles (a×b) each split into two triangles, leaving squares a² and b².
  const t2: P[][] = [[[0, 0], [B, 0], [0, A]], [[B, A], [B, 0], [0, A]], [[B, A], [Sd, A], [B, Sd]], [[Sd, Sd], [Sd, A], [B, Sd]]];
  const cols = [C.ones, C.tens, C.thousands, C.accent];
  return <g transform={`translate(${x0} ${y0})`}><rect width={Sd} height={Sd} fill="#1f1d2b" stroke={C.ink}/>
    {k >= 1 ? <><rect x={0} y={A} width={B} height={B} fill={C.hundreds} opacity={.35}/><rect x={B} y={0} width={A} height={A} fill={C.unknown} opacity={.35}/><T x={B / 2} y={A + B / 2} size={18}>b²</T><T x={B + A / 2} y={A / 2} size={16}>a²</T></>
      : k <= 0 ? <><polygon points={poly([[B, 0], [Sd, B], [A, Sd], [0, A]])} fill={C.hundreds} opacity={.35}/><T x={Sd / 2} y={Sd / 2} size={20}>c²</T></> : null}
    {t1.map((tri, i) => <polygon key={i} points={poly(tri.map((q, j) => [lerp(q[0], t2[i][j][0], k), lerp(q[1], t2[i][j][1], k)] as P))} fill={cols[i]} opacity={.8} stroke="#15141d"/>)}</g>;
}

function Scene({c, scene, p}: {c: PythagConfig; scene: number; p: number}) {
  const {n, a, b} = c;
  switch (c.mode) {
    case 'sqrt': { const r = Math.sqrt(n); const S = 260 / Math.ceil(r); const lo = Math.floor(r), hi = Math.ceil(r); const X = (v: number) => 470 + ((v - lo + 1) / 3) * 300;
      return <g><rect x={80} y={80} width={r * S} height={r * S} fill={C.tens} opacity={.35} stroke={C.tens}/>{range(Math.ceil(r) + 1).map(i => <g key={i}><line x1={80 + i * S} x2={80 + i * S} y1={80} y2={80 + hi * S} stroke="#fff" strokeOpacity={.1}/><line x1={80} x2={80 + hi * S} y1={80 + i * S} y2={80 + i * S} stroke="#fff" strokeOpacity={.1}/></g>)}
        <T x={80 + (r * S) / 2} y={80 + (r * S) / 2} size={20}>area {n}</T>{scene >= 2 && <><line x1={470} x2={770} y1={300} y2={300} stroke={C.muted}/>{[lo - 1, lo, hi, hi + 1].map(v => <T key={v} x={X(v)} y={320} size={13}>{v}</T>)}<circle cx={X(scene >= 3 ? r : lo + .5)} cy={300} r={8} fill={C.unknown}/></>}
        <T x={620} y={150} size={22}>{scene >= 4 ? `√${n} ≈ ${fmt(r, 3)}` : scene >= 2 ? `${lo}² = ${lo * lo} < ${n} < ${hi * hi} = ${hi}²` : `side² = ${n}`}</T></g>; }
    case 'irrational': { const S = 150; const swing = scene === 3 ? eseg(p, .1, .9) : scene > 3 ? 1 : 0; const O: P = [180, 330]; const ang = lerp(-45, 0, swing) * Math.PI / 180;
      return <g><line x1={60} x2={760} y1={O[1]} y2={O[1]} stroke={C.muted}/>{[0, 1, 2, 3].map(v => <g key={v}><line x1={O[0] + v * S} x2={O[0] + v * S} y1={O[1] - 6} y2={O[1] + 6} stroke={C.muted}/><T x={O[0] + v * S} y={O[1] + 22} size={14}>{v}</T></g>)}
        <rect x={O[0]} y={O[1] - S} width={S} height={S} fill={C.tens} opacity={.25} stroke={C.tens}/><line x1={O[0]} y1={O[1]} x2={O[0] + Math.SQRT2 * S * Math.cos(ang)} y2={O[1] + Math.SQRT2 * S * Math.sin(ang)} stroke={C.ones} strokeWidth={4}/>
        {scene >= 2 && <path d={`M${O[0] + Math.SQRT2 * S * Math.cos(-Math.PI / 4)} ${O[1] + Math.SQRT2 * S * Math.sin(-Math.PI / 4)} A${Math.SQRT2 * S} ${Math.SQRT2 * S} 0 0 1 ${O[0] + Math.SQRT2 * S} ${O[1]}`} fill="none" stroke={C.ones} strokeDasharray="4 5" opacity={.6}/>}
        {swing >= 1 && <><circle cx={O[0] + Math.SQRT2 * S} cy={O[1]} r={8} fill={C.unknown}/><T x={O[0] + Math.SQRT2 * S} y={O[1] - 22} size={16} color={C.unknown}>√2</T></>}
        <T x={W / 2} y={50} size={22}>{scene >= 4 ? '√2 = 1.41421356237… (never repeats)' : 'diagonal² = 1² + 1² = 2'}</T></g>; }
    case 'radical': { const [k, m] = simplifyRoot(n); const S = 280; const split = scene >= 3 ? (scene === 3 ? eseg(p, .1, .9) : 1) : 0;
      return <g><rect x={120} y={80} width={S} height={S} fill={C.hundreds} opacity={.3} stroke={C.hundreds}/>{split > 0 && range(k + 1).map(i => <g key={i}><line x1={120 + (i * S) / k} x2={120 + (i * S) / k} y1={80} y2={80 + S * split} stroke={C.ink}/><line x1={120} x2={120 + S * split} y1={80 + (i * S) / k} y2={80 + (i * S) / k} stroke={C.ink}/></g>)}
        {split >= 1 && range(k * k).map(i => <T key={i} x={120 + ((i % k) + .5) * S / k} y={80 + (Math.floor(i / k) + .5) * S / k} size={14}>{m}</T>)}<T x={260} y={70} size={16} color={C.ones}>side √{n}</T>
        <T x={600} y={160} size={22}>√{n} = √({k * k} × {m})</T>{scene >= 4 && <T x={600} y={200} size={24} color={C.good}>= {rootStr(n)}</T>}</g>; }
    case 'converse': { const knots = 12; const k = scene >= 2 ? (scene === 2 ? eseg(p, .1, .9) : 1) : 0; const s = 50; const O: P = [200, 360];
      const line: P[] = range(knots + 1).map(i => [80 + i * 55, 380]);
      const perim = (i: number): P => { const d = i; if (d <= 4) return [O[0] + d * s, O[1]]; if (d <= 9) { const t = (d - 4) / 5; return [lerp(O[0] + 4 * s, O[0], t), lerp(O[1], O[1] - 3 * s, t)]; } const t = (d - 9) / 3; return [O[0], lerp(O[1] - 3 * s, O[1], t)]; };
      return <g><polyline points={poly(range(knots + 1).map(i => { const q = perim(i); return [lerp(line[i][0], q[0], k), lerp(line[i][1], q[1], k)] as P; }))} fill="none" stroke="#d9b98a" strokeWidth={4}/>
        {range(knots + 1).map(i => { const q = perim(i); return <circle key={i} cx={lerp(line[i][0], q[0], k)} cy={lerp(line[i][1], q[1], k)} r={6} fill={C.ones}/>; })}
        {k >= 1 && <><rect x={O[0]} y={O[1] - 20} width={20} height={20} fill="none" stroke={C.unknown} strokeWidth={2}/><T x={O[0] + 2 * s} y={O[1] + 24} size={16}>4</T><T x={O[0] - 20} y={O[1] - 1.5 * s} size={16}>3</T><T x={O[0] + 2.4 * s} y={O[1] - 1.8 * s} size={16}>5</T></>}
        <T x={600} y={140} size={22}>{scene >= 2 ? '3² + 4² = 9 + 16 = 25 = 5²' : '12 equal knots'}</T>{scene >= 3 && <T x={600} y={180} size={16} color={C.muted}>5-12-13 ✓ · 8-15-17 ✓ · 4-5-6 ✗</T>}</g>; }
    default: { const s = 280 / (a + b); const k = scene === 3 ? eseg(p, .1, .9) : scene >= 4 ? 1 : 0;
      return <g><FourTriangles a={a} b={b} s={s} k={scene < 2 ? 0 : k} x0={110} y0={70}/>{scene >= 2 && <FourTriangles a={a} b={b} s={s * .55} k={0} x0={520} y0={60}/>}
        <T x={600} y={300} size={20}>{scene >= 4 ? `${a}² + ${b}² = ${a * a + b * b} = ${fmt(Math.hypot(a, b))}²` : `legs ${a}, ${b}; hypotenuse c = ?`}</T>{scene >= 2 && <T x={600} y={340} size={14} color={C.muted}>same big square, same four triangles</T>}</g>; }
  }
}

function Explore({c}: {c: PythagConfig}) {
  const [a, setA] = useState(c.a), [b, setB] = useState(c.b), [n, setN] = useState(c.n), [k, setK] = useState(0);
  if (c.mode === 'sqrt' || c.mode === 'radical') return <Stage label={`root of ${n}`} controls={<><Slider label="Area" value={n} min={2} max={100} onChange={setN}/><Readout>√{n} ≈ {fmt(Math.sqrt(n), 4)} = {rootStr(n)}</Readout></>}><Scene c={{...c, n}} scene={4} p={1}/></Stage>;
  if (c.mode === 'proof') return <Stage label="Rearrange the triangles" controls={<><Stepper label="a" value={a} min={1} max={8} onChange={setA}/><Stepper label="b" value={b} min={1} max={8} onChange={setB}/><Slider label="Rearrange" value={k} min={0} max={1} step={.05} onChange={setK}/><Readout>{a}² + {b}² = {a * a + b * b} = c² → c = {fmt(Math.hypot(a, b), 3)}</Readout></>}>
    <FourTriangles a={Math.min(a, b)} b={Math.max(a, b)} s={300 / (a + b)} k={k} x0={250} y0={70}/></Stage>;
  const c2 = Math.hypot(a, b); return <Stage label="Test a triangle" controls={<><Stepper label="a" value={a} min={1} max={20} onChange={setA}/><Stepper label="b" value={b} min={1} max={20} onChange={setB}/><Readout>{a}² + {b}² = {a * a + b * b}; √ = {fmt(c2, 3)} {Number.isInteger(c2) ? '— a Pythagorean triple!' : ''}</Readout></>}><Scene c={c} scene={c.mode === 'irrational' ? 4 : 4} p={1}/></Stage>;
}

export const pythagView: EngineView<PythagConfig> = {Scene: props => <Stage label={pythag.describe(props.c)}><Scene {...props}/></Stage>, Explore};

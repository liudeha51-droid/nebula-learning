'use client';
import {useState} from 'react';
import {Stage, T, C, Readout, Slider, Handle} from '../stage';
import {Axes, Curve, Pt, frame} from '../plot';
import {conic, LINE, ptLine, type ConicConfig} from '@/lib/universe/engines/conic';
import {clamp, eseg, fmt, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const F = frame(-8, 8, -4.5, 4.5);
const path = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${F.X(x).toFixed(1)} ${F.Y(y).toFixed(1)}`).join('');
function Ellipse({a, b, t = 1, color = C.tens}: {a: number; b: number; t?: number; color?: string}) { const n = Math.max(2, Math.round(120 * t)); return <path d={path(range(n + 1).map(i => { const th = (i / 120) * 2 * Math.PI; return [a * Math.cos(th), b * Math.sin(th)] as [number, number]; }))} fill="none" stroke={color} strokeWidth={3}/>; }

function Scene({c, scene, p}: {c: ConicConfig; scene: number; p: number}) {
  const t = scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .9) : 1;
  switch (c.mode) {
    case 'line': { const G = frame(-5, 5, -4, 6); const k = c.k; return <g><Axes f={G}/>{scene >= 2 && <><line x1={G.X(0)} y1={G.Y(c.b)} x2={G.X(1)} y2={G.Y(c.b)} stroke={C.ones} strokeWidth={3}/><line x1={G.X(1)} y1={G.Y(c.b)} x2={G.X(1)} y2={G.Y(c.b + k * t)} stroke={C.tens} strokeWidth={3}/><T x={G.X(.5)} y={G.Y(c.b) + 18} size={13} color={C.ones}>1</T><T x={G.X(1) + 16} y={G.Y(c.b + k / 2)} size={13} color={C.tens}>{k}</T></>}
      {scene >= 3 && <Curve f={G} fn={x => k * x + c.b} color={C.unknown}/>}<Pt f={G} x={0} y={c.b} label={`(0, ${c.b})`}/>{scene >= 4 && <><Curve f={G} fn={x => k * x - 2} color={C.unknown} dash="6 4"/><Curve f={G} fn={x => -x / k + c.b} color={C.hundreds}/></>}<T x={660} y={60} size={18}>{scene >= 3 ? `y = ${k}x + ${c.b}` : `k = ${k}`}</T></g>; }
    case 'distance': { const foot: [number, number] = [c.x0 - (LINE.A * (LINE.A * c.x0 + LINE.B * c.y0 + LINE.C)) / 25, c.y0 - (LINE.B * (LINE.A * c.x0 + LINE.B * c.y0 + LINE.C)) / 25]; const G = frame(-3, 7, -1.5, 6); const sw = scene === 2 ? lerp(-2.5, 0, eseg(p, 0, .9)) : 0;
      const tgt: [number, number] = [foot[0] + 4 * sw / 5 * -1, foot[1] + 3 * sw / 5]; return <g><Axes f={G}/><Curve f={G} fn={x => (10 - 3 * x) / 4} color={C.muted}/><Pt f={G} x={c.x0} y={c.y0} label={`(${c.x0}, ${c.y0})`}/>
        {scene >= 2 && <line x1={G.X(c.x0)} y1={G.Y(c.y0)} x2={G.X(tgt[0])} y2={G.Y(tgt[1])} stroke={C.unknown} strokeWidth={3}/>}{scene >= 2 && <T x={660} y={60} size={16}>length {fmt(Math.hypot(tgt[0] - c.x0, tgt[1] - c.y0), 3)}</T>}{scene >= 4 && <T x={660} y={95} size={18} color={C.good}>d = {fmt(ptLine(c.x0, c.y0), 3)}</T>}</g>; }
    case 'circle': { const G = frame(-7, 9, -4, 5); const d = scene === 3 ? lerp(c.r + 2, c.r - 1.5, eseg(p, 0, .9)) : scene >= 4 ? c.r : c.r + 2; const ang = Math.PI * 2 * t;
      return <g><Axes f={G}/><Pt f={G} x={1} y={1} color={C.ones} label="(1, 1)"/>{scene >= 2 && <path d={range(Math.max(2, Math.round(90 * t)) + 1).map(i => { const th = (i / 90) * 2 * Math.PI; return `${i ? 'L' : 'M'}${G.X(1 + c.r * Math.cos(th))} ${G.Y(1 + c.r * Math.sin(th))}`; }).join('')} fill="none" stroke={C.tens} strokeWidth={3}/>}
        {scene >= 1 && <line x1={G.X(1)} y1={G.Y(1)} x2={G.X(1 + c.r * Math.cos(ang))} y2={G.Y(1 + c.r * Math.sin(ang))} stroke={C.ones} strokeWidth={2}/>}{scene >= 3 && <><line x1={G.X(1 + d)} x2={G.X(1 + d)} y1={G.Y(-4)} y2={G.Y(5)} stroke={C.unknown} strokeWidth={3}/><T x={G.X(1 + d) + 8} y={40} size={14} color={C.unknown} anchor="start">d = {fmt(d, 2)} {d < c.r - 1e-6 ? '< r: two points' : Math.abs(d - c.r) < 1e-6 ? '= r: tangent' : '> r: none'}</T></>}</g>; }
    case 'ellipse': { const f = Math.sqrt(c.a ** 2 - c.b ** 2); const th = 2 * Math.PI * (scene === 2 ? p : scene > 2 ? .15 : 0); const P: [number, number] = [c.a * Math.cos(th), c.b * Math.sin(th)];
      return <g><Axes f={F}/>{scene >= 2 && <Ellipse a={c.a} b={c.b} t={scene === 2 ? p : 1}/>}<Pt f={F} x={-f} y={0} color={C.ones} label="F₁"/><Pt f={F} x={f} y={0} color={C.ones} label="F₂"/>{scene >= 2 && <><path d={path([[-f, 0], P, [f, 0]])} fill="none" stroke={C.unknown} strokeWidth={2}/><Pt f={F} x={P[0]} y={P[1]}/></>}
        {scene >= 3 && <T x={W2} y={30} size={16}>|PF₁| + |PF₂| = {fmt(Math.hypot(P[0] + f, P[1]) + Math.hypot(P[0] - f, P[1]), 3)}</T>}{scene >= 4 && <T x={W2} y={60} size={16} color={C.good}>x²/{c.a * c.a} + y²/{c.b * c.b} = 1 · e = {fmt(f / c.a, 3)}</T>}</g>; }
    case 'hyperbola': { const k = c.b / c.a; const s = scene === 2 ? lerp(-2, 2, p) : .8; const P: [number, number] = [c.a * Math.cosh(s), c.b * Math.sinh(s)]; const f = Math.hypot(c.a, c.b); const G = frame(-12, 12, -7, 7);
      return <g><Axes f={G}/>{scene >= 2 && <><Curve f={G} fn={x => (Math.abs(x) >= c.a ? c.b * Math.sqrt(x * x / (c.a * c.a) - 1) : NaN)} color={C.tens}/><Curve f={G} fn={x => (Math.abs(x) >= c.a ? -c.b * Math.sqrt(x * x / (c.a * c.a) - 1) : NaN)} color={C.tens}/></>}
        {scene >= 4 && <><Curve f={G} fn={x => k * x} color={C.faint} dash="6 4"/><Curve f={G} fn={x => -k * x} color={C.faint} dash="6 4"/></>}<Pt f={G} x={-f} y={0} color={C.ones} label="F₁"/><Pt f={G} x={f} y={0} color={C.ones} label="F₂"/>
        {scene >= 2 && <><line x1={G.X(-f)} y1={G.Y(0)} x2={G.X(P[0])} y2={G.Y(P[1])} stroke={C.unknown}/><line x1={G.X(f)} y1={G.Y(0)} x2={G.X(P[0])} y2={G.Y(P[1])} stroke={C.unknown}/><Pt f={G} x={P[0]} y={P[1]}/><T x={W2} y={30} size={16}>|PF₁| − |PF₂| = {fmt(Math.hypot(P[0] + f, P[1]) - Math.hypot(P[0] - f, P[1]), 3)}</T></>}</g>; }
    default: { const q = c.p; const G = frame(-3, 9, -5, 5); const yy = scene === 2 ? lerp(-4, 4, p) : 2.5; const P: [number, number] = [(yy * yy) / (2 * q), yy];
      return <g><Axes f={G}/><line x1={G.X(-q / 2)} x2={G.X(-q / 2)} y1={G.Y(-5)} y2={G.Y(5)} stroke={C.hundreds} strokeDasharray="6 4"/><Pt f={G} x={q / 2} y={0} color={C.ones} label="F"/>
        {scene >= 2 && <path d={range(81).map(i => { const y = lerp(-4.9, scene === 2 ? yy : 4.9, i / 80); return `${i ? 'L' : 'M'}${G.X((y * y) / (2 * q)).toFixed(1)} ${G.Y(y).toFixed(1)}`; }).join('')} fill="none" stroke={C.tens} strokeWidth={3}/>}
        {scene === 2 && <><line x1={G.X(P[0])} y1={G.Y(P[1])} x2={G.X(q / 2)} y2={G.Y(0)} stroke={C.unknown}/><line x1={G.X(P[0])} y1={G.Y(P[1])} x2={G.X(-q / 2)} y2={G.Y(P[1])} stroke={C.unknown}/><Pt f={G} x={P[0]} y={P[1]}/></>}
        {scene >= 3 && range(5).map(i => { const y = -3 + i * 1.5 || .5; const x = (y * y) / (2 * q); const k = scene === 3 ? eseg(p, 0, .9) : 1; return <g key={i}><line x1={G.X(9)} y1={G.Y(y)} x2={G.X(lerp(9, x, Math.min(1, k * 2)))} y2={G.Y(y)} stroke={C.warn} strokeWidth={2}/>{k > .5 && <line x1={G.X(x)} y1={G.Y(y)} x2={G.X(lerp(x, q / 2, (k - .5) * 2))} y2={G.Y(lerp(y, 0, (k - .5) * 2))} stroke={C.warn} strokeWidth={2}/>}</g>; })}
        <T x={W2} y={30} size={16}>y² = {2 * q}x · focus ({q / 2}, 0) · directrix x = −{q / 2}</T></g>; }
  }
}
const W2 = 400;

function Explore({c}: {c: ConicConfig}) {
  const [a, setA] = useState(c.mode === 'circle' ? c.r : c.a), [b, setB] = useState(c.mode === 'line' ? c.k : c.mode === 'parabola' ? c.p : c.b);
  const [pt, setPt] = useState<[number, number]>([c.x0, c.y0]);
  if (c.mode === 'distance') { const G = frame(-3, 7, -1.5, 6); return <Stage label="Drag the point" controls={<Readout>P = ({fmt(pt[0], 1)}, {fmt(pt[1], 1)}) · distance to 3x + 4y − 10 = 0: {fmt(ptLine(...pt), 3)}</Readout>}><Axes f={G}/><Curve f={G} fn={x => (10 - 3 * x) / 4} color={C.muted}/>
    <line x1={G.X(pt[0])} y1={G.Y(pt[1])} x2={G.X(pt[0] - (3 * (3 * pt[0] + 4 * pt[1] - 10)) / 25)} y2={G.Y(pt[1] - (4 * (3 * pt[0] + 4 * pt[1] - 10)) / 25)} stroke={C.unknown} strokeWidth={3}/><Handle x={G.X(pt[0])} y={G.Y(pt[1])} label="point P" onMove={(x, y) => setPt([clamp(Math.round(((x - G.x0) / G.w * 10 - 3) * 2) / 2, -3, 7), clamp(Math.round((6 - (y - G.y0) / G.h * 7.5) * 2) / 2, -1.5, 6)])} keyStep={G.w / 20}/></Stage>; }
  if (c.mode === 'line') return <Stage label="y = kx + b" controls={<><Slider label="k" value={b} min={-4} max={4} step={.5} onChange={setB}/><Readout>inclination {fmt((Math.atan(b) * 180) / Math.PI, 1)}° · perpendicular slope {b === 0 ? 'undefined' : fmt(-1 / b, 3)}</Readout></>}><Scene c={{...c, k: b || .001}} scene={3} p={1}/></Stage>;
  if (c.mode === 'circle') return <Stage label="Circle and line" controls={<><Slider label="r" value={a} min={1} max={5} step={.5} onChange={setA}/><Readout>(x − 1)² + (y − 1)² = {fmt(a * a)} · fence at d = {fmt(c.r)}: {c.r < a ? 'two points' : c.r === a ? 'tangent' : 'no points'}</Readout></>}><Scene c={{...c, r: a}} scene={4} p={1}/></Stage>;
  if (c.mode === 'parabola') return <Stage label="Parabola" controls={<><Slider label="p" value={b} min={.5} max={5} step={.5} onChange={setB}/><Readout>y² = {fmt(2 * b)}x · focus ({fmt(b / 2)}, 0)</Readout></>}><Scene c={{...c, p: b}} scene={4} p={1}/></Stage>;
  const ell = c.mode === 'ellipse'; const bb = ell ? Math.min(b, a - .5) : b; const cc = ell ? Math.sqrt(a * a - bb * bb) : Math.hypot(a, bb);
  return <Stage label={ell ? 'Ellipse' : 'Hyperbola'} controls={<><Slider label="a" value={a} min={2} max={7} step={.5} onChange={setA}/><Slider label="b" value={b} min={1} max={6} step={.5} onChange={setB}/><Readout>c = {fmt(cc, 3)} · e = {fmt(cc / a, 3)}{ell ? '' : ` · asymptotes y = ±${fmt(bb / a, 3)}x`}</Readout></>}><Scene c={{...c, a, b: bb}} scene={4} p={1}/></Stage>;
}

export const conicView: EngineView<ConicConfig> = {Scene: props => <Stage label={conic.describe(props.c)}><Scene {...props}/></Stage>, Explore};

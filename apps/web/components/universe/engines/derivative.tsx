'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider} from '../stage';
import {Axes, Curve, Pt, frame} from '../plot';
import {derivative, cubic, dcubic, boxV, type DerivConfig} from '@/lib/universe/engines/derivative';
import {eseg, fmt, lerp} from '@/lib/universe/math';
import type {EngineView} from './types';

const F = frame(-2.5, 3.5, -1, 9);
function Secant({x0, h}: {x0: number; h: number}) { const k = h > 1e-6 ? 2 * x0 + h : 2 * x0; return <g><Axes f={F}/><Curve f={F} fn={x => x * x} color={C.tens}/><Curve f={F} fn={x => x0 * x0 + k * (x - x0)} color={C.unknown} width={2}/><Pt f={F} x={x0} y={x0 * x0} color={C.ones}/>{h > 1e-6 && <Pt f={F} x={x0 + h} y={(x0 + h) ** 2} color={C.hundreds} label={`h = ${fmt(h, 3)}`}/>}<T x={640} y={70} size={18}>slope = {fmt(k, 4)}</T></g>; }
const G = frame(-.5, 2 * Math.PI + .5, -1.6, 1.6, {x0: 60, y0: 30, w: 680, h: 390});
function Tangent({f, df, x, g, len = 1}: {f: (x: number) => number; df: (x: number) => number; x: number; g: typeof G; len?: number}) { const d = len / Math.sqrt(1 + df(x) ** 2); return <line x1={g.X(x - d)} y1={g.Y(f(x) - d * df(x))} x2={g.X(x + d)} y2={g.Y(f(x) + d * df(x))} stroke={C.unknown} strokeWidth={3}/>; }
const M = frame(-2.6, 2.6, -3, 3);
function Box({s, x}: {s: number; x: number}) { const k = 300 / s, x0 = 60, y0 = 70, c = x * k; return <g><rect x={x0} y={y0} width={s * k} height={s * k} fill={C.ones} opacity={.25} stroke={C.ones}/>{[[0, 0], [s * k - c, 0], [0, s * k - c], [s * k - c, s * k - c]].map(([a, b], i) => <rect key={i} x={x0 + a} y={y0 + b} width={c} height={c} fill={C.bad} opacity={.6}/>)}<rect x={x0 + c} y={y0 + c} width={s * k - 2 * c} height={s * k - 2 * c} fill="none" stroke={C.ink} strokeDasharray="5 4"/><T x={x0 + s * k / 2} y={y0 - 12} size={14}>{s} × {s}, cut x = {fmt(x, 2)}</T></g>; }

function Scene({c, scene, p}: {c: DerivConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'rules': { const x = scene < 2 ? 1 : scene === 2 ? lerp(0, 2 * Math.PI, p) : 2 * Math.PI; return <g><Axes f={G} piTicks/><Curve f={G} fn={Math.sin} color={C.tens}/>{scene >= 2 && <Curve f={G} fn={Math.cos} to={x} color={C.ones}/>}{scene >= 3 && <Curve f={G} fn={Math.cos} color={C.ones}/>}{scene <= 2 && <><Tangent f={Math.sin} df={Math.cos} x={x} g={G}/><Pt f={G} x={x} y={Math.cos(x)} color={C.ones}/></>}<T x={640} y={60} size={18}>{scene >= 3 ? '(sin x)′ = cos x' : `slope at x: ${fmt(Math.cos(x), 3)}`}</T></g>; }
    case 'monotonic': { const x = scene === 2 ? lerp(-2.4, 2.4, p) : scene === 3 ? -1 : 1; const sign = scene >= 2;
      return <g><Axes f={M}/>{sign && <><rect x={M.X(-2.6)} y={M.y0} width={M.X(-1) - M.X(-2.6)} height={M.h} fill={C.good} opacity={.08}/><rect x={M.X(-1)} y={M.y0} width={M.X(1) - M.X(-1)} height={M.h} fill={C.bad} opacity={.08}/><rect x={M.X(1)} y={M.y0} width={M.X(2.6) - M.X(1)} height={M.h} fill={C.good} opacity={.08}/></>}
        <Curve f={M} fn={cubic} color={C.tens}/>{scene >= 2 && <Curve f={M} fn={dcubic} color={C.ones} dash="6 4"/>}{scene >= 2 && scene <= 2 && <Tangent f={cubic} df={dcubic} x={x} g={M as typeof G} len={.8}/>}{scene >= 3 && <><Pt f={M} x={-1} y={2} label="max (−1, 2)"/><Pt f={M} x={1} y={-2} label="min (1, −2)"/></>}<T x={150} y={50} size={14} color={C.ones}>f′(x) = 3x² − 3 (dashed)</T></g>; }
    case 'optimize': { const s = c.side, best = s / 6; const x = scene < 2 ? s / 12 : scene === 2 ? lerp(.3, s / 2 - .3, p) : scene === 3 ? lerp(s / 2 - .3, best, eseg(p, 0, .8)) : best; const V = frame(0, s / 2, 0, boxV(s, best) * 1.15, {x0: 430, y0: 60, w: 330, h: 330});
      return <g><Box s={s} x={x}/><Axes f={V} xLabel="x" yLabel="V"/><Curve f={V} fn={t => boxV(s, t)} color={C.tens}/><Pt f={V} x={x} y={boxV(s, x)} label={`V = ${fmt(boxV(s, x), 1)}`}/>{scene >= 3 && <T x={W / 2 + 200} y={420} size={15} color={C.good}>V′(x) = 0 at x = {fmt(best)}</T>}</g>; }
    default: { const h = scene < 2 ? 2 : scene === 2 ? 2 : scene === 3 ? lerp(2, 0, eseg(p, 0, .95)) : 0; return <Secant x0={c.x0} h={h}/>; }
  }
}

function Explore({c}: {c: DerivConfig}) {
  const [v, setV] = useState(c.mode === 'optimize' ? c.side / 12 : c.mode === 'secant' ? 1 : .5); const [x0, setX0] = useState(c.x0);
  if (c.mode === 'secant') return <Stage label="Shrink h" controls={<><Slider label="x₀" value={x0} min={-2} max={2} step={.5} onChange={setX0}/><Slider label="h" value={v} min={0} max={2} step={.01} onChange={setV}/><Readout>[f(x₀ + h) − f(x₀)]/h = {v > 0 ? fmt(2 * x0 + v, 4) : `→ ${2 * x0}`}</Readout></>}><Secant x0={x0} h={v}/></Stage>;
  if (c.mode === 'optimize') return <Stage label="Cut the corners" controls={<><Slider label="Cut x" value={v} min={.1} max={c.side / 2 - .1} step={.1} onChange={setV}/><Readout>V = {fmt(boxV(c.side, v), 2)} · V′ = {fmt((c.side - 2 * v) * (c.side - 6 * v), 2)}</Readout></>}><Scene c={c} scene={2} p={(v - .3) / (c.side / 2 - .6)}/></Stage>;
  const mono = c.mode === 'monotonic'; const g = mono ? M : G; const f = mono ? cubic : Math.sin, df = mono ? dcubic : Math.cos; const x = mono ? lerp(-2.4, 2.4, v) : v * 2 * Math.PI;
  return <Stage label="Slide the tangent" controls={<><Slider label="x" value={v} min={0} max={1} step={.01} onChange={setV}/><Readout>x = {fmt(x, 2)} · f′(x) = {fmt(df(x), 3)} — {df(x) > 1e-9 ? 'increasing' : df(x) < -1e-9 ? 'decreasing' : 'flat'}</Readout></>}><Axes f={g} piTicks={!mono}/><Curve f={g} fn={f} color={C.tens}/><Curve f={g} fn={df} color={C.ones} dash="6 4"/><Tangent f={f} df={df} x={x} g={g as typeof G}/><Pt f={g} x={x} y={df(x)} color={C.ones}/></Stage>;
}

export const derivativeView: EngineView<DerivConfig> = {Scene: props => <Stage label={derivative.describe(props.c)}><Scene {...props}/></Stage>, Explore};

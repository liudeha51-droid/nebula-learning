'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Handle} from '../stage';
import {Axes, Curve, Pt, frame} from '../plot';
import {func, quadRoots, solve2, quadrantOf, bisect, type FuncConfig} from '@/lib/universe/engines/func';
import {clamp, eseg, fmt, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const F = frame(-6, 6, -4.5, 4.5);
const sgn = (v: number, unit = '') => `${v < 0 ? '−' : '+'} ${fmt(Math.abs(v))}${unit}`;

function Scene({c, scene, p}: {c: FuncConfig; scene: number; p: number}) {
  const t = scene < 2 ? 0 : scene === 2 ? p : 1;
  switch (c.mode) {
    case 'quadrants': { const x = scene < 2 ? 0 : scene === 2 ? c.x * eseg(p, 0, .5) : c.x; const y = scene < 2 ? 0 : scene === 2 ? c.y * eseg(p, .5, 1) : c.y;
      return <g><Axes f={F}/>{scene >= 3 && [['I', 3, 3], ['II', -3, 3], ['III', -3, -3], ['IV', 3, -3]].map(([q, qx, qy]) => <T key={q as string} x={F.X(qx as number)} y={F.Y(qy as number)} size={36} weight={700} color={C.faint}>{q}</T>)}
        <line x1={F.X(0)} y1={F.Y(0)} x2={F.X(x)} y2={F.Y(0)} stroke={C.ones} strokeWidth={3}/><line x1={F.X(x)} y1={F.Y(0)} x2={F.X(x)} y2={F.Y(y)} stroke={C.tens} strokeWidth={3}/><Pt f={F} x={x} y={y} label={`(${fmt(x, 1)}, ${fmt(y, 1)})`}/></g>; }
    case 'system': { const s = solve2(c.a, c.b, c.c, c.d, c.e, c.f)!; const l1 = (x: number) => (c.c - c.a * x) / c.b, l2 = (x: number) => (c.f - c.d * x) / c.e; const G = frame(-2, 10, -4, 12);
      return <g><Axes f={G}/>{scene >= 2 && <Curve f={G} fn={l1} color={C.ones} to={lerp(G.xmin, G.xmax, t)}/>}{scene >= 2 && <Curve f={G} fn={l2} color={C.tens} to={lerp(G.xmin, G.xmax, Math.max(0, t * 2 - 1))}/>}
        {scene >= 4 && <Pt f={G} x={s.x} y={s.y} label={`(${fmt(s.x)}, ${fmt(s.y)})`}/>}{scene === 3 && <T x={W / 2} y={30} size={18}>({c.a}x + {c.b}y) + ({c.d}x {sgn(c.e)}y) = {c.c} + {c.f} → {c.a + c.d}x = {c.c + c.f}</T>}
        <T x={620} y={70} size={14} color={C.ones}>{c.a}x + {c.b}y = {c.c}</T><T x={620} y={95} size={14} color={C.tens}>{c.d}x {sgn(c.e)}y = {c.f}</T></g>; }
    case 'fractional': { const G = frame(-4, 8, -6, 8); return <g><Axes f={G}/><Curve f={G} fn={x => 3 / (x - 1)} color={C.ones}/>{scene >= 2 && <Curve f={G} fn={x => 6 / (x + 1)} color={C.tens} opacity={eseg(t, 0, 1) || 1}/>}
      <line x1={G.X(1)} x2={G.X(1)} y1={G.Y(G.ymin)} y2={G.Y(G.ymax)} stroke={C.bad} strokeDasharray="4 4"/><line x1={G.X(-1)} x2={G.X(-1)} y1={G.Y(G.ymin)} y2={G.Y(G.ymax)} stroke={C.bad} strokeDasharray="4 4"/>
      {scene >= 4 && <Pt f={G} x={3} y={1.5} label="x = 3 ✓"/>}<T x={640} y={60} size={14} color={C.ones}>3/(x − 1)</T><T x={640} y={84} size={14} color={C.tens}>6/(x + 1)</T><T x={G.X(1) + 6} y={50} size={12} color={C.bad} anchor="start">x ≠ 1</T></g>; }
    case 'linear': case 'linear-ineq': { const k = scene === 3 ? lerp(c.k, -c.k, Math.sin(p * Math.PI) * .5) : c.k; const b = scene === 3 ? c.b + Math.sin(p * Math.PI * 2) * 1.5 : c.b; const fn = (x: number) => k * x + b; const zero = -b / k;
      return <g><Axes f={F}/>{c.mode === 'linear-ineq' && scene >= 3 && <rect x={c.k > 0 ? F.X(zero) : F.X(F.xmin)} y={F.y0} width={c.k > 0 ? F.X(F.xmax) - F.X(zero) : F.X(zero) - F.X(F.xmin)} height={F.h} fill={C.good} opacity={.08}/>}
        {scene >= 2 && range(9).filter(i => i <= t * 9).map(i => <Pt key={i} f={F} x={i - 4} y={fn(i - 4)} r={4} color={C.ones}/>)}{scene >= 2 && t > .5 && <Curve f={F} fn={fn} color={C.ones}/>}
        {(scene >= 4 || c.mode === 'linear-ineq') && scene >= 2 && <><Pt f={F} x={0} y={b} color={C.tens} label={`b = ${fmt(b, 1)}`}/>{c.mode === 'linear-ineq' && <Pt f={F} x={zero} y={0} color={C.unknown} label={`x = ${fmt(zero, 2)}`}/>}</>}
        <T x={W / 2} y={20} size={18}>y = {fmt(k, 2)}x {sgn(b)}</T></g>; }
    case 'roots': case 'quad-ineq': { const dc = scene === 3 ? lerp(0, (c.b * c.b) / (4 * c.a) - c.c + 1.5, Math.sin(p * Math.PI)) : 0; const cc = c.c + dc; const fn = (x: number) => c.a * x * x + c.b * x + cc; const r = quadRoots(c.a, c.b, cc); const D = c.b * c.b - 4 * c.a * cc;
      return <g><Axes f={F}/>{c.mode === 'quad-ineq' && scene >= 3 && r.length === 2 && <><rect x={F.X(r[0])} y={F.y0} width={F.X(r[1]) - F.X(r[0])} height={F.h} fill={C.bad} opacity={.08}/><rect x={F.x0} y={F.y0} width={F.X(r[0]) - F.x0} height={F.h} fill={C.good} opacity={.08}/><rect x={F.X(r[1])} y={F.y0} width={F.x0 + F.w - F.X(r[1])} height={F.h} fill={C.good} opacity={.08}/></>}
        <Curve f={F} fn={fn} color={C.ones} to={scene < 2 ? F.xmax : lerp(F.xmin, F.xmax, t)}/>{scene >= 2 && r.map((x, i) => <Pt key={i} f={F} x={x} y={0} label={`x = ${fmt(x, 2)}`}/>)}
        <T x={W / 2} y={20} size={18}>y = {c.a === 1 ? '' : c.a}x² {sgn(c.b)}x {sgn(cc)} · Δ = {fmt(D, 2)}</T></g>; }
    case 'quadratic': { const a = scene < 3 ? 1 : scene === 3 ? lerp(1, c.a, eseg(p, 0, .3)) : c.a; const h = scene < 3 ? 0 : scene === 3 ? lerp(0, c.h, eseg(p, .3, .65)) : c.h; const k = scene < 3 ? 0 : scene === 3 ? lerp(0, c.k, eseg(p, .65, 1)) : c.k;
      return <g><Axes f={F}/><Curve f={F} fn={x => x * x} color={C.faint} dash="4 4"/><Curve f={F} fn={x => a * (x - h) ** 2 + k} color={C.ones}/>{scene >= 4 && <><line x1={F.X(h)} x2={F.X(h)} y1={F.y0} y2={F.y0 + F.h} stroke={C.tens} strokeDasharray="5 4"/><Pt f={F} x={h} y={k} label={`vertex (${fmt(h)}, ${fmt(k)})`}/></>}
        <T x={W / 2} y={20} size={18}>y = {fmt(a, 2)}(x − {fmt(h, 2)})² {sgn(k)}</T></g>; }
    case 'quadratic-max': { const G = frame(-1, 21, -10, 120, {x0: 60, y0: 40, w: 680, h: 370}); const x = scene < 3 ? 10 : scene === 3 ? lerp(2, 18, p) : 10;
      return <g><Axes f={G} xLabel="width x" yLabel="area"/><Curve f={G} fn={v => v * (20 - v)} color={C.ones} from={0} to={20}/><Pt f={G} x={x} y={x * (20 - x)} label={`${fmt(x, 1)} × ${fmt(20 - x, 1)} = ${fmt(x * (20 - x), 0)}`}/>
        <rect x={500} y={300 - (20 - x) * 4} width={x * 6} height={(20 - x) * 4} fill={C.tens} opacity={.3} stroke={C.tens}/></g>; }
    case 'inverse': { const pts = range(10).map(i => .6 + i * .55); return <g><Axes f={F}/>{scene >= 2 && pts.slice(0, Math.ceil(t * 10)).map((x, i) => { const y = c.k / x; return y < F.ymax ? <rect key={i} x={F.X(0)} y={Math.min(F.Y(y), F.Y(0))} width={F.X(x) - F.X(0)} height={Math.abs(F.Y(y) - F.Y(0))} fill="none" stroke={C.tens} opacity={.35}/> : null; })}
      {scene >= 3 && <><Curve f={F} fn={x => c.k / x} color={C.ones} from={.05}/><Curve f={F} fn={x => c.k / x} color={C.ones} to={-.05}/></>}<T x={W / 2} y={20} size={18}>y = {c.k}/x · every rectangle has area {Math.abs(c.k)}</T></g>; }
    case 'mapping': { const A = [1, 2, 3, 4], B = [1, 4, 9, 16]; return <g>{scene < 3 ? <>{A.map((a, i) => <g key={a}><circle cx={200} cy={110 + i * 70} r={20} fill={C.panel} stroke={C.ones}/><T x={200} y={110 + i * 70} size={16}>{a}</T></g>)}{B.map((b, i) => <g key={b}><circle cx={560} cy={110 + i * 70} r={20} fill={C.panel} stroke={C.tens}/><T x={560} y={110 + i * 70} size={16}>{b}</T></g>)}
      {A.slice(0, scene >= 2 ? Math.ceil(t * 4) : 0).map((a, i) => <line key={a} x1={222} y1={110 + i * 70} x2={538} y2={110 + i * 70} stroke={C.unknown} strokeWidth={2}/>)}<T x={380} y={60} size={18}>f(x) = x²</T></>
      : <><Axes f={F}/><Curve f={F} fn={x => Math.sqrt(9 - x * x)} color={C.bad} from={-3} to={3}/><Curve f={F} fn={x => -Math.sqrt(9 - x * x)} color={C.bad} from={-3} to={3}/><Curve f={F} fn={x => x * x / 3 - 2} color={C.good}/><line x1={F.X(lerp(-2.5, 2.5, scene === 3 ? p : 1))} x2={F.X(lerp(-2.5, 2.5, scene === 3 ? p : 1))} y1={F.y0} y2={F.y0 + F.h} stroke={C.accent} strokeDasharray="5 4"/><T x={W / 2} y={20} size={16}>green: function ✓ · red circle: not a function ✗</T></>}</g>; }
    case 'parity': return <g><Axes f={F}/><Curve f={F} fn={x => x * x / 2} color={C.ones} opacity={scene === 3 ? .3 : 1}/>{scene >= 3 && <Curve f={F} fn={x => x ** 3 / 6} color={C.tens}/>}{scene === 2 && <><Pt f={F} x={-2} y={2} color={C.ones}/><Pt f={F} x={2} y={2} color={C.ones}/><line x1={F.X(-2)} x2={F.X(2)} y1={F.Y(2)} y2={F.Y(2)} stroke={C.ones} strokeDasharray="4 4"/></>}
      {scene === 3 && <><Pt f={F} x={-2} y={-8 / 6} color={C.tens}/><Pt f={F} x={2} y={8 / 6} color={C.tens}/></>}<T x={W / 2} y={20} size={16}>{scene >= 3 ? 'odd: x³ (rotate 180°)' : 'even: x² (mirror in the y-axis)'}</T></g>;
    case 'power': { const G = frame(-.5, 3.5, -2, 4); const fs: [string, (x: number) => number, string][] = [['x', x => x, C.ones], ['x²', x => x * x, C.tens], ['x³', x => x ** 3, C.hundreds], ['x^½', x => Math.sqrt(x), C.thousands], ['x⁻¹', x => 1 / x, C.accent]];
      return <g><Axes f={G}/>{fs.slice(0, scene < 2 ? 1 : scene === 2 ? Math.ceil(p * 5) : 5).map(([n, fn, col], i) => <g key={n}><Curve f={G} fn={fn} color={col} from={n === 'x^½' ? 0 : n === 'x⁻¹' ? .2 : G.xmin}/><T x={700} y={60 + i * 24} size={14} color={col}>y = {n}</T></g>)}{scene >= 3 && <Pt f={G} x={1} y={1} label="(1, 1)"/>}</g>; }
    case 'exponential': case 'log': { const a = c.a; const G = frame(-4, 6, -4, 6); const showLog = c.mode === 'log' && scene >= 2; const refl = c.mode === 'log' ? (scene === 2 ? p : scene > 2 ? 1 : 0) : 0;
      return <g><Axes f={G}/><Curve f={G} fn={x => a ** x} color={C.ones} opacity={c.mode === 'log' && scene >= 3 ? .4 : 1}/>{c.mode === 'exponential' && scene >= 3 && <Curve f={G} fn={x => (1 / a) ** x} color={C.tens}/>}
        {showLog && <><Curve f={G} fn={x => x} color={C.faint} dash="4 4"/><Curve f={G} fn={x => lerp(a ** x, Math.log(x) / Math.log(a), refl)} color={C.tens} from={.02}/></>}
        {c.mode === 'exponential' && scene === 2 && range(5).map(i => <Pt key={i} f={G} x={i} y={a ** i} r={4} label={i < 3 ? `${a ** i}` : undefined}/>)}
        <Pt f={G} x={c.mode === 'log' && scene >= 4 ? 1 : 0} y={c.mode === 'log' && scene >= 4 ? 0 : 1} label={c.mode === 'log' && scene >= 4 ? '(1, 0)' : '(0, 1)'}/><T x={W / 2} y={20} size={18}>{c.mode === 'log' ? `y = ${a}ˣ and y = log_${a} x` : `y = ${a}ˣ${scene >= 3 ? ` and y = (1/${a})ˣ` : ''}`}</T></g>; }
    default: { const steps = scene < 3 ? 0 : scene === 3 ? Math.floor(p * 6) : 10; const [lo, hi] = bisect(steps)[steps]; const G = frame(.5, 2.5, -2, 3);
      return <g><Axes f={G}/><Curve f={G} fn={x => x * x - 2} color={C.ones}/><rect x={G.X(lo)} y={G.y0} width={Math.max(2, G.X(hi) - G.X(lo))} height={G.h} fill={C.unknown} opacity={.15}/><Pt f={G} x={1} y={-1} color={C.bad}/><Pt f={G} x={2} y={2} color={C.good}/>
        <T x={W / 2} y={20} size={18}>interval [{fmt(lo, 4)}, {fmt(hi, 4)}] · √2 ≈ 1.4142</T></g>; }
  }
}

function Explore({c}: {c: FuncConfig}) {
  const [k, setK] = useState(c.k), [b, setB] = useState(c.b), [a, setA] = useState(c.a), [h, setH] = useState(c.h), [kk, setKK] = useState(c.mode === 'quadratic' ? c.k : c.k), [cc, setCC] = useState(c.mode === 'bisection' ? 0 : c.mode === 'system' ? c.f : c.c); const [pt, setPt] = useState<[number, number]>([c.x, c.y]); const [base, setBase] = useState(c.a);
  switch (c.mode) {
    case 'quadrants': return <Stage label={`Point (${pt[0]}, ${pt[1]})`} controls={<Readout>({pt[0]}, {pt[1]}) · {quadrantOf(pt[0], pt[1]) === 'axis' ? 'on an axis' : `quadrant ${quadrantOf(pt[0], pt[1])}`}</Readout>}>
      <Axes f={F}/><Pt f={F} x={pt[0]} y={pt[1]} label={`(${pt[0]}, ${pt[1]})`}/><Handle x={F.X(pt[0])} y={F.Y(pt[1])} label="Drag the point" keyStep={F.w / 12} onMove={(x, y) => setPt([clamp(Math.round((x - F.x0) / F.w * 12 - 6), -6, 6), clamp(Math.round(4.5 - (y - F.y0) / F.h * 9), -4, 4)])}/></Stage>;
    case 'linear': case 'linear-ineq': return <Stage label={`y = ${k}x + ${b}`} controls={<><Slider label="k" value={k} min={-4} max={4} step={.5} onChange={v => setK(v || .5)}/><Slider label="b" value={b} min={-4} max={4} step={.5} onChange={setB}/><Readout>y = {k}x {sgn(b)} · crosses x-axis at {fmt(-b / k, 2)} · {k > 0 ? 'increasing' : 'decreasing'}</Readout></>}>
      <Axes f={F}/><Curve f={F} fn={x => k * x + b}/><Pt f={F} x={0} y={b} color={C.tens}/><Pt f={F} x={-b / k} y={0}/></Stage>;
    case 'roots': case 'quad-ineq': { const r = quadRoots(a, c.b, cc); return <Stage label="Parabola roots" controls={<><Slider label="a" value={a} min={-2} max={2} step={.5} onChange={v => setA(v || .5)}/><Slider label="c" value={cc} min={-6} max={6} step={.5} onChange={setCC}/><Readout>Δ = {fmt(c.b * c.b - 4 * a * cc, 2)} → {r.length} real root{r.length === 1 ? '' : 's'} {r.map(v => fmt(v, 2)).join(', ')}</Readout></>}>
      <Axes f={F}/><Curve f={F} fn={x => a * x * x + c.b * x + cc}/>{r.map((v, i) => <Pt key={i} f={F} x={v} y={0}/>)}</Stage>; }
    case 'quadratic': return <Stage label="Vertex form" controls={<><Slider label="a" value={a} min={-3} max={3} step={.25} onChange={v => setA(v || .25)}/><Slider label="h" value={h} min={-4} max={4} step={.5} onChange={setH}/><Slider label="k" value={kk} min={-4} max={4} step={.5} onChange={setKK}/><Readout>y = {a}(x − {h})² {sgn(kk)} · vertex ({h}, {kk}) · opens {a > 0 ? 'up' : 'down'}</Readout></>}>
      <Axes f={F}/><Curve f={F} fn={x => x * x} color={C.faint} dash="4 4"/><Curve f={F} fn={x => a * (x - h) ** 2 + kk}/><Pt f={F} x={h} y={kk}/></Stage>;
    case 'inverse': return <Stage label={`y = ${kk}/x`} controls={<><Slider label="k" value={kk} min={-12} max={12} step={1} onChange={v => setKK(v || 1)}/><Readout>quadrants {kk > 0 ? 'I and III' : 'II and IV'} · rectangle area |k| = {Math.abs(kk)}</Readout></>}>
      <Axes f={F}/><Curve f={F} fn={x => kk / x} from={.02}/><Curve f={F} fn={x => kk / x} to={-.02}/><rect x={F.X(0)} y={Math.min(F.Y(kk / 2), F.Y(0))} width={F.X(2) - F.X(0)} height={Math.abs(F.Y(kk / 2) - F.Y(0))} fill={C.tens} opacity={.2}/></Stage>;
    case 'exponential': case 'log': return <Stage label={`base ${base}`} controls={<><Slider label="Base a" value={base} min={.2} max={4} step={.1} onChange={v => setBase(Math.abs(v - 1) < .05 ? 1.1 : v)}/><Readout>a = {base}: {base > 1 ? 'increasing' : 'decreasing'} · {c.mode === 'log' ? `log_a 1 = 0, log_a ${fmt(base, 1)} = 1` : `a⁰ = 1, a¹ = ${base}`}</Readout></>}>
      <Axes f={frame(-4, 6, -4, 6)}/><Curve f={frame(-4, 6, -4, 6)} fn={x => base ** x}/>{c.mode === 'log' && <Curve f={frame(-4, 6, -4, 6)} fn={x => Math.log(x) / Math.log(base)} color={C.tens} from={.02}/>}</Stage>;
    case 'system': { const s = solve2(c.a, c.b, c.c, c.d, c.e, cc); return <Stage label="System" controls={<><Slider label={`right side of line 2`} value={cc} min={-6} max={14} step={1} onChange={setCC}/><Readout>{s ? `intersection (${fmt(s.x, 2)}, ${fmt(s.y, 2)})` : 'parallel: no solution'}</Readout></>}><Scene c={{...c, f: cc}} scene={4} p={1}/></Stage>; }
    case 'bisection': { const steps = Math.round(cc) >= 0 && Math.round(cc) <= 12 ? Math.round(cc) : 0; const [lo, hi] = bisect(steps)[steps]; const G = frame(.5, 2.5, -2, 3);
      return <Stage label={`Bisection step ${steps}`} controls={<><Slider label="Halvings" value={steps} min={0} max={12} onChange={setCC}/><Readout>[{fmt(lo, 5)}, {fmt(hi, 5)}] · width {fmt(hi - lo, 5)}</Readout></>}>
        <Axes f={G}/><Curve f={G} fn={x => x * x - 2}/><rect x={G.X(lo)} y={G.y0} width={Math.max(2, G.X(hi) - G.X(lo))} height={G.h} fill={C.unknown} opacity={.15}/></Stage>; }
    default: return <Stage label={func.describe(c)} controls={<Readout>Step through the scenes in Observe; this is the finished picture.</Readout>}><Scene c={c} scene={4} p={1}/></Stage>;
  }
}

export const funcView: EngineView<FuncConfig> = {Scene: props => <Stage label={func.describe(props.c)}><Scene {...props}/></Stage>, Explore};

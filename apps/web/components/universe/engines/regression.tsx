'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider} from '../stage';
import {Axes, Curve, Pt, frame} from '../plot';
import {regression, XS, YS, fit, TABLE, chi2, type RegressionConfig} from '@/lib/universe/engines/regression';
import {eseg, fmt, lerp} from '@/lib/universe/math';
import type {EngineView} from './types';

const F = frame(0, 9, 0, 14, {x0: 70, y0: 40, w: 520, h: 370});
const best = fit(XS, YS);
function Plot({b, a, squares = 0, quad = false}: {b: number; a: number; squares?: number; quad?: boolean}) {
  return <g><Axes f={F} xLabel="spend" yLabel="sales"/>{quad && <><line x1={F.X(best.mx)} x2={F.X(best.mx)} y1={F.Y(0)} y2={F.Y(14)} stroke={C.unknown} strokeDasharray="4 4"/><line x1={F.X(0)} x2={F.X(9)} y1={F.Y(best.my)} y2={F.Y(best.my)} stroke={C.unknown} strokeDasharray="4 4"/></>}
    {XS.map((x, i) => { const yh = b * x + a, e = YS[i] - yh, s = Math.abs(F.Y(yh) - F.Y(YS[i])); return <g key={i}>{squares > 0 && <rect x={F.X(x)} y={Math.min(F.Y(yh), F.Y(YS[i]))} width={s * squares} height={s} fill={e > 0 ? C.tens : C.warn} opacity={.3}/>}{squares > 0 && <line x1={F.X(x)} x2={F.X(x)} y1={F.Y(yh)} y2={F.Y(YS[i])} stroke={C.ink}/>}</g>; })}
    <Curve f={F} fn={x => b * x + a} color={C.hundreds}/>{XS.map((x, i) => <Pt key={i} f={F} x={x} y={YS[i]} color={C.ones}/>)}</g>;
}
const sse = (b: number, a: number) => XS.reduce((s, x, i) => s + (YS[i] - b * x - a) ** 2, 0);
function Table({t = 1, expected = false}: {t?: number; expected?: boolean}) {
  const [[a, b], [c, d]] = TABLE, n = a + b + c + d, rows = [a + b, c + d], cols = [a + c, b + d];
  const cell = (v: number, i: number, j: number) => expected ? `${v} (${fmt((rows[i] * cols[j]) / n, 1)})` : String(v);
  return <g opacity={t} transform="translate(160 110)">{[['', 'Sleep well', 'Not', 'Total'], ['Exercise', cell(a, 0, 0), cell(b, 0, 1), String(rows[0])], ['No exercise', cell(c, 1, 0), cell(d, 1, 1), String(rows[1])], ['Total', String(cols[0]), String(cols[1]), String(n)]].map((row, i) => row.map((s, j) => <g key={i + '-' + j}><rect x={j * 130} y={i * 50} width={130} height={50} fill={i && j && i < 3 && j < 3 ? '#232031' : 'none'} stroke={C.line}/><T x={j * 130 + 65} y={i * 50 + 30} size={15} color={i === 0 || j === 0 ? C.muted : C.ink}>{s}</T></g>))}</g>;
}

function Scene({c, scene, p}: {c: RegressionConfig; scene: number; p: number}) {
  if (c.mode === 'contingency') return <g><Table t={scene < 2 ? .4 : 1} expected={scene >= 3}/>{scene >= 4 && <T x={W / 2} y={360} size={22} weight={600} color={C.good}>χ² = {fmt(chi2(TABLE), 3)} &gt; 3.841</T>}<T x={W / 2} y={60} size={16}>{scene >= 3 ? 'observed (expected if independent)' : '80% of exercisers vs 60% of others sleep well'}</T></g>;
  if (c.mode === 'correlation') return <g><Plot b={0} a={-99} quad={scene >= 3}/>{scene >= 4 && <T x={700} y={120} size={22} weight={600} color={C.good}>r = {fmt(best.r, 3)}</T>}</g>;
  const k = scene < 2 ? 0 : scene === 2 ? 0 : scene === 3 ? eseg(p, 0, .3) : 1;
  const tb = scene === 3 ? lerp(.4, best.b, eseg(p, .3, 1)) : scene > 3 ? best.b : .4, ta = scene === 3 ? lerp(8, best.a, eseg(p, .3, 1)) : scene > 3 ? best.a : 8;
  return <g><Plot b={tb} a={ta} squares={k}/>{scene >= 2 && <T x={700} y={120} size={16}>Σ e² = {fmt(sse(tb, ta), 2)}</T>}{scene >= 4 && <T x={700} y={160} size={16} color={C.hundreds}>ŷ = {fmt(best.b, 3)}x + {fmt(best.a, 3)}</T>}</g>;
}

function Explore({c}: {c: RegressionConfig}) {
  const [b, setB] = useState(1), [a, setA] = useState(3);
  if (c.mode === 'contingency') return <Stage label="Contingency table"><Table expected/><T x={W / 2} y={360} size={18}>χ² = n(ad − bc)² / [(a+b)(c+d)(a+c)(b+d)] = {fmt(chi2(TABLE), 3)}</T></Stage>;
  return <Stage label="Fit a line" controls={<><Slider label="Slope" value={b} min={0} max={2.5} step={.05} onChange={setB}/><Slider label="Intercept" value={a} min={-2} max={8} step={.1} onChange={setA}/><Readout>Σ e² = {fmt(sse(b, a), 3)} · best possible {fmt(sse(best.b, best.a), 3)} (b̂ = {fmt(best.b, 3)}, â = {fmt(best.a, 3)}) · r = {fmt(best.r, 3)}</Readout></>}><Plot b={b} a={a} squares={1}/></Stage>;
}

export const regressionView: EngineView<RegressionConfig> = {Scene: props => <Stage label={regression.describe(props.c)}><Scene {...props}/></Stage>, Explore};

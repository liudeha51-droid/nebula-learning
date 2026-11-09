'use client';
import type {ReactNode} from 'react';
import {T, C} from './stage';
import {fmt} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';

/** A coordinate frame mapping maths coordinates into the 800×450 stage. */
export interface Frame {xmin: number; xmax: number; ymin: number; ymax: number; x0: number; y0: number; w: number; h: number; X: (x: number) => number; Y: (y: number) => number}
export function frame(xmin: number, xmax: number, ymin: number, ymax: number, box = {x0: 60, y0: 30, w: 680, h: 390}): Frame {
  const X = (x: number) => box.x0 + ((x - xmin) / (xmax - xmin)) * box.w; const Y = (y: number) => box.y0 + box.h - ((y - ymin) / (ymax - ymin)) * box.h;
  return {xmin, xmax, ymin, ymax, ...box, X, Y};
}
const niceStep = (span: number) => { const raw = span / 10; const p = 10 ** Math.floor(Math.log10(raw)); return [1, 2, 5, 10].map(m => m * p).find(s => s >= raw)!; };

export function Axes({f, labels = true, grid = true, xLabel = 'x', yLabel = 'y', piTicks = false}: {f: Frame; labels?: boolean; grid?: boolean; xLabel?: string; yLabel?: string; piTicks?: boolean}) {
  const sx = piTicks ? Math.PI / 2 : niceStep(f.xmax - f.xmin), sy = niceStep(f.ymax - f.ymin);
  const xs = range(Math.floor(f.xmax / sx) - Math.ceil(f.xmin / sx) + 1).map(i => (Math.ceil(f.xmin / sx) + i) * sx);
  const ys = range(Math.floor(f.ymax / sy) - Math.ceil(f.ymin / sy) + 1).map(i => (Math.ceil(f.ymin / sy) + i) * sy);
  const ax = Math.min(Math.max(0, f.ymin), f.ymax), ay = Math.min(Math.max(0, f.xmin), f.xmax);
  const piLabel = (v: number) => { const k = Math.round(v / (Math.PI / 2)); return k === 0 ? '0' : k % 2 === 0 ? `${k / 2 === 1 ? '' : k / 2 === -1 ? '−' : k / 2}π` : `${k === 1 ? '' : k === -1 ? '−' : k}π/2`; };
  return <g>{grid && xs.map(x => <line key={'gx' + x} x1={f.X(x)} x2={f.X(x)} y1={f.Y(f.ymin)} y2={f.Y(f.ymax)} stroke="#fff" strokeOpacity={.06}/>)}{grid && ys.map(y => <line key={'gy' + y} x1={f.X(f.xmin)} x2={f.X(f.xmax)} y1={f.Y(y)} y2={f.Y(y)} stroke="#fff" strokeOpacity={.06}/>)}
    <line x1={f.X(f.xmin)} x2={f.X(f.xmax)} y1={f.Y(ax)} y2={f.Y(ax)} stroke={C.muted} strokeWidth={1.5}/><line x1={f.X(ay)} x2={f.X(ay)} y1={f.Y(f.ymin)} y2={f.Y(f.ymax)} stroke={C.muted} strokeWidth={1.5}/>
    {labels && xs.filter(x => Math.abs(x) > 1e-9).map(x => <T key={'lx' + x} x={f.X(x)} y={f.Y(ax) + 14} size={11} color={C.faint}>{piTicks ? piLabel(x) : fmt(x)}</T>)}
    {labels && ys.filter(y => Math.abs(y) > 1e-9).map(y => <T key={'ly' + y} x={f.X(ay) - 12} y={f.Y(y)} size={11} color={C.faint} anchor="end">{fmt(y)}</T>)}
    <T x={f.X(f.xmax) - 8} y={f.Y(ax) - 12} size={13} color={C.muted}>{xLabel}</T><T x={f.X(ay) + 14} y={f.Y(f.ymax) + 10} size={13} color={C.muted}>{yLabel}</T></g>;
}
/** Samples y = fn(x); breaks the path at discontinuities and outside the frame. */
export function Curve({f, fn, color = C.ones, width = 3, from, to, dash, opacity = 1}: {f: Frame; fn: (x: number) => number; color?: string; width?: number; from?: number; to?: number; dash?: string; opacity?: number}) {
  const a = from ?? f.xmin, b = to ?? f.xmax; const n = 360; let d = ''; let pen = false; let prev = NaN;
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n; const y = fn(x); const ok = Number.isFinite(y) && y > f.ymin - (f.ymax - f.ymin) && y < f.ymax + (f.ymax - f.ymin);
    const jump = Number.isFinite(prev) && Math.abs(y - prev) > (f.ymax - f.ymin) * .8;
    if (!ok || jump) { pen = false; prev = y; continue; }
    d += `${pen ? 'L' : 'M'}${f.X(x).toFixed(1)} ${f.Y(y).toFixed(1)}`; pen = true; prev = y;
  }
  return <g><defs><clipPath id={`clip-${f.x0}-${f.y0}-${f.w}`}><rect x={f.x0} y={f.y0} width={f.w} height={f.h}/></clipPath></defs><path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} opacity={opacity} clipPath={`url(#clip-${f.x0}-${f.y0}-${f.w})`} strokeLinejoin="round"/></g>;
}
export function Pt({f, x, y, color = C.unknown, r = 6, label}: {f: Frame; x: number; y: number; color?: string; r?: number; label?: ReactNode}) {
  return <g><circle cx={f.X(x)} cy={f.Y(y)} r={r} fill={color}/>{label !== undefined && <T x={f.X(x) + 10} y={f.Y(y) - 14} size={13} color={color} anchor="start">{label}</T>}</g>;
}

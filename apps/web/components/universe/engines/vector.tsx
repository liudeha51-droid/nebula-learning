'use client';
import {useState} from 'react';
import {Stage, T, C, Readout, Handle, Segmented} from '../stage';
import {Axes, frame, type Frame} from '../plot';
import {vector, dot, len, type VectorConfig} from '@/lib/universe/engines/vector';
import {clamp, eseg, fmt, lerp} from '@/lib/universe/math';
import type {EngineView} from './types';

export const VF = frame(-7, 9, -4, 5);
export function Vec({f = VF, x0 = 0, y0 = 0, x, y, color, label, width = 4, dash}: {f?: Frame; x0?: number; y0?: number; x: number; y: number; color: string; label?: string; width?: number; dash?: string}) {
  const X1 = f.X(x0), Y1 = f.Y(y0), X2 = f.X(x0 + x), Y2 = f.Y(y0 + y), a = Math.atan2(Y2 - Y1, X2 - X1), L = Math.hypot(X2 - X1, Y2 - Y1);
  if (L < 1) return <g/>;
  const h = Math.min(14, L * .4), hx = X2 - h * Math.cos(a), hy = Y2 - h * Math.sin(a);
  return <g><line x1={X1} y1={Y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeDasharray={dash}/><path d={`M${X2} ${Y2} L${hx + 7 * Math.sin(a)} ${hy - 7 * Math.cos(a)} L${hx - 7 * Math.sin(a)} ${hy + 7 * Math.cos(a)} Z`} fill={color}/>{label && <T x={(X1 + X2) / 2 - 14 * Math.sin(a)} y={(Y1 + Y2) / 2 + 14 * Math.cos(a) - 4} size={15} color={color} weight={700}>{label}</T>}</g>;
}

function Scene({c, scene, p}: {c: VectorConfig; scene: number; p: number}) {
  const {ax, ay, bx, by} = c, t = scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .8) : 1;
  if (c.mode === 'dot') {
    const k = dot(c) / (ax * ax + ay * ay), px = k * ax, py = k * ay, sh = scene >= 2 ? (scene === 2 ? eseg(p, 0, .8) : 1) : 0;
    const rot = scene === 4 ? eseg(p, .2, .8) : 0; const bb: [number, number] = rot ? [lerp(bx, -ay * len(bx, by) / len(ax, ay), rot), lerp(by, ax * len(bx, by) / len(ax, ay), rot)] : [bx, by];
    const k2 = (ax * bb[0] + ay * bb[1]) / (ax * ax + ay * ay);
    return <g><Axes f={VF}/><Vec x={ax} y={ay} color={C.ones} label="a"/><Vec x={bb[0]} y={bb[1]} color={C.tens} label="b"/>{sh > 0 && <><line x1={VF.X(bb[0])} y1={VF.Y(bb[1])} x2={VF.X(lerp(bb[0], k2 * ax, sh))} y2={VF.Y(lerp(bb[1], k2 * ay, sh))} stroke={C.muted} strokeDasharray="4 4"/><Vec x={k2 * ax * sh} y={k2 * ay * sh} color={C.unknown} width={7}/></>}
      <T x={640} y={60} size={18}>a · b = {fmt(ax * bb[0] + ay * bb[1], 2)}</T>{scene >= 3 && <T x={640} y={95} size={15} color={C.unknown}>shadow {fmt(len(px, py), 3)} × |a| {fmt(len(ax, ay), 3)}</T>}</g>;
  }
  const sx = scene === 3 ? eseg(p, 0, .8) : 0;
  return <g><Axes f={VF}/><Vec x={ax} y={ay} color={C.ones} label="a"/><Vec x0={lerp(0, ax, t)} y0={lerp(0, ay, t)} x={bx} y={by} color={C.tens} label="b"/>
    {scene >= 3 && <><Vec x={bx} y={by} color={C.tens} dash="5 4" width={2}/><Vec x0={bx} y0={by} x={ax * sx} y={ay * sx} color={C.ones} dash="5 4" width={2}/></>}
    {scene >= 2 && t >= 1 && <Vec x={ax + bx} y={ay + by} color={C.unknown} label="a + b"/>}{scene >= 4 && <T x={640} y={60} size={16}>|a| + |b| = {fmt(len(ax, ay) + len(bx, by), 3)} · |a + b| = {fmt(len(ax + bx, ay + by), 3)}</T>}</g>;
}

function Explore({c}: {c: VectorConfig}) {
  const [a, setA] = useState<[number, number]>([c.ax, c.ay]), [b, setB] = useState<[number, number]>([c.bx, c.by]); const [op, setOp] = useState<'sum' | 'diff'>('sum');
  const snap = (sx: number, sy: number): [number, number] => { const x = Math.round((sx - VF.x0) / VF.w * 16 - 7), y = Math.round(5 - (sy - VF.y0) / VF.h * 9); return [clamp(x, -7, 9), clamp(y, -4, 5)]; };
  const d = a[0] * b[0] + a[1] * b[1], th = len(...a) && len(...b) ? (Math.acos(clamp(d / (len(...a) * len(...b)), -1, 1)) * 180) / Math.PI : 0;
  const r: [number, number] = op === 'sum' ? [a[0] + b[0], a[1] + b[1]] : [a[0] - b[0], a[1] - b[1]];
  return <Stage label="Drag the arrow tips" controls={<>{c.mode === 'add' && <Segmented label="Show" value={op} onChange={setOp} options={[['sum', 'a + b'], ['diff', 'a − b']]}/>}<Readout>a = ({a.join(', ')}) · b = ({b.join(', ')}) · {c.mode === 'dot' ? `a · b = ${d} · θ = ${fmt(th, 1)}°${d === 0 ? ' — perpendicular!' : ''}` : `${op === 'sum' ? 'a + b' : 'a − b'} = (${r.join(', ')}) · |·| = ${fmt(len(...r), 3)}`}</Readout></>}>
    <Axes f={VF}/><Vec x={a[0]} y={a[1]} color={C.ones} label="a"/><Vec x={b[0]} y={b[1]} color={C.tens} label="b"/>{c.mode === 'add' && <Vec x={r[0]} y={r[1]} color={C.unknown} label={op === 'sum' ? 'a + b' : 'a − b'}/>}
    {c.mode === 'dot' && len(...a) > 0 && <Vec x={(d / (a[0] ** 2 + a[1] ** 2)) * a[0]} y={(d / (a[0] ** 2 + a[1] ** 2)) * a[1]} color={C.unknown} width={7}/>}
    <Handle x={VF.X(a[0])} y={VF.Y(a[1])} label="tip of a" color={C.ones} onMove={(x, y) => setA(snap(x, y))} keyStep={VF.w / 16}/><Handle x={VF.X(b[0])} y={VF.Y(b[1])} label="tip of b" color={C.tens} onMove={(x, y) => setB(snap(x, y))} keyStep={VF.w / 16}/></Stage>;
}

export const vectorView: EngineView<VectorConfig> = {Scene: props => <Stage label={vector.describe(props.c)}><Scene {...props}/></Stage>, Explore};

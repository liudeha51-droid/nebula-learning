'use client';
import {useState} from 'react';
import {Stage, T, C, Readout, Slider, Action} from '../stage';
import {Axes, frame, Pt} from '../plot';
import {Vec} from './vector';
import {complex, cstr, type ComplexConfig} from '@/lib/universe/engines/complex';
import {eseg, fmt} from '@/lib/universe/math';
import type {EngineView} from './types';

const F = frame(-6.5, 6.5, -5.5, 5.5, {x0: 130, y0: 20, w: 520, h: 410});
const rot = (a: number, b: number, q: number): [number, number] => { const th = (q * Math.PI) / 2; return [a * Math.cos(th) - b * Math.sin(th), a * Math.sin(th) + b * Math.cos(th)]; };

function Scene({c, scene, p}: {c: ComplexConfig; scene: number; p: number}) {
  const {a, b} = c;
  if (c.mode === 'multiply') { const q = scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .8) : scene === 3 ? 1 + eseg(p, 0, .8) : scene === 4 ? 2 + 2 * eseg(p, 0, .8) : 1; const [x, y] = rot(a, b, q);
    return <g><Axes f={F} xLabel="Re" yLabel="Im"/><circle cx={F.X(0)} cy={F.Y(0)} r={Math.hypot(a, b) * (F.w / 13)} fill="none" stroke={C.line} strokeDasharray="4 4"/><Vec f={F} x={a} y={b} color={C.ones} label="z" width={2}/><Vec f={F} x={x} y={y} color={C.unknown} width={4}/><Pt f={F} x={x} y={y} label={cstr(Math.round(x * 100) / 100, Math.round(y * 100) / 100)}/>
      <T x={720} y={60} size={20}>× i{q >= 1.99 ? '²' : ''}{q >= 3.99 ? '²' : ''}</T><T x={720} y={95} size={14} color={C.muted}>{fmt(q * 90, 0)}°</T></g>; }
  const t = scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .8) : 1;
  return <g><Axes f={F} xLabel="Re" yLabel="Im"/>{scene >= 2 && <><line x1={F.X(0)} x2={F.X(a * t)} y1={F.Y(0)} y2={F.Y(0)} stroke={C.ones} strokeWidth={4}/><line x1={F.X(a)} x2={F.X(a)} y1={F.Y(0)} y2={F.Y(b * t)} stroke={C.tens} strokeWidth={4}/></>}{t >= 1 && <Pt f={F} x={a} y={b} label={`z = ${cstr(a, b)}`}/>}
    {scene >= 3 && <Vec f={F} x={a} y={b} color={C.unknown} width={2} label={`|z| = ${fmt(Math.hypot(a, b), 3)}`}/>}{scene >= 4 && <><Pt f={F} x={a} y={-b} color={C.hundreds} label={`z̄ = ${cstr(a, -b)}`}/><line x1={F.X(a)} x2={F.X(a)} y1={F.Y(b)} y2={F.Y(-b)} stroke={C.hundreds} strokeDasharray="4 4"/></>}
    {scene < 2 && <T x={390} y={60} size={22}>x² = −1 ?</T>}</g>;
}

function Explore({c}: {c: ComplexConfig}) {
  const [a, setA] = useState(c.a), [b, setB] = useState(c.b), [q, setQ] = useState(0);
  const [x, y] = rot(a, b, q); const rx = Math.round(x), ry = Math.round(y);
  return <Stage label="Complex plane" controls={<><Slider label="Real" value={a} min={-5} max={5} onChange={v => { setA(v); setQ(0); }}/><Slider label="Imaginary" value={b} min={-5} max={5} onChange={v => { setB(v); setQ(0); }}/>{c.mode === 'multiply' && <><Action primary onClick={() => setQ((q + 1) % 4)}>× i</Action></>}<Readout>{c.mode === 'multiply' ? `z·i^${q} = ${cstr(rx, ry)}` : `z = ${cstr(a, b)} · |z| = ${fmt(Math.hypot(a, b), 3)} · z̄ = ${cstr(a, -b)}`}</Readout></>}>
    <Axes f={F} xLabel="Re" yLabel="Im"/><Vec f={F} x={a} y={b} color={C.ones} label="z"/>{c.mode === 'multiply' ? q > 0 && <Vec f={F} x={x} y={y} color={C.unknown} label={`z·i${q > 1 ? '^' + q : ''}`}/> : <><Pt f={F} x={a} y={-b} color={C.hundreds} label="z̄"/></>}</Stage>;
}

export const complexView: EngineView<ComplexConfig> = {Scene: props => <Stage label={complex.describe(props.c)}><Scene {...props}/></Stage>, Explore};

'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Stepper} from '../stage';
import {sequence, term, sum, type SequenceConfig} from '@/lib/universe/engines/sequence';
import {eseg, fmt, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

function Bars({c, show, mirror = 0, n = c.n}: {c: SequenceConfig; show: number; mirror?: number; n?: number}) {
  const vals = range(n).map(i => term(c, i + 1)); const max = Math.max(...vals.map(Math.abs), 1) * (mirror ? 1 : 1); const bw = Math.min(70, 640 / n), base = 400, k = 250 / (mirror ? Math.max(...vals) + Math.min(...vals) : max);
  return <g>{range(n).map(i => { const v = vals[i], h = v * k, x = 80 + i * bw; const on = i < show; const mv = mirror ? vals[n - 1 - i] * k : 0;
    return <g key={i} opacity={on ? 1 : .12}><rect x={x} y={base - h} width={bw - 6} height={Math.max(0, h)} fill={C.ones} opacity={.75}/>{mirror > 0 && <rect x={x} y={base - h - mv * mirror} width={bw - 6} height={mv * mirror} fill={C.tens} opacity={.6}/>}<T x={x + bw / 2 - 3} y={base - h - 8 - mv * mirror} size={12}>{fmt(v)}</T><T x={x + bw / 2 - 3} y={base + 18} size={11} color={C.muted}>a{i + 1}</T></g>; })}
    <line x1={70} x2={760} y1={base} y2={base} stroke={C.muted}/></g>;
}
function Dominoes({fallen, n = 10}: {fallen: number; n?: number}) {
  return <g>{range(n).map(i => { const a = Math.min(1, Math.max(0, fallen - i)) * 62; return <g key={i} transform={`translate(${110 + i * 60} 360) rotate(${a})`}><rect x={-8} y={-100} width={16} height={100} rx={3} fill={i === 0 ? C.unknown : C.ones}/><T x={0} y={-108} size={13} color={C.muted}>{i + 1}</T></g>; })}<line x1={70} x2={760} y1={360} y2={360} stroke={C.muted}/></g>;
}

function Scene({c, scene, p}: {c: SequenceConfig; scene: number; p: number}) {
  if (c.mode === 'induction') { const f = scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .8) : scene === 3 ? 1 + eseg(p, 0, .8) : scene >= 4 ? (scene === 4 ? 2 + p * 9 : 11) : 0;
    return <g><Dominoes fallen={f}/><T x={W / 2} y={60} size={20}>{scene === 2 ? 'P(1): 1 = 1²' : scene === 3 ? 'P(k) ⇒ P(k + 1): k² + (2k + 1) = (k + 1)²' : scene >= 4 ? 'P(n) holds for every n' : '1 + 3 + 5 + … + (2n − 1) = n²'}</T></g>; }
  const show = scene < 2 ? 1 : scene === 2 ? Math.ceil(lerp(1, c.n, p)) : c.n; const mir = c.mode === 'arithmetic' && scene === 3 ? eseg(p, .1, .9) : c.mode === 'arithmetic' && scene === 4 ? 1 : 0;
  return <g><Bars c={c} show={show} mirror={mir}/>{scene >= 3 && <T x={W / 2} y={50} size={18}>{c.mode === 'arithmetic' ? `${c.n} columns × (a₁ + aₙ) = ${fmt(c.n * (c.a1 + term(c, c.n)))} = 2Sₙ` : `S − qS = a₁ − a₁qⁿ`}</T>}{scene >= 4 && <T x={W / 2} y={82} size={18} color={C.good}>a{c.n} = {fmt(term(c, c.n))} · S{c.n} = {fmt(sum(c))}</T>}</g>;
}

function Explore({c}: {c: SequenceConfig}) {
  const [a1, setA1] = useState(c.a1), [d, setD] = useState(c.mode === 'geometric' ? c.q : c.d), [n, setN] = useState(c.n); const [fallen, setFallen] = useState(0);
  if (c.mode === 'induction') return <Stage label="Dominoes" controls={<><Slider label="Push" value={fallen} min={0} max={11} step={.25} onChange={setFallen}/><Readout>{fallen < 1 ? 'Base case first: tip domino 1.' : `${Math.min(10, Math.floor(fallen))} fallen — each one knocks the next.`}</Readout></>}><Dominoes fallen={fallen}/></Stage>;
  const cc = {...c, a1, d, q: d, n}; const geo = c.mode === 'geometric';
  return <Stage label="Sequence builder" controls={<><Stepper label="a₁" value={a1} min={1} max={9} onChange={setA1}/><Stepper label={geo ? 'q' : 'd'} value={d} min={geo ? 1 : 0} max={geo ? 3 : 6} onChange={setD}/><Stepper label="n" value={n} min={2} max={10} onChange={setN}/><Readout>a{n} = {fmt(term(cc, n))} · S{n} = {fmt(sum(cc, n))}</Readout></>}><Bars c={cc} show={n} n={n}/></Stage>;
}

export const sequenceView: EngineView<SequenceConfig> = {Scene: props => <Stage label={sequence.describe(props.c)}><Scene {...props}/></Stage>, Explore};

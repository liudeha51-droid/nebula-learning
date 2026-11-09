'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Stepper, Slider} from '../stage';
import {tiles, type TilesConfig} from '@/lib/universe/engines/tiles';
import {eseg, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const XL = 110, U = 22; // pixel length of x and of 1
type Tile = {x: number; y: number; w: number; h: number; color: string; label?: string; neg?: boolean};
const Tl = ({t, opacity = 1}: {t: Tile; opacity?: number}) => <g opacity={opacity}><rect x={t.x} y={t.y} width={t.w - 2} height={t.h - 2} rx={3} fill={t.neg ? C.bad : t.color} fillOpacity={.75} stroke="#15141d"/>{t.label && t.w > 26 && t.h > 18 && <T x={t.x + t.w / 2} y={t.y + t.h / 2} size={13} color="#15141d" weight={700}>{t.label}</T>}</g>;
/** (x + a)(x + b) rectangle at (x0, y0); returns tiles. */
function rect(a: number, b: number, x0: number, y0: number): Tile[] {
  const t: Tile[] = [{x: x0, y: y0, w: XL, h: XL, color: C.hundreds, label: 'x²'}];
  range(a).forEach(i => t.push({x: x0 + XL + i * U, y: y0, w: U, h: XL, color: C.tens, label: 'x'}));
  range(b).forEach(j => t.push({x: x0, y: y0 + XL + j * U, w: XL, h: U, color: C.tens, label: 'x'}));
  range(a).forEach(i => range(b).forEach(j => t.push({x: x0 + XL + i * U, y: y0 + XL + j * U, w: U, h: U, color: C.ones})));
  return t;
}
const lerpT = (s: Tile, d: Tile, k: number): Tile => ({...d, x: lerp(s.x, d.x, k), y: lerp(s.y, d.y, k)});

function Scene({c, scene, p}: {c: TilesConfig; scene: number; p: number}) {
  const {a, b} = c;
  switch (c.mode) {
    case 'like-terms': { const pile: Tile[] = [...range(a).map(i => ({x: 100 + i * 70, y: 110, w: U, h: XL, color: C.tens, label: 'x'})), ...range(b).map(i => ({x: 140 + i * 90, y: 270, w: U, h: XL, color: C.tens, label: 'x'})), {x: 520, y: 100, w: XL, h: XL, color: C.hundreds, label: 'x²'}, {x: 620, y: 280, w: U, h: U, color: C.ones}];
      const sorted: Tile[] = [...range(a + b).map(i => ({x: 100 + i * (U + 4), y: 150, w: U, h: XL, color: C.tens, label: 'x'})), {x: 470, y: 150, w: XL, h: XL, color: C.hundreds, label: 'x²'}, {x: 640, y: 190, w: U, h: U, color: C.ones}];
      const k = scene < 2 ? 0 : scene === 2 ? eseg(p, .1, .9) : 1;
      return <g>{pile.map((t, i) => <Tl key={i} t={lerpT(t, sorted[i], k)}/>)}<T x={W / 2} y={50} size={24} weight={600}>{scene >= 4 ? `${a}x + ${b}x + x² + 1 = x² + ${a + b}x + 1` : `${a}x + ${b}x + x² + 1`}</T>{scene >= 3 && <T x={200} y={300} size={18} color={C.tens}>{a + b} x-rods</T>}</g>; }
    case 'brackets': { const flip = scene === 2 ? eseg(p, .2, .8) : scene > 2 ? 1 : 0; const cancel = scene === 3 ? eseg(p, .2, .8) : scene > 3 ? 1 : 0;
      const first: Tile[] = [...range(3).map(i => ({x: 80 + i * 30, y: 120, w: U, h: XL, color: C.tens, label: 'x'})), ...range(2).map(i => ({x: 200 + i * 26, y: 120, w: U, h: U, color: C.ones}))];
      const second: Tile[] = [{x: 420, y: 120, w: U, h: XL, color: C.tens, label: 'x', neg: flip >= .5}, ...range(5).map(i => ({x: 470 + i * 26, y: 120, w: U, h: U, color: C.ones, neg: flip < .5}))];
      return <g>{first.map((t, i) => <Tl key={i} t={t} opacity={i === 0 ? 1 - cancel * .85 : 1}/>)}{second.map((t, i) => <Tl key={'s' + i} t={t} opacity={i === 0 ? 1 - cancel * .85 : 1}/>)}
        <T x={160} y={300} size={18}>(3x + 2)</T><T x={520} y={300} size={18}>{flip >= .5 ? '−x + 5' : '− (x − 5)'}</T><T x={W / 2} y={50} size={24} weight={600}>{scene >= 4 ? '(3x + 2) − (x − 5) = 2x + 7' : '(3x + 2) − (x − 5)'}</T><T x={W / 2} y={380} size={14} color={C.muted}>red = negative tile · a red and a yellow of the same shape cancel</T></g>; }
    case 'diff-squares': { const S = 30; const k = scene === 3 ? eseg(p, .1, .9) : scene > 3 ? 1 : 0; const x0 = 200, y0 = 60 + b * S;
      const from = {x: x0 + (a - b) * S, y: y0 + b * S, w: b * S, h: (a - b) * S}, to = {x: x0, y: y0 - b * S, w: (a - b) * S, h: b * S};
      return <g><rect x={x0} y={y0} width={(a - b) * S} height={a * S} fill={C.hundreds} opacity={.7} stroke="#15141d"/>
        <rect x={lerp(from.x, to.x, k)} y={lerp(from.y, to.y, k)} width={lerp(from.w, to.w, k)} height={lerp(from.h, to.h, k)} fill={C.tens} opacity={.75} stroke="#15141d"/>
        {scene < 3 && <rect x={x0 + (a - b) * S} y={y0} width={b * S} height={b * S} fill="none" stroke={C.bad} strokeDasharray="5 4"/>}
        {scene < 2 && <rect x={x0 + (a - b) * S} y={y0} width={b * S} height={b * S} fill={C.bad} opacity={.15}/>}
        <T x={620} y={150} size={22}>{a}² − {b}² = {a * a - b * b}</T>{scene >= 4 && <T x={620} y={190} size={22} color={C.tens}>= ({a} + {b}) × ({a} − {b})</T>}</g>; }
    case 'factor': case 'expand': { const T0 = rect(a, b, 260, 70); const pile = T0.map((t, i) => ({...t, x: 80 + (i * 97) % 560, y: 300 + ((i * 53) % 80)}));
      const k = c.mode === 'expand' ? 1 : scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .4) * (1 / T0.length) : scene === 3 ? eseg(p, .05, .95) : 1;
      return <g>{T0.map((t, i) => <Tl key={i} t={c.mode === 'factor' ? lerpT(pile[i], t, i === 0 ? Math.min(1, k * T0.length) : scene >= 3 ? k : 0) : t} opacity={c.mode === 'expand' && scene === 2 && i > Math.ceil(p * T0.length) ? .15 : 1}/>)}
        {(c.mode === 'expand' || scene >= 4) && <><T x={260 + XL / 2} y={55} size={16} color={C.hundreds}>x</T><T x={260 + XL + (a * U) / 2} y={55} size={16} color={C.ones}>+ {a}</T><T x={240} y={70 + XL / 2} size={16} color={C.hundreds}>x</T><T x={240} y={70 + XL + (b * U) / 2} size={16} color={C.ones}>+ {b}</T></>}
        <T x={620} y={130} size={20} weight={600}>(x + {a})(x + {b})</T><T x={620} y={165} size={20}>= x² + {a + b}x + {a * b}</T></g>; }
    case 'simplify': { const fade = scene >= 3 ? eseg(scene === 3 ? p : 1, .2, .9) : 0;
      return <g><rect x={260} y={90} width={XL + a * U} height={XL - a * U} fill={C.hundreds} opacity={.6} stroke="#15141d"/><T x={260 + (XL + a * U) / 2} y={60} size={18} color={C.ones}>x + {a}</T><T x={230} y={90 + (XL - a * U) / 2} size={18} color={C.tens} opacity={1 - fade}>x − {a}</T>
        <line x1={240} x2={240} y1={90} y2={90 + XL - a * U} stroke={C.tens} strokeWidth={4} opacity={1 - fade}/><T x={620} y={130} size={20}>(x² − {a * a})/(x − {a})</T>{scene >= 2 && <T x={620} y={165} size={20}>= (x + {a})(x − {a})/(x − {a})</T>}{scene >= 4 && <T x={620} y={200} size={20} color={C.good}>= x + {a}, x ≠ {a}</T>}</g>; }
    case 'complete-square': { const h = b / 2; const split = scene >= 2 ? (scene === 2 ? eseg(p, .1, .9) : 1) : 0; const fill = scene >= 3 ? (scene === 3 ? eseg(p, .3, .8) : 1) : 0; const x0 = 240, y0 = 70;
      return <g><rect x={x0} y={y0} width={XL} height={XL} fill={C.hundreds} opacity={.7} stroke="#15141d"/><T x={x0 + XL / 2} y={y0 + XL / 2} size={16} color="#15141d" weight={700}>x²</T>
        <rect x={x0 + XL} y={y0} width={h * U} height={XL} fill={C.tens} opacity={.7} stroke="#15141d"/>
        <rect x={lerp(x0 + XL + h * U, x0, split)} y={lerp(y0, y0 + XL, split)} width={lerp(h * U, XL, split)} height={lerp(XL, h * U, split)} fill={C.tens} opacity={.7} stroke="#15141d"/>
        <rect x={x0 + XL} y={y0 + XL} width={h * U} height={h * U} fill={C.ones} opacity={fill * .8} stroke={fill > 0 ? '#15141d' : C.bad} strokeDasharray={fill > 0 ? '' : '4 4'}/>
        <T x={620} y={130} size={20}>x² + {b}x = {c.c}</T>{scene >= 3 && <T x={620} y={165} size={20} color={C.ones}>+ {h * h} on both sides</T>}{scene >= 4 && <T x={620} y={200} size={20} color={C.good}>(x + {h})² = {c.c + h * h}</T>}</g>; }
  }
  return <g/>;
}

function Explore({c}: {c: TilesConfig}) {
  const [a, setA] = useState(c.a), [b, setB] = useState(c.b);
  if (c.mode === 'expand' || c.mode === 'factor') return <Stage label={`(x + ${a})(x + ${b})`} controls={<><Stepper label="a" value={a} min={0} max={6} onChange={setA}/><Stepper label="b" value={b} min={0} max={6} onChange={setB}/><Readout>(x + {a})(x + {b}) = x² + {a + b}x + {a * b}</Readout></>}>{rect(a, b, 220, 60).map((t, i) => <Tl key={i} t={t}/>)}</Stage>;
  if (c.mode === 'complete-square') return <Stage label="Complete the square" controls={<><Slider label="b (even)" value={b} min={2} max={10} step={2} onChange={setB}/><Readout>x² + {b}x + {(b / 2) ** 2} = (x + {b / 2})²</Readout></>}><Scene c={{...c, b}} scene={4} p={1}/></Stage>;
  if (c.mode === 'diff-squares') return <Stage label="Difference of squares" controls={<><Stepper label="a" value={a} min={2} max={9} onChange={v => { setA(v); if (b >= v) setB(v - 1); }}/><Stepper label="b" value={b} min={1} max={a - 1} onChange={setB}/><Readout>{a}² − {b}² = {a * a - b * b} = {a + b} × {a - b}</Readout></>}><Scene c={{...c, a, b}} scene={4} p={1}/></Stage>;
  return <Stage label={tiles.describe(c)} controls={<Readout>Step through the scenes in Observe to see the tiles move.</Readout>}><Scene c={c} scene={4} p={1}/></Stage>;
}

export const tilesView: EngineView<TilesConfig> = {Scene: props => <Stage label={tiles.describe(props.c)}><Scene {...props}/></Stage>, Explore};

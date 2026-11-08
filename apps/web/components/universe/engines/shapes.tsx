'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Segmented, Slider, Obj, useSound} from '../stage';
import {shapes, CITY_PARTS, type ShapesConfig} from '@/lib/universe/engines/shapes';
import {eseg, lerp} from '@/lib/universe/math';
import type {EngineView} from './types';

type Piece = {kind: 'rect' | 'tri' | 'circle' | 'para'; x: number; y: number; w: number; h: number; rot?: number; color: string; flip?: boolean};
function Draw({p}: {p: Piece}) {
  const {x, y, w, h} = p; const tf = `rotate(${p.rot ?? 0} ${x + w / 2} ${y + h / 2})`;
  if (p.kind === 'circle') return <circle cx={x + w / 2} cy={y + h / 2} r={w / 2} fill={p.color} opacity={.85}/>;
  if (p.kind === 'tri') return <polygon transform={tf} points={p.flip ? `${x},${y} ${x + w},${y} ${x + w},${y + h}` : `${x},${y} ${x},${y + h} ${x + w},${y + h}`} fill={p.color} opacity={.85} stroke="#15141d" strokeWidth={2}/>;
  if (p.kind === 'para') return <polygon transform={tf} points={`${x + w * .25},${y} ${x + w},${y} ${x + w * .75},${y + h} ${x},${y + h}`} fill={p.color} opacity={.85} stroke="#15141d" strokeWidth={2}/>;
  return <rect transform={tf} x={x} y={y} width={w} height={h} fill={p.color} opacity={.85} stroke="#15141d" strokeWidth={2}/>;
}
const lerpPiece = (a: Piece, b: Piece, t: number): Piece => ({...b, x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t), rot: lerp(a.rot ?? 0, b.rot ?? 0, t)});
// The geometric city: assembled positions and exploded positions.
const CITY: [Piece, Piece][] = [
  [{kind: 'rect', x: 120, y: 180, w: 120, h: 200, color: C.hundreds}, {kind: 'rect', x: 60, y: 120, w: 120, h: 200, color: C.hundreds}],
  [{kind: 'rect', x: 260, y: 240, w: 160, h: 140, color: C.tens}, {kind: 'rect', x: 230, y: 250, w: 160, h: 140, color: C.tens}],
  [{kind: 'rect', x: 440, y: 150, w: 90, h: 230, color: C.accent}, {kind: 'rect', x: 450, y: 170, w: 90, h: 230, color: C.accent}],
  ...[0, 1, 2, 3].map(i => [{kind: 'rect', x: 140 + (i % 2) * 50, y: 210 + Math.floor(i / 2) * 60, w: 30, h: 30, color: C.ones}, {kind: 'rect', x: 590 + (i % 2) * 50, y: 130 + Math.floor(i / 2) * 50, w: 30, h: 30, color: C.ones}] as [Piece, Piece]),
  [{kind: 'tri', x: 260, y: 170, w: 80, h: 70, color: C.thousands}, {kind: 'tri', x: 240, y: 110, w: 80, h: 70, color: C.thousands}],
  [{kind: 'tri', x: 340, y: 170, w: 80, h: 70, color: C.thousands, flip: true}, {kind: 'tri', x: 340, y: 110, w: 80, h: 70, color: C.thousands, flip: true}],
  [{kind: 'circle', x: 620, y: 50, w: 70, h: 70, color: '#ffd27a'}, {kind: 'circle', x: 680, y: 300, w: 70, h: 70, color: '#ffd27a'}],
  [{kind: 'para', x: 100, y: 385, w: 600, h: 30, color: '#4b4560'}, {kind: 'para', x: 100, y: 405, w: 600, h: 30, color: '#4b4560'}],
];
const ROCKET: [Piece, Piece][] = [
  [{kind: 'rect', x: 120, y: 260, w: 60, h: 120, color: C.accent}, {kind: 'rect', x: 370, y: 160, w: 60, h: 160, color: C.accent}],
  [{kind: 'tri', x: 220, y: 300, w: 60, h: 60, color: C.thousands, rot: 0}, {kind: 'tri', x: 370, y: 100, w: 30, h: 60, color: C.thousands}],
  [{kind: 'tri', x: 300, y: 300, w: 60, h: 60, color: C.thousands, flip: true}, {kind: 'tri', x: 400, y: 100, w: 30, h: 60, color: C.thousands, flip: true}],
  [{kind: 'tri', x: 600, y: 300, w: 50, h: 60, color: C.ones}, {kind: 'tri', x: 320, y: 260, w: 50, h: 60, color: C.ones}],
  [{kind: 'tri', x: 670, y: 300, w: 50, h: 60, color: C.ones, flip: true}, {kind: 'tri', x: 430, y: 260, w: 50, h: 60, color: C.ones, flip: true}],
];

function Scene({c, scene, p}: {c: ShapesConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'compose': { if (scene <= 2) { const t = scene === 2 ? eseg(p, .1, .8) : 0; return <g><Draw p={{kind: 'tri', x: lerp(150, 330, t), y: 150, w: 140, h: 140, color: C.ones}}/><Draw p={{kind: 'tri', x: lerp(510, 330, t), y: 150, w: 140, h: 140, color: C.tens, flip: true}}/><T x={W / 2} y={60} size={22} weight={600}>{t >= 1 ? 'two triangles = one square' : 'two triangles'}</T></g>; }
      const t = scene === 3 ? eseg(p, .05, .95) : 1; return <g>{ROCKET.map(([a, b], i) => <Draw key={i} p={lerpPiece(a, b, t)}/>)}<T x={W / 2} y={50} size={22} weight={600}>{t >= 1 ? '1 rectangle + 4 triangles = rocket' : 'build a rocket'}</T></g>; }
    case 'position': { const flip = scene >= 3; return <g><rect x={150} y={300} width={500} height={14} fill="#6b5a4a"/><rect x={330} y={230} width={100} height={70} fill="#b07a52"/><Obj kind="chick" x={380} y={200} r={26} color="#f7e08a"/><Obj kind="ball" x={250} y={278} r={20} color={C.thousands}/><Obj kind="rabbit" x={540} y={268} r={28} color="#e6dcf2"/>
      {scene >= 2 && <T x={380} y={150} size={16} color={C.ones}>chick above the box</T>}{scene >= 3 && <><T x={250} y={340} size={15} color={C.accent}>our left</T><T x={540} y={340} size={15} color={C.unknown}>teddy faces us: ball is on its right</T></>}
      <T x={W / 2} y={60} size={22} weight={600}>{flip ? 'left and right depend on the viewer' : 'Where is each toy?'}</T></g>; }
    case 'city': { const t = scene < 2 ? 0 : scene === 2 ? eseg(p, .05, .9) : 1; return <g>{CITY.map(([a, b], i) => <Draw key={i} p={lerpPiece(a, b, t)}/>)}
      {scene >= 3 && <T x={W / 2} y={30} size={18} weight={600}>{CITY_PARTS.map(q => `${q.n} ${q.shape}${q.n > 1 ? 's' : ''}`).join(' · ')}</T>}</g>; }
    default: { const turn = scene === 3 ? 45 * eseg(p, .1, .8) : scene > 3 ? 45 : 0; const items: Piece[] = [{kind: 'rect', x: 80, y: 160, w: 100, h: 100, color: C.ones, rot: turn}, {kind: 'rect', x: 220, y: 175, w: 140, h: 80, color: C.tens}, {kind: 'tri', x: 400, y: 160, w: 100, h: 100, color: C.thousands}, {kind: 'circle', x: 540, y: 160, w: 100, h: 100, color: C.accent}, {kind: 'para', x: 660, y: 180, w: 120, h: 70, color: C.hundreds}];
      const names = ['square', 'rectangle', 'triangle', 'circle', 'parallelogram']; const info = ['4 sides · 4 corners', '4 sides · 4 corners', '3 sides · 3 corners', 'no corners', '4 sides · 4 corners'];
      return <g>{items.map((q, i) => <g key={i} opacity={scene >= 2 ? 1 : .6}><Draw p={q}/>{scene >= 2 && <T x={q.x + q.w / 2} y={300} size={15}>{names[i]}</T>}{scene >= 4 && <T x={q.x + q.w / 2} y={325} size={12} color={C.muted}>{info[i]}</T>}</g>)}
        {scene >= 3 && <T x={130} y={120} size={14} color={C.ones}>still a square!</T>}</g>; }
  }
}

function Explore({c}: {c: ShapesConfig}) {
  const sound = useSound(); const [t, setT] = useState(c.mode === 'city' ? 0 : 1); const [view, setView] = useState<'ours' | 'teddy'>('ours'); const [turn, setTurn] = useState(0);
  if (c.mode === 'position') return <Stage label="Position" controls={<><Segmented label="Viewpoint" value={view} onChange={v => { setView(v); sound('whoosh'); }} options={[['ours', 'Our view'], ['teddy', 'Teddy’s view']]}/><Readout>From {view === 'ours' ? 'our side the ball is on the LEFT of the box' : 'the teddy’s side (facing us) the ball is on the RIGHT'}</Readout></>}>
    <g style={{transform: view === 'teddy' ? 'scaleX(-1)' : 'none', transformOrigin: '400px 0', transition: 'transform .6s'}}><Scene c={c} scene={2} p={1}/></g></Stage>;
  if (c.mode === 'classify') return <Stage label="Turn the square" controls={<><Slider label="Turn the square" value={turn} min={0} max={90} step={5} onChange={setTurn} format={v => `${v}°`}/><Readout>Turned {turn}°: still 4 equal sides and 4 right angles — still a square.</Readout></>}>
    <g transform={`rotate(${turn} ${W / 2} 220)`}><rect x={W / 2 - 80} y={140} width={160} height={160} fill={C.ones} opacity={.8}/></g></Stage>;
  return <Stage label={c.mode === 'city' ? 'Take the city apart' : 'Build the rocket'} controls={<><Slider label={c.mode === 'city' ? 'Take apart' : 'Assemble'} value={t} min={0} max={1} step={.05} onChange={setT} format={v => `${Math.round(v * 100)}%`}/><Readout>{c.mode === 'city' ? CITY_PARTS.map(q => `${q.n} ${q.shape}`).join(' · ') : '1 rectangle + 4 triangles'}</Readout></>}>
    {(c.mode === 'city' ? CITY : ROCKET).map(([a, b], i) => <Draw key={i} p={lerpPiece(a, b, t)}/>)}</Stage>;
}

export const shapesView: EngineView<ShapesConfig> = {Scene: props => <Stage label={shapes.describe(props.c)}><Scene {...props}/></Stage>, Explore};

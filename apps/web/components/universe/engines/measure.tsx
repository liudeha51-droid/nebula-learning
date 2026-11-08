'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Stepper, Segmented, Handle} from '../stage';
import {measure, LENGTH_UNITS, type MeasureConfig} from '@/lib/universe/engines/measure';
import {clamp, eseg, fmt, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const CM = 50;
function Ruler({x, y, cm = 12}: {x: number; y: number; cm?: number}) {
  return <g><rect x={x - 10} y={y} width={cm * CM + 20} height={50} rx={4} fill="#e9d9a6"/>{range(cm * 10 + 1).map(i => <line key={i} x1={x + i * CM / 10} x2={x + i * CM / 10} y1={y} y2={y + (i % 10 === 0 ? 22 : i % 5 === 0 ? 15 : 9)} stroke="#3a2f1c"/>)}
    {range(cm + 1).map(i => <T key={i} x={x + i * CM} y={y + 34} size={13} color="#3a2f1c">{i}</T>)}</g>;
}
function Crayon({x, y, len, color = C.thousands}: {x: number; y: number; len: number; color?: string}) {
  return <g><rect x={x} y={y - 14} width={len - 20} height={28} rx={4} fill={color}/><polygon points={`${x + len - 20},${y - 14} ${x + len},${y} ${x + len - 20},${y + 14}`} fill="#f3d1a8"/></g>;
}

function Scene({c, scene, p}: {c: MeasureConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'compare': { const align = scene === 3 ? eseg(p, .1, .8) : scene > 3 ? 1 : 0; const redX = 160, blueX = lerp(260, 160, align);
      return <g><Crayon x={redX} y={170} len={380} color={C.thousands}/><Crayon x={blueX} y={260} len={330} color={C.accent}/>{scene >= 2 && <line x1={160} x2={160} y1={130} y2={300} stroke={C.ink} strokeDasharray={align >= 1 ? '' : '4 4'}/>}
        {scene >= 4 && <><line x1={540} x2={540} y1={140} y2={300} stroke={C.ones} strokeDasharray="4 4"/><T x={W / 2} y={360} size={20} color={C.ones}>the red pencil is longer</T></>}<T x={W / 2} y={60} size={22} weight={600}>{scene === 2 ? 'starts are not lined up!' : scene >= 3 ? 'same starting line' : 'Which is longer?'}</T></g>; }
    case 'units': { const z = scene < 2 ? 0 : scene === 2 ? p * 4 : 3; const k = Math.min(4, Math.floor(z)); const u = LENGTH_UNITS[k];
      const objs = ['grain of rice ≈ 5 mm', 'pencil ≈ 18 cm', 'book ≈ 2 dm', 'classroom ≈ 8 m', 'road ≈ 3 km'];
      return <g>{range(11).map(i => <g key={i}><line x1={100 + i * 60} x2={100 + i * 60} y1={200} y2={i % 5 === 0 ? 230 : 220} stroke={C.ink}/><T x={100 + i * 60} y={250} size={12} color={C.muted}>{i}</T></g>)}<line x1={100} x2={700} y1={200} y2={200} stroke={C.ink} strokeWidth={2}/>
        <T x={W / 2} y={150} size={28} weight={700} color={C.ones}>unit: {u[0]}</T><T x={W / 2} y={300} size={18} color={C.muted}>{objs[k]}</T>
        <T x={W / 2} y={60} size={20} weight={600}>{scene >= 3 ? '1 m = 10 dm = 100 cm = 1000 mm · 1 km = 1000 m' : k < 4 ? `10 ${u[0]} = 1 ${LENGTH_UNITS[k + 1][0]}` : '1000 m = 1 km'}</T></g>; }
    case 'mass': { const items = [['strawberry', '20 g', 20], ['melon', '2 kg', 2000], ['car', '1 t', 1e6]] as const; const k = scene < 2 ? 0 : scene === 2 ? 0 : scene === 3 ? 1 : 2;
      return <g><polygon points={`${W / 2 - 20},380 ${W / 2 + 20},380 ${W / 2},220`} fill="#3a3550"/><line x1={W / 2 - 220} x2={W / 2 + 220} y1={220} y2={220} stroke={C.ink} strokeWidth={6}/>
        <circle cx={W / 2 - 200} cy={190} r={[22, 40, 55][k]} fill={[C.bad, C.good, C.accent][k]}/><T x={W / 2 - 200} y={260} size={15}>{items[k][0]}</T>
        <rect x={W / 2 + 160} y={150} width={80} height={60} rx={6} fill={C.ones}/><T x={W / 2 + 200} y={180} size={18} color="#15141d" weight={700}>{items[k][1]}</T>
        <T x={W / 2} y={60} size={22} weight={600}>{scene >= 4 ? '1 t = 1000 kg · 1 kg = 1000 g' : items[k][1]}</T></g>; }
    case 'scale': { const z = scene < 3 ? 0 : scene === 3 ? eseg(p, .1, .9) : 1; const actual = c.map * c.scale;
      return <g><rect x={lerp(120, 40, z)} y={lerp(120, 70, z)} width={lerp(560, 720, z)} height={lerp(220, 320, z)} rx={10} fill="#27402f" stroke="#4e7a5a"/><circle cx={lerp(180, 90, z)} cy={230} r={10} fill={C.ones}/><circle cx={lerp(180 + c.map * 50, 750, z)} cy={230} r={10} fill={C.ones}/>
        <line x1={lerp(180, 90, z)} x2={lerp(180 + c.map * 50, 750, z)} y1={230} y2={230} stroke={C.ones} strokeDasharray="6 4" strokeWidth={2}/><T x={W / 2} y={260} size={18} color={C.ones}>{z < .5 ? `${c.map} cm on the map` : `${fmt(actual / 100)} m in the park`}</T>
        <T x={W / 2} y={40} size={22} weight={600}>scale 1 : {fmt(c.scale)}{scene >= 4 ? ` → ${fmt(actual / 100000)} km` : ''}</T>{scene >= 2 && <T x={W / 2} y={410} size={15} color={C.muted}>1 cm on the map = {fmt(c.scale)} cm = {fmt(c.scale / 100)} m</T>}</g>; }
    default: { const wrong = scene === 2; const start = wrong ? 1 : 0; const x0 = 100; const len = c.length * CM;
      return <g><Ruler x={x0} y={250}/><Crayon x={x0 + start * CM} y={215} len={len}/>{scene >= 3 && range(c.length).map(i => <path key={i} d={`M${x0 + i * CM + 4} 200 Q${x0 + (i + .5) * CM} 186 ${x0 + (i + 1) * CM - 4} 200`} fill="none" stroke={C.ones} strokeWidth={2} opacity={scene === 3 ? (i < p * c.length * 1.2 ? 1 : 0) : 1}/>)}
        <T x={W / 2} y={60} size={22} weight={600}>{wrong ? `starts at 1, ends at ${c.length + 1} → ${c.length} cm, not ${c.length + 1}` : scene >= 3 ? `${c.length} cm` : 'Estimate first…'}</T></g>; }
  }
}

function Explore({c}: {c: MeasureConfig}) {
  const [len, setLen] = useState(c.length); const [start, setStart] = useState(c.mode === 'ruler' ? 1 : 0); const [scale, setScale] = useState(c.scale); const [map, setMap] = useState(c.map); const [unit, setUnit] = useState(3); const [shift, setShift] = useState(60);
  if (c.mode === 'scale') return <Stage label="Scale" controls={<><Segmented label="Scale" value={String(scale)} onChange={v => setScale(Number(v))} options={[['1000', '1 : 1 000'], ['10000', '1 : 10 000'], ['50000', '1 : 50 000'], ['100000', '1 : 100 000']]}/><Slider label="Map distance (cm)" value={map} min={1} max={12} onChange={setMap}/><Readout>{map} cm × {fmt(scale)} = {fmt(map * scale)} cm = {fmt(map * scale / 100)} m = {fmt(map * scale / 100000)} km</Readout></>}><Scene c={{...c, scale, map: Math.min(map, 10)}} scene={2} p={1}/></Stage>;
  if (c.mode === 'units') { const mm = 1000 * 2.5; return <Stage label="Convert" controls={<><Stepper label="Unit" value={unit} min={0} max={4} onChange={setUnit} format={v => LENGTH_UNITS[v][0]}/><Readout>2.5 m = {LENGTH_UNITS.map(([n, f]) => `${fmt(mm / f, 6)} ${n}`).join(' = ')}</Readout></>}><T x={W / 2} y={200} size={44} weight={700} color={C.ones}>{fmt(mm / LENGTH_UNITS[unit][1], 6)} {LENGTH_UNITS[unit][0]}</T><T x={W / 2} y={260} size={18} color={C.muted}>the same length: 2.5 m</T></Stage>; }
  if (c.mode === 'compare') return <Stage label="Compare" controls={<Readout>Drag the blue pencil until the starts line up.</Readout>}><Crayon x={160} y={170} len={380}/><Crayon x={160 + shift} y={260} len={330} color={C.accent}/><line x1={160} x2={160} y1={130} y2={300} stroke={C.ink} strokeDasharray="4 4"/><Handle x={160 + shift} y={260} label="Slide the blue pencil" onMove={x => setShift(clamp(x - 160, -100, 200))}/>
    <T x={W / 2} y={60} size={20}>{Math.abs(shift) < 6 ? 'Lined up: red is longer by ' + fmt((380 - 330) / CM, 1) + ' cm' : 'Starts not aligned'}</T></Stage>;
  if (c.mode === 'mass') return <Stage label="Mass" controls={<Readout>1 t = 1000 kg · 1 kg = 1000 g</Readout>}><Scene c={c} scene={4} p={1}/></Stage>;
  return <Stage label={`Crayon ${len} cm`} controls={<><Stepper label="Length" value={len} min={1} max={10} onChange={setLen}/><Stepper label="Start mark" value={start} min={0} max={2} onChange={setStart}/><Readout>ends at {start + len} − starts at {start} = {len} cm{start ? ' (better: start at 0)' : ''}</Readout></>}>
    <Ruler x={100} y={250}/><Crayon x={100 + start * CM} y={215} len={len * CM}/></Stage>;
}

export const measureView: EngineView<MeasureConfig> = {Scene: props => <Stage label={measure.describe(props.c)}><Scene {...props}/></Stage>, Explore};

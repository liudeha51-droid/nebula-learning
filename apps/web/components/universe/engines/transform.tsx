'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Segmented, Stepper} from '../stage';
import {transform, FLAG, rotatePt, polyArea, type TransformConfig} from '@/lib/universe/engines/transform';
import {eseg, lerp} from '@/lib/universe/math';
import {Grid, gx, gy} from './coordinate';
import type {EngineView} from './types';

type P = [number, number];
const pts = (ps: P[]) => ps.map(([x, y]) => `${gx(x)},${gy(y)}`).join(' ');
const place = (dx: number, dy: number): P[] => FLAG.map(([x, y]) => [x + dx, y + dy]);

function Scene({c, scene, p}: {c: TransformConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'rotate': { const base = place(3, 2); const centre: P = [3, 2]; const ang = scene < 2 ? 0 : scene === 2 ? c.angle * eseg(p, .1, .9) : c.angle; const img = base.map(q => rotatePt(q, centre, ang));
      return <g><Grid/><polygon points={pts(base)} fill={C.hundreds} opacity={.25} stroke={C.hundreds} strokeDasharray="4 4"/><polygon points={pts(img)} fill={C.ones} opacity={.7} stroke={C.ones} strokeWidth={2}/>
        {scene >= 3 && base.map((q, i) => <line key={i} x1={gx(centre[0])} y1={gy(centre[1])} x2={gx(img[i][0])} y2={gy(img[i][1])} stroke={C.tens} strokeDasharray="3 4" opacity={.7}/>)}
        <circle cx={gx(centre[0])} cy={gy(centre[1])} r={7} fill={C.unknown}/><T x={W / 2 + 200} y={50} size={22} weight={600}>{Math.round(ang)}° clockwise</T></g>; }
    case 'reflect': { const mirror = 5; const base: P[] = [[2, 1], [4, 1], [4, 3], [5, 4], [3, 5], [2, 4]].map(([x, y]) => [x, y]) as P[]; const t = scene < 2 ? 0 : scene === 2 ? eseg(p, .1, .9) : 1;
      const img = base.map(([x, y]) => [lerp(x, 2 * mirror - x, t), y] as P);
      return <g><Grid/><line x1={gx(mirror)} x2={gx(mirror)} y1={gy(0) + 10} y2={gy(7) - 10} stroke={C.unknown} strokeWidth={3} strokeDasharray="8 5"/><polygon points={pts(base)} fill={C.hundreds} opacity={.6} stroke={C.hundreds}/>{t > 0 && <polygon points={pts(img)} fill={C.ones} opacity={.55} stroke={C.ones}/>}
        {scene >= 3 && base.map(([x, y], i) => <g key={i}><line x1={gx(x)} x2={gx(2 * mirror - x)} y1={gy(y)} y2={gy(y)} stroke={C.tens} strokeDasharray="3 4"/><T x={gx((x + mirror) / 2)} y={gy(y) - 10} size={11} color={C.tens}>{mirror - x}</T></g>)}
        <T x={W / 2 + 200} y={50} size={20} weight={600}>{scene >= 4 ? 'axis-symmetric figure' : 'mirror line'}</T></g>; }
    case 'scale': { const k = scene < 2 ? 1 : scene === 2 ? lerp(1, c.k, eseg(p, .1, .9)) : c.k; const img = FLAG.map(([x, y]) => [1 + x * k, y * k + .5] as P);
      return <g><Grid/><polygon points={pts(FLAG.map(([x, y]) => [1 + x, y + .5] as P))} fill={C.hundreds} opacity={.35} stroke={C.hundreds}/><polygon points={pts(img)} fill={C.ones} opacity={.45} stroke={C.ones} strokeWidth={2}/>
        <T x={W / 2 + 200} y={50} size={22} weight={600}>× {Math.round(k * 10) / 10}: area {Math.round(polyArea(FLAG) * k * k * 10) / 10}</T>{scene >= 3 && <T x={W / 2 + 200} y={80} size={16} color={C.muted}>lengths × {c.k} → area × {c.k * c.k}</T>}</g>; }
    default: { const base = place(1, 3); const t = scene < 2 ? 0 : scene === 2 ? eseg(p, .1, .9) : 1; const img = base.map(([x, y]) => [x + c.dx * t, y + c.dy * t] as P);
      return <g><Grid/><polygon points={pts(base)} fill={C.hundreds} opacity={.3} stroke={C.hundreds} strokeDasharray="4 4"/><polygon points={pts(img)} fill={C.ones} opacity={.7} stroke={C.ones} strokeWidth={2}/>
        {scene >= 2 && base.map(([x, y], i) => <line key={i} x1={gx(x)} y1={gy(y)} x2={gx(x + c.dx * t)} y2={gy(y + c.dy * t)} stroke={C.tens} opacity={.5}/>)}
        {scene >= 3 && <><circle cx={gx(base[0][0])} cy={gy(base[0][1])} r={6} fill={C.unknown}/><circle cx={gx(base[0][0] + c.dx)} cy={gy(base[0][1] + c.dy)} r={6} fill={C.unknown}/></>}
        <T x={W / 2 + 200} y={50} size={22} weight={600}>{Math.abs(c.dx)} {c.dx >= 0 ? 'right' : 'left'}, {Math.abs(c.dy)} {c.dy >= 0 ? 'up' : 'down'}</T></g>; }
  }
}

function Explore({c}: {c: TransformConfig}) {
  const [dx, setDx] = useState(c.dx), [dy, setDy] = useState(c.dy), [ang, setAng] = useState(c.angle), [k, setK] = useState(c.k); const [mode, setMode] = useState<TransformConfig['mode']>(c.mode);
  const cfg = {...c, mode, dx, dy, angle: ang, k};
  return <Stage label={transform.describe(cfg)} controls={<><Segmented label="Transformation" value={mode} onChange={setMode} options={[['translate', 'Translate'], ['rotate', 'Rotate'], ['reflect', 'Reflect'], ['scale', 'Scale']]}/>
    {mode === 'translate' && <><Stepper label="Right" value={dx} min={-1} max={6} onChange={setDx}/><Stepper label="Up" value={dy} min={-3} max={3} onChange={setDy}/></>}
    {mode === 'rotate' && <Slider label="Angle (clockwise)" value={ang} min={0} max={360} step={15} onChange={setAng}/>}
    {mode === 'scale' && <Slider label="Scale factor" value={k} min={.5} max={2.5} step={.5} onChange={setK}/>}
    <Readout>{mode === 'scale' ? `lengths × ${k}, area ${polyArea(FLAG)} → ${polyArea(FLAG) * k * k}` : 'Size and shape are preserved.'}</Readout></>}><Scene c={cfg} scene={4} p={1}/></Stage>;
}

export const transformView: EngineView<TransformConfig> = {Scene: props => <Stage label={transform.describe(props.c)}><Scene {...props}/></Stage>, Explore};

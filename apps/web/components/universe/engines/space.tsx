'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Segmented, Slider} from '../stage';
import {Mesh, Rotator, project, shade, type Cam, type Face} from './solid';
import {space, CUBE, relation, type SpaceConfig, type P3} from '@/lib/universe/engines/space';
import {eseg, fmt, lerp} from '@/lib/universe/math';
import type {EngineView} from './types';

const cam0: Cam = {yaw: -30, pitch: 22, s: 170, cx: 400, cy: 300};
const at = (k: string): P3 => { const [x, y, z] = CUBE[k]; return [x - .5, y - .5, z]; };
function Seg3({cam, a, b, color, width = 3, dash}: {cam: Cam; a: P3; b: P3; color: string; width?: number; dash?: string}) { const p = project(cam, a), q = project(cam, b); return <line x1={p.X} y1={p.Y} x2={q.X} y2={q.Y} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round"/>; }
function Arrow3({cam, a, b, color, label}: {cam: Cam; a: P3; b: P3; color: string; label?: string}) { const p = project(cam, a), q = project(cam, b), ang = Math.atan2(q.Y - p.Y, q.X - p.X);
  return <g><line x1={p.X} y1={p.Y} x2={q.X - 10 * Math.cos(ang)} y2={q.Y - 10 * Math.sin(ang)} stroke={color} strokeWidth={4}/><path d={`M${q.X} ${q.Y} l${-14 * Math.cos(ang) + 6 * Math.sin(ang)} ${-14 * Math.sin(ang) - 6 * Math.cos(ang)} l${-12 * Math.sin(ang)} ${12 * Math.cos(ang)} Z`} fill={color}/>{label && <T x={(p.X + q.X) / 2 + 14} y={(p.Y + q.Y) / 2 - 8} size={14} color={color} weight={700}>{label}</T>}</g>; }
const EDGES: [string, string][] = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A1', 'B1'], ['B1', 'C1'], ['C1', 'D1'], ['D1', 'A1'], ['A', 'A1'], ['B', 'B1'], ['C', 'C1'], ['D', 'D1']];
function Cube({cam, hi = [], labels = true}: {cam: Cam; hi?: [[string, string], string][]; labels?: boolean}) {
  return <g>{EDGES.map(([a, b]) => <Seg3 key={a + b} cam={cam} a={at(a)} b={at(b)} color={C.line} width={2}/>)}{hi.map(([[a, b], col]) => <Seg3 key={'h' + a + b} cam={cam} a={at(a)} b={at(b)} color={col} width={5}/>)}
    {labels && Object.keys(CUBE).map(k => { const p = project(cam, at(k)); return <T key={k} x={p.X + (CUBE[k][0] ? 14 : -14)} y={p.Y + (CUBE[k][2] ? -10 : 18)} size={13} color={C.muted}>{k.replace('1', '₁')}</T>; })}</g>;
}
const prismPts = (h: number): [P3[], P3[]] => { const b: P3[] = [[-.6, -.5, 0], [.6, -.5, 0], [0, .6, 0]]; return [b, b.map(([x, y]) => [x, y, h] as P3)]; };
function Prism({cam, split}: {cam: Cam; split: number}) {
  const [b, t] = prismPts(1.1); const off = (k: number): P3 => [(k - 1) * 1.1 * split, 0, 0];
  const mv = (p: P3, k: number): P3 => [p[0] + off(k)[0], p[1], p[2]];
  const tet = (pts: P3[], k: number, col: string): Face[] => { const q = pts.map(p => mv(p, k)); return [[0, 1, 2], [0, 1, 3], [1, 2, 3], [0, 2, 3]].map(ix => ({pts: ix.map(i => q[i]), fill: shade(col, .6 + .1 * ix[0] + .1 * ix[2]), opacity: .85})); };
  return <Mesh cam={cam} faces={[...tet([b[0], b[1], b[2], t[0]], 0, C.ones), ...tet([b[1], b[2], t[0], t[1]], 1, C.tens), ...tet([b[2], t[0], t[1], t[2]], 2, C.hundreds)]}/>;
}
function Plane({cam, z = 0, size = 1.4, color = C.accent, opacity = .18}: {cam: Cam; z?: number; size?: number; color?: string; opacity?: number}) { const ps = ([[-size, -size, z], [size, -size, z], [size, size, z], [-size, size, z]] as P3[]).map(p => project(cam, p)); return <polygon points={ps.map(p => `${p.X},${p.Y}`).join(' ')} fill={color} fillOpacity={opacity} stroke={color} strokeOpacity={.5}/>; }

function View({c, cam, scene, p}: {c: SpaceConfig; cam: Cam; scene: number; p: number}) {
  switch (c.mode) {
    case 'pyramid': return <g><Prism cam={cam} split={scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .8) : scene >= 5 ? 0 : 1}/>{scene >= 3 && <T x={W / 2} y={40} size={18}>{scene >= 4 ? 'V(pyramid) = ⅓ S h' : 'three pyramids · equal base and height in pairs'}</T>}</g>;
    case 'relations': { const pairs: [[string, string], [string, string]][] = [[['A', 'B'], ['A', 'D']], [['A', 'B'], ['D1', 'C1']], [['A', 'B'], ['C', 'C1']]]; const k = Math.max(0, Math.min(2, scene - 2)); const [e1, e2] = pairs[k];
      return <g><Cube cam={cam} hi={scene >= 2 ? [[e1, C.ones], [e2, C.unknown]] : []}/>{scene >= 2 && <T x={W / 2} y={40} size={20} weight={600}>{relation(e1, e2)}</T>}</g>; }
    case 'perpendicular': { const sweep = scene === 3 ? p * Math.PI : scene > 3 ? Math.PI * .7 : 0; const L = (a: number, col: string) => <Seg3 cam={cam} a={[-1.2 * Math.cos(a), -1.2 * Math.sin(a), 0]} b={[1.2 * Math.cos(a), 1.2 * Math.sin(a), 0]} color={col}/>;
      return <g><Plane cam={cam}/>{scene >= 2 && <>{L(0, C.ones)}{L(Math.PI / 2, C.tens)}</>}{scene >= 3 && L(sweep, C.hundreds)}<Seg3 cam={cam} a={[0, 0, 0]} b={[0, 0, 1.4]} color={C.unknown} width={6}/>{scene >= 2 && <T x={W / 2} y={40} size={18}>{scene >= 4 ? 'l ⊥ a, l ⊥ b, a ∩ b ⇒ l ⊥ α' : 'l ⊥ a and l ⊥ b'}</T>}</g>; }
    case 'vectors': { const s = scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .8) : 1; const st = scene >= 3 ? (scene === 3 ? eseg(p, 0, .9) : 1) : 0; const A = at('A');
      const leg = (i: number) => Math.min(1, Math.max(0, st * 3 - i)); const B = at('B'), Cc = at('C'), C1 = at('C1'); const mix = (u: P3, v: P3, t: number): P3 => [lerp(u[0], v[0], t), lerp(u[1], v[1], t), lerp(u[2], v[2], t)];
      return <g><Cube cam={cam}/>{s > 0 && <><Arrow3 cam={cam} a={A} b={[A[0] + s, A[1], A[2]]} color={C.ones} label="AB"/><Arrow3 cam={cam} a={A} b={[A[0], A[1] + s, A[2]]} color={C.tens} label="AD"/><Arrow3 cam={cam} a={A} b={[A[0], A[1], A[2] + s]} color={C.hundreds} label="AA₁"/></>}
        {scene >= 3 && <><Seg3 cam={cam} a={A} b={mix(A, B, leg(0))} color={C.ones} dash="5 4"/><Seg3 cam={cam} a={B} b={mix(B, Cc, leg(1))} color={C.tens} dash="5 4"/><Seg3 cam={cam} a={Cc} b={mix(Cc, C1, leg(2))} color={C.hundreds} dash="5 4"/><Arrow3 cam={cam} a={A} b={at('C1')} color={C.unknown} label={scene >= 4 ? 'AC₁ = (1, 1, 1)' : 'AC₁'}/></>}</g>; }
    default: { const pl = ['B', 'D', 'A1'].map(at); const ps = pl.map(q => project(cam, q)); const mid: P3 = [(pl[0][0] + pl[1][0] + pl[2][0]) / 3, (pl[0][1] + pl[1][1] + pl[2][1]) / 3, (pl[0][2] + pl[1][2] + pl[2][2]) / 3]; const k = scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .8) : 1;
      return <g><Cube cam={cam}/><polygon points={ps.map(q => `${q.X},${q.Y}`).join(' ')} fill={C.accent} fillOpacity={.25} stroke={C.accent}/>{k > 0 && <Arrow3 cam={cam} a={mid} b={[mid[0] + .45 * k, mid[1] + .45 * k, mid[2] + .45 * k]} color={C.good} label="n"/>}{scene >= 3 && <Seg3 cam={cam} a={at('A')} b={at('C1')} color={C.unknown} width={4} dash="6 4"/>}{scene >= 4 && <T x={W / 2} y={40} size={18}>u = (1, 1, 1) ∥ n ⇒ AC₁ ⊥ plane A₁BD</T>}</g>; }
  }
}

function Scene({c, scene, p}: {c: SpaceConfig; scene: number; p: number}) { const cam = {...cam0, yaw: cam0.yaw + lerp(-6, 6, (scene + p) / 7)}; return <View c={c} cam={cam} scene={scene} p={p}/>; }

function Explore({c}: {c: SpaceConfig}) {
  const [cam, setCam] = useState(cam0); const [k, setK] = useState(4); const [pair, setPair] = useState<'int' | 'par' | 'skew'>('skew'); const [split, setSplit] = useState(1);
  if (c.mode === 'pyramid') return <Stage label="Drag to rotate" controls={<><Slider label="Separate" value={split} min={0} max={1} step={.05} onChange={setSplit}/><Readout>Three equal pyramids = one prism: V = ⅓Sh each</Readout></>}><Rotator cam={cam} setCam={setCam}><Prism cam={cam} split={split}/></Rotator></Stage>;
  if (c.mode === 'relations') { const m: Record<string, [[string, string], [string, string]]> = {int: [['A', 'B'], ['B', 'C']], par: [['A', 'B'], ['D1', 'C1']], skew: [['A', 'B'], ['C', 'C1']]}; const [e1, e2] = m[pair];
    return <Stage label="Drag to rotate" controls={<><Segmented label="Pair" value={pair} onChange={setPair} options={[['int', 'AB, BC'], ['par', 'AB, D₁C₁'], ['skew', 'AB, CC₁']]}/><Readout>{relation(e1, e2)} — rotate the cube to check from every side</Readout></>}><Rotator cam={cam} setCam={setCam}><Cube cam={cam} hi={[[e1, C.ones], [e2, C.unknown]]}/></Rotator></Stage>; }
  return <Stage label="Drag to rotate" controls={<><Slider label="Step" value={k} min={2} max={4} onChange={setK}/><Readout>Drag the model; arrow keys also rotate. {c.mode === 'normal' ? `n = (1, 1, 1) · n·BD = ${fmt(0)} · n·BA₁ = ${fmt(0)}` : ''}</Readout></>}><Rotator cam={cam} setCam={setCam}><View c={c} cam={cam} scene={k} p={1}/></Rotator></Stage>;
}

export const spaceView: EngineView<SpaceConfig> = {Scene: props => <Stage label={space.describe(props.c)}><Scene {...props}/></Stage>, Explore};

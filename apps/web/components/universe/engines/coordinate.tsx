'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Action, Arrow, useSound} from '../stage';
import {coordinate, DIRS, ROUTE, type CoordConfig} from '@/lib/universe/engines/coordinate';
import {eseg, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

export const G = {x0: 120, y0: 400, s: 46, cols: 10, rows: 7};
export const gx = (x: number) => G.x0 + x * G.s, gy = (y: number) => G.y0 - y * G.s;
export function Grid({labels = true}: {labels?: boolean}) {
  return <g>{range(G.cols + 1).map(i => <line key={'v' + i} x1={gx(i)} x2={gx(i)} y1={gy(0)} y2={gy(G.rows)} stroke="#fff" strokeOpacity={i ? .12 : .5}/>)}{range(G.rows + 1).map(j => <line key={'h' + j} x1={gx(0)} x2={gx(G.cols)} y1={gy(j)} y2={gy(j)} stroke="#fff" strokeOpacity={j ? .12 : .5}/>)}
    {labels && range(G.cols + 1).map(i => <T key={'lx' + i} x={gx(i)} y={gy(0) + 18} size={12} color={C.muted}>{i}</T>)}{labels && range(G.rows + 1).map(j => <T key={'ly' + j} x={gx(0) - 16} y={gy(j)} size={12} color={C.muted}>{j}</T>)}</g>;
}
function Compass({x = 720, y = 90, r = 40}: {x?: number; y?: number; r?: number}) {
  return <g><circle cx={x} cy={y} r={r} fill="#1f1d2b" stroke={C.line}/><polygon points={`${x},${y - r + 6} ${x - 8},${y} ${x + 8},${y}`} fill={C.thousands}/><polygon points={`${x},${y + r - 6} ${x - 8},${y} ${x + 8},${y}`} fill={C.muted}/>
    <T x={x} y={y - r - 12} size={14} weight={700} color={C.thousands}>N</T><T x={x} y={y + r + 12} size={13}>S</T><T x={x + r + 12} y={y} size={13}>E</T><T x={x - r - 12} y={y} size={13}>W</T></g>;
}
const routePts = () => { const pts: [number, number][] = [[1, 1]]; for (const [d, n] of ROUTE) { const [dx, dy] = DIRS[d]; const [x, y] = pts[pts.length - 1]; pts.push([x + dx * n, y + dy * n]); } return pts; };

function Scene({c, scene, p}: {c: CoordConfig; scene: number; p: number}) {
  if (c.mode === 'directions') { const pts = routePts(); const total = ROUTE.length; const prog = scene < 3 ? 0 : scene === 3 ? p * total : total; const k = Math.min(total, Math.floor(prog)), f = prog - k;
    const cur = k >= total ? pts[total] : [lerp(pts[k][0], pts[k + 1][0], eseg(f, 0, 1)), lerp(pts[k][1], pts[k + 1][1], eseg(f, 0, 1))];
    return <g><Grid labels={false}/>{[[2, 4, 'school'], [7, 5, 'park'], [6, 1, 'shop']].map(([x, y, n]) => <g key={n as string}><rect x={gx(x as number) - 20} y={gy(y as number) - 20} width={40} height={40} rx={6} fill={C.hundreds} opacity={.5}/><T x={gx(x as number)} y={gy(y as number) + 30} size={12} color={C.muted}>{n}</T></g>)}
      <rect x={gx(1) - 16} y={gy(1) - 16} width={32} height={32} rx={6} fill={C.ones}/><T x={gx(1)} y={gy(1) + 28} size={12}>home</T><rect x={gx(pts[total][0]) - 16} y={gy(pts[total][1]) - 16} width={32} height={32} rx={6} fill={C.tens}/><T x={gx(pts[total][0])} y={gy(pts[total][1]) + 28} size={12}>library</T>
      {prog > 0 && <polyline points={[...pts.slice(0, k + 1), cur].map(([x, y]) => `${gx(x)},${gy(y)}`).join(' ')} fill="none" stroke={C.unknown} strokeWidth={4}/>}<circle cx={gx(cur[0])} cy={gy(cur[1])} r={9} fill={C.unknown}/>
      {scene >= 2 && <Compass/>}</g>; }
  if (c.mode === 'bearing') { const cx = W / 2, cy = 260; const turn = scene < 3 ? 0 : scene === 3 ? eseg(p, .1, .7) * c.angle : c.angle; const walk = scene === 3 ? eseg(p, .6, 1) : scene > 3 ? 1 : 0; const a = turn * Math.PI / 180; const L = 180;
    return <g><circle cx={cx} cy={cy} r={L} fill="none" stroke={C.line} strokeDasharray="4 6"/><Arrow x1={cx} y1={cy} x2={cx} y2={cy - L - 20} color={C.thousands}/><T x={cx} y={cy - L - 34} size={16} color={C.thousands} weight={700}>北 N</T><Arrow x1={cx} y1={cy} x2={cx + L + 20} y2={cy} color={C.muted}/><T x={cx + L + 40} y={cy} size={14}>东 E</T>
      {scene >= 2 && <line x1={cx} y1={cy} x2={cx + Math.sin(a) * L * Math.max(.3, walk)} y2={cy - Math.cos(a) * L * Math.max(.3, walk)} stroke={C.ones} strokeWidth={4}/>}
      {turn > 1 && <path d={`M${cx} ${cy - 60} A60 60 0 0 1 ${cx + Math.sin(a) * 60} ${cy - Math.cos(a) * 60}`} fill="none" stroke={C.ones} strokeWidth={2}/>}{turn > 1 && <T x={cx + Math.sin(a / 2) * 82} y={cy - Math.cos(a / 2) * 82} size={14} color={C.ones}>{Math.round(turn)}°</T>}
      {walk >= 1 && <><circle cx={cx + Math.sin(a) * L} cy={cy - Math.cos(a) * L} r={10} fill={C.tens}/><T x={W / 2} y={40} size={22} weight={600}>北偏东{c.angle}°, {c.distance} m</T></>}<circle cx={cx} cy={cy} r={8} fill={C.accent}/></g>; }
  const showCol = scene >= 2 ? (scene === 2 ? Math.ceil(p * c.x) : c.x) : 0; const showRow = scene >= 3 ? (scene === 3 ? Math.ceil(p * c.y) : c.y) : 0;
  return <g><Grid/>{showCol > 0 && <rect x={gx(c.x) - 6} y={gy(G.rows)} width={12} height={G.rows * G.s} fill={C.ones} opacity={.15}/>}{showRow > 0 && <rect x={gx(0)} y={gy(c.y) - 6} width={G.cols * G.s} height={12} fill={C.tens} opacity={.15}/>}
    {range(showCol).map(i => <circle key={'c' + i} cx={gx(i + 1)} cy={gy(0)} r={5} fill={C.ones}/>)}{range(showRow).map(j => <circle key={'r' + j} cx={gx(c.x)} cy={gy(j + 1)} r={5} fill={C.tens}/>)}
    <polygon points={range(10).map(i => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 7 : 16; return `${gx(c.x) + Math.cos(a) * rr},${gy(c.y) + Math.sin(a) * rr}`; }).join(' ')} fill={C.unknown}/>
    {scene >= 4 && c.x !== c.y && <circle cx={gx(c.y)} cy={gy(c.x)} r={10} fill="none" stroke={C.warn} strokeWidth={2} strokeDasharray="3 3"/>}{scene >= 4 && c.x !== c.y && c.x <= G.rows && <T x={gx(c.y) + 30} y={gy(c.x)} size={13} color={C.warn} anchor="start">({c.y}, {c.x})</T>}
    <T x={W / 2 + 220} y={50} size={26} weight={600}>({showCol || '?'}, {showRow || '?'})</T></g>;
}

function Explore({c}: {c: CoordConfig}) {
  const sound = useSound();
  const [pt, setPt] = useState<[number, number]>([c.x, c.y]); const [path, setPath] = useState<[number, number][]>([[1, 1]]); const [ang, setAng] = useState(c.angle);
  if (c.mode === 'directions') { const cur = path[path.length - 1]; const lib = routePts()[ROUTE.length]; const go = (d: keyof typeof DIRS) => { const [dx, dy] = DIRS[d]; const nx = cur[0] + dx, ny = cur[1] + dy; if (nx < 0 || ny < 0 || nx > G.cols || ny > G.rows) { sound('error'); return; } setPath([...path, [nx, ny]]); sound('tick'); };
    return <Stage label={`Robot at ${cur.join(', ')}`} controls={<>{(['N', 'E', 'S', 'W'] as const).map(d => <Action key={d} onClick={() => go(d)}>{({N: '↑ North', E: '→ East', S: '↓ South', W: '← West'})[d]}</Action>)}<Action onClick={() => setPath([[1, 1]])}>Reset</Action>
      <Readout>{cur[0] === lib[0] && cur[1] === lib[1] ? `Arrived at the library in ${path.length - 1} blocks!` : `${path.length - 1} blocks walked · library is ${Math.abs(lib[0] - cur[0])} ${lib[0] >= cur[0] ? 'east' : 'west'} and ${Math.abs(lib[1] - cur[1])} ${lib[1] >= cur[1] ? 'north' : 'south'}`}</Readout></>}>
      <Grid labels={false}/><Compass/><rect x={gx(lib[0]) - 16} y={gy(lib[1]) - 16} width={32} height={32} rx={6} fill={C.tens}/><T x={gx(lib[0])} y={gy(lib[1]) + 28} size={12}>library</T><polyline points={path.map(([x, y]) => `${gx(x)},${gy(y)}`).join(' ')} fill="none" stroke={C.unknown} strokeWidth={4}/><circle cx={gx(cur[0])} cy={gy(cur[1])} r={10} fill={C.unknown}/></Stage>; }
  if (c.mode === 'bearing') return <Stage label={`${ang} degrees east of north`} controls={<><Slider label="Angle from north" value={ang} min={0} max={90} step={5} onChange={setAng}/><Readout>北偏东{ang}° = {90 - ang}° north of east (东偏北{90 - ang}°)</Readout></>}><Scene c={{...c, angle: ang}} scene={4} p={1}/></Stage>;
  return <Stage label={`Point (${pt[0]}, ${pt[1]})`} controls={<Readout>Tap any grid point. ({pt[0]}, {pt[1]}): column {pt[0]}, row {pt[1]}</Readout>}>
    <Grid/>{range(G.cols + 1).map(i => range(G.rows + 1).map(j => <circle key={i + '-' + j} cx={gx(i)} cy={gy(j)} r={9} fill="transparent" className="u-hit" onClick={() => { setPt([i, j]); sound('click'); }}/>))}
    <circle cx={gx(pt[0])} cy={gy(pt[1])} r={10} fill={C.unknown}/><line x1={gx(pt[0])} x2={gx(pt[0])} y1={gy(0)} y2={gy(pt[1])} stroke={C.ones} strokeDasharray="4 4"/><line x1={gx(0)} x2={gx(pt[0])} y1={gy(pt[1])} y2={gy(pt[1])} stroke={C.tens} strokeDasharray="4 4"/>
    <T x={W / 2 + 220} y={50} size={26} weight={600}>({pt[0]}, {pt[1]})</T></Stage>;
}

export const coordinateView: EngineView<CoordConfig> = {Scene: props => <Stage label={coordinate.describe(props.c)}><Scene {...props}/></Stage>, Explore};

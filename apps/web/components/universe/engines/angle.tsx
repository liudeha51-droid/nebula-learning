'use client';
import {useState} from 'react';
import {Stage, T, C, W, H, Handle, Readout, Segmented, Action} from '../stage';
import {angle, angleAt, classifyAngle, classifyTriangle, classifyQuad, dist, type AngleConfig, type P} from '@/lib/universe/engines/angle';
import {clamp, eseg, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const rad = (d: number) => d * Math.PI / 180;
const clampP = (x: number, y: number): P => [clamp(x, 30, W - 30), clamp(y, 30, H - 30)];
/** Angle arc at vertex v from direction a1 to a2 (degrees, counter-clockwise in maths sense). */
function Arc({v, a1, a2, r = 40, color = C.ones, label}: {v: P; a1: number; a2: number; r?: number; color?: string; label?: string}) {
  const sweep = ((a2 - a1) % 360 + 360) % 360; const p1 = [v[0] + r * Math.cos(rad(a1)), v[1] - r * Math.sin(rad(a1))], p2 = [v[0] + r * Math.cos(rad(a2)), v[1] - r * Math.sin(rad(a2))];
  const mid = rad(a1 + sweep / 2);
  if (Math.abs(sweep - 90) < .6) { const s = r * .55; const q1 = [v[0] + s * Math.cos(rad(a1)), v[1] - s * Math.sin(rad(a1))], q2 = [v[0] + s * Math.cos(rad(a2)), v[1] - s * Math.sin(rad(a2))]; return <g><path d={`M${q1[0]} ${q1[1]} L${q1[0] + q2[0] - v[0]} ${q1[1] + q2[1] - v[1]} L${q2[0]} ${q2[1]}`} fill="none" stroke={color} strokeWidth={2.5}/>{label && <T x={v[0] + (r + 22) * Math.cos(mid)} y={v[1] - (r + 22) * Math.sin(mid)} size={16} color={color}>{label}</T>}</g>; }
  return <g><path d={`M${p1[0]} ${p1[1]} A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 0 ${p2[0]} ${p2[1]}`} fill="none" stroke={color} strokeWidth={2.5}/>{label && <T x={v[0] + (r + 22) * Math.cos(mid)} y={v[1] - (r + 22) * Math.sin(mid)} size={16} color={color}>{label}</T>}</g>;
}
function Ray({from, deg, len = 260, color = C.ink, width = 3}: {from: P; deg: number; len?: number; color?: string; width?: number}) {
  const to = [from[0] + len * Math.cos(rad(deg)), from[1] - len * Math.sin(rad(deg))];
  return <g><line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={color} strokeWidth={width} strokeLinecap="round"/><circle cx={to[0]} cy={to[1]} r={0}/></g>;
}
function Protractor({v, r = 170, rot = 0, opacity = 1}: {v: P; r?: number; rot?: number; opacity?: number}) {
  return <g opacity={opacity} transform={`rotate(${-rot} ${v[0]} ${v[1]})`}><path d={`M${v[0] - r} ${v[1]} A${r} ${r} 0 0 1 ${v[0] + r} ${v[1]} Z`} fill="#8ec9ff18" stroke={C.accent} strokeWidth={1.5}/>
    {range(19).map(i => { const a = rad(i * 10); const o = [v[0] + r * Math.cos(a), v[1] - r * Math.sin(a)], q = [v[0] + (r - (i % 9 === 0 ? 20 : 12)) * Math.cos(a), v[1] - (r - (i % 9 === 0 ? 20 : 12)) * Math.sin(a)];
      return <g key={i}><line x1={o[0]} y1={o[1]} x2={q[0]} y2={q[1]} stroke={C.accent}/><T x={v[0] + (r - 32) * Math.cos(a)} y={v[1] - (r - 32) * Math.sin(a)} size={11} color={C.ones}>{i * 10}</T><T x={v[0] + (r - 52) * Math.cos(a)} y={v[1] - (r - 52) * Math.sin(a)} size={10} color={C.muted}>{180 - i * 10}</T></g>; })}
    <circle cx={v[0]} cy={v[1]} r={4} fill={C.accent}/></g>;
}
function AngleFigure({deg, armLen = 260, v = [W / 2 - 80, 330] as P, protractor = false}: {deg: number; armLen?: number; v?: P; protractor?: boolean}) {
  const kind = classifyAngle(deg);
  return <g>{protractor && <Protractor v={v}/>}<Ray from={v} deg={0} len={armLen}/><Ray from={v} deg={deg} len={armLen} color={C.ones}/>{deg > 1 && <Arc v={v} a1={0} a2={deg} label={`${Math.round(deg)}°`}/>}
    <circle cx={v[0]} cy={v[1]} r={5} fill="#fff"/><T x={W - 120} y={60} size={24} weight={700} color={C.ones}>{kind}</T></g>;
}

function Scene({c, scene, p}: {c: AngleConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'lines': { const A: P = [260, 240], B: P = [540, 220]; const ext = scene === 2 ? p : scene > 2 ? 1 : 0; const dx = B[0] - A[0], dy = B[1] - A[1];
      const r1 = eseg(ext, .3, .6) * 300, r2 = eseg(ext, .65, 1) * 300; const L = Math.hypot(dx, dy); const ux = dx / L, uy = dy / L;
      return <g><line x1={A[0] - ux * r2} y1={A[1] - uy * r2} x2={B[0] + ux * r1} y2={B[1] + uy * r1} stroke={C.ink} strokeWidth={3}/>
        {scene === 3 && c.distance && <><path d={`M${A[0]} ${A[1]} Q400 80 ${B[0]} ${B[1]}`} fill="none" stroke={C.warn} strokeDasharray="6 5" strokeWidth={2}/><path d={`M${A[0]} ${A[1]} L380 360 L${B[0]} ${B[1]}`} fill="none" stroke={C.unknown} strokeDasharray="6 5" strokeWidth={2}/></>}
        {[A, B].map((q, i) => <g key={i}><circle cx={q[0]} cy={q[1]} r={7} fill={C.ones}/><T x={q[0]} y={q[1] + 28} size={20} color={C.ones}>{'AB'[i]}</T></g>)}
        <T x={W / 2} y={60} size={24} weight={600}>{ext < .3 ? 'segment AB: two endpoints' : ext < .65 ? 'ray AB: one endpoint' : 'line AB: no endpoints'}</T>
        {(scene >= 4 || (scene === 3 && c.distance)) && <T x={W / 2} y={410} size={18} color={C.muted}>{c.distance ? `distance AB = ${Math.round(dist(A, B) / 10)} units — the straight segment is shortest` : 'Exactly one straight line passes through A and B.'}</T>}</g>; }
    case 'protractor': { const place = scene === 2 ? eseg(p, 0, .8) : scene > 2 ? 1 : 0; const v: P = [W / 2, 340];
      return <g><g transform={`translate(${lerp(160, 0, place)} ${lerp(-60, 0, place)})`}><Protractor v={v} opacity={scene >= 2 ? 1 : 0}/></g><Ray from={v} deg={0} len={220}/><Ray from={v} deg={c.deg} len={220} color={C.ones}/><circle cx={v[0]} cy={v[1]} r={5} fill="#fff"/>
        {scene >= 3 && <Arc v={v} a1={0} a2={c.deg} r={60} label={`${c.deg}°`}/>}{scene >= 4 && <T x={W / 2} y={50} size={22} color={C.warn}>not {180 - c.deg}° — read the scale that starts at 0 on the arm</T>}</g>; }
    case 'parallel': { const turn = scene < 2 ? 25 : scene === 2 ? lerp(25, 0, eseg(p, 0, .8)) : scene === 3 ? lerp(0, 90, eseg(p, .1, .8)) : scene === 4 ? (p < .5 ? 0 : 90) : 0;
      const c1: P = [W / 2, 160], c2: P = [W / 2, 290]; const a = rad(turn);
      return <g><line x1={60} x2={740} y1={c1[1]} y2={c1[1]} stroke={C.ones} strokeWidth={3}/><line x1={c2[0] - 340 * Math.cos(a)} y1={c2[1] + 340 * Math.sin(a)} x2={c2[0] + 340 * Math.cos(a)} y2={c2[1] - 340 * Math.sin(a)} stroke={C.tens} strokeWidth={3}/>
        {turn < .5 && range(5).map(i => <line key={i} x1={140 + i * 130} x2={140 + i * 130} y1={c1[1]} y2={c2[1]} stroke={C.muted} strokeDasharray="3 4"/>)}
        {Math.abs(turn - 90) < .5 && <Arc v={[W / 2, c1[1]]} a1={0} a2={90} r={26} color={C.unknown} label="90°"/>}
        <T x={W / 2} y={60} size={24} weight={600}>{turn < .5 ? 'a ∥ b — they never meet' : Math.abs(turn - 90) < .5 ? 'a ⊥ b — four right angles' : `angle between lines: ${Math.round(turn)}°`}</T></g>; }
    case 'triangle': { const keys: [P, P, P][] = [[[200, 340], [600, 340], [380, 120]], [[200, 340], [600, 340], [200, 120]], [[200, 340], [600, 340], [120, 200]], [[250, 340], [550, 340], [400, 140]], [[250, 340], [550, 340], [400, 80.2]]];
      const k = scene < 2 ? 0 : scene === 2 ? Math.min(2, Math.floor(p * 3)) : scene === 3 ? 3 + Math.min(1, Math.floor(p * 2)) : 4; const t = keys[k]; const info = classifyTriangle(t);
      return <g><polygon points={t.map(q => q.join(',')).join(' ')} fill={C.hundreds} fillOpacity={.2} stroke={C.hundreds} strokeWidth={3}/>
        {t.map((q, i) => <T key={i} x={q[0]} y={q[1] + (q[1] > 300 ? 26 : -18)} size={15} color={C.ones}>{Math.round(info.angles[i])}°</T>)}
        <T x={W / 2} y={50} size={26} weight={600}>{info.byAngle} · {info.bySide}</T></g>; }
    case 'triangle-sum': { const t: [P, P, P] = [[180, 330], [560, 330], [430, 120]]; const info = classifyTriangle(t); const tear = scene === 2 ? p : scene > 2 ? 1 : 0; const align = scene === 3 ? eseg(p, .1, .9) : scene > 3 ? 1 : 0;
      const target: P = [W / 2, 400]; const cols = [C.ones, C.tens, C.unknown];
      const dirs = t.map((q, i) => { const n1 = t[(i + 1) % 3], n2 = t[(i + 2) % 3]; return [Math.atan2(-(n1[1] - q[1]), n1[0] - q[0]) * 180 / Math.PI, Math.atan2(-(n2[1] - q[1]), n2[0] - q[0]) * 180 / Math.PI]; });
      let start = 0; const placed = t.map((_, i) => { const a = info.angles[i]; const s = start; start += a; return s; });
      return <g><polygon points={t.map(q => q.join(',')).join(' ')} fill="none" stroke={C.muted} strokeWidth={2} strokeDasharray={tear > 0 ? '4 4' : ''}/>
        {t.map((q, i) => { const [d1, d2] = dirs[i]; const lo = Math.min(d1, d2), hi = Math.max(d1, d2); const a1 = hi - lo > 180 ? hi : lo; const v: P = [lerp(q[0], target[0], align), lerp(q[1], target[1], align)]; const from = lerp(a1, placed[i], align);
          return <g key={i} transform={`translate(${(v[0] - q[0]) * 0} 0)`}><path d={`M${v[0]} ${v[1]} L${v[0] + 50 * Math.cos(rad(from))} ${v[1] - 50 * Math.sin(rad(from))} A50 50 0 0 0 ${v[0] + 50 * Math.cos(rad(from + info.angles[i]))} ${v[1] - 50 * Math.sin(rad(from + info.angles[i]))} Z`} fill={cols[i]} opacity={.75}/></g>; })}
        {align >= 1 && <><line x1={W / 2 - 120} x2={W / 2 + 120} y1={400} y2={400} stroke="#fff" strokeWidth={2}/><T x={W / 2} y={420} size={16}>straight angle</T></>}
        <T x={W / 2} y={50} size={24} weight={600}>{scene >= 4 ? `${info.angles.map(a => Math.round(a)).join('° + ')}° = 180°` : '∠A + ∠B + ∠C = ?'}</T></g>; }
    case 'quadrilateral': { const keys: [P, P, P, P][] = [[[200, 330], [580, 350], [520, 140], [260, 170]], [[200, 330], [600, 330], [500, 150], [300, 150]], [[200, 330], [520, 330], [600, 150], [280, 150]], [[220, 330], [580, 330], [580, 150], [220, 150]], [[310, 330], [490, 330], [490, 150], [310, 150]]];
      const k = scene < 2 ? 0 : scene === 2 ? 1 : scene === 3 ? 2 + Math.min(2, Math.floor(p * 3)) : 4; const q = keys[k]; const info = classifyQuad(q);
      return <g><polygon points={q.map(x => x.join(',')).join(' ')} fill={C.tens} fillOpacity={.18} stroke={C.tens} strokeWidth={3}/><T x={W / 2} y={50} size={26} weight={600}>{info.name}</T>
        <T x={W / 2} y={400} size={16} color={C.muted}>parallel pairs: {info.pairs} · right angles: {info.right ? 'all 4' : 'no'} · equal sides: {info.equal ? 'yes' : 'no'}</T>
        {c.family && scene >= 4 && <T x={W / 2} y={430} size={15} color={C.accent}>square ⊂ rectangle ⊂ parallelogram; trapezoid: exactly one parallel pair</T>}</g>; }
    default: { const d = scene < 2 ? c.deg : scene === 2 ? lerp(5, 360, p) : c.deg; const arm = scene === 3 ? lerp(180, 300, Math.sin(p * Math.PI)) : 240;
      return <AngleFigure deg={Math.min(359.9, d)} armLen={arm}/>; }
  }
}

function Explore({c}: {c: AngleConfig}) {
  const [pts, setPts] = useState<P[]>(() => c.mode === 'lines' ? [[260, 240], [540, 220]] : c.mode === 'parallel' ? [[100, 150], [700, 150], [100, 300], [700, 270]] : c.mode === 'quadrilateral' ? [[200, 330], [580, 350], [520, 140], [260, 170]] : c.mode === 'triangle' || c.mode === 'triangle-sum' ? [[200, 340], [600, 340], [380, 120]] : [[W / 2 - 80, 330], [W / 2 + 160, 330], [W / 2 + 40, 130]]);
  const [kind, setKind] = useState<'segment' | 'ray' | 'line'>('segment'); const [prot, setProt] = useState(c.mode === 'protractor');
  const move = (i: number) => (x: number, y: number) => setPts(ps => ps.map((q, k) => (k === i ? clampP(x, y) : q)));
  const handles = pts.map((q, i) => <Handle key={i} x={q[0]} y={q[1]} onMove={move(i)} label={`Point ${String.fromCharCode(65 + i)}`} color={[C.ones, C.tens, C.unknown, C.accent][i]}/>);
  if (c.mode === 'lines') { const [A, B] = pts; const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1; const e1 = kind === 'segment' ? 0 : 900, e2 = kind === 'line' ? 900 : 0;
    return <Stage label={`${kind} AB`} controls={<><Segmented label="Kind" value={kind} onChange={setKind} options={[['segment', 'Segment'], ['ray', 'Ray'], ['line', 'Line']]}/><Readout>{kind === 'segment' ? `segment AB: length ${Math.round(L / 10)} units (the distance from A to B)` : `${kind} AB: infinite length — cannot be measured`}</Readout></>}>
      <line x1={A[0] - dx / L * e2} y1={A[1] - dy / L * e2} x2={B[0] + dx / L * e1} y2={B[1] + dy / L * e1} stroke={C.ink} strokeWidth={3}/>{handles}</Stage>; }
  if (c.mode === 'parallel') { const [a, b, c2, d] = pts; const t1 = Math.atan2(b[1] - a[1], b[0] - a[0]), t2 = Math.atan2(d[1] - c2[1], d[0] - c2[0]); let ang = Math.abs(t1 - t2) * 180 / Math.PI % 180; ang = Math.min(ang, 180 - ang);
    return <Stage label={`Angle between lines ${Math.round(ang)} degrees`} controls={<><Action onClick={() => setPts([a, b, [c2[0], c2[1]], [d[0], c2[1] + (b[1] - a[1]) * (d[0] - c2[0]) / (b[0] - a[0] || 1)]])}>Make parallel</Action><Readout>{ang < 1 ? 'Parallel: they never meet' : Math.abs(ang - 90) < 1 ? 'Perpendicular: 90°' : `Intersecting at ${Math.round(ang)}°`}</Readout></>}>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.ones} strokeWidth={3}/><line x1={c2[0]} y1={c2[1]} x2={d[0]} y2={d[1]} stroke={C.tens} strokeWidth={3}/>{handles}</Stage>; }
  if (c.mode === 'triangle' || c.mode === 'triangle-sum') { const t = pts as [P, P, P]; const info = classifyTriangle(t);
    return <Stage label={`${info.byAngle} ${info.bySide} triangle`} controls={<Readout>{info.byAngle} · {info.bySide} · angles {info.angles.map(a => Math.round(a)).join('° + ')}° = {Math.round(info.angles.reduce((s, a) => s + a, 0))}°</Readout>}>
      <polygon points={t.map(q => q.join(',')).join(' ')} fill={C.hundreds} fillOpacity={.2} stroke={C.hundreds} strokeWidth={3}/>
      {t.map((q, i) => <T key={i} x={q[0] + (q[0] < W / 2 ? -30 : 30)} y={q[1] - 22} size={16} color={C.ones}>{Math.round(info.angles[i])}°</T>)}
      {t.map((q, i) => { const n = t[(i + 1) % 3]; return <T key={'s' + i} x={(q[0] + n[0]) / 2} y={(q[1] + n[1]) / 2 + 18} size={13} color={C.muted}>{Math.round(dist(q, n) / 10)}</T>; })}{handles}</Stage>; }
  if (c.mode === 'quadrilateral') { const q = pts as [P, P, P, P]; const info = classifyQuad(q);
    return <Stage label={info.name} controls={<><Action onClick={() => setPts([[220, 330], [580, 330], [580, 150], [220, 150]])}>Snap to rectangle</Action><Action onClick={() => setPts([[200, 330], [520, 330], [600, 150], [280, 150]])}>Snap to parallelogram</Action><Readout>{info.name} · parallel pairs {info.pairs} · {info.right ? 'four right angles' : 'not all right angles'}{info.equal ? ' · equal sides' : ''}</Readout></>}>
      <polygon points={q.map(x => x.join(',')).join(' ')} fill={C.tens} fillOpacity={.18} stroke={C.tens} strokeWidth={3}/>{q.map((x, i) => <T key={i} x={x[0]} y={x[1] + (x[1] > 250 ? 26 : -22)} size={14} color={C.ones}>{Math.round(info.angles[i])}°</T>)}{handles}</Stage>; }
  // angle / protractor: vertex A, fixed arm through B, moving arm C
  const [V, , Cc] = pts; const deg = ((Math.atan2(-(Cc[1] - V[1]), Cc[0] - V[0]) * 180 / Math.PI) + 360) % 360;
  return <Stage label={`Angle ${Math.round(deg)} degrees, ${classifyAngle(deg)}`} controls={<><Action onClick={() => setProt(!prot)}>{prot ? 'Hide' : 'Show'} protractor</Action><Readout>{Math.round(deg)}° · {classifyAngle(Math.round(deg))} · arm length {Math.round(dist(V, Cc) / 10)} (does not change the angle)</Readout></>}>
    <AngleFigure deg={deg} v={V} armLen={Math.max(120, dist(V, Cc))} protractor={prot}/><Handle x={Cc[0]} y={Cc[1]} onMove={move(2)} label="Turn the arm" color={C.ones}/></Stage>;
}

export const angleView: EngineView<AngleConfig> = {Scene: props => <Stage label={angle.describe(props.c)}><Scene {...props}/></Stage>, Explore};


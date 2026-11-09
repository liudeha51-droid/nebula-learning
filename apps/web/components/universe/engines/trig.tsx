'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider} from '../stage';
import {Axes, Curve, Pt, frame} from '../plot';
import {trig, rad, radStr, type TrigConfig} from '@/lib/universe/engines/trig';
import {eseg, fmt, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => { const p = (a: number) => `${cx + r * Math.cos(a)} ${cy - r * Math.sin(a)}`; return `M${p(a0)} A${r} ${r} 0 ${Math.abs(a1 - a0) > Math.PI ? 1 : 0} ${a1 > a0 ? 0 : 1} ${p(a1)}`; };
function Unit({deg, cx = 230, cy = 225, R = 160, proj = true, beta}: {deg: number; cx?: number; cy?: number; R?: number; proj?: boolean; beta?: number}) {
  const a = rad(deg), px = cx + R * Math.cos(a), py = cy - R * Math.sin(a);
  return <g><circle cx={cx} cy={cy} r={R} fill="none" stroke={C.line} strokeWidth={2}/><line x1={cx - R - 20} x2={cx + R + 20} y1={cy} y2={cy} stroke={C.muted}/><line x1={cx} x2={cx} y1={cy - R - 20} y2={cy + R + 20} stroke={C.muted}/>
    <path d={arc(cx, cy, 34, 0, a)} fill="none" stroke={C.unknown} strokeWidth={2}/><line x1={cx} y1={cy} x2={px} y2={py} stroke={C.ink} strokeWidth={2}/>
    {proj && <><line x1={px} x2={px} y1={cy} y2={py} stroke={C.tens} strokeWidth={4}/><line x1={cx} x2={px} y1={cy} y2={cy} stroke={C.ones} strokeWidth={4}/></>}
    {beta !== undefined && <><path d={arc(cx, cy, 54, a, a + rad(beta))} fill="none" stroke={C.hundreds} strokeWidth={2}/><line x1={cx} y1={cy} x2={cx + R * Math.cos(a + rad(beta))} y2={cy - R * Math.sin(a + rad(beta))} stroke={C.hundreds} strokeWidth={2}/><circle cx={cx + R * Math.cos(a + rad(beta))} cy={cy - R * Math.sin(a + rad(beta))} r={7} fill={C.hundreds}/></>}
    <circle cx={px} cy={py} r={8} fill={C.unknown}/><T x={cx + 50} y={cy - 12} size={13} color={C.unknown}>{fmt(deg)}°</T></g>;
}
function Tri({deg, s = 1, labels = true}: {deg: number; s?: number; labels?: boolean}) {
  const adj = 300 * s, opp = adj * Math.tan(rad(deg)), x0 = 120, y0 = 400;
  return <g><path d={`M${x0} ${y0} H${x0 + adj} V${y0 - opp} Z`} fill={C.tens} fillOpacity={.12} stroke={C.ink} strokeWidth={2}/><rect x={x0 + adj - 14} y={y0 - 14} width={14} height={14} fill="none" stroke={C.muted}/><path d={arc(x0, y0, 40, 0, rad(deg))} fill="none" stroke={C.unknown} strokeWidth={2}/>
    {labels && <><T x={x0 + adj / 2} y={y0 + 22} size={14} color={C.ones}>adjacent {fmt(adj / 30, 2)}</T><T x={x0 + adj + 12} y={y0 - opp / 2} size={14} color={C.tens} anchor="start">opposite {fmt(opp / 30, 2)}</T><T x={x0 + adj / 2 - 30} y={y0 - opp / 2 - 14} size={14} color={C.hundreds}>hyp {fmt(Math.hypot(adj, opp) / 30, 2)}</T></>}
    <T x={x0 + 56} y={y0 - 10} size={14} color={C.unknown}>{deg}°</T></g>;
}
const WF = frame(-.3, 2 * Math.PI + .3, -1.5, 1.5, {x0: 420, y0: 70, w: 360, h: 310});

function Scene({c, scene, p}: {c: TrigConfig; scene: number; p: number}) {
  const t = scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .9) : 1;
  switch (c.mode) {
    case 'right': { const s = scene === 2 ? lerp(.5, 1.2, Math.sin(p * Math.PI)) : scene < 2 ? .7 : 1; return <g><Tri deg={c.deg} s={s} labels={scene >= 2}/>{scene >= 3 && <><T x={640} y={120} size={18}>sin = opp/hyp = {fmt(Math.sin(rad(c.deg)), 4)}</T><T x={640} y={155} size={18}>cos = adj/hyp = {fmt(Math.cos(rad(c.deg)), 4)}</T><T x={640} y={190} size={18}>tan = opp/adj = {fmt(Math.tan(rad(c.deg)), 4)}</T></>}</g>; }
    case 'height': { const h = c.d * Math.tan(rad(c.deg)), k = 300 / c.d; return <g><rect x={480} y={400 - h * k} width={30} height={h * k} fill={C.hundreds} opacity={.5}/><line x1={60} x2={760} y1={400} y2={400} stroke={C.muted} strokeWidth={2}/><circle cx={180} cy={392} r={8} fill={C.ones}/>
      {scene >= 2 && <path d={`M180 400 H${lerp(180, 480, t)} ${t >= 1 ? `V${400 - h * k} Z` : ''}`} fill="none" stroke={C.unknown} strokeWidth={2} strokeDasharray={scene === 2 ? '6 4' : undefined}/>}<T x={330} y={424} size={14}>{c.d} m</T>{scene >= 3 && <T x={540} y={400 - h * k / 2} size={16} color={C.unknown} anchor="start">h = {c.d} tan {c.deg}° ≈ {fmt(h, 2)} m</T>}<path d={arc(180, 400, 50, 0, rad(c.deg))} fill="none" stroke={C.unknown}/><T x={250} y={386} size={13} color={C.unknown}>{c.deg}°</T></g>; }
    case 'radian': { const cx = 300, cy = 230, R = 130, k = scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .9) : 1; const n = scene >= 3 ? Math.min(Math.PI, eseg(scene === 3 ? p : 1, 0, .9) * Math.PI) : k;
      return <g><circle cx={cx} cy={cy} r={R} fill="none" stroke={C.line} strokeWidth={2}/><line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={C.ones} strokeWidth={4}/><path d={arc(cx, cy, R, 0, n)} fill="none" stroke={C.ones} strokeWidth={6}/>{range(Math.floor(n)).map(i => <circle key={i} cx={cx + R * Math.cos(i + 1)} cy={cy - R * Math.sin(i + 1)} r={6} fill={C.tens}/>)}
        <line x1={cx} y1={cy} x2={cx + R * Math.cos(n)} y2={cy - R * Math.sin(n)} stroke={C.ink}/><T x={600} y={150} size={20}>{fmt(n, 2)} rad = {fmt((n * 180) / Math.PI, 1)}°</T>{scene >= 3 && <T x={600} y={200} size={20} color={C.unknown}>{c.deg}° = {radStr(c.deg)}</T>}{scene >= 4 && <T x={600} y={250} size={18} color={C.good}>arc l = rα</T>}</g>; }
    case 'unit-circle': { const d = scene < 2 ? 30 : scene === 2 ? lerp(30, c.deg, eseg(p, 0, .9)) : scene === 4 ? 180 - c.deg : c.deg; return <g><Unit deg={d}/>{scene === 4 && <g opacity={.5}><Unit deg={c.deg} proj={false}/></g>}<T x={600} y={160} size={20} color={C.ones}>cos = {fmt(Math.cos(rad(d)), 3)}</T><T x={600} y={200} size={20} color={C.tens}>sin = {fmt(Math.sin(rad(d)), 3)}</T>{scene >= 4 && <T x={600} y={250} size={16} color={C.good}>sin(180° − α) = sin α</T>}</g>; }
    case 'wave': { const a = scene < 2 ? 0 : scene === 2 ? 2 * Math.PI * p : 2 * Math.PI; return <g><Unit deg={(a * 180) / Math.PI} cx={200} cy={225} R={WF.h / 3} /><Axes f={WF} piTicks labels={scene >= 2}/>{a > 0 && <Curve f={WF} fn={Math.sin} to={a} color={C.tens}/>}{scene >= 4 && <Curve f={WF} fn={Math.cos} color={C.ones} dash="6 4"/>}<line x1={200 + (WF.h / 3) * Math.cos(a)} y1={WF.Y(Math.sin(a))} x2={WF.X(a)} y2={WF.Y(Math.sin(a))} stroke={C.unknown} strokeDasharray="3 4"/><Pt f={WF} x={a} y={Math.sin(a)}/></g>; }
    case 'transform': { const G = frame(-.5, 2 * Math.PI + .5, -3, 3); const ph = scene >= 2 ? rad(c.phi) * (scene === 2 ? eseg(p, 0, .9) : 1) : 0, w = scene >= 3 ? lerp(1, c.w, scene === 3 ? eseg(p, 0, .9) : 1) : 1, A = scene >= 4 ? lerp(1, c.A, scene === 4 ? eseg(p, 0, .9) : 1) : 1;
      return <g><Axes f={G} piTicks/><Curve f={G} fn={Math.sin} color={C.faint} dash="5 5"/><Curve f={G} fn={x => A * Math.sin(w * x + ph)} color={C.tens}/><T x={W / 2} y={30} size={18}>y = {fmt(A, 2)} sin({fmt(w, 2)}x + {fmt(ph, 2)})</T></g>; }
    case 'sum-formula': { const b = scene < 2 ? 0 : scene === 2 ? c.deg2 * eseg(p, 0, .9) : c.deg2; return <g><Unit deg={c.deg} beta={b} proj={false}/><T x={600} y={120} size={16}>sin {c.deg}° + sin {c.deg2}° = {fmt(Math.sin(rad(c.deg)) + Math.sin(rad(c.deg2)), 4)}</T><T x={600} y={160} size={16} color={C.hundreds}>sin({c.deg}° + {fmt(b)}°) = {fmt(Math.sin(rad(c.deg + b)), 4)}</T>{scene >= 4 && <T x={600} y={210} size={15} color={C.good}>= sin α cos β + cos α sin β</T>}</g>; }
    default: { const k = 30, A0: [number, number] = [150, 380], Bp: [number, number] = [150 + c.a * k * 1.6, 380], ang = rad(c.deg), Cp: [number, number] = [150 + c.b * k * 1.6 * Math.cos(ang), 380 - c.b * k * 1.6 * Math.sin(ang)];
      const c2 = c.a ** 2 + c.b ** 2 - 2 * c.a * c.b * Math.cos(ang);
      return <g><path d={`M${A0} L${Bp} L${Cp} Z`} fill={C.tens} fillOpacity={.12} stroke={C.ink} strokeWidth={2}/><T x={(A0[0] + Bp[0]) / 2} y={404} size={14} color={C.ones}>a = {c.a}</T><T x={(A0[0] + Cp[0]) / 2 - 24} y={(A0[1] + Cp[1]) / 2} size={14} color={C.tens}>b = {c.b}</T><path d={arc(A0[0], A0[1], 34, 0, ang)} fill="none" stroke={C.unknown}/><T x={A0[0] + 50} y={A0[1] - 12} size={13} color={C.unknown}>C = {c.deg}°</T>
        {scene >= 2 && <line x1={Cp[0]} x2={Cp[0]} y1={Cp[1]} y2={lerp(Cp[1], 380, t)} stroke={C.unknown} strokeDasharray="5 4"/>}{scene >= 3 && <T x={640} y={140} size={17}>c² = {c.a}² + {c.b}² − 2·{c.a}·{c.b}·cos {c.deg}°</T>}{scene >= 4 && <T x={640} y={180} size={20} color={C.good}>c ≈ {fmt(Math.sqrt(c2), 3)}</T>}</g>; }
  }
}

function Explore({c}: {c: TrigConfig}) {
  const [deg, setDeg] = useState(c.deg), [A, setA] = useState(c.A), [w, setW] = useState(c.w), [phi, setPhi] = useState(c.phi), [a, setA2] = useState(c.a), [b, setB] = useState(c.b);
  if (c.mode === 'transform') { const G = frame(-.5, 2 * Math.PI + .5, -4, 4); return <Stage label="y = A sin(ωx + φ)" controls={<><Slider label="A" value={A} min={.5} max={3.5} step={.5} onChange={setA}/><Slider label="ω" value={w} min={.5} max={4} step={.5} onChange={setW}/><Slider label="φ (°)" value={phi} min={-180} max={180} step={15} onChange={setPhi}/><Readout>period {fmt((2 * Math.PI) / w, 3)} · range [−{A}, {A}] · shift {fmt(-rad(phi) / w, 3)}</Readout></>}><Axes f={G} piTicks/><Curve f={G} fn={Math.sin} color={C.faint} dash="5 5"/><Curve f={G} fn={x => A * Math.sin(w * x + rad(phi))} color={C.tens}/></Stage>; }
  if (c.mode === 'laws') { const c2 = a * a + b * b - 2 * a * b * Math.cos(rad(deg)); return <Stage label="Law of cosines" controls={<><Slider label="a" value={a} min={2} max={8} onChange={setA2}/><Slider label="b" value={b} min={2} max={8} onChange={setB}/><Slider label="C (°)" value={deg} min={10} max={170} step={5} onChange={setDeg}/><Readout>c = {fmt(Math.sqrt(c2), 3)} · a² + b² = {a * a + b * b} · c² = {fmt(c2, 3)}</Readout></>}><Scene c={{...c, a, b, deg}} scene={4} p={1}/></Stage>; }
  const max = c.mode === 'right' || c.mode === 'height' ? 80 : 360; const min = c.mode === 'right' || c.mode === 'height' ? 10 : 0;
  return <Stage label="Angle explorer" controls={<><Slider label="Angle (°)" value={deg} min={min} max={max} step={5} onChange={setDeg}/><Readout>{deg}° = {fmt(rad(deg), 4)} rad · sin {fmt(Math.sin(rad(deg)), 4)} · cos {fmt(Math.cos(rad(deg)), 4)} · tan {Math.abs(Math.cos(rad(deg))) < 1e-9 ? 'undefined' : fmt(Math.tan(rad(deg)), 4)}</Readout></>}>
    {c.mode === 'right' ? <Tri deg={deg}/> : c.mode === 'height' ? <Scene c={{...c, deg}} scene={4} p={1}/> : c.mode === 'wave' ? <><Unit deg={deg} cx={200} R={WF.h / 3}/><Axes f={WF} piTicks/><Curve f={WF} fn={Math.sin} to={rad(deg)} color={C.tens}/><Pt f={WF} x={rad(deg)} y={Math.sin(rad(deg))}/></> : c.mode === 'sum-formula' ? <Scene c={{...c, deg}} scene={4} p={1}/> : <Unit deg={deg}/>}</Stage>;
}

export const trigView: EngineView<TrigConfig> = {Scene: props => <Stage label={trig.describe(props.c)}><Scene {...props}/></Stage>, Explore};

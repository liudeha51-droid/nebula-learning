'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Handle} from '../stage';
import {geo2, type Geo2Config} from '@/lib/universe/engines/geo2';
import {angleAt, dist, type P} from '@/lib/universe/engines/angle';
import {eseg, fmt, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const rad = (d: number) => d * Math.PI / 180;
const pt = (o: P, deg: number, r: number): P => [o[0] + r * Math.cos(rad(deg)), o[1] - r * Math.sin(rad(deg))];
const L = ({a, b, color = C.ink, w = 3, dash}: {a: P; b: P; color?: string; w?: number; dash?: string}) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeDasharray={dash} strokeLinecap="round"/>;
function Arc({o, from, to, r = 34, color = C.ones, label}: {o: P; from: number; to: number; r?: number; color?: string; label?: string}) {
  const s = pt(o, from, r), e = pt(o, to, r); const sweep = ((to - from) % 360 + 360) % 360; const m = pt(o, from + sweep / 2, r + 20);
  return <g><path d={`M${s[0]} ${s[1]} A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 0 ${e[0]} ${e[1]}`} fill="none" stroke={color} strokeWidth={2.5}/>{label && <T x={m[0]} y={m[1]} size={14} color={color}>{label}</T>}</g>;
}
const poly = (ps: P[]) => ps.map(q => q.join(',')).join(' ');
const dirDeg = (a: P, b: P) => Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180 / Math.PI;

function Scene({c, scene, p}: {c: Geo2Config; scene: number; p: number}) {
  const d = c.deg;
  switch (c.mode) {
    case 'complement': { const O: P = [W / 2 - 60, 320]; const showC = scene >= 2, showS = scene >= 3;
      return <g><L a={O} b={pt(O, 0, 280)}/><L a={O} b={pt(O, d, 230)} color={C.ones}/>{showC && <L a={O} b={pt(O, 90, 230)} color={C.tens} dash="6 4"/>}{showS && <L a={O} b={pt(O, 180, 200)} color={C.accent} dash="6 4"/>}
        <Arc o={O} from={0} to={d} label={`${d}°`}/>{showC && <Arc o={O} from={d} to={90} r={60} color={C.tens} label={`${90 - d}°`}/>}{showS && <Arc o={O} from={d} to={180} r={90} color={C.accent} label={`${180 - d}°`}/>}</g>; }
    case 'vertical': { const O: P = [W / 2, 230]; const dd = scene === 2 ? lerp(25, 80, (Math.sin(p * Math.PI * 2) + 1) / 2) : d;
      return <g><L a={pt(O, 0, 260)} b={pt(O, 180, 260)}/><L a={pt(O, dd, 220)} b={pt(O, dd + 180, 220)} color={C.tens}/><Arc o={O} from={0} to={dd} label={`${Math.round(dd)}°`}/><Arc o={O} from={180} to={180 + dd} label={`${Math.round(dd)}°`}/>
        {scene >= 3 && <><Arc o={O} from={dd} to={180} r={50} color={C.accent} label={`${180 - Math.round(dd)}°`}/></>}</g>; }
    case 'parallel': { const y1 = 150, y2 = 310; const dx = (y2 - y1) / Math.tan(rad(d)); const A: P = [W / 2 + dx / 2, y1], B: P = [W / 2 - dx / 2, y2]; const slide = scene === 2 ? eseg(p, .1, .9) : 0;
      const Ash: P = [lerp(A[0], B[0], slide), lerp(A[1], B[1], slide)];
      return <g><L a={[60, y1]} b={[740, y1]} color={C.ones}/><L a={[60, y2]} b={[740, y2]} color={C.ones}/><L a={pt(B, d + 180, 60)} b={pt(A, d, 60)} color={C.tens}/>
        <Arc o={Ash} from={0} to={d} label={`${d}°`} color={C.unknown}/><Arc o={B} from={0} to={d} label={`${d}°`}/>{scene >= 4 && <><Arc o={A} from={180} to={180 + d} color={C.accent} label={`${d}°`}/><Arc o={B} from={d} to={180} r={46} color={C.thousands} label={`${180 - d}°`}/></>}
        <T x={W / 2} y={40} size={16} color={C.muted}>{scene >= 4 ? 'corresponding = alternate; co-interior sum 180°' : 'transversal across parallel lines'}</T></g>; }
    case 'triangle-inequality': { const s = 40; const third = scene < 2 ? (c.a + c.b) * .7 : scene === 2 ? lerp(c.b - c.a - .8, c.b - c.a + .5, p) : scene === 3 ? lerp(c.a + c.b - .5, c.a + c.b + .8, p) : (c.a + c.b) * .7;
      const A: P = [220, 340], B: P = [A[0] + third * s, 340]; const ok = third > c.b - c.a && third < c.a + c.b;
      const cosA = (c.b * c.b + third * third - c.a * c.a) / (2 * c.b * third); const apex: P = ok ? pt(A, Math.acos(Math.max(-1, Math.min(1, cosA))) * 180 / Math.PI, c.b * s) : [A[0] + c.b * s * .9, 340 - 30];
      return <g><L a={A} b={B} color={C.ones} w={5}/><L a={A} b={ok ? apex : pt(A, 60, c.b * s)} color={C.tens} w={5}/><L a={B} b={ok ? apex : pt(B, 120, c.a * s)} color={C.accent} w={5}/>{!ok && <T x={W / 2} y={80} size={20} color={C.bad}>the sticks cannot meet</T>}
        <T x={W / 2} y={400} size={18}>{c.a} and {c.b}, third = {fmt(third, 1)} → {ok ? 'triangle ✓' : 'no triangle ✗'}</T></g>; }
    case 'polygon': { const n = c.n; const O: P = [300, 230]; const R = 150; const V = range(n).map(i => pt(O, 90 + (i * 360) / n, R)); const diag = scene >= 2 ? (scene === 2 ? Math.ceil(p * (n - 3)) : n - 3) : 0;
      return <g><polygon points={poly(V)} fill={C.hundreds} fillOpacity={.15} stroke={C.hundreds} strokeWidth={3}/>{range(diag).map(i => <L key={i} a={V[0]} b={V[i + 2]} color={C.ones} w={2}/>)}
        {scene >= 4 && V.map((v, i) => { const nx = V[(i + 1) % n]; return <L key={'e' + i} a={nx} b={[nx[0] + (nx[0] - v[0]) * .4, nx[1] + (nx[1] - v[1]) * .4]} color={C.tens} w={2} dash="4 4"/>; })}
        <T x={620} y={150} size={20}>{n} sides → {n - 2} triangles</T><T x={620} y={185} size={20}>({n} − 2) × 180° = {(n - 2) * 180}°</T>{scene >= 4 && <T x={620} y={225} size={18} color={C.tens}>exterior angles: 360°</T>}</g>; }
    case 'congruence': { const s = 46; const A: P = [140, 330]; const tri = (base: P, ang: number, side: number, len: number): P[] => [base, [base[0] + len * s, base[1]], pt(base, ang, side * s)];
      const t1 = tri(A, 50, 4, 5); const t2 = tri([A[0] + 330, 330], 50, 4, 5); const ssa1 = tri([A[0] + 330, 330], 40, 5, 6.1), ssa2 = tri([A[0] + 330, 330], 40, 5, 1.56);
      return <g><polygon points={poly(t1)} fill={C.ones} fillOpacity={.25} stroke={C.ones} strokeWidth={3}/>{scene >= 2 && scene < 3 && <polygon points={poly(t2)} fill={C.tens} fillOpacity={.25} stroke={C.tens} strokeWidth={3}/>}
        {scene >= 3 && <><polygon points={poly(ssa1)} fill={C.accent} fillOpacity={.2} stroke={C.accent} strokeWidth={3}/><polygon points={poly(ssa2)} fill={C.bad} fillOpacity={.2} stroke={C.bad} strokeWidth={3}/><T x={600} y={110} size={16} color={C.bad}>same SSA, two different triangles</T></>}
        <T x={W / 2} y={40} size={18}>{scene >= 4 ? 'SSS · SAS · ASA · AAS · HL ✓   SSA · AAA ✗' : scene >= 2 ? 'SAS: the copy must match' : 'Which facts fix a triangle?'}</T></g>; }
    case 'bisector': { const O: P = [180, 340]; const P0 = pt(O, d / 2, 260 * (scene >= 3 ? .5 + .3 * Math.sin(p * Math.PI) : .6)); const foot1 = pt(O, 0, dist(O, P0) * Math.cos(rad(d / 2))), foot2 = pt(O, d, dist(O, P0) * Math.cos(rad(d / 2)));
      return <g><L a={O} b={pt(O, 0, 520)}/><L a={O} b={pt(O, d, 420)}/>{scene >= 2 && <L a={O} b={pt(O, d / 2, 480)} color={C.ones} dash="6 4"/>}{scene >= 3 && <><L a={P0} b={foot1} color={C.tens}/><L a={P0} b={foot2} color={C.tens}/><circle cx={P0[0]} cy={P0[1]} r={6} fill={C.unknown}/><T x={P0[0] + 50} y={P0[1]} size={14} color={C.tens}>{fmt(dist(P0, foot1) / 30, 1)} = {fmt(dist(P0, foot2) / 30, 1)}</T></>}
        <Arc o={O} from={0} to={d / 2} r={50} label={`${d / 2}°`}/><Arc o={O} from={d / 2} to={d} r={70} color={C.accent} label={`${d / 2}°`}/></g>; }
    case 'perp-bisector': { const A: P = [250, 260], B: P = [550, 260]; const M: P = [400, 260]; const P0: P = [400, scene >= 2 ? lerp(120, 380, (Math.sin(p * Math.PI * 2) + 1) / 2) : 140];
      return <g>{scene >= 3 && <L a={[400, 40]} b={[400, 420]} color={C.ones} dash="6 4"/>}<L a={A} b={B} color={C.muted} w={2}/><circle cx={A[0]} cy={A[1]} r={8} fill={C.tens}/><circle cx={B[0]} cy={B[1]} r={8} fill={C.tens}/><T x={A[0]} y={A[1] + 24} size={16}>A</T><T x={B[0]} y={B[1] + 24} size={16}>B</T>
        <L a={P0} b={A} color={C.accent} w={2}/><L a={P0} b={B} color={C.accent} w={2}/><circle cx={P0[0]} cy={P0[1]} r={7} fill={C.unknown}/><T x={P0[0] + 70} y={P0[1]} size={14} color={C.accent}>PA = PB = {fmt(dist(P0, A) / 30, 1)}</T><rect x={M[0]} y={M[1] - 14} width={14} height={14} fill="none" stroke={C.ones} opacity={scene >= 3 ? 1 : 0}/></g>; }
    case 'isosceles': { const base = 300; const h = (base / 2) / Math.tan(rad(d / 2)); const A: P = [W / 2, 360 - Math.min(h, 300)], B: P = [W / 2 - base / 2, 360], Cc: P = [W / 2 + base / 2, 360]; const fold = scene === 2 ? Math.sin(p * Math.PI) : 0;
      return <g><polygon points={poly([A, B, Cc])} fill={C.hundreds} fillOpacity={.2} stroke={C.hundreds} strokeWidth={3}/><polygon points={poly([A, [lerp(Cc[0], B[0], fold), Cc[1]], [W / 2, 360]])} fill={C.tens} opacity={fold * .4}/>{scene >= 2 && <L a={A} b={[W / 2, 360]} color={C.ones} dash="6 4"/>}
        {scene >= 3 && <><Arc o={B} from={0} to={dirDeg(B, A)} r={40} label={`${(180 - d) / 2}°`}/><Arc o={Cc} from={dirDeg(Cc, A)} to={180} r={40} label={`${(180 - d) / 2}°`}/></>}<Arc o={A} from={dirDeg(A, B)} to={dirDeg(A, Cc) + 360} r={36} color={C.accent} label={`${d}°`}/>
        {scene >= 4 && <T x={W / 2} y={40} size={16} color={C.ones}>bisector = median = altitude</T>}</g>; }
    case 'midline': { const A: P = [380, 90], B: P = [170, 370], Cc: P = [650, 370]; const M: P = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], N: P = [(A[0] + Cc[0]) / 2, (A[1] + Cc[1]) / 2]; const rot = scene === 3 ? eseg(p, .1, .9) : scene > 3 ? 1 : 0;
      const img = (q: P): P => { const x = 2 * N[0] - q[0], y = 2 * N[1] - q[1]; return [lerp(q[0], x, rot), lerp(q[1], y, rot)]; };
      return <g><polygon points={poly([A, B, Cc])} fill="none" stroke={C.ink} strokeWidth={3}/>{scene >= 1 && <><circle cx={M[0]} cy={M[1]} r={6} fill={C.ones}/><circle cx={N[0]} cy={N[1]} r={6} fill={C.ones}/></>}{scene >= 2 && <L a={M} b={N} color={C.ones} w={4}/>}
        {rot > 0 && <polygon points={poly([img(A), img(M), N])} fill={C.tens} fillOpacity={.3} stroke={C.tens}/>}<T x={W / 2} y={410} size={16}>{scene >= 2 ? `MN = ${fmt(dist(M, N) / 40, 1)}, BC = ${fmt(dist(B, Cc) / 40, 1)}: MN ∥ BC, MN = ½BC` : 'midpoints M and N'}</T></g>; }
    case 'inscribed': { const O: P = [W / 2 - 80, 240]; const R = 160; const a1 = 230, a2 = a1 + d; const Aa = pt(O, a1, R), Bb = pt(O, a2, R); const pAng = scene >= 2 ? lerp(a2 + 30, a1 + 330, scene === 2 ? (Math.sin(p * Math.PI * 2) + 1) / 2 : .5) : a2 + 120; const Pp = pt(O, pAng, R);
      return <g><circle cx={O[0]} cy={O[1]} r={R} fill="none" stroke={C.muted} strokeWidth={2}/><L a={O} b={Aa} color={C.tens} w={2}/><L a={O} b={Bb} color={C.tens} w={2}/><Arc o={O} from={a1} to={a2} r={30} color={C.tens} label={`${d}°`}/>
        <L a={Pp} b={Aa} color={C.ones} w={2}/><L a={Pp} b={Bb} color={C.ones} w={2}/><circle cx={Pp[0]} cy={Pp[1]} r={6} fill={C.unknown}/><T x={Pp[0]} y={Pp[1] + (Pp[1] > O[1] ? 22 : -22)} size={14} color={C.ones}>{fmt(angleAt(Aa, Pp, Bb), 0)}°</T>
        <T x={650} y={160} size={18}>central {d}°</T><T x={650} y={195} size={18} color={C.ones}>inscribed {d / 2}°</T>{scene >= 4 && <T x={650} y={240} size={14} color={C.muted}>diameter → 90°</T>}</g>; }
    case 'tangent': { const O: P = [320, 240]; const R = 110; const dLine = scene === 2 ? lerp(40, R, eseg(p, .1, .9)) : scene < 2 ? 60 : R; const P0: P = [620, 240]; const tLen = Math.sqrt(dist(O, P0) ** 2 - R * R); const ang = Math.asin(R / dist(O, P0));
      const T1 = pt(O, (Math.PI / 2 - ang) * 180 / Math.PI, R), T2 = pt(O, -(Math.PI / 2 - ang) * 180 / Math.PI, R);
      return <g><circle cx={O[0]} cy={O[1]} r={R} fill="none" stroke={C.muted} strokeWidth={2}/><circle cx={O[0]} cy={O[1]} r={4} fill={C.ink}/>{scene <= 3 && <L a={[O[0] - 200, O[1] - dLine]} b={[O[0] + 200, O[1] - dLine]} color={C.ones}/>}{scene === 3 && <><L a={O} b={[O[0], O[1] - R]} color={C.tens}/><rect x={O[0]} y={O[1] - R} width={12} height={12} fill="none" stroke={C.unknown}/></>}
        {scene >= 4 && <><L a={P0} b={T1} color={C.ones}/><L a={P0} b={T2} color={C.ones}/><L a={O} b={T1} color={C.tens} w={2}/><L a={O} b={T2} color={C.tens} w={2}/><T x={(P0[0] + T1[0]) / 2} y={(P0[1] + T1[1]) / 2 - 16} size={14} color={C.ones}>{fmt(tLen / 30, 1)}</T><T x={(P0[0] + T2[0]) / 2} y={(P0[1] + T2[1]) / 2 + 16} size={14} color={C.ones}>{fmt(tLen / 30, 1)}</T></>}
        <T x={W / 2} y={40} size={16}>{scene >= 4 ? 'equal tangent lengths from P' : `distance to line ${fmt(dLine / R, 2)}r ${dLine >= R - .5 ? '= r → tangent' : '< r → crosses'}`}</T></g>; }
    case 'arc-length': { const O: P = [260, 260]; const R = 150; const curl = scene >= 4 ? eseg(scene === 4 ? p : 1, .1, .9) : 0;
      return <g><circle cx={O[0]} cy={O[1]} r={R} fill="none" stroke={C.faint} strokeDasharray="4 6"/><path d={`M${O[0]} ${O[1]} L${pt(O, 90, R).join(' ')} A${R} ${R} 0 ${d > 180 ? 1 : 0} 0 ${pt(O, 90 + d, R).join(' ')} Z`} fill={C.ones} opacity={.35 * (1 - curl * .6)} stroke={C.ones}/>
        {scene >= 3 && <path d={`M${pt(O, 90, R).join(' ')} A${R} ${R} 0 ${d > 180 ? 1 : 0} 0 ${pt(O, 90 + d, R).join(' ')}`} fill="none" stroke={C.unknown} strokeWidth={5}/>}
        {curl > 0 && <g transform="translate(560 200)"><ellipse cx={0} cy={120} rx={R * d / 360 * curl + 4} ry={(R * d / 360) * .25} fill="none" stroke={C.unknown} strokeWidth={3}/><path d={`M${-R * d / 360 * curl} 120 L0 ${120 - Math.sqrt(R * R - (R * d / 360) ** 2) * curl} L${R * d / 360 * curl} 120`} fill={C.ones} opacity={.3} stroke={C.ones}/></g>}
        <T x={600} y={60} size={18}>{d}/360 of the circle</T>{scene >= 3 && <T x={600} y={90} size={16} color={C.unknown}>l = nπr/180</T>}</g>; }
    default: { const s = 36; const k = scene >= 3 ? (scene === 3 ? lerp(1, c.k, eseg(p, .1, .9)) : c.k) : 1; const base: P = [100, 380]; const t1: P[] = [base, [base[0] + 4 * s, base[1]], [base[0] + 1.2 * s, base[1] - 3 * s]]; const b2: P = [360, 380]; const t2: P[] = [b2, [b2[0] + 4 * s * k, b2[1]], [b2[0] + 1.2 * s * k, b2[1] - 3 * s * k]];
      return <g><polygon points={poly(t1)} fill={C.ones} fillOpacity={.3} stroke={C.ones} strokeWidth={3}/><polygon points={poly(t2)} fill={C.tens} fillOpacity={.3} stroke={C.tens} strokeWidth={3}/>{scene >= 2 && <><Arc o={t1[0]} from={0} to={dirDeg(t1[0], t1[2])} r={28} label={`${fmt(angleAt(t1[1], t1[0], t1[2]), 0)}°`}/><Arc o={t2[0]} from={0} to={dirDeg(t2[0], t2[2])} r={28} label={`${fmt(angleAt(t2[1], t2[0], t2[2]), 0)}°`}/></>}
        <T x={650} y={120} size={18}>lengths × {fmt(k, 2)}</T>{scene >= 4 && <T x={650} y={155} size={18} color={C.tens}>areas × {fmt(k * k, 2)}</T>}</g>; }
  }
}

function Explore({c}: {c: Geo2Config}) {
  const [d, setD] = useState(c.deg), [n, setN] = useState(c.n); const [P0, setP0] = useState<P>([420, 150]);
  switch (c.mode) {
    case 'polygon': return <Stage label={`${n}-gon`} controls={<><Slider label="Sides" value={n} min={3} max={12} onChange={setN}/><Readout>interior sum ({n} − 2) × 180° = {(n - 2) * 180}° · each (regular) {fmt(((n - 2) * 180) / n, 1)}° · exterior 360°</Readout></>}><Scene c={{...c, n}} scene={4} p={1}/></Stage>;
    case 'perp-bisector': { const A: P = [250, 260], B: P = [550, 260]; const da = dist(P0, A), db = dist(P0, B); return <Stage label="Equidistant points" controls={<Readout>PA = {fmt(da / 30, 2)}, PB = {fmt(db / 30, 2)} {Math.abs(da - db) < 3 ? '— on the perpendicular bisector!' : ''}</Readout>}>
      <L a={[400, 40]} b={[400, 420]} color={C.ones} dash="6 4"/><L a={A} b={B} color={C.muted} w={2}/><L a={P0} b={A} color={C.accent} w={2}/><L a={P0} b={B} color={C.accent} w={2}/><circle cx={A[0]} cy={A[1]} r={8} fill={C.tens}/><circle cx={B[0]} cy={B[1]} r={8} fill={C.tens}/><Handle x={P0[0]} y={P0[1]} label="Move P" onMove={(x, y) => setP0([x, y])}/></Stage>; }
    case 'inscribed': case 'complement': case 'vertical': case 'parallel': case 'isosceles': case 'bisector': case 'arc-length': return <Stage label={`angle ${d}`} controls={<><Slider label="Angle" value={d} min={10} max={c.mode === 'complement' ? 85 : 170} step={5} onChange={setD}/><Readout>{c.mode === 'inscribed' ? `central ${d}° → inscribed ${d / 2}°` : c.mode === 'complement' ? `complement ${90 - d}° · supplement ${180 - d}°` : c.mode === 'isosceles' ? `base angles ${(180 - d) / 2}°` : c.mode === 'arc-length' ? `${d}/360 of the circle` : `${d}° and ${180 - d}°`}</Readout></>}><Scene c={{...c, deg: d}} scene={4} p={1}/></Stage>;
    default: return <Stage label={geo2.describe(c)} controls={<Readout>Step through the scenes in Observe to watch the figure move.</Readout>}><Scene c={c} scene={4} p={1}/></Stage>;
  }
}

export const geo2View: EngineView<Geo2Config> = {Scene: props => <Stage label={geo2.describe(props.c)}><Scene {...props}/></Stage>, Explore};

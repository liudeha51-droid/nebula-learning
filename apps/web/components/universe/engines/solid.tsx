'use client';
import {useRef, useState, type ReactNode} from 'react';
import {Stage, T, C, W, H, Readout, Slider, Stepper, Segmented, Action, useSound} from '../stage';
import {solid, foldNet, surfaceArea, type SolidConfig, type V3} from '@/lib/universe/engines/solid';
import {clamp, eseg, fix, fmt, lerp, seg} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

type Face = {pts: V3[]; fill: string; stroke?: string; opacity?: number; label?: string};
interface Cam {yaw: number; pitch: number; s: number; cx: number; cy: number}
const project = (cam: Cam, [x, y, z]: V3) => { const a = cam.yaw * Math.PI / 180, b = cam.pitch * Math.PI / 180; const x1 = x * Math.cos(a) - y * Math.sin(a), y1 = x * Math.sin(a) + y * Math.cos(a);
  return {X: cam.cx + cam.s * x1, Y: cam.cy - cam.s * (z * Math.cos(b) + y1 * Math.sin(b)), depth: y1 * Math.cos(b) - z * Math.sin(b)}; };
const shade = (hex: string, k: number) => { const n = parseInt(hex.slice(1), 16); const f = (v: number) => Math.round(clamp(v * k, 0, 255)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
/** Painter's algorithm renderer for convex faces. */
function Mesh({faces, cam}: {faces: Face[]; cam: Cam}) {
  const proj = faces.map(f => { const ps = f.pts.map(p => project(cam, p)); return {...f, ps, depth: ps.reduce((s, p) => s + p.depth, 0) / ps.length}; }).sort((a, b) => b.depth - a.depth);
  return <g>{proj.map((f, i) => <g key={i}><polygon points={f.ps.map(p => `${p.X},${p.Y}`).join(' ')} fill={f.fill} fillOpacity={f.opacity ?? 1} stroke={f.stroke ?? '#15141d'} strokeWidth={1.2} strokeLinejoin="round"/>
    {f.label && <T x={f.ps.reduce((s, p) => s + p.X, 0) / f.ps.length} y={f.ps.reduce((s, p) => s + p.Y, 0) / f.ps.length} size={12} color="#15141d" weight={700}>{f.label}</T>}</g>)}</g>;
}
const boxFaces = (x0: number, y0: number, z0: number, l: number, w: number, h: number, color: string, opacity = 1): Face[] => {
  const v = (x: number, y: number, z: number): V3 => [x0 + x * l, y0 + y * w, z0 + z * h];
  return [
    {pts: [v(0, 0, 1), v(1, 0, 1), v(1, 1, 1), v(0, 1, 1)], fill: shade(color, 1.1), opacity}, {pts: [v(0, 0, 0), v(1, 0, 0), v(1, 1, 0), v(0, 1, 0)], fill: shade(color, .5), opacity},
    {pts: [v(0, 0, 0), v(1, 0, 0), v(1, 0, 1), v(0, 0, 1)], fill: shade(color, .85), opacity}, {pts: [v(0, 1, 0), v(1, 1, 0), v(1, 1, 1), v(0, 1, 1)], fill: shade(color, .7), opacity},
    {pts: [v(0, 0, 0), v(0, 1, 0), v(0, 1, 1), v(0, 0, 1)], fill: shade(color, .75), opacity}, {pts: [v(1, 0, 0), v(1, 1, 0), v(1, 1, 1), v(1, 0, 1)], fill: shade(color, .62), opacity}];
};
const ring = (r: number, z: number, n = 36): V3[] => range(n).map(i => [r * Math.cos(i / n * 2 * Math.PI), r * Math.sin(i / n * 2 * Math.PI), z]);
const cylinderFaces = (r: number, h: number, color: string, opacity = 1, top = true): Face[] => { const b = ring(r, 0), t = ring(r, h); const n = b.length;
  return [...range(n).map(i => ({pts: [b[i], b[(i + 1) % n], t[(i + 1) % n], t[i]], fill: shade(color, .65 + .35 * Math.abs(Math.cos(i / n * 2 * Math.PI - .8))), stroke: 'none', opacity})), {pts: b, fill: shade(color, .5), opacity}, ...(top ? [{pts: t, fill: shade(color, 1.1), opacity}] : [])]; };
const coneFaces = (r: number, h: number, color: string, opacity = 1): Face[] => { const b = ring(r, 0); const n = b.length; const apex: V3 = [0, 0, h];
  return [...range(n).map(i => ({pts: [b[i], b[(i + 1) % n], apex], fill: shade(color, .65 + .35 * Math.abs(Math.cos(i / n * 2 * Math.PI - .8))), stroke: 'none', opacity})), {pts: b, fill: shade(color, .5), opacity}]; };
const translate = (faces: Face[], d: V3): Face[] => faces.map(f => ({...f, pts: f.pts.map(([x, y, z]) => [x + d[0], y + d[1], z + d[2]] as V3)}));
function Sphere({cx, cy, r}: {cx: number; cy: number; r: number}) { return <g><defs><radialGradient id="u-sph" cx=".35" cy=".3"><stop offset="0" stopColor="#ffe9f6"/><stop offset="1" stopColor={C.unknown}/></radialGradient></defs><circle cx={cx} cy={cy} r={r} fill="url(#u-sph)"/></g>; }

/** Drag anywhere on the stage to rotate. */
function Rotator({cam, setCam, children}: {cam: Cam; setCam: (c: Cam) => void; children: ReactNode}) {
  const drag = useRef<[number, number] | null>(null);
  return <g onPointerDown={e => { drag.current = [e.clientX, e.clientY]; (e.currentTarget as Element).setPointerCapture(e.pointerId); }} onPointerUp={() => { drag.current = null; }}
    onPointerMove={e => { if (!drag.current) return; const dx = e.clientX - drag.current[0], dy = e.clientY - drag.current[1]; drag.current = [e.clientX, e.clientY]; setCam({...cam, yaw: cam.yaw + dx * .6, pitch: clamp(cam.pitch + dy * .4, 5, 85)}); }}
    tabIndex={0} role="application" aria-label="Rotate the solid: drag, or use arrow keys" onKeyDown={e => { const m: Record<string, [number, number]> = {ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -5], ArrowDown: [0, 5]}; const k = m[e.key]; if (k) { e.preventDefault(); setCam({...cam, yaw: cam.yaw + k[0], pitch: clamp(cam.pitch + k[1], 5, 85)}); } }}>
    <rect width={W} height={H} fill="transparent" style={{cursor: 'grab'}}/>{children}</g>;
}

function stackFaces(): Face[] { const cubes: V3[] = [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0], [0, 0, 1]]; return cubes.flatMap(([x, y, z]) => boxFaces(x - 1.5, y - 1, z, 1, 1, 1, C.tens)); }
function solidFaces(shape: string): Face[] {
  if (shape === 'cuboid') return boxFaces(-1.6, -1, 0, 3.2, 2, 1.6, C.ones);
  if (shape === 'cylinder') return cylinderFaces(1.2, 2.4, C.tens);
  if (shape === 'stack') return stackFaces();
  if (shape === 'cone') return coneFaces(1.4, 2.6, C.thousands);
  return boxFaces(-1.2, -1.2, 0, 2.4, 2.4, 2.4, C.hundreds);
}
function unitCubes(l: number, w: number, h: number, upTo: number, color = C.ones) { const out: Face[] = []; let k = 0;
  for (let z = 0; z < h; z++) for (let y = 0; y < w; y++) for (let x = 0; x < l; x++) { if (k++ >= upTo) continue; out.push(...boxFaces(x - l / 2, y - w / 2, z, 1, 1, 1, z % 2 ? C.tens : color)); }
  return out; }
const netColors = [C.ones, C.tens, C.hundreds, C.thousands, C.accent, C.unknown];
function netFaces(l: number, w: number, h: number, t: number, labels = false): Face[] { return foldNet(l, w, h, t).map((f, i) => ({pts: f.pts.map(([x, y, z]) => [x - l / 2, y - w / 2, z] as V3), fill: netColors[i], opacity: .9, label: labels ? `${f.area}` : undefined})); }

/** Side view of a cylinder or cone container (pseudo 3D) with a liquid level 0..1 of its own volume. */
function Vessel({kind, x, base, r, h, level, tilt = 0}: {kind: 'cyl' | 'cone'; x: number; base: number; r: number; h: number; level: number; tilt?: number}) {
  const e = r * .28; const lh = level * h; // cylinder: linear; cone (standing on its base) is solved below
  const coneW = (y: number) => r * (1 - y / h);
  return <g transform={`rotate(${tilt} ${x} ${base - h / 2})`}>
    {kind === 'cyl' ? <><rect x={x - r} y={base - lh} width={2 * r} height={lh} fill={C.accent} opacity={.55}/>{lh > 0 && <ellipse cx={x} cy={base - lh} rx={r} ry={e} fill={C.accent} opacity={.7}/>}
      <ellipse cx={x} cy={base} rx={r} ry={e} fill="none" stroke={C.ink} strokeWidth={1.5}/><line x1={x - r} x2={x - r} y1={base} y2={base - h} stroke={C.ink} strokeWidth={1.5}/><line x1={x + r} x2={x + r} y1={base} y2={base - h} stroke={C.ink} strokeWidth={1.5}/><ellipse cx={x} cy={base - h} rx={r} ry={e} fill="#ffffff08" stroke={C.ink} strokeWidth={1.5}/></>
      : (() => { const fillH = (1 - Math.cbrt(1 - level)) * h; const wTop = coneW(fillH); return <>{level > 0 && <path d={`M${x - r} ${base} L${x - wTop} ${base - fillH} L${x + wTop} ${base - fillH} L${x + r} ${base} Z`} fill={C.accent} opacity={.55}/>}
        {level > 0 && <ellipse cx={x} cy={base - fillH} rx={wTop} ry={wTop * .28} fill={C.accent} opacity={.7}/>}<ellipse cx={x} cy={base} rx={r} ry={e} fill="none" stroke={C.ink} strokeWidth={1.5}/><path d={`M${x - r} ${base} L${x} ${base - h} L${x + r} ${base}`} fill="none" stroke={C.ink} strokeWidth={1.5}/></>; })()}
    {kind === 'cyl' && [1, 2].map(k => <g key={k}><line x1={x + r} x2={x + r + 12} y1={base - (h * k) / 3} y2={base - (h * k) / 3} stroke={C.muted}/><T x={x + r + 28} y={base - (h * k) / 3} size={12} color={C.muted}>{k}/3</T></g>)}</g>;
}

function Scene({c, scene, p}: {c: SolidConfig; scene: number; p: number}) {
  const spin = 30 + (scene * 25 + p * 50);
  const cam: Cam = {yaw: -30, pitch: 28, s: 46, cx: W / 2, cy: 330};
  switch (c.mode) {
    case 'views': { const yaw = scene < 2 ? spin : scene === 2 ? lerp(spin, 0, eseg(p, 0, .5)) : scene === 3 ? (p < .5 ? lerp(0, 90, eseg(p, 0, .4)) : 90) : 0; const pitch = scene === 3 && p >= .5 ? lerp(5, 89, eseg(p, .5, .9)) : scene >= 2 ? 5 : 28;
      const label = scene === 2 ? 'FRONT' : scene === 3 ? (p < .5 ? 'SIDE' : 'TOP') : '';
      return <g><Mesh faces={solidFaces(c.shape)} cam={{...cam, yaw, pitch, s: 60, cy: 300}}/>{label && <T x={W / 2} y={50} size={24} color={C.accent} weight={700}>{label} VIEW</T>}{scene >= 4 && <T x={W / 2} y={50} size={20}>{c.shape === 'stack' ? 'front · side · top: three flat patterns' : 'front & side: rectangle · top: circle'}</T>}</g>; }
    case 'unit-cubes': case 'capacity': { const layer = c.l * c.w; const shown = scene < 2 ? 0 : scene === 2 ? Math.ceil(p * layer) : scene === 3 ? layer + Math.ceil(p * layer * (c.h - 1)) : layer * c.h; const s = Math.min(46, 260 / Math.max(c.l, c.w, c.h * 1.4));
      if (c.mode === 'capacity') { const lv = scene < 2 ? 0 : scene === 2 ? p / c.h : scene === 3 ? (1 + p * (c.h - 1)) / c.h : 1; return <g><Mesh faces={[...boxFaces(-c.l / 2, -c.w / 2, 0, c.l, c.w, c.h * lv, C.accent, .55), ...boxFaces(-c.l / 2, -c.w / 2, 0, c.l, c.w, c.h, '#ffffff', .06)]} cam={{...cam, s: 26, cy: 380}}/><T x={W / 2} y={40} size={24} weight={600}>{fmt(Math.round(c.l * c.w * c.h * lv))} dm³ = {fmt(Math.round(c.l * c.w * c.h * lv))} L</T></g>; }
      return <g><Mesh faces={[...boxFaces(-c.l / 2, -c.w / 2, 0, c.l, c.w, c.h, '#ffffff', .05), ...unitCubes(c.l, c.w, c.h, shown)]} cam={{...cam, s, yaw: -30 + p * 4}}/><T x={W / 2} y={40} size={24} weight={600}>{scene >= 4 ? `${c.l} × ${c.w} × ${c.h} = ${c.l * c.w * c.h} cubes` : `${shown} unit cubes`}</T></g>; }
    case 'fev': { const faces = boxFaces(-2, -1.5, 0, c.l, c.w, c.h, C.ones, scene >= 3 ? .25 : .9); const camE = {...cam, yaw: spin - 60, s: 50, cy: 320};
      const verts: V3[] = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]].map(([x, y, z]) => [-2 + x * c.l, -1.5 + y * c.w, z * c.h]);
      const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
      return <g><Mesh faces={faces} cam={camE}/>{scene >= 3 && edges.map(([a, b], i) => { const A = project(camE, verts[a]), B = project(camE, verts[b]); return <line key={i} x1={A.X} y1={A.Y} x2={B.X} y2={B.Y} stroke={[C.tens, C.hundreds, C.thousands][Math.floor(i / 4) % 3]} strokeWidth={4} opacity={seg(p, i / 14, i / 14 + .1) || (scene > 3 ? 1 : 0)}/>; })}
        {scene >= 3 && verts.map((v, i) => { const P = project(camE, v); return <circle key={i} cx={P.X} cy={P.Y} r={6} fill={C.unknown}/>; })}<T x={W / 2} y={40} size={22} weight={600}>{scene >= 4 ? '6 faces · 12 edges · 8 vertices' : scene === 3 ? 'edges in 3 groups of 4 · 8 vertices' : scene === 2 ? '6 faces' : 'cuboid'}</T></g>; }
    case 'net': case 'surface': { const s = c.mode === 'surface'; const [l, w, h] = s ? [c.l, c.w, c.h] : [2, 2, 2]; const t = scene < 2 ? 1 : scene === 2 ? 1 - eseg(p, .05, .95) : scene === 3 ? 0 : scene === 4 && !s ? eseg(p, .1, .9) : 0;
      return <g><Mesh faces={netFaces(l, w, h, t, s && t < .05)} cam={{...cam, yaw: lerp(-20, -30, t), pitch: lerp(70, 28, t), s: s ? 34 : 44, cy: 270}}/><T x={W / 2} y={40} size={22} weight={600}>{s && scene >= 4 ? `surface area = 2 × (${l * w} + ${l * h} + ${w * h}) = ${surfaceArea(l, w, h)} · volume = ${l * w * h}` : t < .05 ? 'the net: six faces, flat' : t > .95 ? (s ? `${l} × ${w} × ${h} box` : 'cube') : 'folding…'}</T></g>; }
    case 'cylinder-net': { const r = 1.1, h = 2.6; const t = scene < 2 ? 0 : scene === 2 ? eseg(p, .1, .9) : 1; const Cpx = 2 * Math.PI * r * 46, Hpx = h * 46;
      return <g><g opacity={1 - t * .6}><Mesh faces={translate(cylinderFaces(r, h, C.tens, 1), [0, 0, 0])} cam={{...cam, cx: 170, s: 46, cy: 330}}/></g>
        <rect x={330} y={330 - Hpx} width={Cpx * t} height={Hpx} fill={C.tens} opacity={.7} stroke="#fff" strokeOpacity={.3}/>{t > .9 && <><circle cx={330 + Cpx / 2} cy={330 - Hpx - r * 46} r={r * 46} fill={C.tens} opacity={.5}/><circle cx={330 + Cpx / 2} cy={330 + r * 46 + 4} r={r * 46} fill={C.tens} opacity={.5}/></>}
        {scene >= 3 && <><T x={330 + Cpx / 2} y={330 - Hpx - 2 * r * 46 - 16} size={15} color={C.ones}>length = 2πr = {fmt(fix(2 * 3.14 * c.r))}</T><T x={330 + Cpx + 30} y={330 - Hpx / 2} size={15} color={C.ones} anchor="start">h = {c.h}</T></>}
        <T x={W / 2} y={30} size={22} weight={600}>{scene >= 4 ? `lateral = 2πrh = ${fmt(fix(2 * 3.14 * c.r * c.h))}` : 'unroll the curved surface'}</T></g>; }
    case 'cylinder-volume': { const n = 16; const t = scene < 3 ? 0 : scene === 3 ? eseg(p, .1, .9) : 1; const r = 1.2, h = 2.2;
      const chord = 2 * r * Math.sin(Math.PI / n); const x0 = -(n / 2) * chord / 2 - chord / 4;
      const wedges: Face[] = range(n).flatMap(i => { const a0 = i / n * 2 * Math.PI, a1 = (i + 1) / n * 2 * Math.PI, mid = (a0 + a1) / 2; const odd = i % 2 === 1; const k = Math.floor(i / 2);
        // Arranged: wedges alternate pointing +y and −y along a strip of length ≈ πr and width ≈ r.
        const apex: [number, number] = odd ? [x0 + chord + k * chord, r / 2] : [x0 + chord / 2 + k * chord, -r / 2]; const target = odd ? -Math.PI / 2 : Math.PI / 2;
        const pt = (a: number, rho: number, z: number): V3 => { const dx = rho * Math.cos(a), dy = rho * Math.sin(a); const b2 = a - mid + target; return [lerp(dx, apex[0] + rho * Math.cos(b2), t), lerp(dy, apex[1] + rho * Math.sin(b2), t), z]; };
        const col = odd ? C.tens : C.ones; return [{pts: [pt(a0, r, 0), pt(a1, r, 0), pt(a1, r, h), pt(a0, r, h)], fill: shade(col, .8)}, {pts: [pt(0, 0, h), pt(a0, r, h), pt(a1, r, h)], fill: col}, {pts: [pt(0, 0, 0), pt(a0, r, 0), pt(a0, r, h), pt(0, 0, h)], fill: shade(col, .6)}, {pts: [pt(0, 0, 0), pt(a1, r, 0), pt(a1, r, h), pt(0, 0, h)], fill: shade(col, .6)}]; });
      return <g><Mesh faces={wedges} cam={{...cam, s: 62, cy: 320}}/><T x={W / 2} y={40} size={22} weight={600}>{scene >= 4 ? `V = πr² × h = 3.14 × ${c.r * c.r} × ${c.h} = ${fmt(fix(3.14 * c.r * c.r * c.h))}` : scene >= 3 ? 'length πr · width r · height h' : 'cylinder'}</T></g>; }
    case 'cone-pour': { const pours = scene < 2 ? 0 : scene === 2 ? seg(p, .3, .9) : scene === 3 ? 1 + seg(p, .05, .45) + seg(p, .55, .95) : 3;
      const inPour = pours % 1; const coneLevel = scene < 2 ? 1 : inPour > 0 ? 1 - inPour : pours >= 3 ? 0 : 1; const tilt = inPour > 0 ? -110 * Math.sin(Math.min(1, inPour * 1.2) * Math.PI / 2) : 0;
      return <g><Vessel kind="cyl" x={520} base={380} r={90} h={240} level={Math.min(1, pours / 3)}/><Vessel kind="cone" x={inPour > 0 ? 360 : 230} base={inPour > 0 ? 230 : 380} r={90} h={240} level={coneLevel} tilt={tilt}/>
        <T x={W / 2} y={40} size={24} weight={600}>{scene >= 4 ? 'V cone = ⅓ × V cylinder' : `${Math.floor(pours)} cone${Math.floor(pours) === 1 ? '' : 's'} poured`}</T>
        <T x={230} y={420} size={14} color={C.muted}>same base, same height</T></g>; }
    default: { const shapes = ['cube', 'cuboid', 'cylinder']; return <g>{shapes.map((sh, i) => <g key={sh}><Mesh faces={solidFaces(sh)} cam={{...cam, yaw: spin + i * 20, s: 34, cx: 130 + i * 190, cy: 320}}/><T x={130 + i * 190} y={400} size={15} color={C.muted}>{sh}</T></g>)}
      <Sphere cx={700} cy={270} r={58}/><T x={700} y={400} size={15} color={C.muted}>sphere</T>
      {scene >= 3 && <g><rect x={95} y={60} width={70} height={70} fill="none" stroke={C.hundreds} strokeWidth={3}/><rect x={260} y={70} width={110} height={56} fill="none" stroke={C.ones} strokeWidth={3}/><circle cx={510} cy={95} r={36} fill="none" stroke={C.tens} strokeWidth={3}/><T x={700} y={95} size={14} color={C.muted}>no flat face</T></g>}</g>; }
  }
}

function Explore({c}: {c: SolidConfig}) {
  const sound = useSound();
  const [cam, setCam] = useState<Cam>({yaw: -30, pitch: 28, s: 46, cx: W / 2, cy: 330});
  const [l, setL] = useState(c.l), [w, setW] = useState(c.w), [h, setH] = useState(c.h); const [t, setT] = useState(0); const [shape, setShape] = useState(c.shape === 'stack' ? 'stack' : c.shape || 'cube'); const [pours, setPours] = useState(0);
  if (c.mode === 'cone-pour') return <Stage label={`${pours} cones poured`} controls={<><Action primary onClick={() => { if (pours < 3) { setPours(pours + 1); sound(pours === 2 ? 'success' : 'whoosh'); } }} disabled={pours >= 3}>Pour a cone</Action><Action onClick={() => setPours(0)}>Empty</Action><Readout>{pours}/3 of the cylinder · cone volume = ⅓ × base area × height</Readout></>}>
    <Vessel kind="cyl" x={520} base={380} r={90} h={240} level={pours / 3}/><Vessel kind="cone" x={230} base={380} r={90} h={240} level={pours < 3 ? 1 : 0}/></Stage>;
  if (c.mode === 'cylinder-net' || c.mode === 'cylinder-volume') { const r = l / 2, hh = h; return <Stage label="Cylinder" controls={<><Slider label="Radius" value={l} min={1} max={6} onChange={setL} format={v => String(v / 2)}/><Slider label="Height" value={h} min={1} max={6} onChange={setH}/>
    <Readout>{c.mode === 'cylinder-net' ? `lateral 2πrh = ${fmt(fix(2 * 3.14 * r * hh))} · total ${fmt(fix(2 * 3.14 * r * hh + 2 * 3.14 * r * r))}` : `V = πr²h = ${fmt(fix(3.14 * r * r * hh))}`} · drag to rotate</Readout></>}>
    <Rotator cam={cam} setCam={setCam}><Mesh faces={cylinderFaces(r * .6, hh * .6, C.tens)} cam={{...cam, s: 50}}/></Rotator></Stage>; }
  if (c.mode === 'net' || c.mode === 'surface') { const [L, Wd, Hh] = c.mode === 'net' ? [2, 2, 2] : [l, w, h]; return <Stage label="Fold the net" controls={<><Slider label="Fold" value={t} min={0} max={1} step={.02} onChange={setT} format={v => `${Math.round(v * 90)}°`}/>
    {c.mode === 'surface' && <><Stepper label="l" value={l} min={1} max={6} onChange={setL}/><Stepper label="w" value={w} min={1} max={5} onChange={setW}/><Stepper label="h" value={h} min={1} max={5} onChange={setH}/></>}
    <Readout>{c.mode === 'surface' ? `surface ${surfaceArea(L, Wd, Hh)} squares · volume ${L * Wd * Hh} cubes` : 'Drag to rotate; slide to fold'}</Readout></>}>
    <Rotator cam={cam} setCam={setCam}><Mesh faces={netFaces(L, Wd, Hh, t, c.mode === 'surface')} cam={{...cam, s: c.mode === 'surface' ? 30 : 44, cy: 280}}/></Rotator></Stage>; }
  if (c.mode === 'unit-cubes' || c.mode === 'capacity' || c.mode === 'fev') { const s = Math.min(44, 230 / Math.max(l, w, h * 1.3)); return <Stage label={`${l} by ${w} by ${h}`} controls={<><Stepper label="Length" value={l} min={1} max={8} onChange={setL}/><Stepper label="Width" value={w} min={1} max={6} onChange={setW}/><Stepper label="Height" value={h} min={1} max={6} onChange={setH}/>
    <Readout>{c.mode === 'fev' ? `edges total (${l}+${w}+${h})×4 = ${(l + w + h) * 4}` : `V = ${l} × ${w} × ${h} = ${l * w * h}${c.mode === 'capacity' ? ' dm³ = ' + l * w * h + ' L' : ' cubes'}`} · surface {surfaceArea(l, w, h)}</Readout></>}>
    <Rotator cam={cam} setCam={setCam}><Mesh faces={c.mode === 'fev' ? boxFaces(-l / 2, -w / 2, 0, l, w, h, C.ones) : unitCubes(l, w, h, l * w * h)} cam={{...cam, s}}/></Rotator></Stage>; }
  const views: [string, Partial<Cam>][] = [['Free', {}], ['Front', {yaw: 0, pitch: 5}], ['Side', {yaw: 90, pitch: 5}], ['Top', {yaw: 0, pitch: 89}]];
  return <Stage label={`${shape}, drag to rotate`} controls={<>{c.mode === 'explore' && <Segmented label="Solid" value={shape} onChange={setShape} options={[['cube', 'Cube'], ['cuboid', 'Cuboid'], ['cylinder', 'Cylinder'], ['cone', 'Cone']]}/>}
    {views.map(([name, v]) => <Action key={name} onClick={() => setCam({...cam, ...v})}>{name} view</Action>)}<Readout>Drag or use arrow keys to rotate.</Readout></>}>
    <Rotator cam={cam} setCam={setCam}><Mesh faces={solidFaces(shape)} cam={{...cam, s: 60, cy: 300}}/></Rotator></Stage>;
}

export const solidView: EngineView<SolidConfig> = {Scene: props => <Stage label={solid.describe(props.c)}><Scene {...props}/></Stage>, Explore};

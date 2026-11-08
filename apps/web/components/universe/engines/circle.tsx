'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Handle, Action} from '../stage';
import {circle, circleArea, PI, type CircleConfig} from '@/lib/universe/engines/circle';
import {eseg, fmt, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const rad = (d: number) => d * Math.PI / 180;
/** n sectors of a circle (radius r px) morphing from the disc at (cx,cy) to an alternating strip starting at (x0, baseY). */
function Sectors({n, r, cx, cy, x0, baseY, t, colors = [C.ones, C.tens], stroke = '#15141d'}: {n: number; r: number; cx: number; cy: number; x0: number; baseY: number; t: number; colors?: string[]; stroke?: string}) {
  const half = 180 / n; const chord = 2 * r * Math.sin(rad(half)); const h = r * Math.cos(rad(half));
  const pts = range(9).map(k => { const a = rad(-90 - half + (2 * half * k) / 8); return [r * Math.cos(a), r * Math.sin(a)]; });
  const d = `M0 0 ${pts.map(([x, y]) => `L${x} ${y}`).join(' ')} Z`;
  return <g>{range(n).map(i => {
    const ti = eseg(t, (i / n) * .5, (i / n) * .5 + .5); const odd = i % 2 === 1; const k = Math.floor(i / 2);
    const fromRot = (i * 360) / n; let toRot = odd ? 180 : 0; while (toRot - fromRot > 180) toRot -= 360; while (fromRot - toRot > 180) toRot += 360;
    const tx = odd ? x0 + chord / 2 + k * chord + chord / 2 : x0 + k * chord + chord / 2, ty = odd ? baseY - h : baseY;
    return <path key={i} d={d} transform={`translate(${lerp(cx, tx, ti)} ${lerp(cy, ty, ti)}) rotate(${lerp(fromRot, toRot, ti)})`} fill={colors[i % 2]} stroke={stroke} strokeWidth={.6}/>;
  })}</g>;
}
function Cake({cx, cy, r, label, grid = 0, color = '#f2c9a1'}: {cx: number; cy: number; r: number; label?: string; grid?: number; color?: string}) {
  const id = `clip-${Math.round(cx)}-${Math.round(r)}`;
  return <g><defs><clipPath id={id}><circle cx={cx} cy={cy} r={r}/></clipPath></defs><ellipse cx={cx} cy={cy + 10} rx={r} ry={r * .25} fill="#00000044"/><circle cx={cx} cy={cy} r={r} fill={color} stroke="#b07a52" strokeWidth={3}/>
    <circle cx={cx} cy={cy} r={r * .85} fill="none" stroke="#fff" strokeOpacity={.35} strokeDasharray="3 6"/>
    {grid > 0 && <g clipPath={`url(#${id})`}>{range(Math.ceil((2 * r) / grid) + 1).map(i => <g key={i}><line x1={cx - r + i * grid} x2={cx - r + i * grid} y1={cy - r} y2={cy + r} stroke="#15141d" strokeOpacity={.55}/><line x1={cx - r} x2={cx + r} y1={cy - r + i * grid} y2={cy - r + i * grid} stroke="#15141d" strokeOpacity={.55}/></g>)}</g>}
    {label && <T x={cx} y={cy + r + 26} size={16} color={C.muted}>{label}</T>}</g>;
}

function Scene({c, scene, p}: {c: CircleConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'circumference': { const R = 60; const d = 2 * R; const C0 = 120; const roll = scene === 2 ? eseg(p, .05, .95) : scene > 2 ? 1 : 0; const dist = roll * PI * d; const groundY = 300;
      return <g><line x1={60} x2={760} y1={groundY} y2={groundY} stroke={C.muted}/>
        <g transform={`translate(${C0 + dist} ${groundY - R}) rotate(${(dist / R) * 180 / Math.PI})`}><circle r={R} fill="#2b2533" stroke={C.ones} strokeWidth={4}/><line x1={-R} x2={R} y1={0} y2={0} stroke={C.tens} strokeWidth={2}/><circle cx={0} cy={R} r={5} fill={C.unknown}/></g>
        <line x1={C0} x2={C0 + dist} y1={groundY + 4} y2={groundY + 4} stroke={C.ones} strokeWidth={6}/>
        {scene >= 3 && range(scene === 3 ? Math.min(4, Math.floor(p * 4.5)) : 4).map(i => <g key={i}><rect x={C0 + i * d} y={groundY + 18} width={Math.min(d, PI * d - i * d)} height={12} fill={C.tens} opacity={.7}/><T x={C0 + i * d + Math.min(d, PI * d - i * d) / 2} y={groundY + 46} size={14} color={C.tens}>{i < 3 ? `d ${i + 1}` : '0.14 d'}</T></g>)}
        <T x={W / 2} y={50} size={24} weight={600}>{scene >= 4 ? 'C = π × d ≈ 3.14 × d' : scene >= 2 ? `edge unrolled: ${fmt(roll * PI, 2)} × d` : 'How long is the edge?'}</T></g>; }
    case 'area': { const R = 110; const n = scene < 2 ? 8 : scene === 2 ? 8 : scene === 3 ? (p < .33 ? 8 : p < .66 ? 16 : 32) : 32; const t = scene === 3 ? eseg((p * 3) % 1, 0, .8) : scene > 3 ? 1 : 0;
      const len = PI * R; return <g><Sectors n={n} r={R} cx={W / 2} cy={230} x0={W / 2 - len / 2} baseY={360} t={scene === 3 && p >= .99 ? 1 : t}/>
        {scene >= 4 && <><line x1={W / 2 - len / 2} x2={W / 2 + len / 2} y1={385} y2={385} stroke={C.ones} strokeWidth={2}/><T x={W / 2} y={405} size={16} color={C.ones}>πr (half the circumference)</T><T x={W / 2 + len / 2 + 30} y={300} size={16} color={C.tens}>r</T></>}
        <T x={W / 2} y={40} size={24} weight={600}>{scene >= 5 ? `S = πr × r = πr² = ${fmt(circleArea(c.r))}` : `${n} sectors`}</T></g>; }
    case 'cake': { const k = c.d2 / c.d1; const R2 = 105, R1 = R2 / k; const cx1 = 200, cx2 = 540, cy = 200; const pxPerCm = R2 / (c.d2 / 2);
      if (scene <= 3) return <g><Cake cx={cx1} cy={cy} r={R1} grid={scene === 3 ? pxPerCm * 3 : 0} label={scene >= 2 ? `${c.d1} cm` : undefined}/><Cake cx={cx2} cy={cy} r={R2} grid={scene === 3 ? pxPerCm * 3 : 0} label={scene >= 2 ? `${c.d2} cm` : undefined}/>
        {scene >= 2 && <><line x1={cx1 - R1} x2={cx1 + R1} y1={cy} y2={cy} stroke={C.unknown} strokeWidth={2}/><line x1={cx2 - R2} x2={cx2 + R2} y1={cy} y2={cy} stroke={C.unknown} strokeWidth={2}/></>}
        {scene === 3 && <><T x={cx1} y={360} size={15} color={C.ones}>≈ {fmt(Math.round(circleArea(c.d1 / 2)))} cm²</T><T x={cx2} y={360} size={15} color={C.ones}>≈ {fmt(Math.round(circleArea(c.d2 / 2)))} cm²</T><T x={W / 2} y={400} size={13} color={C.muted}>grid squares are 3 cm × 3 cm</T></>}
        <T x={W / 2} y={40} size={24} weight={600}>{scene === 1 ? 'Which cake has more?' : scene >= 2 ? `${fmt(k)} times as wide…` : 'Two cakes'}</T></g>;
      const t = scene === 4 ? p : 1; const L1 = PI * R1, L2 = PI * R2; const base1 = 380, x01 = 70, x02 = 330;
      return <g><Sectors n={24} r={R1} cx={cx1} cy={cy} x0={x01} baseY={base1} t={t} colors={['#f2c9a1', '#e3b48a']} stroke="#b07a52"/><Sectors n={24} r={R2} cx={cx2} cy={cy} x0={x02} baseY={base1} t={t} colors={['#f2c9a1', '#e3b48a']} stroke="#b07a52"/>
        {scene >= 5 && Number.isInteger(k) && <g>{range(k + 1).map(i => <line key={'v' + i} x1={x02 + (L2 / k) * i} x2={x02 + (L2 / k) * i} y1={base1 - R2} y2={base1} stroke={C.unknown} strokeWidth={2} strokeDasharray="5 4" opacity={eseg(scene === 5 ? p : 1, 0, .5)}/>)}
          {range(k + 1).map(i => <line key={'h' + i} x1={x02} x2={x02 + L2} y1={base1 - (R2 / k) * i} y2={base1 - (R2 / k) * i} stroke={C.unknown} strokeWidth={2} strokeDasharray="5 4" opacity={eseg(scene === 5 ? p : 1, .3, .8)}/>)}</g>}
        {scene >= 5 && <rect x={x01} y={base1 - R1} width={L1} height={R1} fill="none" stroke={C.unknown} strokeWidth={2}/>}
        <T x={x01 + L1 / 2} y={base1 + 22} size={14} color={C.muted}>πr × r</T><T x={x02 + L2 / 2} y={base1 + 22} size={14} color={C.muted}>{fmt(k)}× longer, {fmt(k)}× taller</T>
        <T x={W / 2} y={40} size={24} weight={600}>{scene >= 5 ? `${fmt(k)} × ${fmt(k)} = ${fmt(k * k)} small cakes fit in the big one` : 'Rearrange both cakes'}</T>
        {scene >= 6 && <T x={W / 2} y={75} size={20} color={C.accent}>S₂ ÷ S₁ = (d₂ ÷ d₁)² = ({c.d2} ÷ {c.d1})² = {fmt(k * k)}</T>}</g>; }
    case 'annulus': { const s = 22; const big = scene >= 2 ? 1 : 0, hole = scene >= 3 ? (scene === 3 ? eseg(p, .2, .8) : 1) : 0;
      return <g><circle cx={W / 2} cy={230} r={c.R * s} fill={C.tens} opacity={.25 + big * .35} stroke={C.tens} strokeWidth={2}/><circle cx={W / 2} cy={230} r={c.r * s} fill="#15141d" opacity={hole} stroke={C.ones} strokeWidth={2}/>
        <line x1={W / 2} x2={W / 2 + c.R * s} y1={230} y2={230} stroke={C.tens}/><T x={W / 2 + c.R * s / 2} y={218} size={14} color={C.tens}>R = {c.R}</T><line x1={W / 2} x2={W / 2} y1={230} y2={230 - c.r * s} stroke={C.ones}/><T x={W / 2 - 24} y={230 - c.r * s / 2} size={14} color={C.ones}>r = {c.r}</T>
        <T x={W / 2} y={40} size={22} weight={600}>{scene >= 4 ? `π(R² − r²) = 3.14 × (${c.R * c.R} − ${c.r * c.r}) = ${fmt(circleArea(c.R) - circleArea(c.r))}` : scene >= 2 ? `big disc ${fmt(circleArea(c.R))}${hole ? ` − hole ${fmt(circleArea(c.r))}` : ''}` : 'Area of the ring?'}</T></g>; }
    default: { const R = c.r * 35; const spin = scene === 2 ? p * 360 : 0;
      return <g><Cake cx={W / 2} cy={230} r={R} color="#3a3150"/><circle cx={W / 2} cy={230} r={5} fill="#fff"/>
        {scene >= 2 && range(scene === 2 ? Math.ceil(p * 12) : 12).map(i => <line key={i} x1={W / 2} y1={230} x2={W / 2 + R * Math.cos(rad(i * 30))} y2={230 + R * Math.sin(rad(i * 30))} stroke={C.ones} strokeOpacity={.6}/>)}
        {scene === 2 && <line x1={W / 2} y1={230} x2={W / 2 + R * Math.cos(rad(spin))} y2={230 + R * Math.sin(rad(spin))} stroke={C.ones} strokeWidth={4}/>}
        {scene >= 3 && <line x1={W / 2 - R} x2={W / 2 + R} y1={230} y2={230} stroke={C.tens} strokeWidth={4}/>}
        {scene >= 4 && range(6).map(i => <line key={'s' + i} x1={W / 2 - (R + 20) * Math.cos(rad(i * 30))} y1={230 - (R + 20) * Math.sin(rad(i * 30))} x2={W / 2 + (R + 20) * Math.cos(rad(i * 30))} y2={230 + (R + 20) * Math.sin(rad(i * 30))} stroke={C.unknown} strokeDasharray="4 5" opacity={.6}/>)}
        <T x={W / 2} y={40} size={24} weight={600}>{scene >= 4 ? `d = 2r = ${2 * c.r}` : scene >= 2 ? `every radius = ${c.r}` : 'What makes it round?'}</T></g>; }
  }
}

function Explore({c}: {c: CircleConfig}) {
  const [r, setR] = useState(c.r); const [n, setN] = useState(8); const [d1, setD1] = useState(c.d1), [d2, setD2] = useState(c.d2); const [R, setRR] = useState(c.R); const [ang, setAng] = useState(40); const [roll, setRoll] = useState(0);
  if (c.mode === 'area') { const px = 110; return <Stage label={`${n} sectors rearranged`} controls={<><Slider label="Number of sectors" value={n} min={4} max={64} step={2} onChange={setN}/><Readout>With {n} sectors the shape is close to a {fmt(PI * c.r, 2)} × {c.r} rectangle: area ≈ {fmt(circleArea(c.r))}</Readout></>}>
    <Sectors n={n} r={px} cx={W / 2} cy={230} x0={W / 2 - (PI * px) / 2} baseY={330} t={1}/><rect x={W / 2 - (PI * px) / 2} y={330 - px} width={PI * px} height={px} fill="none" stroke={C.unknown} strokeDasharray="4 4"/></Stage>; }
  if (c.mode === 'cake') { const k = d2 / d1; return <Stage label={`Cakes ${d1} and ${d2} cm`} controls={<><Slider label="Small cake (cm)" value={d1} min={6} max={30} onChange={v => setD1(Math.min(v, d2 - 1))}/><Slider label="Big cake (cm)" value={d2} min={8} max={40} onChange={v => setD2(Math.max(v, d1 + 1))}/><Readout>{fmt(k, 2)} times as wide → {fmt(k * k, 2)} times as much cake ({fmt(circleArea(d1 / 2), 1)} vs {fmt(circleArea(d2 / 2), 1)} cm²)</Readout></>}>
    <Cake cx={220} cy={220} r={(105 * d1) / 40} label={`${d1} cm`}/><Cake cx={540} cy={220} r={(105 * d2) / 40} label={`${d2} cm`}/></Stage>; }
  if (c.mode === 'circumference') return <Stage label={`Diameter ${2 * r}`} controls={<><Slider label="Radius" value={r} min={1} max={5} step={.5} onChange={setR}/><Action onClick={() => setRoll(roll ? 0 : 1)}>{roll ? 'Roll back' : 'Roll one turn'}</Action><Readout>C = 3.14 × {fmt(2 * r)} = {fmt(PI * 2 * r)} · C ÷ d = 3.14 for every size</Readout></>}>
    <line x1={40} x2={780} y1={330} y2={330} stroke={C.muted}/><g style={{transition: 'transform 1.6s ease', transform: `translate(${80 + r * 14 + roll * PI * 2 * r * 14}px, ${330 - r * 14}px) rotate(${roll * 360}deg)`}}><circle r={r * 14} fill="#2b2533" stroke={C.ones} strokeWidth={4}/><line x1={-r * 14} x2={r * 14} stroke={C.tens} strokeWidth={2}/></g>
    <line x1={80 + r * 14} x2={80 + r * 14 + roll * PI * 2 * r * 14} y1={334} y2={334} stroke={C.ones} strokeWidth={6} style={{transition: 'all 1.6s ease'}}/></Stage>;
  if (c.mode === 'annulus') return <Stage label="Ring and sector" controls={<><Slider label="R" value={R} min={2} max={8} onChange={v => setRR(Math.max(v, r + 1))}/><Slider label="r" value={r} min={0} max={R - 1} onChange={setR}/><Slider label="Sector angle" value={ang} min={10} max={360} step={10} onChange={setAng}/>
    <Readout>ring {fmt(circleArea(R) - circleArea(r))} · {ang}° sector of the ring = {ang}/360 → {fmt((circleArea(R) - circleArea(r)) * ang / 360, 2)}</Readout></>}>
    <circle cx={W / 2} cy={230} r={R * 22} fill={C.tens} opacity={.25}/><path d={`M${W / 2} 230 L${W / 2 + R * 22} 230 A${R * 22} ${R * 22} 0 ${ang > 180 ? 1 : 0} 0 ${W / 2 + R * 22 * Math.cos(rad(ang))} ${230 - R * 22 * Math.sin(rad(ang))} Z`} fill={C.tens} opacity={.6}/><circle cx={W / 2} cy={230} r={r * 22} fill="#15141d" stroke={C.ones}/></Stage>;
  const P = [W / 2 + r * 35 * Math.cos(rad(ang)), 230 - r * 35 * Math.sin(rad(ang))];
  return <Stage label={`Radius ${r}`} controls={<><Slider label="Radius" value={r} min={1} max={5} step={.5} onChange={setR}/><Readout>radius {r} · diameter {2 * r} · every edge point is {r} from the centre</Readout></>}>
    <Cake cx={W / 2} cy={230} r={r * 35} color="#3a3150"/><circle cx={W / 2} cy={230} r={5} fill="#fff"/><line x1={W / 2} y1={230} x2={P[0]} y2={P[1]} stroke={C.ones} strokeWidth={4}/><line x1={2 * W / 2 - P[0]} y1={460 - P[1]} x2={P[0]} y2={P[1]} stroke={C.tens} strokeWidth={2} strokeDasharray="5 4"/>
    <Handle x={P[0]} y={P[1]} label="Move along the edge" onMove={(x, y) => setAng(Math.atan2(230 - y, x - W / 2) * 180 / Math.PI)}/></Stage>;
}

export const circleView: EngineView<CircleConfig> = {Scene: props => <Stage label={circle.describe(props.c)}><Scene {...props}/></Stage>, Explore};


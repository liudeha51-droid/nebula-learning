'use client';
/**
 * Abstract-algebra journeys, after the video “抽象代数 · 结构之美”: a snowflake’s symmetry group,
 * clock arithmetic and the circle of fifths, wallpaper groups, and the dance of a quintic’s roots.
 * Glowing lines on the night-sky stage; every frame is a pure function of (scene, progress).
 */
import {useEffect, useMemo, useRef, useState} from 'react';
import {useClock} from '../use-clock';
import {Stage, T, C, W, Readout, Slider, Segmented, Action, Handle} from '../stage';
import {
  D6_ELEMENTS, d6Compose, d6Index, d6Name, gcd, hopsToReturn, NOTES, WALLPAPER, quinticRoots, BRANCH_POINTS, loopAround, trackRoots, rootPermutation,
  type D6, type Cx, type JourneyConfig,
} from '@/lib/universe/engines/journey';
import {clamp, ease, eseg, fmt, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';

const hue = (h: number, l = 68, a = 1) => `hsla(${((h % 360) + 360) % 360}, 90%, ${l}%, ${a})`;
/** A soft neon glow, as in the video. */
export function Glow({id = 'u-glow', sd = 3}: {id?: string; sd?: number}) {
  return <defs><filter id={id} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={sd} result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>;
}
const Stars = () => <g opacity={.5}>{range(60).map(i => <circle key={i} cx={(i * 137.5 * 7.1) % W} cy={(i * 97.3 * 3.7) % 450} r={(i % 3) * .5 + .4} fill="#fff" opacity={.25 + (i % 5) * .1}/>)}</g>;

/* ===================== 1. A snowflake’s symmetries ===================== */
function Snowflake({cx = 400, cy = 225, R = 120, angle = 0, fx = 1, marker = true, glow = true}: {cx?: number; cy?: number; R?: number; angle?: number; fx?: number; marker?: boolean; glow?: boolean}) {
  const arm = (k: number) => { const a = (k * Math.PI) / 3; const pt = (r: number, off = 0): string => { const x = r * Math.sin(a + off), y = -r * Math.cos(a + off); return `${x.toFixed(1)} ${y.toFixed(1)}`; };
    const side = (r: number, len: number) => { const bx = r * Math.sin(a), by = -r * Math.cos(a); return [-1, 1].map(sg => `M${bx.toFixed(1)} ${by.toFixed(1)}L${(bx + len * Math.sin(a + sg * .7)).toFixed(1)} ${(by - len * Math.cos(a + sg * .7)).toFixed(1)}`).join(''); };
    return `M0 0L${pt(R)}${side(R * .35, R * .28)}${side(R * .6, R * .24)}${side(R * .82, R * .14)}`; };
  return <g transform={`translate(${cx} ${cy}) scale(${fx} 1) rotate(${angle})`} filter={glow ? 'url(#u-glow)' : undefined}>
    {range(6).map(k => <path key={k} d={arm(k)} stroke="#eaf6ff" strokeWidth={R / 30} strokeLinecap="round" fill="none"/>)}
    <polygon points={range(6).map(k => `${(R * .18 * Math.sin((k * Math.PI) / 3)).toFixed(1)},${(-R * .18 * Math.cos((k * Math.PI) / 3)).toFixed(1)}`).join(' ')} fill="none" stroke="#bfe6ff" strokeWidth={R / 45}/>
    {marker && <><circle cx={R * .07} cy={-R * 1.05} r={R / 14} fill={C.unknown}/><circle cx={R * .2} cy={-R * .92} r={R / 22} fill={C.ones}/></>}
  </g>;
}
function CayleyTable({x0, y0, cell, rows = 12, hi}: {x0: number; y0: number; cell: number; rows?: number; hi?: [number, number]}) {
  return <g>{D6_ELEMENTS.map((a, i) => <T key={'r' + i} x={x0 - 4} y={y0 + i * cell + cell * .7} size={cell * .45} anchor="end" color={C.muted}>{d6Name(a)}</T>)}
    {D6_ELEMENTS.map((b, j) => <T key={'c' + j} x={x0 + j * cell + cell / 2} y={y0 - 5} size={cell * .45} color={C.muted}>{d6Name(b)}</T>)}
    {D6_ELEMENTS.slice(0, rows).map((a, i) => D6_ELEMENTS.map((b, j) => { const v = d6Index(d6Compose(a, b)); const on = hi && hi[0] === i && hi[1] === j;
      return <rect key={i + '-' + j} x={x0 + j * cell + 1} y={y0 + i * cell + 1} width={cell - 2} height={cell - 2} rx={2} fill={hue(v * 30, 62)} opacity={on ? 1 : .85} stroke={on ? '#fff' : 'none'} strokeWidth={2}/>; }))}</g>;
}
function TokenRing({n, cx = 400, cy = 225, R = 150}: {n: number; cx?: number; cy?: number; R?: number}) {
  return <g>{D6_ELEMENTS.slice(0, n).map((el, i) => { const a = (i / 12) * 2 * Math.PI - Math.PI / 2; const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    return <g key={i} filter="url(#u-glow)"><polygon points={range(6).map(k => `${(x + 17 * Math.cos((k * Math.PI) / 3)).toFixed(1)},${(y + 17 * Math.sin((k * Math.PI) / 3)).toFixed(1)}`).join(' ')} fill={hue(i * 30, 82)} opacity={.9}/><T x={x} y={y + 5} size={13} color="#15141d" weight={700}>{d6Name(el)}</T></g>; })}</g>;
}
export function SymmetryScene({scene, p}: {scene: number; p: number}) {
  switch (scene) {
    case 0: return <g><Glow/><Stars/><Snowflake angle={60 * eseg(p, .35, .85)}/><T x={W / 2} y={420} size={16} color="#cfe8ff">Turn it by 60°: the same snowflake · 旋转 60°，雪花还是那片雪花</T></g>;
    case 1: return <g><Glow/><Stars/><Snowflake/>{range(12).map(i => { const a = (i / 12) * 2 * Math.PI; return <T key={i} x={400 + 175 * Math.cos(a)} y={230 + 175 * Math.sin(a)} size={18} color={C.faint}>?</T>; })}</g>;
    case 2: { const f = p * 6, k = Math.min(5, Math.floor(f)); const ang = 60 * (k + eseg(f - k, .45, .95)); return <g><Glow/><Stars/><Snowflake angle={ang}/><TokenRing n={Math.min(6, k + 1)} R={175}/><T x={W / 2} y={30} size={18} color="#cfe8ff">rotations: {d6Name([Math.min(5, Math.round(ang / 60)) % 6, false])}</T></g>; }
    case 3: { const f = p * 2, flipT = eseg(f % 1, .3, .8); const fx = Math.cos(Math.PI * (Math.floor(f) + flipT)); return <g><Glow/><Stars/>{range(6).map(k => { const a = (k * Math.PI) / 6; return <line key={k} x1={400 - 150 * Math.sin(a)} y1={225 + 150 * Math.cos(a)} x2={400 + 150 * Math.sin(a)} y2={225 - 150 * Math.cos(a)} stroke={C.hundreds} strokeDasharray="5 6" opacity={.5}/>; })}<Snowflake fx={fx}/><T x={W / 2} y={420} size={16} color="#cfe8ff">Flip across a mirror line: still unchanged · 沿轴翻折，依然不变</T></g>; }
    case 4: return <g><Glow/><Stars/><Snowflake R={70} angle={60 * p}/><TokenRing n={Math.ceil(12 * eseg(p, 0, .8))} R={160}/><T x={W / 2} y={30} size={18} color="#cfe8ff">12 moves: 6 turns + 6 flips</T></g>;
    case 5: { const rows = Math.ceil(12 * eseg(p, 0, .9)); return <g><Glow/><Stars/><Snowflake cx={150} R={80}/><CayleyTable x0={330} y0={50} cell={30} rows={rows}/><T x={150} y={340} size={15} color="#cfe8ff">do one move, then another:</T><T x={150} y={364} size={15} color="#cfe8ff">always one of the 12</T><T x={150} y={392} size={15} color={C.ones}>这样的结构，叫做「群」</T></g>; }
    default: { const ang = 360 * p, fx = Math.cos(Math.PI * eseg(p, .46, .54)); return <g><Glow/><Stars/><Snowflake angle={ang} fx={fx}/></g>; }
  }
}
export function SymmetryExplore() {
  const [angle, setAngle] = useState(0), [fx, setFx] = useState(1), [moves, setMoves] = useState<string[]>([]);
  const k = ((Math.round((fx * angle) / 60) % 6) + 6) % 6, el: D6 = [k, fx < 0];
  return <Stage label="Turn and flip the snowflake" controls={<><Action primary onClick={() => { setAngle(angle + 60 * fx); setMoves([...moves, 'r']); }}>Turn 60°</Action><Action onClick={() => { setFx(-fx); setMoves([...moves, 's']); }}>Flip</Action><Action onClick={() => { setAngle(0); setFx(1); setMoves([]); }}>Reset</Action>
    <Readout>moves so far: {moves.length ? moves.slice(-10).join(' ') : '—'} · same as the single move <strong>{d6Name(el)}</strong> {d6Index(el) === 0 && moves.length ? '(back to the start!)' : ''}</Readout></>}>
    <Glow/><Stars/>
    <g style={{transform: `translate(220px, 225px) scaleX(${fx}) rotate(${angle}deg)`, transition: 'transform .6s cubic-bezier(.4,1.4,.5,1)'}}><Snowflake cx={0} cy={0} R={120}/></g>
    <CayleyTable x0={460} y0={60} cell={26} hi={[d6Index(el), 0]}/><rect x={459} y={59 + d6Index(el) * 26} width={26 * 12 + 2} height={28} fill="none" stroke="#fff" strokeWidth={2} rx={3}/>
    <T x={616} y={400} size={13} color="#cfe8ff">Your current move is highlighted in the group table.</T></Stage>;
}

/* ===================== 2. Clock arithmetic and the circle of fifths ===================== */
function Ring({n, cx = 400, cy = 225, R = 160, labels, hl = []}: {n: number; cx?: number; cy?: number; R?: number; labels?: string[]; hl?: number[]}) {
  return <g><circle cx={cx} cy={cy} r={R + 22} fill="none" stroke={hue(285, 70, .6)} strokeWidth={3} filter="url(#u-glow)"/>
    {range(n).map(i => { const a = (i / n) * 2 * Math.PI - Math.PI / 2; const on = hl.includes(i); return <g key={i}><circle cx={cx + R * Math.cos(a)} cy={cy + R * Math.sin(a)} r={on ? 7 : 4} fill={on ? hue(i * 30) : '#cfc6e8'} filter={on ? 'url(#u-glow)' : undefined}/>
      <T x={cx + (R + 40) * Math.cos(a)} y={cy + (R + 40) * Math.sin(a) + 5} size={15} color="#e9e2ff">{labels ? labels[i] : String(i === 0 ? n : i)}</T></g>; })}</g>;
}
function StarPath({n, k, hops, cx = 400, cy = 225, R = 160, glow = true}: {n: number; k: number; hops: number; cx?: number; cy?: number; R?: number; glow?: boolean}) {
  const P = (i: number): [number, number] => { const a = (((i * k) % n) / n) * 2 * Math.PI - Math.PI / 2; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; };
  const whole = Math.floor(hops), frac = hops - whole;
  return <g filter={glow ? 'url(#u-glow)' : undefined}>{range(Math.min(whole + 1, Math.ceil(hops))).map(i => { const a = P(i), b = P(i + 1), t = i < whole ? 1 : frac; return <line key={i} x1={a[0]} y1={a[1]} x2={lerp(a[0], b[0], t)} y2={lerp(a[1], b[1], t)} stroke={hue(i * 31 + 180)} strokeWidth={2.5} strokeLinecap="round"/>; })}</g>;
}
export function ClockScene({c, scene, p}: {c: JourneyConfig; scene: number; p: number}) {
  const n = c.n, k = c.m;
  switch (scene) {
    case 0: case 1: { const t = scene === 0 ? eseg(p, .25, .9) : 1; const hr = 9 + 5 * t, a = (hr / 12) * 2 * Math.PI - Math.PI / 2;
      return <g><Glow/><Stars/><Ring n={12} cx={330} hl={[9, 2]}/><path d={`M${330 + 120 * Math.cos(-Math.PI / 2 + (9 / 12) * 2 * Math.PI)} ${225 + 120 * Math.sin(-Math.PI / 2 + (9 / 12) * 2 * Math.PI)} A120 120 0 0 1 ${330 + 120 * Math.cos(a)} ${225 + 120 * Math.sin(a)}`} fill="none" stroke={C.ones} strokeWidth={4} filter="url(#u-glow)"/>
        <line x1={330} y1={225} x2={330 + 105 * Math.cos(a)} y2={225 + 105 * Math.sin(a)} stroke="#fff" strokeWidth={4} strokeLinecap="round"/><circle cx={330} cy={225} r={6} fill="#fff"/>
        <T x={640} y={210} size={30} weight={600} color="#fff">9 + 5 ≡ 2</T><T x={640} y={245} size={16} color={C.muted}>(mod 12)</T>{scene === 1 && <T x={640} y={300} size={22} color={hue(285, 75)}>ℤ / 12ℤ</T>}</g>; }
    case 2: return <g><Glow/><Stars/><Ring n={12} labels={NOTES} hl={range(Math.floor(12 * p) + 1).map(i => (i * 7) % 12)}/><StarPath n={12} k={7} hops={12 * eseg(p, 0, .95)}/><T x={680} y={210} size={18} color="#fff">n ↦ n + 7 (mod 12)</T><T x={680} y={238} size={14} color={C.muted}>circle of fifths · 五度圈</T></g>;
    case 3: { const kk = 1 + Math.min(10, Math.floor(p * 11)); return <g><Glow/><Stars/><Ring n={12}/><StarPath n={12} k={kk} hops={hopsToReturn(12, kk)}/><T x={680} y={200} size={22} color="#fff">step {kk}</T><T x={680} y={232} size={15} color={C.muted}>{hopsToReturn(12, kk)} hops home</T></g>; }
    case 4: return <g><Glow/><Stars/>{range(11).map(i => { const kk = i + 1, x = 80 + (i % 6) * 128, y = 120 + Math.floor(i / 6) * 200, full = gcd(12, kk) === 1;
      return <g key={kk} opacity={clamp(p * 12 - i, .15, 1)}><StarPath n={12} k={kk} hops={hopsToReturn(12, kk)} cx={x} cy={y} R={48} glow={full}/><T x={x} y={y + 76} size={13} color={full ? C.good : C.muted}>step {kk}: {hopsToReturn(12, kk)} hops</T></g>; })}</g>;
    case 5: return <g><Glow/><Stars/><Ring n={n}/><StarPath n={n} k={5} hops={hopsToReturn(n, 5)}/><T x={680} y={190} size={17} color="#fff">a + b (mod {n})</T><T x={680} y={220} size={14} color={C.muted}>visits every point</T><T x={680} y={242} size={14} color={C.muted}>⇔ gcd({n}, k) = 1</T></g>;
    default: { const kk = 1 + Math.floor(p * 11) % 11; return <g><Glow/><Stars/><g transform={`rotate(${30 * p} 400 225)`}><Ring n={12}/><StarPath n={12} k={kk} hops={hopsToReturn(12, kk) * eseg((p * 11) % 1, 0, .8)}/></g><T x={W / 2} y={30} size={16} color="#fff">step {kk} · {k === 7 ? 'music lives in ℤ/12' : ''}</T></g>; }
  }
}
let AUDIO: AudioContext | null = null;
function beep(semitone: number) {
  try { AUDIO ??= new AudioContext(); const o = AUDIO.createOscillator(), g = AUDIO.createGain(); o.type = 'triangle'; o.frequency.value = 261.63 * 2 ** (semitone / 12); g.gain.setValueAtTime(.12, AUDIO.currentTime); g.gain.exponentialRampToValueAtTime(.0001, AUDIO.currentTime + .45); o.connect(g).connect(AUDIO.destination); o.start(); o.stop(AUDIO.currentTime + .5); } catch { /* audio unavailable */ }
}
export function ClockExplore({c}: {c: JourneyConfig}) {
  const clock = useClock(); const [n, setN] = useState(c.n), [k, setK] = useState(c.m), [sound, setSound] = useState(false);
  const kk = Math.min(k, n - 1), total = hopsToReturn(n, kk); const hops = (clock.t * 1.5) % (total + 2); const shown = Math.min(total, hops); const at = (Math.floor(shown) * kk) % n;
  const last = useRef(-1); useEffect(() => { if (sound && n === 12 && Math.floor(shown) !== last.current) beep(at); last.current = Math.floor(shown); }, [shown, sound, n, at]);
  return <Stage label="Hop around the circle" controls={<><Slider label="Points n" value={n} min={3} max={24} onChange={v => { setN(v); clock.setT(0); }}/><Slider label="Step k" value={kk} min={1} max={n - 1} onChange={v => { setK(v); clock.setT(0); }}/><Action primary onClick={clock.toggle}>{clock.playing ? 'Pause' : 'Play'}</Action>{n === 12 && <Action onClick={() => setSound(!sound)}>{sound ? 'Sound on' : 'Sound off'}</Action>}
    <Readout>step {kk} on {n} points: back home after {n} ÷ gcd({n}, {kk}) = {total} hops · {gcd(n, kk) === 1 ? 'visits every point ✓' : `visits only ${total} of ${n} points`}</Readout></>}>
    <Glow/><Stars/><Ring n={n} labels={n === 12 ? NOTES : undefined} hl={[at]}/><StarPath n={n} k={kk} hops={shown}/></Stage>;
}

/* ===================== 3. Seventeen ways to repeat ===================== */
const MOTIF = 'M0 0C10 -18 34 -22 42 -4C31 -9 19 -3 15 9C11 3 5 3 0 0Z';
type WG = typeof WALLPAPER[number];
function Wallpaper({g, prev, s = 92, reveal = 99, opacityRot = 1, motifAngle = 0, drift = 0, gold = true}: {g: WG; prev?: WG; s?: number; reveal?: number; opacityRot?: number; motifAngle?: number; drift?: number; gold?: boolean}) {
  const a1: [number, number] = [s, 0], a2: [number, number] = g.hex ? [s / 2, (s * Math.sqrt(3)) / 2] : [0, s];
  const ops: {rot: number; mir: boolean; extra: boolean}[] = [];
  // A copy is “new” (fades in) unless the previous group already had it.
  const had = (rot: number, mir: boolean) => !!prev && rot % (360 / prev.order) === 0 && (!mir || prev.mirror);
  for (let j = 0; j < g.order; j++) { const rot = (360 / g.order) * j; ops.push({rot, mir: false, extra: j > 0 && !had(rot, false)}); if (g.mirror) ops.push({rot, mir: true, extra: !had(rot, true)}); }
  const cells: {x: number; y: number; d: number}[] = []; const span = 8;
  for (let i = -span; i <= span; i++) for (let j = -span; j <= span; j++) { const x = 400 + i * a1[0] + j * a2[0] + drift, y = 225 + i * a1[1] + j * a2[1]; if (x > -s && x < W + s && y > -s && y < 450 + s) cells.push({x, y, d: Math.hypot(x - 400, y - 225) / s}); }
  const sc = s / 92;
  return <g filter="url(#u-glow)">{cells.map((cl, ci) => { const vis = clamp(reveal - cl.d, 0, 1); if (vis <= 0) return null;
    return <g key={ci} transform={`translate(${cl.x.toFixed(1)} ${cl.y.toFixed(1)})`} opacity={vis}><circle r={2} fill="#fff6d0" opacity={.4}/>
      {ops.map((o, oi) => <path key={oi} d={MOTIF} transform={`rotate(${o.rot})${o.mir ? ' scale(1 -1)' : ''} translate(${(14 * sc).toFixed(1)} ${(-6 * sc).toFixed(1)}) rotate(${motifAngle}) scale(${sc.toFixed(3)})`} fill={gold ? (o.mir ? '#ffd27a' : '#f6c453') : hue(oi * 50)} opacity={o.extra ? opacityRot : 1} stroke="#fff3c4" strokeWidth={.8}/>)}</g>; })}</g>;
}
const byId = (id: string) => WALLPAPER.find(w => w.id === id)!;
export function WallpaperScene({scene, p}: {scene: number; p: number}) {
  switch (scene) {
    case 0: return <g><Glow/><Stars/><g transform={`translate(400 225) scale(${lerp(1, 3, ease(p))})`} filter="url(#u-glow)"><path d={MOTIF} fill="#f6c453" stroke="#fff3c4" strokeWidth={.6} transform="translate(-20 4)"/></g></g>;
    case 1: return <g><Glow/><Stars/><Wallpaper g={byId('p1')} reveal={.6}/><T x={W / 2} y={420} size={16} color="#ffe9b0">How many ways can a pattern repeat forever?</T></g>;
    case 2: return <g><Glow/><Stars/><Wallpaper g={byId('p1')} reveal={10 * eseg(p, 0, .95)}/><T x={60} y={40} size={22} color="#ffe9b0" anchor="start">p1</T></g>;
    case 3: { const seq = ['p1', 'p2', 'p4', 'p4m'] as const; const f = p * 4, i = Math.min(3, Math.floor(f)); return <g><Glow/><Stars/><Wallpaper g={byId(seq[i])} prev={i > 0 ? byId(seq[i - 1]) : undefined} opacityRot={eseg(f - i, .05, .6)}/><T x={60} y={40} size={22} color="#ffe9b0" anchor="start">{seq[i]}</T></g>; }
    case 4: { const fit = (sides: number, cx: number, label: string, gap: number) => { const ang = 180 - 360 / sides, cnt = Math.floor(360 / ang); const r = 70;
        return <g>{range(cnt).map(j => { const base = (j * ang * Math.PI) / 180; const pts = range(sides).map(q => { const th = base + (q * 2 * Math.PI) / sides - Math.PI / 2 + Math.PI / sides; return `${(cx + r * Math.cos(base) + r * Math.cos(th)).toFixed(1)},${(225 + r * Math.sin(base) + r * Math.sin(th)).toFixed(1)}`; }).join(' ');
          return <polygon key={j} points={pts} fill={hue(40 + j * 20, 60, .35)} stroke="#ffe9b0" strokeWidth={2} opacity={clamp(p * 4 - j * .6, 0, 1)}/>; })}
          {gap > 0 && <path d={`M${cx} 225 L${cx + 120 * Math.cos((cnt * ang * Math.PI) / 180)} ${225 + 120 * Math.sin((cnt * ang * Math.PI) / 180)} A120 120 0 0 1 ${cx + 120} 225 Z`} fill={C.bad} opacity={.45 * eseg(p, .6, .9)}/>}<T x={cx} y={410} size={15} color={gap ? C.bad : C.good}>{label}</T></g>; };
      return <g><Glow/><Stars/>{fit(6, 230, '6-fold: 3 × 120° = 360° fits', 0)}{fit(5, 570, '5-fold: 3 × 108° = 324° — a gap', 36)}</g>; }
    case 5: return <g><Glow/><Stars/><Wallpaper g={byId('p6m')} s={86}/><rect x={250} y={170} width={300} height={110} rx={14} fill="#15141dcc"/><T x={400} y={220} size={34} weight={700} color="#ffe9b0">17</T><T x={400} y={255} size={14} color="#fff">wallpaper groups · 230 space groups</T></g>;
    default: { const id = p < .5 ? 'p6m' : 'p4m'; return <g><Glow/><Stars/><Wallpaper g={byId(id)} drift={(p * 2 % 1) * 92} motifAngle={20 * Math.sin(p * 2 * Math.PI)}/><T x={60} y={40} size={22} color="#ffe9b0" anchor="start">{id}</T></g>; }
  }
}
export function WallpaperExplore() {
  const clock = useClock(); const [id, setId] = useState<WG['id']>('p4m'); const [ma, setMa] = useState(0); const g = byId(id);
  return <Stage label="Make a wallpaper" controls={<><Segmented label="Group" value={id} onChange={setId} options={WALLPAPER.map(w => [w.id, w.id] as [WG['id'], string])}/><Slider label="Turn the motif" value={ma} min={0} max={360} step={5} onChange={setMa}/><Action primary onClick={clock.toggle}>{clock.playing ? 'Pause' : 'Drift'}</Action>
    <Readout>{id}: {g.order > 1 ? `${g.order}-fold turns` : 'no turns'}{g.mirror ? ' + mirrors' : ''} on a {g.hex ? 'hexagonal' : 'square'} grid · {g.order * (g.mirror ? 2 : 1)} copies per cell</Readout></>}>
    <Glow/><Stars/><Wallpaper g={g} motifAngle={ma} drift={(clock.t * 14) % 92}/></Stage>;
}

/* ===================== 4. Roots that dance ===================== */
const RF = {X: (x: number) => 270 + x * 150, Y: (y: number) => 225 - y * 150};
const CF = {X: (x: number) => 650 + x * 85, Y: (y: number) => 225 - y * 85, inv: (sx: number, sy: number): Cx => [(sx - 650) / 85, (225 - sy) / 85]};
const ROOT_COL = [C.ones, C.tens, C.unknown, C.hundreds, C.accent];
let TRACKS: {path: Cx[]; roots: Cx[][]; perm: number[]}[] | null = null;
function tracks() { if (TRACKS) return TRACKS; const start = quinticRoots([1, 0]); return (TRACKS = BRANCH_POINTS.map((_, b) => { const path = loopAround(b, 360); const roots = trackRoots(path); return {path, roots, perm: rootPermutation(start, roots[roots.length - 1])}; })); }
const cycleText = (perm: number[]) => { const seen = new Set<number>(), out: string[] = []; perm.forEach((_, i) => { if (seen.has(i) || perm[i] === i) return; const cyc = []; let j = i; while (!seen.has(j)) { seen.add(j); cyc.push(j + 1); j = perm[j]; } out.push(`(${cyc.join(' ')})`); }); return out.join('') || 'no change'; };
function RootsView({roots, trailsFrom = [], c, path, upto = 0, showBranch = true}: {roots: Cx[]; trailsFrom?: Cx[][]; c: Cx; path?: Cx[]; upto?: number; showBranch?: boolean}) {
  return <g><line x1={RF.X(-1.6)} x2={RF.X(1.6)} y1={RF.Y(0)} y2={RF.Y(0)} stroke="#ffffff22"/><line x1={RF.X(0)} x2={RF.X(0)} y1={RF.Y(-1.35)} y2={RF.Y(1.35)} stroke="#ffffff22"/><T x={RF.X(1.5)} y={RF.Y(0) - 8} size={12} color={C.faint}>Re</T><T x={RF.X(0) + 14} y={RF.Y(1.3)} size={12} color={C.faint}>Im</T>
    {range(5).map(i => { const pts = trailsFrom.map(r => r[i]); return pts.length > 1 && <path key={'t' + i} d={pts.map((q, j) => `${j ? 'L' : 'M'}${RF.X(q[0]).toFixed(1)} ${RF.Y(q[1]).toFixed(1)}`).join('')} fill="none" stroke={ROOT_COL[i]} strokeWidth={2.5} opacity={.75} filter="url(#u-glow)"/>; })}
    {roots.map((r, i) => <g key={i} filter="url(#u-glow)"><circle cx={RF.X(r[0])} cy={RF.Y(r[1])} r={9} fill={ROOT_COL[i]}/><T x={RF.X(r[0]) + 14} y={RF.Y(r[1]) - 10} size={13} color={ROOT_COL[i]}>x{i + 1}</T></g>)}
    <rect x={540} y={95} width={235} height={260} rx={14} fill="#0f0d2acc" stroke="#ffffff22"/><T x={657} y={118} size={13} color={C.muted}>the constant c</T>
    {showBranch && BRANCH_POINTS.map((b, i) => <circle key={i} cx={CF.X(b[0])} cy={CF.Y(b[1])} r={6} fill={C.warn} filter="url(#u-glow)"/>)}
    {path && <path d={path.slice(0, Math.max(2, upto)).map((q, j) => `${j ? 'L' : 'M'}${CF.X(q[0]).toFixed(1)} ${CF.Y(q[1]).toFixed(1)}`).join('')} fill="none" stroke="#fff" strokeWidth={2} opacity={.8}/>}
    <circle cx={CF.X(1)} cy={CF.Y(0)} r={4} fill="#ffffff88"/><circle cx={CF.X(c[0])} cy={CF.Y(c[1])} r={8} fill="#fff" filter="url(#u-glow)"/><T x={657} y={342} size={12} color={C.muted}>orange: where two roots collide</T></g>;
}
export function QuinticScene({scene, p}: {scene: number; p: number}) {
  const tr = tracks(), start = tr[0].roots[0];
  const play = (b: number, q: number) => { const t = tr[b]; const i = Math.min(t.roots.length - 1, Math.floor(q * (t.roots.length - 1))); return {roots: t.roots[i], trail: t.roots.slice(0, i + 1), c: t.path[i], path: t.path, upto: i + 1, done: q >= .999, perm: t.perm}; };
  switch (scene) {
    case 0: return <g><Glow/><Stars/><g opacity={eseg(p, 0, .6)}><RootsView roots={start} c={[1, 0]}/></g><T x={270} y={40} size={22} color="#fff">x⁵ − x − 1 = 0</T></g>;
    case 1: return <g><Glow/><Stars/><RootsView roots={start} c={[1, 0]}/><T x={270} y={40} size={17} color="#fff">x = (−b ± √(b² − 4ac)) / 2a … and for degree 5?</T></g>;
    case 2: case 3: { const b = scene === 2 ? 0 : 1, s = play(b, eseg(p, .05, .92)); return <g><Glow/><Stars/><RootsView roots={s.roots} trailsFrom={s.trail} c={s.c} path={s.path} upto={s.upto}/><T x={270} y={40} size={20} color="#fff">x⁵ − x − c = 0</T>{s.done && <T x={270} y={425} size={18} color={C.good}>swapped: {cycleText(s.perm)}</T>}</g>; }
    case 4: return <g><Glow/><Stars/><RootsView roots={start} c={[1, 0]}/>
      <rect x={70} y={330} width={420} height={90} rx={12} fill="#0f0d2acc"/><T x={280} y={360} size={18} color="#fff">loops give {tr.map(t => cycleText(t.perm)).join(' ')}</T><T x={280} y={395} size={22} weight={700} color={C.ones}>together: all 5! = 120 · S₅</T></g>;
    case 5: return <g><Glow/><Stars/><RootsView roots={start} c={[1, 0]}/><g transform="translate(270 70) rotate(-8)" opacity={eseg(p, .3, .7)}><rect x={-120} y={-28} width={240} height={56} rx={6} fill="none" stroke={C.bad} strokeWidth={3}/><T x={0} y={8} size={22} weight={700} color={C.bad}>NO FORMULA · 不可解</T></g><T x={270} y={425} size={14} color={C.muted}>Ruffini 1799 · Abel 1824 · Galois 1832</T></g>;
    default: { const f = p * 4, b = Math.min(3, Math.floor(f)), s = play(b, f - b); return <g><Glow/><Stars/><RootsView roots={s.roots} trailsFrom={s.trail} c={s.c} path={s.path} upto={s.upto}/></g>; }
  }
}
/** Moves c in small steps so every root can be followed continuously. */
function follow(roots: Cx[], from: Cx, to: Cx): Cx[] { const steps = Math.max(1, Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1]) / .01)); let z = roots; for (let i = 1; i <= steps; i++) z = quinticRoots([lerp(from[0], to[0], i / steps), lerp(from[1], to[1], i / steps)], z, 8); return z; }
export function QuinticExplore() {
  const start = useMemo(() => quinticRoots([1, 0]), []);
  const [st, setSt] = useState<{c: Cx; roots: Cx[]; trail: Cx[][]}>(() => ({c: [1, 0], roots: start, trail: [start]}));
  const move = (sx: number, sy: number) => { const c = CF.inv(clamp(sx, 545, 770), clamp(sy, 100, 350)); setSt(s => { const roots = follow(s.roots, s.c, c); return {c, roots, trail: [...s.trail.slice(-600), roots]}; }); };
  const home = Math.hypot(st.c[0] - 1, st.c[1]) < .06; const perm = rootPermutation(start, st.roots);
  return <Stage label="Drag c and watch the roots" controls={<><Action onClick={() => setSt({c: [1, 0], roots: start, trail: [start]})}>Reset</Action><Action onClick={() => setSt(s => ({...s, trail: [s.roots]}))}>Clear trails</Action>
    <Readout>c = {fmt(st.c[0], 2)} {st.c[1] < 0 ? '−' : '+'} {fmt(Math.abs(st.c[1]), 2)}i · {home ? `back at c = 1: roots rearranged as ${cycleText(perm)}` : 'drag the white dot around an orange point and back to the grey start dot'}</Readout></>}>
    <Glow/><Stars/><RootsView roots={st.roots} trailsFrom={st.trail} c={st.c}/>{start.map((r, i) => <circle key={i} cx={RF.X(r[0])} cy={RF.Y(r[1])} r={14} fill="none" stroke={ROOT_COL[i]} strokeDasharray="3 3" opacity={.6}/>)}
    <Handle x={CF.X(st.c[0])} y={CF.Y(st.c[1])} label="constant c" color="#fff" onMove={move} keyStep={6}/></Stage>;
}


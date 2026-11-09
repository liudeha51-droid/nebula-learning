'use client';
import {useState} from 'react';
import {useClock} from '../use-clock';
import {Stage, T, C, W, Readout, Slider, Segmented, Action, Stepper} from '../stage';
import {journey, PHI, GOLDEN_DEG, fib, inscribed, circumscribed, type JourneyConfig} from '@/lib/universe/engines/journey';
import {clamp, ease, eseg, fmt, lerp, seg} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';
import {SymmetryScene, SymmetryExplore, ClockScene, ClockExplore, WallpaperScene, WallpaperExplore, QuinticScene, QuinticExplore} from './journey-algebra';

/** Scene time that keeps flowing across scene boundaries (6 units per scene). */
const flow = (scene: number, p: number) => (scene + p) * 6;
const hue = (h: number, l = 68, a = 1) => `hsla(${((h % 360) + 360) % 360}, 85%, ${l}%, ${a})`;

/* ---------- Times tables on a circle ---------- */
function TimesCircle({n, m, shown = n, cx = 400, cy = 228, R = 190, dots = true, numbers = false, hi}: {n: number; m: number; shown?: number; cx?: number; cy?: number; R?: number; dots?: boolean; numbers?: boolean; hi?: number[]}) {
  const P = (k: number): [number, number] => { const a = -Math.PI / 2 + (k / n) * 2 * Math.PI; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; };
  const full = Math.floor(shown), frac = shown - full;
  return <g><circle cx={cx} cy={cy} r={R} fill="none" stroke={C.line}/>
    {range(Math.min(n, Math.ceil(shown))).map(k => { const a = P(k), b = P(m * k); const t = k < full ? 1 : frac; return <line key={k} x1={a[0]} y1={a[1]} x2={lerp(a[0], b[0], t)} y2={lerp(a[1], b[1], t)} stroke={hue((k / n) * 300 + 20, 66, hi?.includes(k) ? 1 : .55)} strokeWidth={hi?.includes(k) ? 3 : R > 120 ? 1.2 : .8}/>; })}
    {dots && range(n).map(k => { const [x, y] = P(k); return <circle key={k} cx={x} cy={y} r={R > 120 ? 2.6 : 1.6} fill={C.ink} opacity={.8}/>; })}
    {numbers && range(n).filter(k => n <= 20 || k % 5 === 0).map(k => { const a = -Math.PI / 2 + (k / n) * 2 * Math.PI; return <T key={k} x={cx + (R + 18) * Math.cos(a)} y={cy + (R + 18) * Math.sin(a) + 4} size={11} color={C.muted}>{k}</T>; })}</g>;
}
function TimesScene({c, scene, p}: {c: JourneyConfig; scene: number; p: number}) {
  const n = c.n;
  switch (scene) {
    case 0: return <g><TimesCircle n={n} m={2} shown={0} numbers dots/><T x={W / 2} y={30} size={18}>{n} points round a circle</T></g>;
    case 1: return <g><TimesCircle n={n} m={2} shown={Math.min(4, 1 + p * 4)} numbers hi={[1, 2, 3]}/><T x={W / 2} y={30} size={18}>k → 2 × k: 1 → 2, 2 → 4, 3 → 6, …</T></g>;
    case 2: return <g><TimesCircle n={n} m={2} shown={1 + ease(p) * (n - 1)} numbers/><T x={W / 2} y={30} size={18}>{`${Math.floor(1 + ease(p) * (n - 1))} threads`}</T></g>;
    case 3: { const m = 2 + 2 * eseg(p, .15, .95); return <g><TimesCircle n={n} m={m}/><T x={W / 2} y={30} size={20} weight={600}>× {fmt(m, 2)}</T></g>; }
    case 4: return <g>{[2, 3, 4].map((m, i) => <g key={m} opacity={clamp(p * 3 - i + .3, 0, 1)}><TimesCircle n={n} m={m} cx={150 + i * 250} cy={215} R={105} dots={false}/><T x={150 + i * 250} y={360} size={16} color={C.ones}>× {m}</T><T x={150 + i * 250} y={384} size={14} color={C.muted}>{m - 1} {m - 1 === 1 ? 'petal' : 'petals'}</T></g>)}</g>;
    case 5: return <g><TimesCircle n={n} m={2} hi={[7, 40]} numbers/><T x={W / 2} y={30} size={17}>k → m·k mod {n}: 7 → 14, 40 → 80 − {n} = {80 % n}</T></g>;
    default: { const m = 2 + p * 8; return <g><TimesCircle n={Math.max(n, 120)} m={m} dots={false}/><T x={W / 2} y={30} size={18}>× {fmt(m, 2)}</T></g>; }
  }
}
function TimesExplore({c}: {c: JourneyConfig}) {
  const clock = useClock(); const [n, setN] = useState(Math.max(120, c.n)); const [base, setBase] = useState(c.m); const [speed, setSpeed] = useState(.12);
  const m = base + speed * clock.t;
  return <Stage label="Times tables on a circle" controls={<><Slider label="Points" value={n} min={10} max={300} step={2} onChange={setN}/><Slider label="Multiplier" value={Math.round(m * 100) / 100} min={1} max={60} step={.01} onChange={v => { setBase(v); clock.setT(0); }}/><Slider label="Drift" value={speed} min={0} max={.6} step={.01} onChange={v => { setBase(m); clock.setT(0); setSpeed(v); }}/><Action primary onClick={clock.toggle}>{clock.playing ? 'Pause' : 'Play'}</Action><Readout>× {fmt(m, 2)} · {Number.isInteger(Math.round(m * 100) / 100) ? `${Math.round(m) - 1} petals` : 'between two flowers'}</Readout></>}>
    <TimesCircle n={n} m={m} dots={n <= 120}/></Stage>;
}

/* ---------- Unrolling π ---------- */
const RX = (m: number) => 80 + m * 170;
function Wheel({s, d = 1, y = 330, trail = true, digits = false}: {s: number; d?: number; y?: number; trail?: boolean; digits?: boolean}) {
  const r = (d / 2) * 170, theta = s / (d / 2), cx = RX(s), cy = y - r;
  const dot: [number, number] = [cx - r * Math.sin(theta), cy + r * Math.cos(theta)];
  const PI_DIGITS = '3.14159265358979323846';
  return <g>{trail && <line x1={RX(0)} x2={RX(s)} y1={y} y2={y} stroke={C.unknown} strokeWidth={6} strokeLinecap="round"/>}
    {digits && <T x={RX(s / 2)} y={y + 30} size={14} color={C.unknown} mono>{PI_DIGITS.slice(0, clamp(Math.round(2 + s * 5.5), 1, PI_DIGITS.length))}</T>}
    <circle cx={cx} cy={cy} r={r} fill="#232031" stroke={C.ones} strokeWidth={4}/>{range(6).map(i => { const a = theta + (i * Math.PI) / 3; return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.sin(a)} y2={cy - r * Math.cos(a)} stroke={C.faint} strokeWidth={2}/>; })}
    <circle cx={dot[0]} cy={dot[1]} r={7} fill={C.unknown}/><circle cx={cx} cy={cy} r={4} fill={C.ones}/></g>;
}
function Ruler({y = 330, max = 4}: {y?: number; max?: number}) {
  return <g><line x1={RX(0)} x2={RX(max)} y1={y} y2={y} stroke={C.muted} strokeWidth={2}/>{range(max * 10 + 1).map(i => <line key={i} x1={RX(i / 10)} x2={RX(i / 10)} y1={y} y2={y + (i % 10 ? 6 : 14)} stroke={C.muted}/>)}{range(max + 1).map(i => <T key={i} x={RX(i)} y={y + 50} size={13} color={C.muted}>{i} m</T>)}</g>;
}
function Polygons({n, cx = 260, cy = 225, R = 165, opacity = 1}: {n: number; cx?: number; cy?: number; R?: number; opacity?: number}) {
  const pts = (rr: number) => range(n).map(i => { const a = -Math.PI / 2 + (i / n) * 2 * Math.PI; return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`; }).join(' ');
  return <g opacity={opacity}><polygon points={pts(R / Math.cos(Math.PI / n))} fill="none" stroke={C.tens} strokeWidth={2}/><polygon points={pts(R)} fill={C.hundreds} fillOpacity={.12} stroke={C.hundreds} strokeWidth={2}/></g>;
}
const SIDES = [6, 12, 24, 48, 96];
function PiScene({scene, p}: {scene: number; p: number}) {
  switch (scene) {
    case 0: return <g><Ruler/><Wheel s={0} trail={false}/><T x={RX(0)} y={135} size={14} color={C.ones}>1 m across</T></g>;
    case 1: return <g><Ruler/><Wheel s={0} trail={false}/><T x={RX(3)} y={250} size={22} color={C.muted}>3?</T><T x={RX(3.5)} y={250} size={22} color={C.faint}>…?</T><T x={RX(4)} y={250} size={22} color={C.muted}>4?</T></g>;
    case 2: { const s = Math.PI * eseg(p, .05, .9); return <g><Ruler/><Wheel s={s} digits/><T x={W / 2} y={60} size={22} weight={600}>{fmt(s, 4)} m</T>{p > .9 && <T x={W / 2} y={92} size={16} color={C.unknown}>one turn = π metres</T>}</g>; }
    case 3: { const f = p * (SIDES.length - .001), i = Math.floor(f), local = f - i; return <g><circle cx={260} cy={225} r={165} fill="none" stroke={C.ones} strokeWidth={3}/><Polygons n={SIDES[i]} opacity={1 - seg(local, .75, 1) * .6}/>{i + 1 < SIDES.length && <Polygons n={SIDES[i + 1]} opacity={seg(local, .75, 1)}/>}
      <T x={600} y={150} size={20} weight={600}>{SIDES[i]} sides</T><T x={600} y={190} size={16} color={C.hundreds}>inside: {fmt(inscribed(SIDES[i]), 5)}</T><T x={600} y={220} size={16} color={C.tens}>outside: {fmt(circumscribed(SIDES[i]), 5)}</T><T x={600} y={262} size={14} color={C.muted}>perimeter ÷ diameter</T></g>; }
    case 4: { const lo = lerp(2.95, 3.135, eseg(p, 0, .8)), hi = lerp(3.5, 3.15, eseg(p, 0, .8)); const X = (v: number) => 80 + ((v - lo) / (hi - lo)) * 640;
      return <g><line x1={80} x2={720} y1={300} y2={300} stroke={C.muted}/>{SIDES.map((n, k) => { const a = inscribed(n), b = circumscribed(n), y = 110 + k * 34; return <g key={n}><line x1={clamp(X(a), 60, 740)} x2={clamp(X(b), 60, 740)} y1={y} y2={y} stroke={hue(200 + k * 25)} strokeWidth={8} strokeLinecap="round"/><T x={50} y={y + 5} size={12} color={C.muted} anchor="end">{n}</T></g>; })}
        <line x1={X(Math.PI)} x2={X(Math.PI)} y1={90} y2={310} stroke={C.unknown} strokeWidth={2}/><T x={X(Math.PI)} y={330} size={16} color={C.unknown}>π</T><T x={W / 2} y={50} size={18}>{fmt(inscribed(96), 4)} &lt; π &lt; {fmt(circumscribed(96), 4)}</T>{p > .7 && <T x={W / 2} y={390} size={15} color={C.good}>祖冲之: 3.1415926 &lt; π &lt; 3.1415927</T>}</g>; }
    case 5: return <g>{[.5, 1, 1.25].map((d, i) => <g key={d}><Wheel s={Math.PI * d * eseg(p, 0, .8)} d={d} y={130 + i * 120} /><line x1={RX(0)} x2={RX(4)} y1={130 + i * 120} y2={130 + i * 120} stroke={C.line}/><T x={760} y={110 + i * 120} size={13} color={C.muted} anchor="end">d = {d} m → {fmt(Math.PI * d, 3)} m</T></g>)}<T x={W / 2} y={428} size={20} weight={600} color={C.good}>C = πd for every circle</T></g>;
    default: { const s = (Math.PI * (p * 1.2)) % 4; return <g><Ruler/><Wheel s={s} digits/></g>; }
  }
}
function PiExplore() {
  const clock = useClock(); const [d, setD] = useState(1); const [view, setView] = useState<'roll' | 'poly'>('roll'); const [k, setK] = useState(0);
  const n = 6 * 2 ** k; const s = (clock.t * .6) % (4 - d * .5);
  return <Stage label="Unrolling π" controls={<><Segmented label="View" value={view} onChange={setView} options={[['roll', 'Roll the wheel'], ['poly', 'Liu Hui polygons']]}/>{view === 'roll' ? <><Slider label="Diameter (m)" value={d} min={.4} max={1.2} step={.1} onChange={setD}/><Action primary onClick={clock.toggle}>{clock.playing ? 'Pause' : 'Roll'}</Action><Readout>rolled {fmt(s, 3)} m = {fmt(s / (Math.PI * d), 3)} turns · one turn = π × {fmt(d)} = {fmt(Math.PI * d, 4)} m</Readout></>
    : <><Stepper label="Sides" value={k} min={0} max={9} onChange={setK} format={v => String(6 * 2 ** v)}/><Readout>{n} sides: {fmt(inscribed(n), 7)} &lt; π &lt; {fmt(circumscribed(n), 7)}</Readout></>}</>}>
    {view === 'roll' ? <><Ruler/><Wheel s={s} d={d} digits={d === 1}/></> : <><circle cx={260} cy={225} r={165} fill="none" stroke={C.ones} strokeWidth={3}/><Polygons n={n}/><T x={600} y={170} size={20} weight={600}>{n} sides</T><T x={600} y={210} size={15} color={C.hundreds}>inside {fmt(inscribed(n), 7)}</T><T x={600} y={240} size={15} color={C.tens}>outside {fmt(circumscribed(n), 7)}</T>{n >= 3072 && <T x={600} y={280} size={14} color={C.good}>Liu Hui went this far: 3072 sides</T>}</>}</Stage>;
}

/* ---------- Circles that draw waves ---------- */
type Shape = 'square' | 'saw';
function harmonics(shape: Shape, terms: number): [number, number][] {
  const full = Math.floor(terms), frac = terms - full;
  return range(Math.ceil(terms)).map(j => { const w = j < full ? 1 : frac; const f = shape === 'square' ? 2 * j + 1 : j + 1; const a = shape === 'square' ? 1 / f : (j % 2 ? -1 : 1) / f; return [f, a * w]; });
}
function Epicycles({t, terms, shape = 'square', ghost = false, note}: {t: number; terms: number; shape?: Shape; ghost?: boolean; note?: string}) {
  const A = shape === 'square' ? 72 : 46, cx = 180, cy = 225, x0 = 380, k = 30, span = 400 / k;
  const hs = harmonics(shape, terms);
  const centers: [number, number, number][] = []; let x = cx, y = cy;
  for (const [f, a] of hs) { centers.push([x, y, Math.abs(a) * A]); x += A * a * Math.cos(f * t); y -= A * a * Math.sin(f * t); }
  const yAt = (tau: number) => cy - hs.reduce((s, [f, a]) => s + A * a * Math.sin(f * tau), 0);
  const wave = range(241).map(i => { const tau = t - (i / 240) * span; return `${i ? 'L' : 'M'}${(x0 + (t - tau) * k).toFixed(1)} ${yAt(tau).toFixed(1)}`; }).join('');
  const target = (tau: number) => { const v = shape === 'square' ? (Math.sin(tau) >= 0 ? 1 : -1) * Math.PI / 4 : (((tau + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI) / 2; return cy - A * v; };
  const ghostPath = range(401).map(i => { const tau = t - (i / 400) * span; return `${i ? 'L' : 'M'}${(x0 + (t - tau) * k).toFixed(1)} ${target(tau).toFixed(1)}`; }).join('');
  return <g>{centers.map(([px, py, r], i) => <g key={i}><circle cx={px} cy={py} r={r} fill="none" stroke={hue(190 + i * 23, 70, .55)} strokeWidth={1.5}/><line x1={px} y1={py} x2={i + 1 < centers.length ? centers[i + 1][0] : x} y2={i + 1 < centers.length ? centers[i + 1][1] : y} stroke={hue(190 + i * 23, 75, .9)} strokeWidth={2}/></g>)}
    {ghost && <path d={ghostPath} fill="none" stroke={C.faint} strokeWidth={2} strokeDasharray="6 5"/>}
    <line x1={x} y1={y} x2={x0} y2={y} stroke={C.unknown} strokeOpacity={.5} strokeDasharray="3 4"/><path d={wave} fill="none" stroke={C.tens} strokeWidth={3}/><circle cx={x} cy={y} r={5} fill={C.unknown}/><circle cx={x0} cy={y} r={5} fill={C.unknown}/>
    <T x={W / 2 + 180} y={34} size={16}>{note ?? `${Math.ceil(terms)} circle${Math.ceil(terms) === 1 ? '' : 's'}`}</T></g>;
}
function EpicycleScene({scene, p}: {scene: number; p: number}) {
  const t = flow(scene, p) * .9;
  switch (scene) {
    case 0: return <Epicycles t={t} terms={1}/>;
    case 1: return <Epicycles t={t} terms={1} ghost note="target: a square wave"/>;
    case 2: return <Epicycles t={t} terms={1 + eseg(p, .1, .7)} ghost note="+ radius 1/3, 3× as fast"/>;
    case 3: return <Epicycles t={t} terms={2 + p * 10} ghost/>;
    case 4: return <Epicycles t={t} terms={12 + p * 18} ghost note="flat tops · overshoot at the corners"/>;
    case 5: return <g><Epicycles t={t} terms={30}/><T x={W / 2} y={420} size={17} color={C.good}>sin x + sin 3x/3 + sin 5x/5 + … → square wave</T></g>;
    default: return <Epicycles t={t} terms={1 + 14 * (.5 - .5 * Math.cos(p * 2 * Math.PI))}/>;
  }
}
function EpicycleExplore() {
  const clock = useClock(); const [terms, setTerms] = useState(4); const [shape, setShape] = useState<Shape>('square');
  return <Stage label="Circles that draw waves" controls={<><Segmented label="Wave" value={shape} onChange={setShape} options={[['square', 'Square'], ['saw', 'Sawtooth']]}/><Slider label="Circles" value={terms} min={1} max={30} onChange={setTerms}/><Action primary onClick={clock.toggle}>{clock.playing ? 'Pause' : 'Play'}</Action><Readout>{shape === 'square' ? 'odd speeds 1, 3, 5, … with radii 1, 1/3, 1/5, …' : 'speeds 1, 2, 3, … with radii 1, −1/2, 1/3, …'}</Readout></>}>
    <Epicycles t={clock.t * 1.4} terms={terms} shape={shape} ghost/></Stage>;
}

/* ---------- Halving forever ---------- */
function pieceRect(i: number): [number, number, number, number] {
  const j = Math.floor(i / 2), s = 2 ** -j, o = 1 - s;
  return i % 2 === 0 ? [o, o, s / 2, s] : [o + s / 2, o, s / 2, s / 2];
}
function Halving({z, painted = 99, size = 380, x0 = 210, y0 = 35, labels = true}: {z: number; painted?: number; size?: number; x0?: number; y0?: number; labels?: boolean}) {
  const scale = 2 ** (z / 2); const map = (u: number) => 1 + (u - 1) * scale; // zoom about the bottom-right corner (1, 1)
  const first = Math.max(0, Math.floor(z) - 3), last = Math.floor(z) + 26;
  return <g><defs><clipPath id="u-halving-clip"><rect x={x0} y={y0} width={size} height={size}/></clipPath></defs><rect x={x0} y={y0} width={size} height={size} fill="#100f17" stroke={C.line}/>
    <g clipPath="url(#u-halving-clip)">{range(last - first).map(q => { const i = first + q; if (i >= painted + 1) return null; const [u, v, w, h] = pieceRect(i); const a = clamp(painted - i, 0, 1);
      const X = x0 + map(u) * size, Y = y0 + map(v) * size, Wd = w * scale * size, Ht = h * scale * size;
      return <g key={i} opacity={a}><rect x={X} y={Y} width={Wd} height={Ht} fill={hue(30 + i * 36, 62)} fillOpacity={.85} stroke="#15141d" strokeWidth={1.5}/>{labels && Wd > 46 && Ht > 30 && <T x={X + Wd / 2} y={Y + Ht / 2 + 6} size={clamp(Math.min(Wd, Ht) / 5, 12, 30)} color="#15141d" weight={700}>1/{2 ** (i + 1)}</T>}</g>; })}</g></g>;
}
function Corridor({k}: {k: number}) {
  const pos = 1 - 2 ** -k, X = (v: number) => 100 + v * 560;
  return <g><line x1={X(0)} x2={X(1)} y1={300} y2={300} stroke={C.muted} strokeWidth={2}/><rect x={X(1)} y={190} width={36} height={110} rx={4} fill={C.hundreds} opacity={.6}/><T x={X(1) + 18} y={180} size={13} color={C.hundreds}>door</T>
    {range(Math.floor(k)).map(i => <g key={i}><line x1={X(1 - 2 ** -i)} x2={X(1 - 2 ** -(i + 1))} y1={330 + (i % 2) * 8} y2={330 + (i % 2) * 8} stroke={hue(30 + i * 36)} strokeWidth={5}/>{i < 4 && <T x={(X(1 - 2 ** -i) + X(1 - 2 ** -(i + 1))) / 2} y={360} size={13} color={hue(30 + i * 36)}>1/{2 ** (i + 1)}</T>}</g>)}
    <circle cx={X(pos)} cy={282} r={14} fill={C.ones}/><T x={W / 2} y={100} size={20}>walked {fmt(pos, 5)} of the way</T></g>;
}
function HalvingScene({scene, p}: {scene: number; p: number}) {
  switch (scene) {
    case 0: return <Corridor k={eseg(p, 0, 1) * 3}/>;
    case 1: return <g><Corridor k={3 + p * 5}/><T x={W / 2} y={140} size={16} color={C.muted}>infinitely many steps — do you ever arrive?</T></g>;
    case 2: return <Halving z={0} painted={p * 8}/>;
    case 3: return <Halving z={p * 6}/>;
    case 4: { const z = 6 + p * 6, n = Math.floor(z) + 2; return <g><Halving z={z}/><T x={700} y={150} size={18} weight={600}>S{n} = 1 − 1/{2 ** n}</T><T x={700} y={185} size={16} color={C.good}>= {fmt(1 - 2 ** -n, 6)}</T><T x={700} y={220} size={14} color={C.muted}>gap 1/{2 ** n}</T></g>; }
    case 5: return <g><Halving z={0}/><T x={700} y={160} size={17} color={C.good}>a₁/(1 − q)</T><T x={700} y={192} size={17} color={C.good}>= (1/2)/(1/2) = 1</T></g>;
    default: return <Halving z={p * 10} labels={false}/>;
  }
}
function HalvingExplore() {
  const clock = useClock(); const [painted, setPainted] = useState(12); const [speed, setSpeed] = useState(1);
  // The picture repeats exactly every 2 pieces (and the colours every 20), so wrapping at 20 is seamless.
  const z = (clock.t * speed) % 20; const n = Math.round(painted);
  return <Stage label="Halving forever" controls={<><Slider label="Pieces painted" value={painted} min={1} max={30} onChange={setPainted}/><Slider label="Dive speed" value={speed} min={0} max={3} step={.1} onChange={setSpeed}/><Action primary onClick={clock.toggle}>{clock.playing ? 'Pause' : 'Dive'}</Action><Readout>{clock.playing ? 'Diving: every corner holds the whole picture again' : `S${n} = 1 − 1/2^${n} = ${fmt(1 - 2 ** -n, 9)} · unpainted gap 1/${2 ** n}`}</Readout></>}>
    <Halving z={z} painted={clock.playing ? Infinity : painted} labels={!clock.playing}/></Stage>;
}

/* ---------- The sunflower’s secret angle ---------- */
function Sunflower({deg, seeds = 500, family = 0, cx = 400, cy = 240, R = 185, dim = 1}: {deg: number; seeds?: number; family?: number; cx?: number; cy?: number; R?: number; dim?: number}) {
  const N = Math.max(1, Math.floor(seeds)), c = R / Math.sqrt(N), th = (deg * Math.PI) / 180;
  // Seeds i ≡ r (mod family) lie on one spiral arm. Rank the arms by angle so neighbouring arms alternate colours.
  const rank = new Map(range(family).map(r => [r, ((r * deg) % 360 + 360) % 360] as const).sort((a, b) => a[1] - b[1]).map(([r], k) => [r, k]));
  return <g opacity={dim}>{range(N).map(i => { const r = c * Math.sqrt(i + .5), a = i * th; const col = family ? ((rank.get(i % family) ?? 0) % 2 ? C.tens : C.ones) : hue(28 + (i / N) * 30, 45 + (i / N) * 25);
    return <circle key={i} cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r={clamp(c * .42, 1.6, 7) * (.6 + .4 * Math.sqrt(i / N))} fill={col}/>; })}</g>;
}
/** Smoothly travel through angle keyframes with short holds. */
function keyframes(p: number, keys: number[]) { const f = p * (keys.length - 1), i = Math.min(keys.length - 2, Math.floor(f)); return lerp(keys[i], keys[i + 1], eseg(f - i, .35, .95)); }
function SunflowerScene({scene, p}: {scene: number; p: number}) {
  switch (scene) {
    case 0: return <g><Sunflower deg={GOLDEN_DEG} seeds={2 + ease(p) * 160} R={130}/><T x={W / 2} y={30} size={16}>each new seed turns by the same angle</T></g>;
    case 1: return <g><Sunflower deg={100} seeds={400}/><T x={W / 2} y={30} size={16}>100°: gaps everywhere</T></g>;
    case 2: { const d = keyframes(p, [180, 120, 144, 135]); return <g><Sunflower deg={d} seeds={400}/><T x={W / 2} y={30} size={18}>{fmt(d, 1)}° {Math.abs(d - 180) < .5 ? '= 1/2 turn' : Math.abs(d - 120) < .5 ? '= 1/3 turn' : Math.abs(d - 144) < .5 ? '= 2/5 turn' : ''}</T></g>; }
    case 3: { const d = lerp(135, GOLDEN_DEG, 1 - (1 - ease(p)) ** 2); return <g><Sunflower deg={d} seeds={600}/><T x={W / 2} y={30} size={18}>{fmt(d, 3)}°</T></g>; }
    case 4: { const fam = p < .5 ? 13 : 21; return <g><Sunflower deg={GOLDEN_DEG} seeds={fam === 13 ? 300 : 650} family={fam}/><T x={W / 2} y={30} size={18}>{fmt(GOLDEN_DEG, 3)}° · {fam} spirals</T></g>; }
    case 5: { const k = Math.min(12, 3 + Math.floor(p * 10)); return <g><Sunflower deg={GOLDEN_DEG} seeds={600} dim={.35}/>{range(k).map(i => <T key={i} x={W / 2} y={70 + i * 28} size={15} color={C.ink}>{`${fib(i + 2)} / ${fib(i + 1)} = ${fmt(fib(i + 2) / fib(i + 1), 5)}`}</T>)}<T x={W / 2} y={430} size={17} color={C.good}>→ φ = {fmt(PHI, 6)}</T></g>; }
    default: { const d = GOLDEN_DEG + .6 * Math.sin(p * 2 * Math.PI); return <g><Sunflower deg={d} seeds={600}/><T x={W / 2} y={30} size={16}>{fmt(d, 3)}° — tiny changes, big differences</T></g>; }
  }
}
function SunflowerExplore() {
  const clock = useClock(); const [base, setBase] = useState(136.5); const [seeds, setSeeds] = useState(500); const [fam, setFam] = useState<'0' | '8' | '13' | '21' | '34'>('0'); const [drift, setDrift] = useState(.08);
  const deg = base + drift * clock.t;
  return <Stage label="The sunflower’s secret angle" controls={<><Slider label="Angle (°)" value={Math.round(deg * 100) / 100} min={90} max={180} step={.01} onChange={v => { setBase(v); clock.setT(0); }}/><Slider label="Drift" value={drift} min={0} max={.5} step={.01} onChange={v => { setBase(deg); clock.setT(0); setDrift(v); }}/><Action onClick={() => { setBase(GOLDEN_DEG); clock.setT(0); setDrift(0); }}>Golden angle</Action><Action primary onClick={clock.toggle}>{clock.playing ? 'Pause' : 'Play'}</Action><Slider label="Seeds" value={seeds} min={50} max={900} step={10} onChange={setSeeds}/>
    <Segmented label="Colour spirals" value={fam} onChange={setFam} options={[['0', 'Off'], ['8', '8'], ['13', '13'], ['21', '21'], ['34', '34']]}/><Readout>{fmt(deg, 3)}° · golden angle {fmt(GOLDEN_DEG, 3)}° · difference {fmt(deg - GOLDEN_DEG, 3)}°</Readout></>}>
    <Sunflower deg={deg} seeds={seeds} family={Number(fam)}/></Stage>;
}

function Scene({c, scene, p}: {c: JourneyConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'pi': return <PiScene scene={scene} p={p}/>;
    case 'epicycles': return <EpicycleScene scene={scene} p={p}/>;
    case 'halving': return <HalvingScene scene={scene} p={p}/>;
    case 'sunflower': return <SunflowerScene scene={scene} p={p}/>;
    case 'symmetry': return <SymmetryScene scene={scene} p={p}/>;
    case 'clock': return <ClockScene c={c} scene={scene} p={p}/>;
    case 'wallpaper': return <WallpaperScene scene={scene} p={p}/>;
    case 'quintic': return <QuinticScene scene={scene} p={p}/>;
    default: return <TimesScene c={c} scene={scene} p={p}/>;
  }
}
function Explore({c}: {c: JourneyConfig}) {
  switch (c.mode) {
    case 'pi': return <PiExplore/>;
    case 'epicycles': return <EpicycleExplore/>;
    case 'halving': return <HalvingExplore/>;
    case 'sunflower': return <SunflowerExplore/>;
    case 'symmetry': return <SymmetryExplore/>;
    case 'clock': return <ClockExplore c={c}/>;
    case 'wallpaper': return <WallpaperExplore/>;
    case 'quintic': return <QuinticExplore/>;
    default: return <TimesExplore c={c}/>;
  }
}

export const journeyView: EngineView<JourneyConfig> = {Scene: props => <Stage label={journey.describe(props.c)}><Scene {...props}/></Stage>, Explore};

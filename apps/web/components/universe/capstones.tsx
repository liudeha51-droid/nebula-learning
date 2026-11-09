'use client';
/**
 * Capstones for the learning journeys: one problem that needs every tool collected on the way.
 * Each shows an interactive board plus a worked solution whose steps name the tool they use.
 */
import {useState, type ReactNode} from 'react';
import {Stage, T, C, Readout, Slider, Stepper, Segmented, Action, Handle} from './stage';
import {Axes, Curve, Pt, frame} from './plot';
import {
  earthCircumference, earthRadius, diceWays, diceGame, simulateDice, gardenArea, gardenSlope, gardenBest, balanceAfter, doublingTime, savingsAfter, trilaterate,
  type CapstoneId, type LearningJourney,
} from '@/lib/universe/learning-journeys';
import {clamp, fmt} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';

/** One worked step, tagged with the tool (station) it uses. */
function Step({j, tools, children}: {j: LearningJourney; tools: string[]; children: ReactNode}) {
  return <li><span className="u-lj-step-tools">{tools.map(t => { const i = j.stations.findIndex(s => s.tool === t); return <a key={t} href={`#stop-${i + 1}`} className="u-lj-tool" title={`Collected at stop ${i + 1}`}>{t}</a>; })}</span><span>{children}</span></li>;
}
const Steps = ({children}: {children: ReactNode}) => <ol className="u-lj-steps">{children}</ol>;

/* ---------- 1. Eratosthenes ---------- */
function Eratosthenes({j}: {j: LearningJourney}) {
  const [deg, setDeg] = useState(7.2), [km, setKm] = useState(800);
  const C0 = earthCircumference(deg, km), R0 = earthRadius(C0);
  const cx = 270, cy = 270, R = 165, show = deg * 4; // the drawing exaggerates the angle 4× so it can be seen
  const at = (a: number) => [cx + R * Math.sin((a * Math.PI) / 180), cy - R * Math.cos((a * Math.PI) / 180)] as const;
  const [sx, sy] = at(0), [ax, ay] = at(-show);
  return <>
    <Stage label="Eratosthenes’ measurement" controls={<><Slider label="Shadow angle (°)" value={deg} min={4} max={10} step={.1} onChange={setDeg}/><Slider label="Syene → Alexandria (km)" value={km} min={500} max={1200} step={10} onChange={setKm}/><Readout>Earth ≈ {fmt(Math.round(C0))} km round, radius ≈ {fmt(Math.round(R0))} km</Readout></>}>
      {range(9).map(i => <line key={i} x1={40 + i * 60} x2={40 + i * 60} y1={0} y2={70} stroke={C.ones} strokeWidth={2} opacity={.7}/>)}<T x={300} y={20} size={13} color={C.ones}>parallel sun rays</T>
      <circle cx={cx} cy={cy} r={R} fill="#1f3f7a" stroke="#8ec9ff" strokeWidth={3}/>
      <path d={`M${ax} ${ay} A${R} ${R} 0 0 1 ${sx} ${sy}`} fill="none" stroke={C.unknown} strokeWidth={6}/>
      <line x1={cx} y1={cy} x2={sx} y2={sy} stroke="#fff" strokeDasharray="5 5"/><line x1={cx} y1={cy} x2={ax} y2={ay} stroke="#fff" strokeDasharray="5 5"/>
      <line x1={sx} y1={sy} x2={sx} y2={sy - 40} stroke={C.ink} strokeWidth={4}/><line x1={ax} y1={ay} x2={ax + 40 * Math.sin((-show * Math.PI) / 180)} y2={ay - 40 * Math.cos((-show * Math.PI) / 180)} stroke={C.ink} strokeWidth={4}/>
      <line x1={ax + 40 * Math.sin((-show * Math.PI) / 180)} y1={ay - 40 * Math.cos((-show * Math.PI) / 180)} x2={ax + 40 * Math.sin((-show * Math.PI) / 180)} y2={ay + 10} stroke={C.ones} strokeWidth={2}/>
      <path d={`M${cx} ${cy - 40} A40 40 0 0 0 ${cx + 40 * Math.sin((-show * Math.PI) / 180)} ${cy - 40 * Math.cos((-show * Math.PI) / 180)}`} fill="none" stroke={C.ones} strokeWidth={3}/>
      <T x={cx - 18} y={cy - 50} size={14} color={C.ones}>{fmt(deg, 1)}°</T><T x={sx + 30} y={sy - 30} size={13} anchor="start">Syene: no shadow</T><T x={ax - 30} y={ay - 30} size={13} anchor="end">Alexandria: shadow {fmt(deg, 1)}°</T>
      <T x={(sx + ax) / 2} y={Math.min(sy, ay) - 58} size={14} color={C.unknown}>{km} km</T>
      <T x={640} y={150} size={15}>{fmt(deg, 1)}° is 1/{fmt(360 / deg, 2)} of a full turn,</T><T x={640} y={176} size={15}>so {km} km is 1/{fmt(360 / deg, 2)} of the way round.</T>
      <T x={640} y={222} size={22} weight={700} color={C.good}>C ≈ {fmt(Math.round(C0))} km</T><T x={640} y={252} size={14} color={C.muted}>(real: about 40,075 km)</T><T x={640} y={420} size={12} color={C.muted}>Angles drawn 4× larger so you can see them.</T>
    </Stage>
    <Steps>
      <Step j={j} tools={['Parallel lines']}>The sun’s rays are parallel, so the shadow angle at Alexandria equals the angle at the Earth’s centre: <b>{fmt(deg, 1)}°</b>.</Step>
      <Step j={j} tools={['Angles', 'Degrees']}>A full turn is 360°, so {fmt(deg, 1)}° is <b>{fmt(deg, 1)}/360 = 1/{fmt(360 / deg, 2)}</b> of the whole circle.</Step>
      <Step j={j} tools={['Arc length', 'Proportion']}>The arc between the cities is the same fraction of the circumference: {km} = ({fmt(deg, 1)}/360) × C, so <b>C = 360/{fmt(deg, 1)} × {km} ≈ {fmt(Math.round(C0))} km</b>.</Step>
      <Step j={j} tools={['Circumference']}>C = 2πr gives the radius: <b>r = C/(2π) ≈ {fmt(Math.round(R0))} km</b> (the real mean radius is about 6,371 km; this estimate is {fmt(Math.abs(R0 / 6371 - 1) * 100, 1)}% off).</Step>
    </Steps></>;
}

/* ---------- 2. Is the game fair? ---------- */
function FairGame({j}: {j: LearningJourney}) {
  const [sum, setSum] = useState(7), [prize, setPrize] = useState(6), [price, setPrice] = useState(1), [seed, setSeed] = useState(7);
  const g = diceGame(sum, prize, price), ways = diceWays(sum), N = 1000, hits = simulateDice(N, sum, seed);
  const simProfit = hits * (prize - price) - (N - hits) * price; const fairPrize = price / g.p;
  const S = 40, x0 = 70, y0 = 60;
  return <>
    <Stage label="The dice stall" controls={<><Stepper label="Lucky sum" value={sum} min={2} max={12} onChange={setSum}/><Stepper label="Prize ¥" value={prize} min={1} max={40} onChange={setPrize}/><Stepper label="Price ¥" value={price} min={1} max={5} onChange={setPrice}/><Action onClick={() => setSeed(seed + 1)}>Roll 1,000 more</Action>
      <Readout>{g.verdict === 'fair' ? 'Fair game ✓' : g.verdict === 'good for players' ? 'Players win in the long run' : 'The stall wins in the long run'} · expected result per game: ¥{fmt(g.ev, 3)}</Readout></>}>
      {range(6).map(i => <T key={'r' + i} x={x0 - 18} y={y0 + i * S + S / 2 + 5} size={14} color={C.bad}>{i + 1}</T>)}{range(6).map(k => <T key={'c' + k} x={x0 + k * S + S / 2} y={y0 - 12} size={14} color={C.accent}>{k + 1}</T>)}
      {range(36).map(q => { const a = Math.floor(q / 6) + 1, b = (q % 6) + 1, win = a + b === sum; return <g key={q}><rect x={x0 + (b - 1) * S} y={y0 + (a - 1) * S} width={S - 4} height={S - 4} rx={6} fill={win ? C.ones : '#2a2638'}/><T x={x0 + (b - 1) * S + S / 2 - 2} y={y0 + (a - 1) * S + S / 2 + 3} size={13} color={win ? '#15141d' : C.muted}>{a + b}</T></g>; })}
      <T x={560} y={80} size={16}>P(sum = {sum}) = {ways}/36</T><T x={560} y={108} size={14} color={C.muted}>≈ {fmt(g.p, 4)}</T>
      <T x={560} y={160} size={14}>1,000 simulated games:</T>
      <rect x={440} y={176} width={240} height={18} rx={4} fill="#2a2638"/><rect x={440} y={176} width={clamp((hits / N) * 240 * 3, 0, 240)} height={18} rx={4} fill={C.tens}/><line x1={440 + g.p * 240 * 3} x2={440 + g.p * 240 * 3} y1={170} y2={200} stroke={C.ones} strokeWidth={3}/>
      <T x={560} y={222} size={13} color={C.muted}>wins {hits} ({fmt((hits / N) * 100, 1)}%) · predicted {fmt(g.p * 100, 1)}% (yellow line)</T>
      <T x={560} y={262} size={15}>player profit over 1,000 games: ¥{fmt(simProfit)}</T>
      <T x={560} y={320} size={17} weight={700} color={g.verdict === 'fair' ? C.good : C.warn}>{g.verdict === 'fair' ? 'Fair!' : `A fair prize would be ¥${fmt(fairPrize, 2)}`}</T>
    </Stage>
    <Steps>
      <Step j={j} tools={['Listing outcomes']}>Two dice give <b>6 × 6 = 36</b> equally likely results; {ways} of them add up to {sum} (yellow).</Step>
      <Step j={j} tools={['Fractions', 'Classical probability']}>So <b>P(win) = {ways}/36 ≈ {fmt(g.p, 4)}</b>, and P(lose) = {36 - ways}/36.</Step>
      <Step j={j} tools={['Expected value']}>Per game a player expects <b>({ways}/36) × ({prize} − {price}) − ({36 - ways}/36) × {price} = ¥{fmt(g.ev, 3)}</b>. Zero means fair.</Step>
      <Step j={j} tools={['Chance']}>To be fair the prize must be price ÷ P(win) = <b>¥{fmt(fairPrize, 2)}</b>. {sum === 7 && price === 1 ? 'For sum 7 at ¥1 that is exactly ¥6.' : ''}</Step>
      <Step j={j} tools={['Experiments']}>The simulation won {hits} of {N} games ({fmt((hits / N) * 100, 1)}%), close to the predicted {fmt(g.p * 100, 1)}% — frequencies settle near probabilities.</Step>
    </Steps></>;
}

/* ---------- 3. The biggest garden ---------- */
function Garden({j}: {j: LearningJourney}) {
  const [L, setL] = useState(40), [x, setX] = useState(6); const xx = clamp(x, .5, L / 2 - .5); const best = gardenBest(L), A = gardenArea(L, xx), slope = gardenSlope(L, xx);
  const F = frame(0, L / 2, 0, best.area * 1.15, {x0: 450, y0: 40, w: 320, h: 330}); const k = 300 / (L - 1);
  const tbl = [-2, -1, 0, 1, 2].map(d => best.x + (d * L) / 20);
  return <>
    <Stage label="Fence the biggest garden" controls={<><Slider label="Width x (m)" value={xx} min={.5} max={L / 2 - .5} step={.25} onChange={setX}/><Stepper label="Fence (m)" value={L} min={20} max={80} step={4} onChange={v => { setL(v); setX(v / 7); }}/><Readout>width {fmt(xx, 2)} m × length {fmt(L - 2 * xx, 2)} m = {fmt(A, 2)} m² · slope A′(x) = {fmt(slope, 2)}</Readout></>}>
      <rect x={40} y={40} width={360} height={12} fill={C.muted}/><T x={220} y={34} size={12} color={C.muted}>wall</T>
      <rect x={220 - ((L - 2 * xx) * k) / 2} y={52} width={(L - 2 * xx) * k} height={xx * k} fill={C.good} fillOpacity={.35} stroke={C.good} strokeWidth={3}/>
      <T x={220} y={52 + xx * k + 22} size={13}>{fmt(L - 2 * xx, 2)} m</T><T x={220 - ((L - 2 * xx) * k) / 2 - 8} y={52 + (xx * k) / 2} size={13} anchor="end">{fmt(xx, 2)} m</T>
      <Axes f={F} xLabel="x" yLabel="A"/><Curve f={F} fn={t => gardenArea(L, t)} color={C.good}/><Curve f={F} fn={t => A + slope * (t - xx)} color={C.unknown} width={2} from={Math.max(0, xx - L / 10)} to={Math.min(L / 2, xx + L / 10)}/><Pt f={F} x={xx} y={A}/>
      <line x1={F.X(best.x)} x2={F.X(best.x)} y1={F.Y(0)} y2={F.Y(best.area)} stroke={C.ones} strokeDasharray="5 5"/><T x={F.X(best.x)} y={F.Y(best.area) - 10} size={13} color={C.ones}>best: x = {fmt(best.x)}</T>
    </Stage>
    <Steps>
      <Step j={j} tools={['Perimeter', 'Equations']}>Three sides use the fence: x + x + length = {L}, so <b>length = {L} − 2x</b>.</Step>
      <Step j={j} tools={['Expressions', 'Functions']}>Area as a function of width: <b>A(x) = x({L} − 2x) = −2x² + {L}x</b>.</Step>
      <Step j={j} tools={['Functions']}>Table method: {tbl.map(t => `A(${fmt(t, 1)}) = ${fmt(gardenArea(L, t), 1)}`).join(' · ')} — the biggest is in the middle.</Step>
      <Step j={j} tools={['Parabolas']}>Parabola method: the vertex is at <b>x = −b/2a = −{L}/(2 × −2) = {fmt(best.x)}</b>.</Step>
      <Step j={j} tools={['Rate of change', 'Optimisation']}>Derivative method: A′(x) = {L} − 4x = 0 gives <b>x = {fmt(best.x)}</b>; A′ changes from + to −, so it is a maximum.</Step>
      <Step j={j} tools={['Optimisation']}>All three agree: a <b>{fmt(best.x)} m × {fmt(L / 2)} m</b> garden, area <b>{fmt(best.area)} m²</b>. Now x = {fmt(xx, 2)} gives {fmt(A, 2)} m² — {A >= best.area - 1e-9 ? 'the best!' : `${fmt(best.area - A, 2)} m² short`}.</Step>
    </Steps></>;
}

/* ---------- 4. How fast do things grow? ---------- */
function Growth({j}: {j: LearningJourney}) {
  const [rp, setRp] = useState(5), [years, setYears] = useState(20), [mode, setMode] = useState<'single' | 'yearly'>('single'); const r = rp / 100;
  const vals = range(years + 1).map(t => (mode === 'single' ? balanceAfter(1000, r, t) : savingsAfter(1000, r, t)));
  const maxV = Math.max(...vals, mode === 'single' ? 2100 : 0) * 1.1, bw = 640 / (years + 1), base = 400; const td = doublingTime(r);
  const deposits = 1000 * years, total = savingsAfter(1000, r, years);
  return <>
    <Stage label="The savings machine" controls={<><Segmented label="Plan" value={mode} onChange={setMode} options={[['single', 'One deposit of ¥1000'], ['yearly', '¥1000 every year']]}/><Slider label="Interest %" value={rp} min={1} max={12} step={.5} onChange={setRp}/><Slider label="Years" value={years} min={5} max={40} onChange={setYears}/>
      <Readout>{mode === 'single' ? `doubles after ${fmt(td, 2)} years (rule of 72: about ${fmt(72 / rp, 1)})` : `after ${years} years: ¥${fmt(Math.round(total))} from ¥${fmt(deposits)} deposited`}</Readout></>}>
      {vals.map((v, t) => { const h = (v / maxV) * 330; const dep = mode === 'yearly' ? Math.min(v, 1000 * t) : Math.min(v, 1000); const hd = (dep / maxV) * 330;
        return <g key={t}><rect x={80 + t * bw} y={base - h} width={Math.max(1, bw - 2)} height={h} fill={C.warn} opacity={.85}/><rect x={80 + t * bw} y={base - hd} width={Math.max(1, bw - 2)} height={hd} fill={C.tens} opacity={.85}/></g>; })}
      <line x1={70} x2={730} y1={base} y2={base} stroke={C.muted}/>{mode === 'single' && <><line x1={70} x2={730} y1={base - (2000 / maxV) * 330} y2={base - (2000 / maxV) * 330} stroke={C.ones} strokeDasharray="6 5"/><T x={735} y={base - (2000 / maxV) * 330 + 4} size={12} color={C.ones} anchor="start">¥2000</T>
        {td <= years && <line x1={80 + td * bw} x2={80 + td * bw} y1={base} y2={60} stroke={C.ones} strokeWidth={2}/>}</>}
      {range(Math.floor(years / 5) + 1).map(i => <T key={i} x={80 + i * 5 * bw + bw / 2} y={base + 18} size={11} color={C.muted}>{i * 5}</T>)}<T x={400} y={436} size={12} color={C.muted}>years</T>
      <T x={110} y={50} size={13} color={C.tens} anchor="start">■ money you put in</T><T x={110} y={70} size={13} color={C.warn} anchor="start">■ interest earned</T></Stage>
    <Steps>
      <Step j={j} tools={['Percentage change', 'Multiplication']}>Growing by {rp}% means multiplying by <b>{fmt(1 + r, 3)}</b> every year.</Step>
      <Step j={j} tools={['Powers', 'Exponential functions']}>After t years one deposit is worth <b>1000 × {fmt(1 + r, 3)}ᵗ</b>; after {years} years that is ¥{fmt(Math.round(balanceAfter(1000, r, years)))}.</Step>
      <Step j={j} tools={['Logarithms']}>Doubling means {fmt(1 + r, 3)}ᵗ = 2, so <b>t = log 2 / log {fmt(1 + r, 3)} ≈ {fmt(td, 2)} years</b> (the rule of 72 estimates {fmt(72 / rp, 1)}).</Step>
      <Step j={j} tools={['Geometric series']}>Depositing ¥1000 every year, the deposits grow by {fmt(1 + r, 3)}¹, {fmt(1 + r, 3)}², …: a geometric series, total <b>1000 × {fmt(1 + r, 3)} × ({fmt(1 + r, 3)}^{years} − 1)/{fmt(r, 3)} ≈ ¥{fmt(Math.round(total))}</b>, of which ¥{fmt(Math.round(total - deposits))} is interest.</Step>
    </Steps></>;
}

/* ---------- 5. GPS ---------- */
/** ax + by = c with proper signs, e.g. “17x − 2y = 24.5”. */
const lin = ({a, b, c}: {a: number; b: number; c: number}) => `${fmt(a, 2)}x ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b), 2)}y = ${fmt(c, 2)}`;
const TOWERS = [{x: -4, y: 3, name: 'A'}, {x: 4.5, y: 2, name: 'B'}, {x: -1, y: -3.5, name: 'C'}];
function Gps({j}: {j: LearningJourney}) {
  const F = frame(-6.5, 6.5, -4.6, 4.6, {x0: 70, y0: 20, w: 520, h: 368});
  const [ph, setPh] = useState<[number, number]>([1.5, 0.5]); const [show, setShow] = useState<'circles' | 'lines' | 'both'>('both');
  const towers = TOWERS.map(t => ({...t, r: Math.hypot(ph[0] - t.x, ph[1] - t.y)})); const sol = trilaterate([towers[0], towers[1], towers[2]]);
  const lineFn = (l: {a: number; b: number; c: number}) => (x: number) => (Math.abs(l.b) < 1e-9 ? NaN : (l.c - l.a * x) / l.b);
  const sx = (v: number) => clamp(((v - F.x0) / F.w) * 13 - 6.5, -6, 6), sy = (v: number) => clamp(4.6 - ((v - F.y0) / F.h) * 9.2, -4.2, 4.2);
  const eq = (t: typeof towers[0]) => `(x ${t.x < 0 ? '+' : '−'} ${fmt(Math.abs(t.x))})² + (y ${t.y < 0 ? '+' : '−'} ${fmt(Math.abs(t.y))})² = ${fmt(t.r ** 2, 2)}`;
  return <>
    <Stage label="Find the phone" controls={<><Segmented label="Show" value={show} onChange={setShow} options={[['circles', 'Circles'], ['lines', 'Lines'], ['both', 'Both']]}/><Readout>distances: A {fmt(towers[0].r, 2)} · B {fmt(towers[1].r, 2)} · C {fmt(towers[2].r, 2)} → phone found at ({fmt(sol.point?.x ?? NaN, 2)}, {fmt(sol.point?.y ?? NaN, 2)}). Drag the phone!</Readout></>}>
      <Axes f={F}/>
      {show !== 'lines' && towers.map((t, i) => <circle key={i} cx={F.X(t.x)} cy={F.Y(t.y)} r={(t.r * F.w) / 13} fill="none" stroke={[C.ones, C.tens, C.hundreds][i]} strokeWidth={2.5} opacity={.85}/>)}
      {show !== 'circles' && [sol.l1, sol.l2].map((l, i) => <Curve key={i} f={F} fn={lineFn(l)} color={[C.unknown, C.warn][i]} dash="7 5" width={2.5}/>)}
      {towers.map((t, i) => <g key={i}><rect x={F.X(t.x) - 8} y={F.Y(t.y) - 8} width={16} height={16} rx={3} fill={[C.ones, C.tens, C.hundreds][i]}/><T x={F.X(t.x)} y={F.Y(t.y) - 14} size={13} color={[C.ones, C.tens, C.hundreds][i]}>{t.name}({fmt(t.x)}, {fmt(t.y)})</T></g>)}
      {sol.point && <circle cx={F.X(sol.point.x)} cy={F.Y(sol.point.y)} r={16} fill="none" stroke={C.good} strokeWidth={3}/>}
      <Handle x={F.X(ph[0])} y={F.Y(ph[1])} label="phone" color={C.unknown} onMove={(x, y) => setPh([sx(x), sy(y)])} keyStep={F.w / 52}/>
      <T x={700} y={60} size={13} color={C.muted}>Each tower hears</T><T x={700} y={78} size={13} color={C.muted}>the phone’s distance:</T>
      {towers.map((t, i) => <T key={i} x={700} y={108 + i * 22} size={13} color={[C.ones, C.tens, C.hundreds][i]}>{t.name}: {fmt(t.r, 2)}</T>)}
      <T x={700} y={210} size={13} color={C.muted}>circle − circle</T><T x={700} y={228} size={13} color={C.muted}>= a straight line</T>
    </Stage>
    <Steps>
      <Step j={j} tools={['Ordered pairs', 'The coordinate plane']}>The towers sit at A(−4, 3), B(4.5, 2) and C(−1, −3.5); the phone is at an unknown point (x, y).</Step>
      <Step j={j} tools={['Pythagoras', 'Distance formula']}>Each distance comes from a right triangle: for example d(A) = √((x + 4)² + (y − 3)²) = {fmt(towers[0].r, 3)}.</Step>
      <Step j={j} tools={['Circle equations']}>So the phone lies on three circles: {towers.map(eq).join('; ')}.</Step>
      <Step j={j} tools={['Systems of equations']}>Subtracting A’s equation from B’s and from C’s cancels x² and y², leaving two lines: <b>{lin(sol.l1)}</b> and <b>{lin(sol.l2)}</b>.</Step>
      <Step j={j} tools={['Systems of equations']}>Solving the two lines together: <b>(x, y) = ({fmt(sol.point?.x ?? NaN, 3)}, {fmt(sol.point?.y ?? NaN, 3)})</b> — exactly where the phone is. Real GPS does the same in 3-D, with satellites and an extra unknown for the clock.</Step>
    </Steps></>;
}

export const CAPSTONES: Record<CapstoneId, (p: {j: LearningJourney}) => ReactNode> = {eratosthenes: Eratosthenes, 'fair-game': FairGame, garden: Garden, growth: Growth, gps: Gps};

'use client';
import {useMemo, useState, type ReactNode} from 'react';
import {Stage, T, C, W, Readout, Slider, Stepper, Segmented, Action} from './stage';
import {Axes, Curve, Pt, frame} from './plot';
import {useClock} from './use-clock';
import type {ExplorerId} from '@/lib/universe/frontier';
import {
  primeCounts, li, subsetSum, q, ecAdd, qstr, qnum, pointsModP, primeSieve, piConvergents, piError, egyptianGreedy, largestPrimeFactors,
  divisorSequence, imoP4Answer, threeLargestProperDivisors, isSunny, covers, sunnyConstruction, trianglePoints, bonzaViolation, bonzaExtremal,
  inekoalaty, moserSpindle, properColouring, type ECPoint, type IntFn, type Line,
} from '@/lib/universe/frontier-math';
import {clamp, fmt} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';

/* Large tables are built once, on first use. */
let PRIME_COUNTS: Uint32Array | null = null; const primeTable = () => (PRIME_COUNTS ??= primeCounts(100000));
let LPF_SHARE: Float64Array | null = null;
function lpfTable() { if (LPF_SHARE) return LPF_SHARE; const N = 200000, l = largestPrimeFactors(N + 1), s = new Float64Array(N + 1); let c = 0; for (let m = 2; m <= N; m++) { if (l[m] < l[m + 1]) c++; s[m] = c / (m - 1); } return (LPF_SHARE = s); }

/* ---------- Navier–Stokes: what “blowup” means ---------- */
function Blowup() {
  const [y0, setY0] = useState(1); const F = frame(0, 3, 0, 12, {x0: 60, y0: 30, w: 680, h: 350}); const T0 = 1 / y0;
  return <Stage label="Blowup in finite time" controls={<><Slider label="Starting value y(0)" value={y0} min={.4} max={2.5} step={.05} onChange={setY0}/><Readout>y′ = y² reaches infinity at t = 1/y(0) = {fmt(T0, 3)}; y′ = y only grows exponentially and stays finite at every time.</Readout></>}>
    <Axes f={F} xLabel="time t" yLabel="y"/><Curve f={F} fn={t => y0 * Math.exp(t)} color={C.tens}/><Curve f={F} fn={t => (t < T0 ? y0 / (1 - y0 * t) : NaN)} color={C.unknown} to={Math.min(3, T0 - 1e-3)}/>
    {T0 < 3 && <><line x1={F.X(T0)} x2={F.X(T0)} y1={F.Y(0)} y2={F.Y(12)} stroke={C.unknown} strokeDasharray="6 5"/><T x={F.X(T0) + 8} y={60} size={13} color={C.unknown} anchor="start">blowup at t = {fmt(T0, 2)}</T></>}
    <T x={640} y={330} size={14} color={C.tens}>y′ = y (finite forever)</T><T x={640} y={355} size={14} color={C.unknown}>y′ = y² (blows up)</T>
    <T x={W / 2} y={428} size={13} color={C.muted}>A toy model. The real question asks which behaviour the fluid equations allow.</T></Stage>;
}

/* ---------- Riemann: counting primes ---------- */
function Primes() {
  const [e, setE] = useState(3); const X = Math.round(10 ** e); const c = primeTable(); const F = frame(0, X, 0, c[X] * 1.15, {x0: 70, y0: 30, w: 670, h: 380});
  const step = Math.max(1, Math.floor(X / 400)); const pts = range(Math.floor(X / step) + 1).map(i => i * step);
  const d = pts.map((x, i) => `${i ? 'L' : 'M'}${F.X(x).toFixed(1)} ${F.Y(c[x]).toFixed(1)}`).join('');
  return <Stage label="Counting primes" controls={<><Slider label="Count up to" value={e} min={2} max={5} step={.1} onChange={setE} format={v => String(Math.round(10 ** v))}/><Readout>primes ≤ {X}: {c[X]} · x/ln x ≈ {fmt(X / Math.log(X), 1)} · Li(x) ≈ {fmt(li(X), 1)}</Readout></>}>
    <Axes f={F} xLabel="x" yLabel="primes ≤ x"/><path d={d} fill="none" stroke={C.ones} strokeWidth={3}/><Curve f={F} fn={x => (x > 1.5 ? x / Math.log(x) : NaN)} color={C.tens} dash="6 4"/><Curve f={F} fn={x => li(x)} color={C.unknown} width={2}/>
    <T x={150} y={60} size={13} color={C.ones} anchor="start">actual count π(x)</T><T x={150} y={82} size={13} color={C.unknown} anchor="start">Li(x): far closer</T><T x={150} y={104} size={13} color={C.tens} anchor="start">x / ln x</T></Stage>;
}

/* ---------- P vs NP: subset sum ---------- */
const PUZZLES: {nums: number[]; target: number}[] = [{nums: [3, 34, 4, 12, 5, 2, 27, 15], target: 46}, {nums: [41, 17, 9, 33, 26, 8, 12, 50, 23, 6], target: 100}, {nums: [71, 38, 15, 64, 29, 47, 92, 11, 56, 83, 24, 37], target: 233}];
function Subset() {
  const [k, setK] = useState(0); const [on, setOn] = useState<number[]>([]); const [shown, setShown] = useState<number[] | null>(null);
  const P = PUZZLES[k], sum = on.reduce((s, i) => s + P.nums[i], 0), n = P.nums.length;
  const next = () => { setK((k + 1) % PUZZLES.length); setOn([]); setShown(null); };
  return <Stage label="Pick numbers that add up to the target" controls={<><Action onClick={next}>Next puzzle</Action><Action onClick={() => setShown(subsetSum(P.nums, P.target))}>Search every subset</Action>
    <Readout>{sum === P.target ? `✓ ${sum} — checking an answer takes one addition.` : `sum ${sum} / target ${P.target}`} · a full search may test 2^{n} = {2 ** n} subsets{shown ? ` · found: ${shown.map(i => P.nums[i]).join(' + ')}` : ''}</Readout></>}>
    <T x={W / 2} y={46} size={22} weight={600}>target {P.target}</T>
    {P.nums.map((v, i) => { const x = 80 + (i % 6) * 110, y = 110 + Math.floor(i / 6) * 90, sel = on.includes(i), hint = shown?.includes(i);
      return <g key={i} role="button" tabIndex={0} aria-pressed={sel} aria-label={`number ${v}`} style={{cursor: 'pointer'}} onClick={() => setOn(sel ? on.filter(j => j !== i) : [...on, i])} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOn(sel ? on.filter(j => j !== i) : [...on, i]); } }}>
        <rect x={x} y={y} width={90} height={64} rx={12} fill={sel ? C.ones : '#232031'} stroke={hint ? C.good : C.line} strokeWidth={hint ? 3 : 1.5}/><T x={x + 45} y={y + 40} size={22} color={sel ? '#15141d' : C.ink} weight={600}>{v}</T></g>; })}
    {[20, 40, 60].map((m, i) => <T key={m} x={W / 2} y={320 + i * 24} size={13} color={C.muted} mono>{`n = ${m}:  2^n ≈ ${(2 ** m).toExponential(1)}   2^(n/2) ≈ ${(2 ** (m / 2)).toExponential(1)}   2^(0.49n) ≈ ${(2 ** (.49 * m)).toExponential(1)}`}</T>)}
    <T x={W / 2} y={410} size={13} color={C.muted}>Faster exponential algorithms help, but are still exponential — P vs NP asks about polynomial time.</T></Stage>;
}

/* ---------- BSD: rational points on y² = x³ − 2 ---------- */
const EA = q(0n); const GEN: ECPoint = {x: q(3n), y: q(5n)};
/** N_p for y² = x³ − 2 at primes 5…59, with the running product ∏ N_p / p. */
const MOD_P_COUNTS = (() => { const s = primeSieve(60), out: {p: number; N: number; prod: number}[] = []; let prod = 1; for (let p = 5; p <= 60; p++) if (s[p]) { const N = pointsModP(0, -2, p); prod *= N / p; out.push({p, N, prod}); } return out; })();
const short = (s: string) => (s.length > 34 ? `${s.slice(0, 14)}…${s.slice(-10)} (${s.replace(/[-/]/g, '').length} digits)` : s);
function Elliptic() {
  const [k, setK] = useState(2); const pts = useMemo(() => { const out: ECPoint[] = [GEN]; for (let i = 1; i < 6; i++) out.push(ecAdd(out[i - 1], GEN, EA)); return out; }, []);
  const F = frame(-1, 7, -16, 16, {x0: 60, y0: 30, w: 430, h: 390}); const P = pts[k - 1]!;
  const counts = MOD_P_COUNTS;
  return <Stage label="Rational points on y² = x³ − 2" controls={<><Stepper label="Point k·P" value={k} min={1} max={6} onChange={setK}/><Readout>{k}P = ({short(qstr(P.x))}, {short(qstr(P.y))})</Readout></>}>
    <Axes f={F}/><Curve f={F} fn={x => (x ** 3 - 2 >= 0 ? Math.sqrt(x ** 3 - 2) : NaN)} color={C.tens}/><Curve f={F} fn={x => (x ** 3 - 2 >= 0 ? -Math.sqrt(x ** 3 - 2) : NaN)} color={C.tens}/>
    {pts.slice(0, k).map((p, i) => p && Math.abs(qnum(p.x)) < 7 && Math.abs(qnum(p.y)) < 16 && <Pt key={i} f={F} x={qnum(p.x)} y={qnum(p.y)} color={i === k - 1 ? C.unknown : C.ones} label={i < 3 ? `${i + 1}P` : undefined}/>)}
    <T x={650} y={40} size={14} weight={600}>Counting mod p</T><T x={650} y={60} size={12} color={C.muted}>points N_p and ∏ N_p / p</T>
    {counts.map((r, i) => <T key={r.p} x={650} y={84 + i * 22} size={13} mono>{`p=${String(r.p).padStart(2)}  N=${String(r.N).padStart(2)}  ${fmt(r.prod, 2)}`}</T>)}
    <T x={650} y={84 + counts.length * 22 + 10} size={12} color={C.muted}>BSD: this product creeps up</T><T x={650} y={84 + counts.length * 22 + 28} size={12} color={C.muted}>when there are infinitely many points.</T></Stage>;
}

/* ---------- Poincaré: loops on a sphere and a doughnut ---------- */
function Loops() {
  const clock = useClock(); const s = (Math.sin(clock.t * .9) + 1) / 2; // 0..1
  const lat = s * .95, ry = 160 * Math.sqrt(1 - lat * lat), cy = 225 - 160 * lat;
  const stuck = .55 + .45 * (1 - s);
  return <Stage label="Can every loop shrink to a point?" controls={<><Action primary onClick={clock.toggle}>{clock.playing ? 'Pause' : 'Play'}</Action><Readout>Sphere: any loop slides off the top and shrinks to a point. Doughnut: a loop around the hole can never shrink.</Readout></>}>
    <defs><radialGradient id="u-front-sph" cx=".35" cy=".3"><stop offset="0" stopColor="#5f5a90"/><stop offset="1" stopColor="#2a2640"/></radialGradient></defs>
    <circle cx={210} cy={225} r={160} fill="url(#u-front-sph)"/><ellipse cx={210} cy={cy} rx={ry} ry={ry * .25} fill="none" stroke={C.ones} strokeWidth={4}/><T x={210} y={430} size={15}>sphere: shrinks ✓</T>
    <ellipse cx={590} cy={225} rx={170} ry={95} fill="#2a2640"/><ellipse cx={590} cy={215} rx={70} ry={26} fill="#15141d"/>
    <ellipse cx={590} cy={225} rx={70 + 60 * stuck} ry={(26 + 40 * stuck)} fill="none" stroke={C.unknown} strokeWidth={4}/><T x={590} y={430} size={15}>doughnut: stuck around the hole ✗</T></Stage>;
}

/* ---------- Hadwiger–Nelson: the Moser spindle ---------- */
const PALETTE = [C.ones, C.tens, C.hundreds, C.unknown];
function Moser() {
  const {pts, edges} = useMemo(() => moserSpindle(), []); const [col, setCol] = useState<number[]>([0, 1, 2, 2, 1, 2, 0]); const [four, setFour] = useState(false);
  const K = 140, X = (p: [number, number]) => 400 + p[0] * K, Y = (p: [number, number]) => 410 - p[1] * K;
  const bad = edges.filter(([a, b]) => col[a] === col[b]); const n = four ? 4 : 3;
  return <Stage label="Colour the Moser spindle" controls={<><Segmented label="Colours" value={four ? '4' : '3'} onChange={v => { setFour(v === '4'); setCol(c => c.map(x => Math.min(x, v === '4' ? 3 : 2))); }} options={[['3', '3 colours'], ['4', '4 colours']]}/><Readout>{bad.length ? `${bad.length} edge${bad.length > 1 ? 's' : ''} join same colours (red).` : properColouring(edges, col) ? '✓ Every unit edge joins different colours.' : ''} {n === 3 ? 'With 3 colours this is impossible — that is why the plane needs at least 4.' : ''}</Readout></>}>
    {edges.map(([a, b], i) => <line key={i} x1={X(pts[a])} y1={Y(pts[a])} x2={X(pts[b])} y2={Y(pts[b])} stroke={col[a] === col[b] ? C.bad : C.muted} strokeWidth={col[a] === col[b] ? 5 : 2.5}/>)}
    {pts.map((p, i) => <circle key={i} cx={X(p)} cy={Y(p)} r={17} fill={PALETTE[col[i]]} stroke="#15141d" strokeWidth={2} role="button" tabIndex={0} aria-label={`point ${i + 1}, colour ${col[i] + 1}`} style={{cursor: 'pointer'}}
      onClick={() => setCol(col.map((c, j) => (j === i ? (c + 1) % n : c)))} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCol(col.map((c, j) => (j === i ? (c + 1) % n : c))); } }}/>)}
    <T x={W / 2} y={30} size={14} color={C.muted}>Every line has length exactly 1. Click a point to change its colour.</T></Stage>;
}

/* ---------- π approximations ---------- */
function PiApprox() {
  const rows = useMemo(() => piConvergents(9).map(([p, d]) => ({p, d, err: piError(p, d)})), []);
  return <Stage label="The best fractions for π" controls={<Readout>Each fraction is the best possible for its size. If the last column, q² × error, stays roughly between 0.001 and 1, the error behaves like 1/q². 355/113 is unusually good, but “exponent 2” says no fraction with a large q can beat 1/q^(2+ε), for any ε &gt; 0.</Readout>}>
    {['fraction p/q', 'value', '|π − p/q|', 'q² × error'].map((h, i) => <T key={h} x={[110, 300, 490, 670][i]} y={40} size={14} color={C.muted} weight={600}>{h}</T>)}
    {rows.map((r, i) => { const v = Number(r.p) / Number(r.d), qq = Number(r.d) ** 2 * r.err; return <g key={i}><T x={110} y={80 + i * 40} size={15} mono>{`${r.p}/${r.d}`}</T><T x={300} y={80 + i * 40} size={15} mono>{v.toFixed(10)}</T><T x={490} y={80 + i * 40} size={15} mono>{r.err.toExponential(2)}</T>
      <rect x={610} y={66 + i * 40} width={clamp(qq * 120, 2, 170)} height={18} rx={4} fill={C.ones} opacity={.7}/><T x={790} y={80 + i * 40} size={13} anchor="end" mono>{qq.toFixed(3)}</T></g>; })}</Stage>;
}

/* ---------- Egyptian fractions ---------- */
function Egypt() {
  const [a, setA] = useState(4), [b, setB] = useState(13); const aa = Math.min(a, b - 1); const terms = egyptianGreedy(BigInt(aa), BigInt(b), 10);
  return <Stage label="Egyptian fractions" controls={<><Stepper label="a" value={aa} min={1} max={b - 1} onChange={setA}/><Stepper label="b" value={b} min={3} max={120} onChange={setB}/><Readout>Greedy method: {terms.length} terms · the largest denominator has {String(terms[terms.length - 1] ?? 0n).length} digits · log log b ≈ {fmt(Math.log(Math.log(b)), 2)}</Readout></>}>
    <T x={W / 2} y={60} size={30} weight={600}>{aa}/{b} =</T>
    {terms.map((d, i) => <T key={i} x={W / 2} y={110 + i * 32} size={i < 4 ? 22 : 16} color={C.ones} mono>{`${i ? '+ ' : ''}1/${String(d).length > 40 ? String(d).slice(0, 18) + '…' + ` (${String(d).length} digits)` : d}`}</T>)}
    <T x={W / 2} y={430} size={13} color={C.muted}>Greedy: always take the largest unit fraction that fits. Try 5/121 — the denominators explode.</T></Stage>;
}

/* ---------- Largest prime factors of n and n + 1 ---------- */
function Lpf() {
  const [e, setE] = useState(3); const N = Math.round(10 ** e); const share = lpfTable(); const l = useMemo(() => largestPrimeFactors(41), []);
  const F = frame(1, 5.3, .3, .7, {x0: 70, y0: 30, w: 400, h: 330}); const xs = range(81).map(i => 1.3 + i * .05);
  const d = xs.map((x, i) => `${i ? 'L' : 'M'}${F.X(x).toFixed(1)} ${F.Y(share[Math.round(10 ** x)]).toFixed(1)}`).join('');
  return <Stage label="Does the largest prime factor rise?" controls={<><Slider label="Check n up to" value={e} min={1.3} max={5.3} step={.05} onChange={setE} format={v => String(Math.round(10 ** v))}/><Readout>For n ≤ {N}: the largest prime factor rises from n to n + 1 in {fmt(share[N] * 100, 2)}% of cases.</Readout></>}>
    <line x1={F.X(1)} x2={F.X(5.3)} y1={F.Y(.5)} y2={F.Y(.5)} stroke={C.good} strokeDasharray="6 4"/><path d={d} fill="none" stroke={C.ones} strokeWidth={3}/><Pt f={F} x={e} y={share[N]}/>
    {[.3, .4, .5, .6, .7].map(v => <T key={v} x={60} y={F.Y(v) + 4} size={11} color={C.faint} anchor="end">{v * 100}%</T>)}{[1, 2, 3, 4, 5].map(v => <T key={v} x={F.X(v)} y={380} size={11} color={C.faint}>10^{v}</T>)}
    <T x={640} y={40} size={14} weight={600}>n → n + 1</T>
    {range(14).map(i => { const n = 10 + i, up = l[n] < l[n + 1]; return <T key={n} x={640} y={66 + i * 24} size={13} mono color={up ? C.good : C.muted}>{`${n}: ${l[n]} → ${l[n + 1]} ${up ? '↑' : '↓'}`}</T>; })}</Stage>;
}

/* ---------- Snaky ---------- */
const SNAKY: [number, number][] = [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [4, 1]];
const ORIENT = (() => { const out: [number, number][][] = []; const seen = new Set<string>();
  for (let r = 0; r < 4; r++) for (const fl of [false, true]) { let s = SNAKY.map(([x, y]) => (fl ? [-x, y] : [x, y]) as [number, number]); for (let i = 0; i < r; i++) s = s.map(([x, y]) => [-y, x]); const mx = Math.min(...s.map(p => p[0])), my = Math.min(...s.map(p => p[1])); s = s.map(([x, y]) => [x - mx, y - my]); const k = s.map(p => p.join(',')).sort().join(';'); if (!seen.has(k)) { seen.add(k); out.push(s); } }
  return out; })();
function findSnaky(maker: Set<string>, cols: number, rows: number): [number, number][] | null {
  for (const o of ORIENT) for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) { const cells = o.map(([a, b]) => [a + x, b + y] as [number, number]); if (cells.every(([a, b]) => maker.has(`${a},${b}`))) return cells; }
  return null;
}
function Snaky() {
  const cols = 16, rows = 7, S = 40, x0 = (W - cols * S) / 2, y0 = 24; const [moves, setMoves] = useState<string[]>([]);
  const maker = new Set(moves.filter((_, i) => i % 2 === 0)), breaker = new Set(moves.filter((_, i) => i % 2 === 1)); const win = findSnaky(maker, cols, rows);
  const winSet = new Set(win?.map(p => p.join(',')) ?? []); const turn = moves.length % 2 === 0 ? 'Maker' : 'Breaker';
  const claim = (k: string) => { if (!win && !moves.includes(k)) setMoves([...moves, k]); };
  return <Stage label="Snaky: a two-player game" controls={<><Action onClick={() => setMoves(moves.slice(0, -1))} disabled={!moves.length}>Undo</Action><Action onClick={() => setMoves([])}>New game</Action><Readout>{win ? `Maker built Snaky in ${maker.size} moves!` : `${turn} to move · Maker ${maker.size} · Breaker ${breaker.size}. Play with a friend — OpenAI’s result claims Maker can always win within 21 moves (on an unlimited board).`}</Readout></>}>
    {range(cols * rows).map(i => { const x = i % cols, y = Math.floor(i / cols), k = `${x},${y}`; const own = maker.has(k) ? 'm' : breaker.has(k) ? 'b' : '';
      return <rect key={k} x={x0 + x * S} y={y0 + y * S} width={S - 3} height={S - 3} rx={6} fill={winSet.has(k) ? C.good : own === 'm' ? C.ones : own === 'b' ? C.tens : '#232031'} stroke={C.line} style={{cursor: own || win ? 'default' : 'pointer'}} role="button" tabIndex={own ? -1 : 0} aria-label={`cell ${x + 1}, ${y + 1}${own === 'm' ? ', Maker' : own === 'b' ? ', Breaker' : ''}`} onClick={() => claim(k)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); claim(k); } }}/>; })}
    <T x={W / 2} y={y0 + rows * S + 26} size={13} color={C.muted}>The target shape, in any rotation or reflection:</T>
    {SNAKY.map(([x, y], i) => <rect key={i} x={W / 2 - 55 + x * 22} y={y0 + rows * S + 34 + (1 - y) * 22} width={20} height={20} rx={3} fill={C.ones}/>)}</Stage>;
}

/* ---------- IMO 2025 P1: sunny lines ---------- */
function Sunny() {
  const [n, setN] = useState(4), [k, setK] = useState<'0' | '1' | '3' | '2'>('3');
  const lines: Line[] = k === '2' ? [] : sunnyConstruction(n, Number(k) as 0 | 1 | 3); const pts = trianglePoints(n);
  const S = Math.min(320 / (n + 1), 60), X = (x: number) => 130 + x * S, Y = (y: number) => 420 - y * S, lo = -.6, hi = n + 1.6;
  const seg = (l: Line) => { const ends: [number, number][] = []; if (l.b !== 0) for (const x of [lo, hi]) { const y = (l.c - l.a * x) / l.b; if (y >= lo - 1e-9 && y <= hi + 1e-9) ends.push([x, y]); } if (l.a !== 0) for (const y of [lo, hi]) { const x = (l.c - l.b * y) / l.a; if (x > lo + 1e-9 && x < hi - 1e-9) ends.push([x, y]); } return ends.slice(0, 2); };
  return <Stage label="Sunny lines" controls={<><Stepper label="n" value={n} min={3} max={7} onChange={setN}/><Segmented label="Sunny lines k" value={k} onChange={setK} options={[['0', '0'], ['1', '1'], ['2', '2?'], ['3', '3']]}/><Readout>{k === '2' ? 'No arrangement has exactly 2 sunny lines (checked by computer search for n = 3, 4, 5; the IMO proof covers every n).' : `${lines.length} lines, ${lines.filter(isSunny).length} sunny · every point covered: ${covers(lines, n) ? 'yes ✓' : 'no'}`}</Readout></>}>
    <line x1={X(0)} x2={X(hi)} y1={Y(0)} y2={Y(0)} stroke={C.faint}/><line x1={X(0)} x2={X(0)} y1={Y(0)} y2={Y(hi)} stroke={C.faint}/>
    {lines.map((l, i) => { const e = seg(l); return e.length === 2 && <line key={i} x1={X(e[0][0])} y1={Y(e[0][1])} x2={X(e[1][0])} y2={Y(e[1][1])} stroke={isSunny(l) ? C.ones : C.muted} strokeWidth={isSunny(l) ? 3.5 : 2} strokeDasharray={isSunny(l) ? undefined : '7 5'}/>; })}
    {pts.map(([x, y]) => <circle key={`${x},${y}`} cx={X(x)} cy={Y(y)} r={7} fill={C.unknown}/>)}
    <T x={640} y={120} size={15} color={C.ones}>── sunny</T><T x={640} y={146} size={15} color={C.muted}>- - not sunny</T><T x={640} y={172} size={13} color={C.muted}>(horizontal, vertical or</T><T x={640} y={190} size={13} color={C.muted}>parallel to x + y = 0)</T></Stage>;
}

/* ---------- IMO 2025 P3: bonza functions ---------- */
const CANDIDATES: [string, string, IntFn][] = [['id', 'f(n) = n', n => n], ['one', 'f(n) = 1', () => 1], ['best', 'extremal example', bonzaExtremal], ['sq', 'f(n) = n²', n => n * n]];
function Bonza() {
  const [c, setC] = useState('best'); const [, label, f] = CANDIDATES.find(x => x[0] === c)!; const v = useMemo(() => bonzaViolation(f, 30), [f]);
  const ratio = Math.max(...range(32).map(i => f(i + 1) / (i + 1)));
  return <Stage label="Test bonza functions" controls={<><Segmented label="Candidate" value={c} onChange={setC} options={CANDIDATES.map(([id, l]) => [id, l] as [string, string])}/><Readout>{label}: {v ? `not bonza — fails at a = ${v[0]}, b = ${v[1]}` : 'passes for every a, b ≤ 30'} · largest f(n)/n for n ≤ 32: {fmt(ratio, 3)}</Readout></>}>
    {range(16).map(i => { const n = i + 1, val = f(n), x = 70 + (i % 8) * 85, y = 70 + Math.floor(i / 8) * 150, r = val / n;
      return <g key={n}><T x={x + 35} y={y} size={13} color={C.muted}>n = {n}</T><rect x={x + 10} y={y + 110 - clamp(r, 0, 4.4) * 22} width={50} height={clamp(r, 0, 4.4) * 22} rx={4} fill={r >= 4 ? C.unknown : C.ones} opacity={.8}/><T x={x + 35} y={y + 128} size={14} mono>{val}</T></g>; })}
    <T x={W / 2} y={420} size={13} color={C.muted}>Bar height = f(n)/n. Condition: f(a) divides bᵃ − f(b)^f(a) for all a, b. Answer: f(n) ≤ 4n always, and 4 is reached.</T></Stage>;
}

/* ---------- IMO 2025 P5: the inekoalaty game ---------- */
function Game() {
  const [lam, setLam] = useState(.75); const res = useMemo(() => inekoalaty(lam, 60), [lam]); const t = res.turns; const n = Math.max(2, t.length);
  const F = frame(0, Math.max(n, 6), 0, Math.max(...t.map(x => Math.max(x.sum, x.squares, lam * x.n)), 4) * 1.1, {x0: 70, y0: 30, w: 670, h: 330});
  const path = (g: (x: typeof t[0]) => number) => t.map((x, i) => `${i ? 'L' : 'M'}${F.X(x.n).toFixed(1)} ${F.Y(g(x)).toFixed(1)}`).join('');
  return <Stage label="The inekoalaty game" controls={<><Slider label="λ" value={lam} min={.5} max={1} step={.005} onChange={setLam}/><Readout>λ = {lam.toFixed(3)} (1/√2 ≈ 0.707) · {res.winner ? `${res.winner} wins on turn ${t.length + 1}` : `no winner in ${t.length} turns`}</Readout></>}>
    <Axes f={F} xLabel="turn n" yLabel=""/><Curve f={F} fn={x => lam * x} color={C.ones} dash="6 4"/><Curve f={F} fn={x => x} color={C.tens} dash="6 4"/>
    <path d={path(x => x.sum)} fill="none" stroke={C.ones} strokeWidth={3}/><path d={path(x => x.squares)} fill="none" stroke={C.tens} strokeWidth={3}/>
    <T x={110} y={50} size={13} color={C.ones} anchor="start">sum x₁ + … + xₙ (Alice must keep it ≤ λn, dashed)</T><T x={110} y={72} size={13} color={C.tens} anchor="start">sum of squares (Bazza must keep it ≤ n, dashed)</T>
    <T x={W / 2} y={420} size={13} color={C.muted}>Both play the known optimal strategies. Slide λ across 1/√2 and watch the winner change.</T></Stage>;
}

/* ---------- IMO 2025 P4: three largest proper divisors ---------- */
function Divisors() {
  const [a, setA] = useState(72); const run = divisorSequence(a, 30); const ok = imoP4Answer(a);
  return <Stage label="Three largest proper divisors" controls={<><Stepper label="a₁" value={a} min={6} max={5000} onChange={setA}/>{[30, 72, 216, 1000, 1872].map(v => <Action key={v} onClick={() => setA(v)}>{v}</Action>)}<Readout>{run.fate === 'cycle' ? 'The sequence settles and continues forever ✓' : run.fate === 'stuck' ? 'Stuck: a term has fewer than 3 proper divisors ✗' : 'Still running'} · formula 6·12ᵉ·m (m not divisible by 2 or 5) says: {ok ? 'valid' : 'not valid'}</Readout></>}>
    {run.terms.slice(0, 10).map((v, i) => { const t = threeLargestProperDivisors(v); return <T key={i} x={W / 2} y={44 + i * 38} size={17} mono color={i === 0 ? C.unknown : C.ink}>{`a${i + 1} = ${v}${t ? `   → ${t.join(' + ')} = ${t[0] + t[1] + t[2]}` : '   (fewer than 3 proper divisors)'}`}</T>; })}</Stage>;
}

export const EXPLORERS: Record<ExplorerId, () => ReactNode> = {
  blowup: Blowup, primes: Primes, subset: Subset, elliptic: Elliptic, loops: Loops, moser: Moser, pi: PiApprox, egypt: Egypt, lpf: Lpf, snaky: Snaky,
  sunny: Sunny, bonza: Bonza, game: Game, divisors: Divisors,
};

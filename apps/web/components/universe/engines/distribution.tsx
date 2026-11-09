'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Stepper, Action} from '../stage';
import {distribution, binom, WHEEL, EX, VX, FACT, type DistConfig} from '@/lib/universe/engines/distribution';
import {Cnk} from '@/lib/universe/engines/combin';
import {eseg, fix, fmt, rng} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

function Bars({ps, labels, hi, mean, base = 390, maxH = 250}: {ps: number[]; labels: string[]; hi?: (i: number) => boolean; mean?: number; base?: number; maxH?: number}) {
  const m = Math.max(...ps, .01), n = ps.length, bw = Math.min(70, 660 / n), x0 = W / 2 - (n * bw) / 2;
  return <g><line x1={x0 - 10} x2={x0 + n * bw + 10} y1={base} y2={base} stroke={C.muted}/>{ps.map((p, i) => { const h = (p / m) * maxH; return <g key={i}><rect x={x0 + i * bw + 3} y={base - h} width={bw - 6} height={h} fill={hi?.(i) ? C.ones : C.tens} opacity={.75}/><T x={x0 + i * bw + bw / 2} y={base + 18} size={12} color={C.muted}>{labels[i]}</T>{bw > 40 && <T x={x0 + i * bw + bw / 2} y={base - h - 8} size={11}>{fmt(p, 3)}</T>}</g>; })}
    {mean !== undefined && <path d={`M${x0 + (mean + .5) * bw} ${base + 4} l-12 22 h24 z`} fill={C.unknown}/>}</g>;
}
function Galton({rows, balls, seed = 4}: {rows: number; balls: number; seed?: number}) {
  const R = rng(seed), bins = Array(rows + 1).fill(0) as number[]; for (let b = 0; b < balls; b++) { let k = 0; for (let i = 0; i < rows; i++) if (R() < .5) k++; bins[k]++; }
  const dx = 640 / (rows + 1), x0 = 80; const exp = range(rows + 1).map(k => binom(rows, .5, k) * balls); const m = Math.max(...exp) * 1.25;
  return <g>{range(rows).map(r => range(r + 1).map(k => <circle key={r + '-' + k} cx={W / 2 + (k - r / 2) * dx} cy={40 + r * (150 / rows)} r={3} fill={C.muted}/>))}
    {bins.map((b, k) => <g key={k}>{range(Math.min(b, 60)).map(j => <circle key={j} cx={x0 + k * dx + dx / 2} cy={410 - j * (200 / (m || 1)) - 4} r={Math.min(5, dx / 3)} fill={C.ones}/>)}</g>)}
    <path d={range(121).map(i => { const x = (i / 120) * rows; const z = (x - rows / 2) / Math.sqrt(rows / 4); const y = (balls / Math.sqrt(2 * Math.PI * rows / 4)) * Math.exp(-z * z / 2); return `${i ? 'L' : 'M'}${x0 + x * dx + dx / 2} ${410 - y * (200 / (m || 1))}`; }).join('')} fill="none" stroke={C.unknown} strokeWidth={2} opacity={balls > 50 ? 1 : 0}/></g>;
}
const PAIRS = ['R₁R₂', 'R₁R₃', 'R₂R₃', 'R₁B₁', 'R₁B₂', 'R₂B₁', 'R₂B₂', 'R₃B₁', 'R₃B₂', 'B₁B₂'];

function Scene({c, scene, p}: {c: DistConfig; scene: number; p: number}) {
  const t = scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .9) : 1;
  switch (c.mode) {
    case 'classical': return <g>{range(5).map(i => <circle key={i} cx={200 + i * 60} cy={70} r={20} fill={i < 3 ? C.bad : C.accent}/>)}{PAIRS.map((s, i) => <g key={s} opacity={i < Math.ceil(t * 10) ? 1 : 0}><rect x={110 + (i % 5) * 120} y={150 + Math.floor(i / 5) * 80} width={100} height={56} rx={10} fill={scene >= 3 && i < 3 ? C.ones : '#2a2638'} stroke={C.line}/><T x={160 + (i % 5) * 120} y={184 + Math.floor(i / 5) * 80} size={18} color={scene >= 3 && i < 3 ? '#15141d' : C.ink}>{s}</T></g>)}{scene >= 4 && <T x={W / 2} y={380} size={24} weight={600} color={C.good}>P(both red) = 3/10</T>}</g>;
    case 'independence': { const S = 300, x0 = 250, y0 = 80; return <g><rect x={x0} y={y0} width={S} height={S} fill="#2a2638" stroke={C.line}/><rect x={x0} y={y0} width={S * c.p * t} height={S} fill={C.ones} opacity={.3}/><rect x={x0} y={y0} width={S} height={S * c.q * (scene >= 3 ? 1 : 0)} fill={C.tens} opacity={.3}/>{scene >= 3 && <rect x={x0} y={y0} width={S * c.p} height={S * c.q} fill={C.unknown} opacity={.55}/>}
      <T x={x0 + (S * c.p) / 2} y={y0 - 12} size={14} color={C.ones}>A hits {c.p}</T><T x={x0 - 12} y={y0 + (S * c.q) / 2} size={14} color={C.tens} anchor="end">B hits {c.q}</T>{scene >= 3 && <T x={x0 + (S * c.p) / 2} y={y0 + (S * c.q) / 2} size={16} color="#15141d" weight={700}>{fix(c.p * c.q)}</T>}</g>; }
    case 'conditional': { const paths = [['A', FACT.a, 'faulty', FACT.da], ['A', FACT.a, 'ok', 1 - FACT.da], ['B', FACT.b, 'faulty', FACT.db], ['B', FACT.b, 'ok', 1 - FACT.db]] as const; const tot = FACT.a * FACT.da + FACT.b * FACT.db;
      return <g><circle cx={90} cy={225} r={8} fill={C.ink}/>{[0, 1].map(i => { const y = 130 + i * 190; return <g key={i}><line x1={90} y1={225} x2={300} y2={y} stroke={C.ones} strokeWidth={2} opacity={t > 0 ? 1 : .2}/><T x={190} y={(225 + y) / 2 - 10} size={14} color={C.ones}>{i ? FACT.b : FACT.a}</T><T x={315} y={y + 5} size={16} anchor="start">{i ? 'B' : 'A'}</T></g>; })}
        {paths.map(([f, pf, d, pd], i) => { const y1 = 130 + (f === 'B' ? 190 : 0), y2 = 80 + i * 95; const fault = d === 'faulty'; return <g key={i} opacity={scene >= 2 ? Math.min(1, t * 2 - .5) : 0}><line x1={340} y1={y1} x2={540} y2={y2} stroke={fault ? C.bad : C.muted} strokeWidth={fault && scene >= 3 ? 4 : 2}/><T x={440} y={(y1 + y2) / 2 - 8} size={13}>{fmt(pd, 3)}</T><T x={555} y={y2 + 5} size={14} anchor="start" color={fault ? C.bad : C.muted}>{d}: {fmt(pf * pd, 3)}</T></g>; })}
        {scene >= 3 && <T x={W / 2} y={430} size={17}>P(faulty) = {fix(tot)}{scene >= 4 ? ` · P(B | faulty) = ${fmt((FACT.b * FACT.db) / tot, 3)}` : ''}</T>}</g>; }
    case 'expectation': return <g><Bars ps={WHEEL.map(w => w[1] * (scene >= 2 ? 1 : .2))} labels={WHEEL.map(w => '¥' + w[0])}/>{scene >= 3 && <T x={W / 2} y={60} size={20} weight={600}>E(X) = {fmt(EX, 2)}</T>}{scene >= 4 && <T x={W / 2} y={92} size={16} color={C.muted}>D(X) = {fmt(VX, 2)}</T>}</g>;
    case 'normal': return <g><Galton rows={c.n} balls={scene < 2 ? 0 : scene === 2 ? Math.round(400 * p) : 400}/>{scene >= 4 && <T x={W / 2} y={230} size={16} color={C.unknown}>68.3% · 95.4% · 99.7% within 1σ, 2σ, 3σ</T>}</g>;
    default: { const ps = range(c.n + 1).map(k => binom(c.n, c.p, k)); return <g><Bars ps={ps.map(v => v * (scene >= 3 ? 1 : scene === 2 ? .3 : 0.05))} labels={range(c.n + 1).map(String)} hi={k => scene >= 3 && k === Math.round(c.n * c.p)}/>{scene >= 3 && <T x={W / 2} y={50} size={17}>P(X = k) = C({c.n}, k)·{c.p}^k·{fix(1 - c.p)}^({c.n} − k)</T>}{scene >= 4 && <T x={W / 2} y={80} size={17} color={C.good}>E(X) = np = {fmt(c.n * c.p)}</T>}</g>; }
  }
}

function Explore({c}: {c: DistConfig}) {
  const [n, setN] = useState(c.n), [p, setP] = useState(c.p), [q, setQ] = useState(c.q), [seed, setSeed] = useState(4), [balls, setBalls] = useState(200);
  switch (c.mode) {
    case 'binomial': { const ps = range(n + 1).map(k => binom(n, p, k)); return <Stage label="B(n, p)" controls={<><Stepper label="n" value={n} min={1} max={16} onChange={setN}/><Slider label="p" value={p} min={.05} max={.95} step={.05} onChange={setP}/><Readout>E = {fmt(n * p, 2)} · D = {fmt(n * p * (1 - p), 3)} · C({n}, ⌊np⌋) = {Cnk(n, Math.floor(n * p))}</Readout></>}><Bars ps={ps} labels={range(n + 1).map(String)} mean={n * p}/></Stage>; }
    case 'normal': return <Stage label="Galton board" controls={<><Stepper label="Rows" value={n} min={4} max={16} onChange={setN}/><Slider label="Balls" value={balls} min={10} max={600} step={10} onChange={setBalls}/><Action onClick={() => setSeed(seed + 1)}>Drop again</Action><Readout>μ = {n / 2}, σ = {fmt(Math.sqrt(n) / 2, 3)}</Readout></>}><Galton rows={n} balls={balls} seed={seed}/></Stage>;
    case 'independence': return <Stage label="Area model" controls={<><Slider label="P(A)" value={p} min={0} max={1} step={.05} onChange={setP}/><Slider label="P(B)" value={q} min={0} max={1} step={.05} onChange={setQ}/><Readout>P(AB) = {fmt(p * q, 4)} · P(A ∪ B) = {fmt(p + q - p * q, 4)} · P(neither) = {fmt((1 - p) * (1 - q), 4)}</Readout></>}><Scene c={{...c, p, q}} scene={4} p={1}/></Stage>;
    default: return <Stage label="Explore" controls={<><Stepper label="Step" value={seed > 6 ? 6 : seed} min={2} max={6} onChange={setSeed}/><Readout>Step through the model at your own pace.</Readout></>}><Scene c={c} scene={Math.min(6, seed)} p={1}/></Stage>;
  }
}

export const distributionView: EngineView<DistConfig> = {Scene: props => <Stage label={distribution.describe(props.c)}><Scene {...props}/></Stage>, Explore};

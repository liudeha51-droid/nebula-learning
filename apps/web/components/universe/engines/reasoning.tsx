'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Stepper, Segmented, Obj} from '../stage';
import {reasoning, trees, CODES, type ReasonConfig} from '@/lib/universe/engines/reasoning';
import {eseg, fmt, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const COLS = [C.ones, C.tens, C.hundreds, C.thousands, C.accent];
function Code({kind, split}: {kind: ReasonConfig['kind']; split: boolean}) {
  const k = CODES[kind]; const n = k.code.length; const cw = Math.min(46, 700 / n); const starts = k.parts.map((_, i) => k.parts.slice(0, i).reduce((s, [d]) => s + d.length, 0));
  return <g>{k.parts.map(([d, m], pi) => { const start = starts[pi]; return <g key={pi}>{d.split('').map((ch, i) => { const x = W / 2 - (n * cw) / 2 + (start + i) * cw + (split ? (pi - (k.parts.length - 1) / 2) * 16 : 0); return <g key={i}><rect x={x} y={160} width={cw - 4} height={60} rx={6} fill={split ? COLS[pi] : C.panel} opacity={split ? .8 : 1} stroke={C.line}/><T x={x + (cw - 4) / 2} y={190} size={26} weight={700} color={split ? '#15141d' : C.ink}>{ch}</T></g>; })}
    {split && <T x={W / 2 - (n * cw) / 2 + (start + d.length / 2) * cw + (pi - (k.parts.length - 1) / 2) * 16} y={250 + (pi % 2) * 26} size={13} color={COLS[pi]}>{m}</T>}</g>; })}</g>;
}
function Road({length, gap, ends, shown = 1}: {length: number; gap: number; ends: ReasonConfig['ends']; shown?: number}) {
  const g = length / gap; const X = (k: number) => 100 + (k / g) * 600; const list = range(g + 1).filter(k => ends === 'both' || (ends === 'one' && k > 0) || (ends === 'none' && k > 0 && k < g) || (ends === 'loop' && k < g));
  return <g><rect x={100} y={250} width={600} height={24} fill="#4b4560"/>{range(g).map(k => <T key={k} x={(X(k) + X(k + 1)) / 2} y={295} size={12} color={C.muted}>{gap} m</T>)}
    {list.slice(0, Math.ceil(shown * list.length)).map(k => <g key={k}><rect x={X(k) - 3} y={210} width={6} height={40} fill="#7a5a3a"/><circle cx={X(k)} cy={200} r={18} fill="#5fbf7a"/></g>)}</g>;
}
function LogicGrid({marks}: {marks: Record<string, '✓' | '✗'>}) {
  const people = ['A', 'B', 'C'], pets = ['cat', 'dog', 'fish'];
  return <g>{pets.map((p, j) => <T key={p} x={340 + j * 90} y={110} size={16} color={C.muted}>{p}</T>)}{people.map((p, i) => <g key={p}><T x={270} y={160 + i * 70} size={18}>{p}</T>{pets.map((q, j) => <g key={q}><rect x={300 + j * 90} y={130 + i * 70} width={80} height={60} rx={8} fill={C.panel} stroke={C.line}/><T x={340 + j * 90} y={160 + i * 70} size={26} color={marks[p + q] === '✓' ? C.good : C.bad}>{marks[p + q] ?? ''}</T></g>)}</g>)}</g>;
}
function Farm({heads, rabbits, t = 1}: {heads: number; rabbits: number; t?: number}) {
  return <g>{range(heads).map(i => { const isR = i < rabbits; const x = 90 + (i % 10) * 64, y = 180 + Math.floor(i / 10) * 100; return <g key={i}><Obj kind={isR ? 'rabbit' : 'chick'} x={x} y={y} r={22} color={isR ? '#e6dcf2' : '#f7e08a'} opacity={t}/>{range(isR ? 4 : 2).map(l => <line key={l} x1={x - 12 + l * (isR ? 8 : 24)} x2={x - 12 + l * (isR ? 8 : 24)} y1={y + 22} y2={y + 42} stroke={isR ? C.accent : C.ones} strokeWidth={3}/>)}</g>; })}</g>;
}

function Scene({c, scene, p}: {c: ReasonConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'code': return <g><Code kind={c.kind} split={scene >= 2}/><T x={W / 2} y={70} size={22} weight={600}>{scene >= 4 ? 'position carries meaning' : CODES[c.kind].code}</T></g>;
    case 'planting': { const show = scene < 2 ? 0 : scene === 2 ? p : 1; const cases: ReasonConfig['ends'][] = ['both', 'one', 'none', 'loop']; const ends = scene === 3 ? cases[Math.min(3, Math.floor(p * 4))] : c.ends;
      return <g><Road length={c.length} gap={c.gap} ends={ends} shown={show}/><T x={W / 2} y={60} size={22} weight={600}>{scene >= 2 ? `${ends === 'loop' ? 'closed loop' : ends === 'both' ? 'both ends' : ends === 'one' ? 'one end' : 'no ends'}: ${trees(c.length, c.gap, ends)} trees, ${c.length / c.gap} gaps` : `${c.length} m, every ${c.gap} m`}</T></g>; }
    case 'logic': { const m: Record<string, '✓' | '✗'> = {}; if (scene >= 2) Object.assign(m, {Acat: '✗', Adog: '✗', Afish: '✓', Bfish: '✗', Cfish: '✗'}); if (scene >= 3) Object.assign(m, {Bdog: '✗', Bcat: '✓', Ccat: '✗'}); if (scene >= 4) m.Cdog = '✓';
      return <g><LogicGrid marks={m}/><T x={W / 2} y={50} size={18} color={C.muted}>A: no furry pet · B: not the dog</T></g>; }
    case 'pigeonhole': { const placed = scene < 2 ? 0 : scene === 2 ? Math.ceil(p * c.boxes) : scene === 3 ? c.boxes + Math.ceil(p * (c.items - c.boxes)) : c.items;
      return <g>{range(c.boxes).map(b => <rect key={b} x={120 + b * (560 / c.boxes)} y={220} width={560 / c.boxes - 20} height={110} rx={8} fill="none" stroke={C.line} strokeWidth={2}/>)}
        {range(placed).map(i => { const b = i % c.boxes, k = Math.floor(i / c.boxes); return <rect key={i} x={140 + b * (560 / c.boxes)} y={300 - k * 30} width={40} height={22} rx={3} fill={k > 0 ? C.unknown : C.ones}/>; })}
        <T x={W / 2} y={70} size={22} weight={600}>{placed} letters placed{scene >= 4 ? ` — some box has ${Math.ceil(c.items / c.boxes)}` : ''}</T></g>; }
    case 'combinations': { const pts = range(c.n).map(i => [W / 2 + 150 * Math.cos(i / c.n * 2 * Math.PI - Math.PI / 2), 240 + 150 * Math.sin(i / c.n * 2 * Math.PI - Math.PI / 2)]); const pairs = range(c.n).flatMap(i => range(c.n).filter(j => j > i).map(j => [i, j])); const shown = scene < 2 ? 0 : scene === 2 ? Math.ceil(p * pairs.length) : pairs.length;
      return <g>{pairs.slice(0, shown).map(([i, j], k) => <line key={k} x1={pts[i][0]} y1={pts[i][1]} x2={pts[j][0]} y2={pts[j][1]} stroke={COLS[i % 5]} strokeWidth={2} opacity={.7}/>)}{pts.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={18} fill={COLS[i % 5]}/><T x={x} y={y} size={14} color="#15141d" weight={700}>{String.fromCharCode(65 + i)}</T></g>)}
        <T x={W / 2} y={40} size={22} weight={600}>{shown} handshake{shown === 1 ? '' : 's'}{scene >= 4 ? ` = ${c.n} × ${c.n - 1} ÷ 2` : ''}</T></g>; }
    case 'work': { const day = scene < 2 ? 0 : scene === 2 ? 1 : scene === 3 ? 1 + p * (1 / (1 / c.a + 1 / c.b) - 1) : 1 / (1 / c.a + 1 / c.b);
      const bar = (y: number, frac: number, label: string, col: string) => <g><rect x={150} y={y} width={500} height={34} rx={6} fill="#1f1d2b" stroke={C.line}/><rect x={150} y={y} width={500 * Math.min(1, frac)} height={34} rx={6} fill={col} opacity={.8}/><T x={140} y={y + 17} size={14} anchor="end">{label}</T></g>;
      return <g>{bar(130, day / c.a, 'A alone', C.ones)}{bar(190, day / c.b, 'B alone', C.tens)}{scene >= 3 && bar(270, day * (1 / c.a + 1 / c.b), 'together', C.hundreds)}<T x={W / 2} y={60} size={22} weight={600}>day {fmt(day, 2)}{scene >= 3 ? ` · together ${fmt(Math.min(1, day * (1 / c.a + 1 / c.b)) * 100, 0)}% done` : ''}</T></g>; }
    case 'travel': { const tm = c.distance / (c.v1 + c.v2); const t = scene < 2 ? 0 : scene === 2 ? Math.min(1, tm) * eseg(p, 0, 1) : scene === 3 ? lerp(Math.min(1, tm), tm, eseg(p, 0, 1)) : tm; const X = (km: number) => 80 + (km / c.distance) * 640;
      return <g><line x1={80} x2={720} y1={240} y2={240} stroke={C.muted} strokeWidth={6}/><g transform={`translate(${X(c.v1 * t)} 220)`}><rect x={-26} y={-12} width={52} height={22} rx={6} fill={C.thousands}/></g><g transform={`translate(${X(c.distance - c.v2 * t)} 220)`}><rect x={-26} y={-12} width={52} height={22} rx={6} fill={C.accent}/></g>
        <T x={X(c.v1 * t)} y={280} size={13} color={C.thousands}>{fmt(c.v1 * t, 0)} km</T><T x={X(c.distance - c.v2 * t)} y={300} size={13} color={C.accent}>{fmt(c.v2 * t, 0)} km</T><T x={W / 2} y={60} size={22} weight={600}>t = {fmt(t, 2)} h · gap {fmt(Math.max(0, c.distance - (c.v1 + c.v2) * t), 0)} km</T></g>; }
    case 'optimize': { const half = c.perimeter / 2; const opts = range(Math.floor(half / 2)).map(i => i + 1); const k = scene < 2 ? 0 : scene === 2 ? Math.min(opts.length - 1, Math.floor(p * opts.length)) : opts.length - 1; const w = opts[k], l = half - w;
      return <g><rect x={80} y={330 - w * 20} width={l * 20} height={w * 20} fill={C.tens} opacity={.35} stroke={C.tens} strokeWidth={3}/><T x={80 + l * 10} y={330 - w * 20 - 16} size={15}>{l} × {w} = {l * w}</T>
        {scene >= 3 && opts.map((ww, i) => <g key={i}><rect x={500 + i * 44} y={330 - (half - ww) * ww * 3} width={34} height={(half - ww) * ww * 3} fill={i === opts.length - 1 ? C.ones : C.hundreds}/><T x={517 + i * 44} y={346} size={11} color={C.muted}>{ww}</T></g>)}<T x={W / 2} y={50} size={22} weight={600}>perimeter {c.perimeter}: {scene >= 4 ? `square ${half / 2} × ${half / 2} = ${(half / 2) ** 2}` : 'which is biggest?'}</T></g>; }
    default: { const rabbits = (c.legs - 2 * c.heads) / 2; const swapped = scene < 2 ? -1 : scene === 2 ? 0 : scene === 3 ? Math.round(p * rabbits) : rabbits; const legs = 2 * c.heads + 2 * Math.max(0, swapped);
      return <g>{swapped >= 0 ? <Farm heads={c.heads} rabbits={swapped}/> : <Farm heads={c.heads} rabbits={rabbits}/>}<T x={W / 2} y={60} size={22} weight={600}>{swapped < 0 ? `${c.heads} heads, ${c.legs} legs` : `${swapped} rabbit${swapped === 1 ? '' : 's'}: ${legs} legs ${legs === c.legs ? '✓' : `(need ${c.legs})`}`}</T>
        {scene >= 5 && <T x={W / 2} y={420} size={18} color={C.accent}>2x + 4({c.heads} − x) = {c.legs} → x = {c.heads - rabbits} chickens</T>}</g>; }
  }
}

function Explore({c}: {c: ReasonConfig}) {
  const [v1, setV1] = useState(0); const [v2, setV2] = useState(0); const [ends, setEnds] = useState(c.ends);
  switch (c.mode) {
    case 'chicken-rabbit': return <Stage label="Swap animals" controls={<><Slider label="Rabbits" value={v1} min={0} max={c.heads} onChange={setV1}/><Readout>{v1} rabbits + {c.heads - v1} chickens = {4 * v1 + 2 * (c.heads - v1)} legs {4 * v1 + 2 * (c.heads - v1) === c.legs ? '✓ matches!' : `(target ${c.legs})`}</Readout></>}><Farm heads={c.heads} rabbits={v1}/></Stage>;
    case 'planting': return <Stage label="Planting" controls={<><Segmented label="Ends" value={ends} onChange={setEnds} options={[['both', 'Both ends'], ['one', 'One end'], ['none', 'No ends'], ['loop', 'Loop']]}/><Readout>{c.length / c.gap} gaps → {trees(c.length, c.gap, ends)} trees</Readout></>}><Road length={c.length} gap={c.gap} ends={ends}/></Stage>;
    case 'combinations': { const n = v1 || c.n; return <Stage label="Handshakes" controls={<><Stepper label="People" value={n} min={2} max={9} onChange={setV1}/><Readout>{n} people → {n * (n - 1) / 2} handshakes · arrangements in a row: {range(n).reduce((s, i) => s * (i + 1), 1)}</Readout></>}><Scene c={{...c, n}} scene={4} p={1}/></Stage>; }
    case 'pigeonhole': { const items = v1 || c.items, boxes = v2 || c.boxes; return <Stage label="Pigeonhole" controls={<><Stepper label="Letters" value={items} min={boxes + 1} max={30} onChange={setV1}/><Stepper label="Boxes" value={boxes} min={2} max={8} onChange={setV2}/><Readout>some box must hold at least ⌈{items} ÷ {boxes}⌉ = {Math.ceil(items / boxes)}</Readout></>}><Scene c={{...c, items, boxes}} scene={4} p={1}/></Stage>; }
    case 'work': { const a = v1 || c.a, b = v2 || c.b; return <Stage label="Work rate" controls={<><Stepper label="A days" value={a} min={1} max={20} onChange={setV1}/><Stepper label="B days" value={b} min={1} max={20} onChange={setV2}/><Readout>together: 1 ÷ (1/{a} + 1/{b}) = {fmt(1 / (1 / a + 1 / b), 2)} days</Readout></>}><Scene c={{...c, a, b}} scene={4} p={1}/></Stage>; }
    case 'travel': { const s1 = v1 || c.v1, s2 = v2 || c.v2; return <Stage label="Travel" controls={<><Slider label="Speed A" value={s1} min={10} max={120} step={10} onChange={setV1}/><Slider label="Speed B" value={s2} min={10} max={120} step={10} onChange={setV2}/><Readout>meet after {c.distance} ÷ {s1 + s2} = {fmt(c.distance / (s1 + s2), 2)} h</Readout></>}><Scene c={{...c, v1: s1, v2: s2}} scene={4} p={1}/></Stage>; }
    case 'optimize': { const half = c.perimeter / 2; const w = v1 || 1; return <Stage label="Optimize" controls={<><Slider label="Width" value={w} min={1} max={half - 1} onChange={setV1}/><Readout>{half - w} × {w} = {(half - w) * w} m² {w === half / 2 ? '— the maximum!' : ''}</Readout></>}><rect x={100} y={330 - w * 20} width={(half - w) * 20} height={w * 20} fill={C.tens} opacity={.35} stroke={C.tens} strokeWidth={3}/></Stage>; }
    default: return <Stage label={reasoning.describe(c)} controls={<Readout>Step through the reasoning in Observe; here is the finished picture.</Readout>}><Scene c={c} scene={4} p={1}/></Stage>;
  }
}

export const reasoningView: EngineView<ReasonConfig> = {Scene: props => <Stage label={reasoning.describe(props.c)}><Scene {...props}/></Stage>, Explore};

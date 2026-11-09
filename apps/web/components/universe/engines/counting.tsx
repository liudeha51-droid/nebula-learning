'use client';
import {useMemo, useState} from 'react';
import {Stage, Obj, T, C, W, Block, Stepper, Slider, Action, Readout, Segmented, useSound} from '../stage';
import {counting, ordinal, numberWord, type CountingConfig} from '@/lib/universe/engines/counting';
import {eseg, lerp, rng, seg} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

function scatter(n: number, seed: number, box = {x: 110, y: 90, w: 580, h: 210}) {
  const r = rng(seed); const cols = Math.ceil(Math.sqrt(n * 2)); const rows = Math.ceil(n / cols);
  return range(n).map(i => ({x: box.x + ((i % cols) + .5) * box.w / cols + (r() - .5) * 40, y: box.y + (Math.floor(i / cols) + .5) * box.h / rows + (r() - .5) * 30}));
}
const rowPos = (n: number, i: number, y = 210, gap = 58) => ({x: W / 2 + (i - (n - 1) / 2) * gap, y});

function NumberLine({value, max = 10, y = 395, highlight = C.ones}: {value: number; max?: number; y?: number; highlight?: string}) {
  const x0 = 100, x1 = 700, step = (x1 - x0) / max;
  return <g><line x1={x0 - 15} x2={x1 + 15} y1={y} y2={y} stroke={C.muted} strokeWidth={2}/>
    {range(max + 1).map(i => <g key={i}><line x1={x0 + i * step} x2={x0 + i * step} y1={y - 7} y2={y + 7} stroke={C.muted}/><T x={x0 + i * step} y={y + 22} size={13} color={i === Math.round(value) ? highlight : C.muted}>{i}</T></g>)}
    <circle cx={x0 + value * step} cy={y} r={9} fill={highlight}/></g>;
}
function TenFrame({x, y, filled, cell = 52, color = C.ones}: {x: number; y: number; filled: number; cell?: number; color?: string}) {
  return <g>{range(10).map(i => <g key={i}><rect x={x + (i % 5) * cell} y={y + Math.floor(i / 5) * cell} width={cell} height={cell} fill="none" stroke={C.line} strokeWidth={2}/>{i < filled && <circle cx={x + (i % 5 + .5) * cell} cy={y + (Math.floor(i / 5) + .5) * cell} r={cell * .32} fill={color}/>}</g>)}</g>;
}

function CountScene({c, scene, p}: {c: CountingConfig; scene: number; p: number}) {
  const pts = useMemo(() => scatter(c.n, 7 + c.n), [c.n]);
  const k = scene === 2 ? Math.min(c.n, Math.floor(p * (c.n + .6))) : scene > 2 ? c.n : 0;
  const lineUp = scene === 3 ? eseg(p, .1, .7) : scene > 3 ? 1 : 0;
  return <>
    {scene === 5 ? <g><T x={210} y={170} size={120} color={C.ones} weight={700}>{c.n}</T><T x={210} y={265} size={26} color={C.muted}>{numberWord(c.n)}</T><TenFrame x={380} y={125} filled={c.n}/></g>
      : scene === 6 ? <g>{scatter(c.n === 10 ? 6 : c.n + 1, 99).map((q, i) => <Obj key={i} kind={c.object} x={q.x} y={q.y} color={C.accent}/>)}<T x={W / 2} y={340} size={30} color={C.accent}>How many now?</T></g>
      : pts.map((q, i) => { const target = rowPos(c.n, i); const dropIn = scene === 0 ? .2 + .8 * eseg(p, i * .06, i * .06 + .45) : 1; const x = lerp(q.x, target.x, lineUp), y = lerp(q.y, target.y, lineUp) - (1 - dropIn) * 260;
        return <g key={i}><Obj kind={c.object} x={x} y={y} glow={i < k} opacity={dropIn} color={i < k ? C.ones : '#d9c79c'}/>{i < k && <T x={x} y={y - 32} size={16} color={C.ones} weight={700}>{i + 1}</T>}</g>; })}
    {scene === 1 && <T x={W / 2} y={340} size={42} color={C.accent} opacity={.5 + .5 * Math.sin(p * 12)}>?</T>}
    {(scene === 3 || scene === 4) && <T x={W / 2} y={300} size={scene === 4 ? 46 : 22} color={C.ones} weight={700} opacity={scene === 3 ? seg(p, .6, .9) : 1}>{scene === 4 ? `${c.n} ${c.object}s` : `still ${c.n}`}</T>}
    {scene >= 2 && scene <= 4 && <NumberLine value={k}/>}
  </>;
}
function CountExplore({c}: {c: CountingConfig}) {
  const sound = useSound();
  const [n, setN] = useState(c.n); const [seed, setSeed] = useState(1); const [order, setOrder] = useState<number[]>([]);
  const pts = useMemo(() => scatter(n, seed * 31 + n), [n, seed]);
  const tap = (i: number) => { if (order.includes(i)) return; const next = [...order, i]; setOrder(next); sound(next.length === n ? 'success' : 'tick'); };
  return <Stage label={`Tap each ${c.object} once to count. ${order.length} of ${n} counted.`} controls={<>
    <Stepper label="Objects" value={n} min={1} max={10} onChange={v => { setN(v); setOrder([]); }}/>
    <Action onClick={() => { setSeed(seed + 1); }}>Move them around</Action><Action onClick={() => setOrder([])}>Count again</Action>
    <Readout>{order.length === n ? `All counted: ${n} ${c.object}s. Moving them does not change the number.` : `Counted ${order.length}. Tap the next one.`}</Readout></>}>
    {pts.map((q, i) => { const idx = order.indexOf(i); return <g key={i}><Obj kind={c.object} x={q.x} y={q.y} glow={idx >= 0} color={idx >= 0 ? C.ones : '#d9c79c'} onClick={() => tap(i)} label={`${c.object} ${i + 1}${idx >= 0 ? ', counted as ' + (idx + 1) : ''}`}/>{idx >= 0 && <T x={q.x} y={q.y - 32} size={16} color={C.ones} weight={700}>{idx + 1}</T>}</g>; })}
    <NumberLine value={order.length}/>
  </Stage>;
}

function TeenScene({c, scene, p}: {c: CountingConfig; scene: number; p: number}) {
  const pts = useMemo(() => scatter(c.n, 3 + c.n, {x: 120, y: 70, w: 560, h: 240}), [c.n]); const ones = c.n - 10;
  const cell = 52, fx = 150, fy = 110;
  const toFrame = scene === 2 ? p : scene > 2 ? 1 : 0; const bundle = scene === 3 ? eseg(p, .2, .8) : scene > 3 ? 1 : 0;
  if (scene >= 5) return <g>
    <rect x={220} y={90} width={360} height={60} fill={C.panel} stroke={C.line}/><line x1={400} x2={400} y1={90} y2={330} stroke={C.line}/>
    <T x={310} y={120} color={C.tens} size={20}>Tens</T><T x={490} y={120} color={C.ones} size={20}>Ones</T>
    <rect x={220} y={150} width={360} height={180} fill="none" stroke={C.line}/>
    <Block place={1} x={300} y={170} s={14}/><T x={360} y={250} size={64} color={C.tens} weight={700}>1</T>
    {range(ones).map(i => <Block key={i} place={0} x={420 + (i % 3) * 18} y={175 + Math.floor(i / 3) * 18} s={14}/>)}<T x={540} y={250} size={64} color={C.ones} weight={700}>{ones}</T>
    <T x={W / 2} y={380} size={26}>{c.n} = 10 + {ones}</T>{scene === 6 && <T x={W / 2} y={415} size={18} color={C.accent}>Build another teen number in Explore.</T>}
  </g>;
  return <g>
    <g opacity={1 - bundle}><TenFrame x={fx} y={fy} filled={0} cell={cell}/></g>
    {pts.map((q, i) => {
      const inFrame = i < 10; const t = inFrame ? seg(toFrame, i * .08, i * .08 + .25) : bundle;
      const target = inFrame ? {x: fx + (i % 5 + .5) * cell, y: fy + (Math.floor(i / 5) + .5) * cell} : {x: 560 + ((i - 10) % 3) * 44, y: 140 + Math.floor((i - 10) / 3) * 44};
      return <Obj key={i} kind={c.object} x={lerp(q.x, target.x, t)} y={lerp(q.y, target.y, t)} r={15} opacity={inFrame ? 1 - bundle : 1} color={inFrame ? C.tens : C.ones}/>;
    })}
    <g opacity={bundle}><Block place={1} x={fx + 100} y={70} s={22}/><T x={fx + 111} y={320} color={C.tens} size={20}>1 ten</T></g>
    {scene >= 3 && <T x={600} y={320} color={C.ones} size={20} opacity={bundle}>{ones} ones</T>}
    {scene === 1 && <T x={W / 2} y={380} size={22} color={C.accent}>How can we see {c.n} quickly?</T>}
    {scene === 4 && <T x={W / 2} y={390} size={30} weight={700}>{c.n} = 1 ten + {ones} ones</T>}
  </g>;
}
function TeenExplore({c}: {c: CountingConfig}) {
  const [n, setN] = useState(c.n);
  return <Stage label={`${n} is 1 ten and ${n - 10} ones`} controls={<><Stepper label="Number" value={n} min={10} max={20} onChange={setN}/><Readout>{n === 20 ? '20 = 2 tens and 0 ones' : `${n} = 1 ten and ${n - 10} ones`}</Readout></>}>
    <TenFrame x={110} y={120} filled={10} color={C.tens}/>
    {n === 20 ? <TenFrame x={410} y={120} filled={10} color={C.tens}/> : <TenFrame x={410} y={120} filled={n - 10} color={C.ones}/>}
    <T x={240} y={260} color={C.tens} size={20}>1 ten</T><T x={540} y={260} color={n === 20 ? C.tens : C.ones} size={20}>{n === 20 ? '1 more ten' : `${n - 10} ones`}</T>
    <T x={W / 2} y={350} size={60} weight={700}><tspan fill={C.tens}>{Math.floor(n / 10)}</tspan><tspan fill={C.ones}>{n % 10}</tspan></T>
  </Stage>;
}

function BondDiagram({n, a, x = W / 2, y = 110}: {n: number; a: number; x?: number; y?: number}) {
  return <g><line x1={x} y1={y} x2={x - 110} y2={y + 130} stroke={C.muted} strokeWidth={3}/><line x1={x} y1={y} x2={x + 110} y2={y + 130} stroke={C.muted} strokeWidth={3}/>
    <circle cx={x} cy={y} r={44} fill={C.panel} stroke={C.accent} strokeWidth={3}/><T x={x} y={y} size={36} weight={700}>{n}</T>
    <circle cx={x - 110} cy={y + 130} r={38} fill={C.panel} stroke={C.ones} strokeWidth={3}/><T x={x - 110} y={y + 130} size={30} color={C.ones}>{a}</T>
    <circle cx={x + 110} cy={y + 130} r={38} fill={C.panel} stroke={C.tens} strokeWidth={3}/><T x={x + 110} y={y + 130} size={30} color={C.tens}>{n - a}</T></g>;
}
function BondRow({n, a, kind, spread}: {n: number; a: number; kind: CountingConfig['object']; spread: number}) {
  return <g>{range(n).map(i => { const base = rowPos(n, i, 200, 54); const dx = (i < a ? -1 : 1) * spread * 40; return <Obj key={i} kind={kind} x={base.x + dx} y={base.y} color={i < a ? C.ones : C.tens}/>; })}
    {spread > .05 && <><T x={rowPos(n, 0).x - 40 + (a - 1) * 27} y={270} color={C.ones} size={28} opacity={spread}>{a}</T><T x={rowPos(n, n - 1).x + 40 - (n - a - 1) * 27} y={270} color={C.tens} size={28} opacity={spread}>{n - a}</T></>}</g>;
}
function BondScene({c, scene, p}: {c: CountingConfig; scene: number; p: number}) {
  if (scene === 4) { const pairs = range(c.n + 1); const shown = Math.ceil(p * (c.n + 1));
    return <g><T x={W / 2} y={50} size={22}>All the ways to make {c.n}</T>{pairs.slice(0, shown).map(a => <T key={a} x={W / 2} y={95 + a * (300 / (c.n + 1))} size={22} mono><tspan fill={C.ones}>{a}</tspan> + <tspan fill={C.tens}>{c.n - a}</tspan> = {c.n}</T>)}</g>; }
  if (scene >= 5) return <g><BondDiagram n={c.n} a={c.a}/><T x={W / 2} y={340} size={30}>{c.n} = {c.a} + {c.n - c.a}</T>{scene === 6 && <T x={W / 2} y={390} size={20} color={C.accent}>{c.n} = {c.a} + ?</T>}</g>;
  const a = scene === 3 ? Math.min(c.n, Math.floor(p * (c.n + 1))) : c.a;
  const spread = scene === 2 ? (p < .5 ? eseg(p, 0, .35) : 1 - eseg(p, .6, .95)) : scene === 3 ? 1 : 0;
  return <g><BondRow n={c.n} a={scene < 2 ? 0 : a} kind={c.object} spread={spread}/>{scene === 3 && <T x={W / 2} y={350} size={30}>{a} + {c.n - a} = {c.n}</T>}{scene === 1 && <T x={W / 2} y={350} size={26} color={C.accent}>How many ways can we split {c.n}?</T>}</g>;
}
function BondExplore({c}: {c: CountingConfig}) {
  const [n, setN] = useState(c.n); const [a, setA] = useState(Math.min(c.a, c.n));
  return <Stage label={`${n} split into ${a} and ${n - a}`} controls={<><Stepper label="Whole" value={n} min={2} max={10} onChange={v => { setN(v); setA(Math.min(a, v)); }}/><Slider label="First part" value={a} min={0} max={n} onChange={setA}/><Readout>{n} = {a} + {n - a}</Readout></>}>
    <BondRow n={n} a={a} kind={c.object} spread={1}/><BondDiagram n={n} a={a} x={W / 2} y={300} />
  </Stage>;
}

function CompareRows({a, b, kind, matched, glowExtra}: {a: number; b: number; kind: CountingConfig['object']; matched: number; glowExtra: boolean}) {
  const m = Math.min(a, b); const x = (i: number) => 130 + i * 58;
  return <g>{range(matched).map(i => <line key={i} x1={x(i)} x2={x(i)} y1={150} y2={260} stroke={C.accent} strokeWidth={2} strokeDasharray="5 5"/>)}
    {range(a).map(i => <Obj key={'a' + i} kind={kind} x={x(i)} y={130} color={C.ones} glow={glowExtra && i >= m}/>)}
    {range(b).map(i => <Obj key={'b' + i} kind={kind} x={x(i)} y={280} color={C.tens} glow={glowExtra && i >= m}/>)}
    <T x={60} y={130} color={C.ones} size={26}>{a}</T><T x={60} y={280} color={C.tens} size={26}>{b}</T></g>;
}
const sym = (a: number, b: number) => (a > b ? '>' : a < b ? '<' : '=');
function CompareScene({c, scene, p}: {c: CountingConfig; scene: number; p: number}) {
  const m = Math.min(c.a, c.b); const matched = scene === 2 ? Math.floor(p * (m + .5)) : scene > 2 ? m : 0;
  if (scene >= 5) return <g><T x={W / 2} y={180} size={110} weight={700}><tspan fill={C.ones}>{c.a}</tspan> {sym(c.a, c.b)} <tspan fill={C.tens}>{c.b}</tspan></T>
    <T x={W / 2} y={300} size={20} color={C.muted}>&gt; greater than · &lt; less than · = equal to</T>{scene === 6 && <T x={W / 2} y={360} color={C.accent}>Compare new numbers in the challenge.</T>}</g>;
  return <g><CompareRows a={c.a} b={c.b} kind={c.object} matched={matched} glowExtra={scene >= 3}/>
    {scene === 4 && <T x={W / 2} y={380} size={26}>{c.a === c.b ? 'Equal' : `${Math.abs(c.a - c.b)} extra in the ${c.a > c.b ? 'top' : 'bottom'} row`}</T>}
    {scene === 1 && <T x={W / 2} y={380} size={26} color={C.accent}>Which row has more?</T>}</g>;
}
function CompareExplore({c}: {c: CountingConfig}) {
  const [a, setA] = useState(c.a), [b, setB] = useState(c.b), [match, setMatch] = useState(true);
  return <Stage label={`${a} ${sym(a, b)} ${b}`} controls={<><Stepper label="Top" value={a} min={0} max={10} onChange={setA}/><Stepper label="Bottom" value={b} min={0} max={10} onChange={setB}/><Action onClick={() => setMatch(!match)}>{match ? 'Hide' : 'Show'} matching</Action><Readout>{a} {sym(a, b)} {b}</Readout></>}>
    <CompareRows a={a} b={b} kind={c.object} matched={match ? Math.min(a, b) : 0} glowExtra={match}/><T x={W / 2} y={390} size={40} weight={700}>{a} {sym(a, b)} {b}</T>
  </Stage>;
}

function Queue({n, highlight, bracket, labels, fromBack = false}: {n: number; highlight: number; bracket: number; labels: number; fromBack?: boolean}) {
  const x = (i: number) => 180 + i * (520 / n);
  return <g><rect x={50} y={150} width={70} height={110} rx={8} fill={C.panel} stroke={C.accent}/><T x={85} y={205} size={13} color={C.accent}>TICKETS</T>
    {range(n).map(i => { const pos = fromBack ? n - i : i + 1; return <g key={i}><Obj kind={i % 2 ? 'rabbit' : 'chick'} x={x(i)} y={220} r={20} color={pos === highlight ? C.ones : i % 2 ? '#e6dcf2' : '#f7e08a'} glow={pos === highlight}/>{i < labels && <T x={x(i)} y={280} size={14} color={pos === highlight ? C.ones : C.muted}>{ordinal(pos)}</T>}</g>; })}
    {bracket > 0 && <g><path d={`M${x(0) - 22} 165 V150 H${x(bracket - 1) + 22} V165`} fill="none" stroke={C.tens} strokeWidth={3}/><T x={(x(0) + x(bracket - 1)) / 2} y={130} color={C.tens} size={20}>{bracket} animals</T></g>}</g>;
}
function OrdinalScene({c, scene, p}: {c: CountingConfig; scene: number; p: number}) {
  const labels = scene === 2 ? Math.floor(p * (c.n + .5)) : scene > 2 ? c.n : 0;
  return <g><Queue n={c.n} labels={labels} highlight={scene >= 4 ? c.a : 0} bracket={scene === 3 || scene >= 5 ? c.a : 0}/>
    {scene === 1 && <T x={W / 2} y={360} size={24} color={C.accent}>“{c.a}” or “{ordinal(c.a)}”?</T>}
    {scene === 4 && <T x={W / 2} y={360} size={26}>The {ordinal(c.a)} animal is just one animal.</T>}
    {scene >= 5 && <T x={W / 2} y={360} size={22}><tspan fill={C.tens}>{c.a} animals: how many</tspan> · <tspan fill={C.ones}>{ordinal(c.a)}: which one</tspan></T>}</g>;
}
function OrdinalExplore({c}: {c: CountingConfig}) {
  const [k, setK] = useState(c.a); const [back, setBack] = useState<'front' | 'back'>('front');
  return <Stage label={`The ${ordinal(k)} animal from the ${back}`} controls={<><Stepper label="Position" value={k} min={1} max={c.n} onChange={setK}/><Segmented label="Count from" value={back} onChange={setBack} options={[['front', 'From the front'], ['back', 'From the back']]}/><Readout>{ordinal(k)} from the {back} = {ordinal(c.n - k + 1)} from the {back === 'front' ? 'back' : 'front'}</Readout></>}>
    <Queue n={c.n} labels={c.n} highlight={k} bracket={0} fromBack={back === 'back'}/>
  </Stage>;
}

function Plate({n, total}: {n: number; total: number}) {
  return <g><ellipse cx={W / 2} cy={210} rx={190} ry={70} fill="#2a2638" stroke="#4c4664" strokeWidth={4}/>
    {range(total).map(i => <Obj key={i} kind="apple" x={W / 2 + (i - (total - 1) / 2) * 52} y={200} r={20} color="#ff7a7a" opacity={i < n ? 1 : .08}/>)}
    <T x={W / 2} y={320} size={40} weight={700} color={n === 0 ? C.accent : C.ink}>{n}</T></g>;
}
function ZeroScene({c, scene, p}: {c: CountingConfig; scene: number; p: number}) {
  const left = scene < 2 ? c.n : scene === 2 ? c.n - Math.min(c.n, Math.floor(p * (c.n + .5))) : 0;
  return <g><Plate n={left} total={c.n}/>{scene >= 2 && <NumberLine value={left} max={Math.max(6, c.n)} highlight={left === 0 ? C.accent : C.ones}/>}
    {scene === 4 && <T x={W / 2} y={60} size={28} color={C.accent}>Nothing left: zero, written 0</T>}{scene === 1 && <T x={W / 2} y={60} size={24} color={C.accent}>What if every apple is eaten?</T>}</g>;
}
function ZeroExplore({c}: {c: CountingConfig}) {
  const [n, setN] = useState(c.n);
  return <Stage label={`${n} apples on the plate`} controls={<><Stepper label="Apples" value={n} min={0} max={6} onChange={setN}/><Readout>{n === 0 ? 'Zero apples: the plate is empty.' : `${n} apples`}</Readout></>}>
    <Plate n={n} total={6}/><NumberLine value={n} max={6} highlight={n === 0 ? C.accent : C.ones}/>
  </Stage>;
}

export const countingView: EngineView<CountingConfig> = {
  Scene: props => <Stage label={counting.describe(props.c)}>{(() => { switch (props.c.mode) { case 'teen': return <TeenScene {...props}/>; case 'bond': return <BondScene {...props}/>; case 'compare': return <CompareScene {...props}/>; case 'ordinal': return <OrdinalScene {...props}/>; case 'zero': return <ZeroScene {...props}/>; default: return <CountScene {...props}/>; } })()}</Stage>,
  Explore: ({c}) => { switch (c.mode) { case 'teen': return <TeenExplore c={c}/>; case 'bond': return <BondExplore c={c}/>; case 'compare': return <CompareExplore c={c}/>; case 'ordinal': return <OrdinalExplore c={c}/>; case 'zero': return <ZeroExplore c={c}/>; default: return <CountExplore c={c}/>; } },
};

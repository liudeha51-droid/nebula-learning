'use client';
import {useState} from 'react';
import {Stage, T, C, W, Stepper, Readout, Slider, Segmented} from '../stage';
import {laws, orderSteps, pretty, evaluate, leftToRight, type LawsConfig} from '@/lib/universe/engines/laws';
import {eseg, fmt, lerp} from '@/lib/universe/math';
import type {EngineView} from './types';

/** Bars for a + b + c with a bracket around the pair being added first. */
function Bars({a, b, c, pair, t = 1}: {a: number; b: number; c: number; pair: 'left' | 'right'; t?: number}) {
  const total = a + b + c; const scale = 600 / total; const x0 = 100, y = 200;
  const widths = [a, b, c].map(v => v * scale); const colors = [C.ones, C.tens, C.hundreds];
  const gapL = pair === 'left' ? lerp(30, 6, t) : 6, gapR = pair === 'right' ? lerp(30, 6, t) : 30;
  const xs = [x0, x0 + widths[0] + (pair === 'left' ? 4 : gapL + 20), 0]; xs[2] = xs[1] + widths[1] + (pair === 'right' ? 4 : gapR);
  const bx = pair === 'left' ? [xs[0], xs[1] + widths[1]] : [xs[1], xs[2] + widths[2]];
  return <g>{[a, b, c].map((v, i) => <g key={i}><rect x={xs[i]} y={y} width={widths[i]} height={50} rx={6} fill={colors[i]} opacity={.75}/><T x={xs[i] + widths[i] / 2} y={y + 25} size={20} weight={700} color="#15141d">{v}</T></g>)}
    <path d={`M${bx[0]} ${y - 12} V${y - 26} H${bx[1]} V${y - 12}`} fill="none" stroke={C.accent} strokeWidth={3}/>
    <T x={(bx[0] + bx[1]) / 2} y={y - 42} size={18} color={C.accent}>{pair === 'left' ? a + b : b + c}</T>
    <T x={W / 2} y={y + 110} size={26}>{pair === 'left' ? `(${a} + ${b}) + ${c}` : `${a} + (${b} + ${c})`} = {total}</T></g>;
}
function Cards({items, groups}: {items: (number | string)[]; groups: [number, number] | null}) {
  const w = 110, x0 = W / 2 - (items.length * (w + 40)) / 2;
  return <g>{items.map((v, i) => <g key={i}><rect x={x0 + i * (w + 40)} y={160} width={w} height={90} rx={12} fill={C.panel} stroke={C.line}/><T x={x0 + i * (w + 40) + w / 2} y={205} size={34} weight={700} color={[C.ones, C.tens, C.hundreds][i % 3]}>{v}</T>
    {i < items.length - 1 && <T x={x0 + i * (w + 40) + w + 20} y={205} size={30}>×</T>}</g>)}
    {groups && <path d={`M${x0 + groups[0] * (w + 40) - 8} 150 V140 H${x0 + groups[1] * (w + 40) + w + 8} V150 M${x0 + groups[0] * (w + 40) - 8} 260 V270 H${x0 + groups[1] * (w + 40) + w + 8} V260`} fill="none" stroke={C.accent} strokeWidth={3}/>}</g>;
}
function Pathway({expr, upTo}: {expr: string; upTo: number}) {
  const steps = orderSteps(expr);
  return <g>{steps.slice(0, upTo + 1).map((s, i) => <g key={i}><T x={W / 2} y={80 + i * 62} size={i === upTo ? 30 : 24} weight={i === upTo ? 700 : 400} color={i === upTo ? C.ink : C.muted}>{s.text}</T>
    {i > 0 && <T x={W / 2 + 230} y={80 + i * 62 - 31} size={14} color={C.ones} anchor="start">{s.op}</T>}{i < upTo && <T x={W / 2} y={80 + i * 62 + 31} size={16} color={C.faint}>↓</T>}</g>)}</g>;
}

function Scene({c, scene, p}: {c: LawsConfig; scene: number; p: number}) {
  if (c.mode === 'assoc-add') return <g>{scene <= 2 ? <Bars a={c.a} b={c.b} c={c.c} pair="left" t={scene === 2 ? eseg(p, 0, .5) : 0}/> : <Bars a={c.a} b={c.b} c={c.c} pair="right" t={scene === 3 ? eseg(p, 0, .5) : 1}/>}
    {scene >= 5 && <T x={W / 2} y={400} size={22} color={C.accent}>(a + b) + c = a + (b + c) · a + b = b + a</T>}</g>;
  if (c.mode === 'assoc-mul') { const swapped = scene >= 2; const items = swapped ? [c.a, c.c, c.b] : [c.a, c.b, c.c];
    return <g><Cards items={items} groups={scene >= 3 ? [0, 1] : null}/><T x={W / 2} y={330} size={26}>{scene >= 3 ? `(${c.a} × ${c.c}) × ${c.b} = ${c.a * c.c} × ${c.b} = ${fmt(c.a * c.b * c.c)}` : swapped ? `${c.a} × ${c.c} × ${c.b}` : `${c.a} × ${c.b} × ${c.c} = ?`}</T>
      {scene >= 5 && <T x={W / 2} y={395} size={22} color={C.accent}>(a × b) × c = a × (b × c)</T>}</g>; }
  if (c.mode === 'letters') { const lines = [['a + b = b + a', 'a × b = b × a'], ['(a + b) + c = a + (b + c)', '(a × b) × c = a × (b × c)'], ['a × (b + c) = a × b + a × c']];
    const shown = scene < 2 ? 0 : scene - 1; return <g>{lines.slice(0, Math.min(3, shown)).map((l, i) => <g key={i}><T x={W / 2} y={100 + i * 90} size={14} color={C.muted}>{['COMMUTATIVE', 'ASSOCIATIVE', 'DISTRIBUTIVE'][i]}</T><T x={W / 2} y={130 + i * 90} size={26} color={[C.ones, C.tens, C.hundreds][i]}>{l.join('      ')}</T></g>)}
      {scene >= 5 && <T x={W / 2} y={400} size={20}>125 × 8 × 7 = (125 × 8) × 7 = 7 000 · 99 × 7 = (100 − 1) × 7 = 693</T>}{scene < 2 && <T x={W / 2} y={220} size={30} color={C.accent}>a, b, c = any numbers</T>}</g>; }
  const st = orderSteps(c.expr), alt = orderSteps(c.alt);
  if (scene === 3) return <g><T x={W / 2} y={30} size={16} color={C.muted}>With parentheses</T><Pathway expr={c.alt} upTo={Math.min(alt.length - 1, Math.floor(p * alt.length))}/></g>;
  if (scene >= 4) return <g><T x={240} y={150} size={28}>{pretty(c.expr)}</T><T x={240} y={210} size={44} weight={700} color={C.ones}>{fmt(evaluate(c.expr))}</T>
    <T x={560} y={150} size={28}>{pretty(c.alt)}</T><T x={560} y={210} size={44} weight={700} color={C.tens}>{fmt(evaluate(c.alt))}</T>
    {scene >= 5 && <T x={W / 2} y={330} size={20} color={C.accent}>( ) first → × ÷ left to right → + − left to right</T>}
    {leftToRight(c.expr) !== evaluate(c.expr) && <T x={W / 2} y={380} size={16} color={C.warn}>Working strictly left to right would give {fmt(leftToRight(c.expr))} — a common mistake.</T>}</g>;
  return <Pathway expr={c.expr} upTo={scene < 2 ? 0 : Math.min(st.length - 1, Math.floor(p * st.length))}/>;
}

function Explore({c}: {c: LawsConfig}) {
  const [a, setA] = useState(c.mode === 'order' ? 24 : c.a), [b, setB] = useState(c.mode === 'order' ? 6 : c.b), [cc, setC] = useState(c.mode === 'order' ? 3 : c.c);
  const [shape, setShape] = useState<'a-b*c' | '(a-b)*c' | 'a+b*c' | '(a+b)*c'>('a-b*c');
  if (c.mode === 'order') { const e = shape.replace('a', String(a)).replace('b', String(b)).replace('c', String(cc)); const v = evaluate(e);
    return <Stage label={`${pretty(e)} equals ${v}`} controls={<><Segmented label="Expression shape" value={shape} onChange={setShape} options={[['a-b*c', 'a − b × c'], ['(a-b)*c', '(a − b) × c'], ['a+b*c', 'a + b × c'], ['(a+b)*c', '(a + b) × c']]}/>
      <Stepper label="a" value={a} min={0} max={99} onChange={setA}/><Stepper label="b" value={b} min={0} max={20} onChange={setB}/><Stepper label="c" value={cc} min={0} max={12} onChange={setC}/><Readout>{pretty(e)} = {fmt(v)}</Readout></>}>
      <Pathway expr={e} upTo={orderSteps(e).length - 1}/></Stage>; }
  const rows = [[`${a} + ${b}`, a + b, `${b} + ${a}`, b + a], [`(${a} + ${b}) + ${cc}`, a + b + cc, `${a} + (${b} + ${cc})`, a + (b + cc)], [`(${a} × ${b}) × ${cc}`, a * b * cc, `${a} × (${b} × ${cc})`, a * (b * cc)], [`${a} × (${b} + ${cc})`, a * (b + cc), `${a} × ${b} + ${a} × ${cc}`, a * b + a * cc]] as const;
  return <Stage label="Check every law with your own numbers" controls={<><Slider label="a" value={a} min={0} max={125} onChange={setA}/><Slider label="b" value={b} min={0} max={100} onChange={setB}/><Slider label="c" value={cc} min={0} max={100} onChange={setC}/><Readout>Every row stays equal, whatever you choose.</Readout></>}>
    {rows.map((r, i) => <g key={i}><T x={60} y={80 + i * 85} size={13} color={C.muted} anchor="start">{['COMMUTATIVE (+)', 'ASSOCIATIVE (+)', 'ASSOCIATIVE (×)', 'DISTRIBUTIVE'][i]}</T>
      <T x={230} y={110 + i * 85} size={21}>{r[0]} = {fmt(r[1])}</T><T x={W / 2 + 20} y={110 + i * 85} size={22} color={C.good}>=</T><T x={590} y={110 + i * 85} size={21}>{r[2]} = {fmt(r[3])}</T></g>)}
  </Stage>;
}

export const lawsView: EngineView<LawsConfig> = {Scene: props => <Stage label={laws.describe(props.c)}><Scene {...props}/></Stage>, Explore};

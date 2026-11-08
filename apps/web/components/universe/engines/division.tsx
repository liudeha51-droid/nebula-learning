'use client';
import {useState} from 'react';
import {Stage, Obj, T, C, W, Stepper, Readout, Action, Segmented, useSound} from '../stage';
import {division, type DivisionConfig} from '@/lib/universe/engines/division';
import {fmt, lerp, longDivision, eseg} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const pilePos = (i: number) => ({x: 250 + (i % 10) * 30, y: 70 + Math.floor(i / 10) * 30});
const plateX = (k: number, n: number) => W / 2 + (k - (n - 1) / 2) * Math.min(150, 700 / n);
/** Shared objects: `dealt` of `total` have moved to plates (round-robin). */
function Sharing({total, divisor, dealt, kind = 'flower', back = 0}: {total: number; divisor: number; dealt: number; kind?: 'flower' | 'star' | 'ball'; back?: number}) {
  return <g>{range(divisor).map(k => <g key={k}><ellipse cx={plateX(k, divisor)} cy={330} rx={Math.min(62, 300 / divisor)} ry={18} fill="#2a2638" stroke="#4c4664" strokeWidth={3}/><Obj kind="chick" x={plateX(k, divisor)} y={390} r={18} color="#f7e08a"/></g>)}
    {range(total).map(i => { const from = pilePos(i); const k = i % divisor, round = Math.floor(i / divisor); const plate = {x: plateX(k, divisor) + ((round % 3) - 1) * 18, y: 318 - Math.floor(round / 3) * 18};
      const t = i < dealt ? 1 : Math.max(0, Math.min(1, dealt - i)); const tb = back; const merged = {x: W / 2 + ((i % 10) - 4.5) * 26, y: 230 - Math.floor(i / 10) * 26};
      const x = lerp(lerp(from.x, plate.x, eseg(t, 0, 1)), merged.x, tb), y = lerp(lerp(from.y, plate.y, eseg(t, 0, 1)), merged.y, tb);
      return <Obj key={i} kind={kind} x={x} y={y} r={11} color={[C.ones, C.tens, C.hundreds, C.thousands, C.accent, C.unknown, '#c8e07a', '#ffd0a0', '#9fd8ff'][k % 9]}/>; })}</g>;
}
/** Grouping: objects in a pile packed into boxes of `size`. */
function Grouping({total, size, packed, glowLeft}: {total: number; size: number; packed: number; glowLeft: boolean}) {
  const boxes = Math.floor(total / size); const per = Math.min(5, boxes || 1); const bw = Math.min(130, 680 / per);
  const box = (g: number) => ({x: 70 + (g % per) * (bw + 10), y: 200 + Math.floor(g / per) * 90});
  return <g>{range(boxes).map(g => { const b = box(g); return <rect key={g} x={b.x} y={b.y} width={bw} height={70} rx={10} fill="none" stroke={g < packed ? C.tens : C.line} strokeWidth={2} strokeDasharray={g < packed ? '' : '5 5'}/>; })}
    {range(total).map(i => { const g = Math.floor(i / size), inBox = g < packed; const b = box(g); const from = pilePos(i);
      const to = {x: b.x + 14 + (i % size) * Math.min(22, (bw - 20) / size), y: b.y + 35};
      return <Obj key={i} kind="ball" x={inBox ? to.x : from.x} y={inBox ? to.y : from.y} r={9} color={inBox ? C.tens : g >= boxes ? C.warn : C.ones} glow={glowLeft && g >= boxes}/>; })}</g>;
}

function LongBoard({total, divisor, shown}: {total: number; divisor: number; shown: number}) {
  const ld = longDivision(total, divisor); const s = String(total); const cw = 30; const x0 = 250, y0 = 100;
  const cx = (i: number) => x0 + i * cw; const right = (i: number) => cx(i) + 9; // right edge of the digit in column i
  const firstNonZero = Math.max(0, ld.steps.findIndex(st => st.q > 0));
  let row = 0; const lines: React.ReactNode[] = [];
  ld.steps.slice(0, shown).forEach((st, i) => {
    if (i < firstNonZero) return;
    const y = y0 + 44 + row * 58; const next = i < s.length - 1 ? st.rem * 10 + Number(s[i + 1]) : st.rem;
    lines.push(<g key={i}><T x={right(i)} y={y} size={24} mono anchor="end" color={C.thousands}>{st.product}</T>
      <line x1={right(i) - String(st.bring).length * 15 - 4} x2={right(i) + 4} y1={y + 14} y2={y + 14} stroke={C.muted}/>
      <T x={right(Math.min(i + 1, s.length - 1))} y={y + 30} size={24} mono anchor="end" color={C.ones}>{next}</T>
      <T x={440} y={y} size={14} anchor="start" color={C.muted}>{st.bring} ÷ {divisor} → {st.q} · {st.q} × {divisor} = {st.product} · left {st.rem}</T></g>);
    row++;
  });
  return <g><T x={cx(0) - 34} y={y0} size={26} mono anchor="end" color={C.tens}>{divisor}</T>
    <path d={`M${cx(0) - 24} ${y0 + 18} Q${cx(0) - 12} ${y0} ${cx(0) - 24} ${y0 - 18} H${right(s.length - 1) + 12}`} fill="none" stroke={C.ink} strokeWidth={2}/>
    {s.split('').map((d, i) => <T key={i} x={cx(i)} y={y0} size={26} mono>{d}</T>)}
    {ld.steps.slice(0, shown).map((st, i) => (i >= firstNonZero ? <T key={i} x={cx(i)} y={y0 - 40} size={26} mono color={C.ones} weight={700}>{st.q}</T> : null))}
    {lines}</g>;
}

function Scene({c, scene, p}: {c: DivisionConfig; scene: number; p: number}) {
  const q = Math.floor(c.total / c.divisor), r = c.total % c.divisor;
  if (c.mode === 'long') { const n = String(c.total).length; const shown = scene < 2 ? 0 : scene === 2 ? Math.ceil(p * n) : n; const ld = longDivision(c.total, c.divisor);
    return <g><LongBoard total={c.total} divisor={c.divisor} shown={shown}/><T x={W / 2} y={30} size={22} weight={600}>{scene >= 4 ? `${fmt(c.total)} ÷ ${c.divisor} = ${fmt(ld.quotient)}${ld.remainder ? ` R ${ld.remainder}` : ''}` : `${fmt(c.total)} ÷ ${c.divisor} = ?`}</T>
      {scene === 1 && c.divisor >= 10 && <T x={W / 2} y={410} size={18} color={C.accent}>Trial quotient: think of {c.divisor} as {Math.round(c.divisor / 10) * 10}, then adjust.</T>}
      {scene >= 5 && <T x={W / 2} y={415} size={20} color={C.good}>Check: {fmt(ld.quotient)} × {c.divisor}{ld.remainder ? ` + ${ld.remainder}` : ''} = {fmt(c.total)}</T>}</g>; }
  if (c.mode === 'group' || c.mode === 'remainder') { const boxes = Math.floor(c.total / c.divisor); const packed = scene < 2 ? 0 : scene === 2 ? Math.floor(p * (boxes + .99)) : boxes;
    return <g><Grouping total={c.total} size={c.divisor} packed={Math.min(boxes, packed)} glowLeft={scene >= 3}/>
      <T x={W / 2} y={30} size={22} weight={600}>{scene >= 4 ? (r ? `${c.total} ÷ ${c.divisor} = ${q} R ${r}` : `${c.total} ÷ ${c.divisor} = ${q}`) : `${Math.min(boxes, packed)} group${packed === 1 ? '' : 's'} of ${c.divisor}`}</T>
      {scene >= 5 && r > 0 && <T x={W / 2} y={430} size={18} color={C.warn}>{c.divisor} × {q} + {r} = {c.total}, and {r} &lt; {c.divisor}</T>}</g>; }
  const dealt = scene < 2 ? 0 : scene === 2 || (c.mode === 'inverse' && scene === 2) ? p * c.total : c.total;
  const back = c.mode === 'inverse' ? (scene === 3 ? eseg(p, .1, .9) : scene > 3 ? 1 : 0) : 0;
  return <g><Sharing total={c.total} divisor={c.divisor} dealt={dealt} kind={c.mode === 'inverse' ? 'star' : 'flower'} back={back}/>
    <T x={W / 2} y={30} size={22} weight={600}>{c.mode === 'inverse' && scene >= 3 ? `${c.divisor} × ${q} = ${c.total}` : scene >= 3 ? `${c.total} ÷ ${c.divisor} = ${q}` : `${c.total} shared by ${c.divisor}`}</T>
    {scene >= 3 && back === 0 && range(c.divisor).map(k => <T key={k} x={plateX(k, c.divisor)} y={290 - Math.ceil(q / 3) * 18} size={18} color={C.ones}>{q}</T>)}
    {c.mode === 'inverse' && scene >= 5 && <T x={W / 2} y={430} size={17} color={C.accent}>{c.divisor} × {q} = {c.total} · {q} × {c.divisor} = {c.total} · {c.total} ÷ {c.divisor} = {q} · {c.total} ÷ {q} = {c.divisor}</T>}</g>;
}

function Explore({c}: {c: DivisionConfig}) {
  const sound = useSound();
  const [total, setTotal] = useState(c.mode === 'long' ? c.total : c.total), [d, setD] = useState(c.divisor);
  const [mode, setMode] = useState<'share' | 'group'>(c.mode === 'group' || c.mode === 'remainder' ? 'group' : 'share');
  const [n, setN] = useState(0);
  if (c.mode === 'long') { const len = String(total).length; const ld = longDivision(total, d);
    return <Stage label={`Long division ${total} divided by ${d}`} controls={<><Stepper label="Dividend" value={total} min={d} max={9999} onChange={v => { setTotal(v); setN(0); }}/><Stepper label="Divisor" value={d} min={2} max={99} onChange={v => { setD(v); setN(0); }}/>
      <Action primary onClick={() => { setN(Math.min(len, n + 1)); sound('click'); }} disabled={n >= len}>Next step</Action><Action onClick={() => setN(0)}>Start over</Action>
      <Readout>{n >= len ? `${fmt(total)} ÷ ${d} = ${fmt(ld.quotient)}${ld.remainder ? ` R ${ld.remainder}` : ''}` : `Step ${n + 1}: share the ${len - n === 1 ? 'ones' : 'next place'}`}</Readout></>}>
      <LongBoard total={total} divisor={d} shown={n}/></Stage>; }
  const q = Math.floor(total / d), r = total % d; const max = mode === 'share' ? total - r : q;
  return <Stage label={`${total} divided by ${d}`} controls={<>
    <Segmented label="Meaning" value={mode} onChange={v => { setMode(v); setN(0); }} options={[['share', 'Share equally'], ['group', 'Make groups']]}/>
    <Stepper label="Objects" value={total} min={1} max={40} onChange={v => { setTotal(v); setN(0); }}/><Stepper label={mode === 'share' ? 'Friends' : 'Group size'} value={d} min={1} max={9} onChange={v => { setD(v); setN(0); }}/>
    <Action primary onClick={() => { const next = mode === 'share' ? Math.min(total - r, n + d) : Math.min(q, n + 1); setN(next); sound(next === max ? 'success' : 'click'); }} disabled={n >= max}>{mode === 'share' ? 'Deal a round' : 'Fill a group'}</Action><Action onClick={() => setN(0)}>Reset</Action>
    <Readout>{n >= max ? `${total} ÷ ${d} = ${q}${r ? ` R ${r}` : ''}` : mode === 'share' ? `${n} dealt` : `${n} groups made`}</Readout></>}>
    {mode === 'share' ? <Sharing total={total} divisor={d} dealt={n}/> : <Grouping total={total} size={d} packed={n} glowLeft={n >= q}/>}
    {mode === 'share' && n >= total - r && r > 0 && <T x={W / 2} y={30} size={18} color={C.warn}>{r} left over — not enough for another round</T>}
  </Stage>;
}

export const divisionView: EngineView<DivisionConfig> = {Scene: props => <Stage label={division.describe(props.c)}><Scene {...props}/></Stage>, Explore};

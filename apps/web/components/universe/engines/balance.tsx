'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Action, useSound} from '../stage';
import {balance, type BalanceConfig} from '@/lib/universe/engines/balance';
import {clamp, eseg} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

type Item = {kind: 'x' | 'u'; opacity?: number; dy?: number; group?: number};
/** Beam that tilts by sign/size of (left − right); items stack on the pans. */
function Scale({left, right, diff, groups = 0, label}: {left: Item[]; right: Item[]; diff: number; groups?: number; label?: string}) {
  const tilt = clamp(diff, -6, 6) * 2.5; const cx = W / 2, cy = 150, arm = 230;
  const a = tilt * Math.PI / 180; const L = [cx - arm * Math.cos(a), cy - arm * Math.sin(a)], R = [cx + arm * Math.cos(a), cy + arm * Math.sin(a)];
  const pan = (p: number[], items: Item[], side: number) => <g><line x1={p[0]} y1={p[1]} x2={p[0] - 80} y2={p[1] + 90} stroke={C.muted}/><line x1={p[0]} y1={p[1]} x2={p[0] + 80} y2={p[1] + 90} stroke={C.muted}/>
    <path d={`M${p[0] - 100} ${p[1] + 90} Q${p[0]} ${p[1] + 120} ${p[0] + 100} ${p[1] + 90} Z`} fill="#2a2638" stroke="#5a4f6e" strokeWidth={2}/>
    {items.map((it, i) => { const col = i % 7, row = Math.floor(i / 7); const gx = groups > 0 && it.group !== undefined ? (it.group - (groups - 1) / 2) * 5 : 0; const x = p[0] - 78 + col * 26 + gx, y = p[1] + 72 - row * 26 + (it.dy ?? 0);
      return it.kind === 'x' ? <g key={side + '-' + i} opacity={it.opacity ?? 1}><rect x={x - 11} y={y - 11} width={22} height={22} rx={4} fill={C.unknown}/><T x={x} y={y} size={13} weight={700} color="#15141d">x</T></g>
        : <circle key={side + '-' + i} cx={x} cy={y} r={10} fill={C.ones} opacity={it.opacity ?? 1}/>; })}</g>;
  return <g><polygon points={`${cx - 30},400 ${cx + 30},400 ${cx},${cy + 6}`} fill="#3a3550"/><line x1={L[0]} y1={L[1]} x2={R[0]} y2={R[1]} stroke={C.ink} strokeWidth={6} strokeLinecap="round"/><circle cx={cx} cy={cy} r={8} fill={C.accent}/>
    {pan(L, left, 0)}{pan(R, right, 1)}{label && <T x={W / 2} y={40} size={26} weight={600}>{label}</T>}
    <T x={W / 2} y={430} size={15} color={Math.abs(diff) < 1e-9 ? C.good : C.warn}>{Math.abs(diff) < 1e-9 ? 'balanced' : diff > 0 ? 'left side heavier' : 'right side heavier'}</T></g>;
}
const units = (n: number, extra: Partial<Item> = {}): Item[] => range(Math.max(0, n)).map(() => ({kind: 'u', ...extra}));
const boxes = (n: number, extra: Partial<Item> = {}): Item[] => range(n).map(() => ({kind: 'x', ...extra}));

function Scene({c, scene, p}: {c: BalanceConfig; scene: number; p: number}) {
  if (c.mode === 'expression') { const aVal = scene < 2 ? 1 : scene === 2 ? (p < .5 ? 1 : 2) : scene === 3 ? 1 + Math.floor(p * 5) : 5;
    return <g><T x={W / 2} y={40} size={26} weight={600}>{c.coef}a + {c.constant}{scene >= 2 ? ` = ${c.coef} × ${aVal} + ${c.constant} = ${c.coef * aVal + c.constant}` : ''}</T>
      {range(c.coef).map(i => <g key={i}><rect x={150 + i * 90} y={130} width={70} height={70} rx={10} fill={C.unknown}/><T x={185 + i * 90} y={165} size={scene >= 2 ? 30 : 24} weight={700} color="#15141d">{scene >= 2 ? aVal : 'a'}</T></g>)}
      {range(c.constant).map(i => <circle key={i} cx={170 + (c.coef + i) * 90} cy={165} r={22} fill={C.ones}/>)}
      {scene >= 3 && <g>{range(6).map(k => <g key={k}><T x={200 + k * 80} y={290} size={18} color={k + 1 === aVal ? C.ones : C.muted}>a = {k + 1}</T><T x={200 + k * 80} y={325} size={20} color={k + 1 === aVal ? C.ones : C.ink}>{c.coef * (k + 1) + c.constant}</T></g>)}</g>}</g>; }
  if (c.mode === 'equality') { const off = scene === 2 ? eseg(p, .2, .7) : 0; const both = scene === 3 ? (p < .5 ? eseg(p, .1, .4) : 1) : scene > 3 ? 1 : 0; const dbl = scene === 3 && p >= .5;
    const L = [...boxes(dbl ? 2 : 1), ...units(3, {opacity: 1 - Math.max(off, both), dy: -60 * Math.max(off, both)})]; const R = units((dbl ? 2 : 1) * 10 - (both >= 1 ? (dbl ? 6 : 3) : 0)).map((it, i) => ({...it, opacity: !dbl && i >= 7 ? 1 - both : 1}));
    const diff = off > .5 ? -3 : 0;
    return <Scale left={L} right={R} diff={diff} label={scene === 2 ? 'x + 3 − 3 ≠ 10 ?' : dbl ? '2x = 14' : both >= 1 ? 'x = 7' : 'x + 3 = 10'}/>; }
  const x = (c.c - c.b) / c.a; const rem = scene === 2 ? eseg(p, .2, .8) : scene > 2 ? 1 : 0; const grouped = scene >= 3 ? c.a : 0;
  const L = [...boxes(c.a, {}).map((it, i) => ({...it, group: grouped ? i : undefined})), ...units(c.b, {opacity: 1 - rem, dy: -70 * rem})];
  const R = units(c.c).map((it, i) => (i >= c.c - c.b ? {...it, opacity: 1 - rem, dy: -70 * rem} : {...it, group: grouped ? Math.floor(i / x) : undefined}));
  const label = scene >= 4 ? `x = ${x}` : scene === 3 ? `${c.a}x = ${c.c - c.b} → x = ${c.c - c.b} ÷ ${c.a}` : rem >= 1 ? `${c.a}x = ${c.c - c.b}` : `${c.a}x + ${c.b} = ${c.c}`;
  return <g><Scale left={L} right={R} diff={0} groups={grouped} label={label}/>{scene >= 5 && <T x={W / 2} y={80} size={18} color={C.good}>check: {c.a} × {x} + {c.b} = {c.c} ✓</T>}</g>;
}

function Explore({c}: {c: BalanceConfig}) {
  const sound = useSound();
  const xTrue = c.mode === 'equation' ? (c.c - c.b) / c.a : c.mode === 'equality' ? 7 : 0;
  const start = c.mode === 'equation' ? {bx: c.a, ul: c.b, ur: c.c} : {bx: 1, ul: 3, ur: 10};
  const [st, setSt] = useState(start); const [log, setLog] = useState<string[]>([]); const [aVal, setA] = useState(2);
  if (c.mode === 'expression') return <Stage label={`${c.coef}a + ${c.constant} with a = ${aVal}`} controls={<><Slider label="a" value={aVal} min={0} max={12} onChange={setA}/><Readout>{c.coef} × {aVal} + {c.constant} = {c.coef * aVal + c.constant}</Readout></>}><Scene c={c} scene={3} p={aVal / 6}/></Stage>;
  const diff = st.bx * xTrue + st.ul - st.ur;
  const act = (name: string, next: typeof st) => { if (next.ul < 0 || next.ur < 0 || next.bx < 1) { sound('error'); return; } setSt(next); setLog([...log, name].slice(-4)); const d = next.bx * xTrue + next.ul - next.ur; sound(Math.abs(d) < 1e-9 ? (next.bx === 1 && next.ul === 0 ? 'success' : 'click') : 'error'); };
  const solved = st.bx === 1 && st.ul === 0 && Math.abs(diff) < 1e-9;
  return <Stage label={`${st.bx}x + ${st.ul} and ${st.ur}`} controls={<>
    <Action onClick={() => act('−1 from both', {...st, ul: st.ul - 1, ur: st.ur - 1})} disabled={st.ul < 1}>Remove 1 from both</Action>
    <Action onClick={() => act('−1 from left only', {...st, ul: st.ul - 1})} disabled={st.ul < 1}>Remove 1 from left only</Action>
    <Action onClick={() => { if (st.ul === 0 && st.ur % st.bx === 0) act(`÷${st.bx} both`, {bx: 1, ul: 0, ur: st.ur / st.bx}); else sound('error'); }} disabled={st.bx === 1}>Divide both by {st.bx}</Action>
    <Action onClick={() => { setSt(start); setLog([]); }}>Reset</Action>
    <Readout>{solved ? `Solved: x = ${st.ur}. Check: ${c.mode === 'equation' ? `${c.a} × ${st.ur} + ${c.b} = ${c.c}` : `${st.ur} + 3 = 10`}` : Math.abs(diff) < 1e-9 ? `${st.bx}x${st.ul ? ' + ' + st.ul : ''} = ${st.ur} — still balanced` : 'Unbalanced! Undo by doing the same to the other side.'} {log.length ? `· ${log.join(' → ')}` : ''}</Readout></>}>
    <Scale left={[...boxes(st.bx), ...units(st.ul)]} right={units(st.ur)} diff={diff} label={`${st.bx === 1 ? '' : st.bx}x${st.ul ? ` + ${st.ul}` : ''} ${Math.abs(diff) < 1e-9 ? '=' : '≠'} ${st.ur}`}/>
  </Stage>;
}

export const balanceView: EngineView<BalanceConfig> = {Scene: props => <Stage label={balance.describe(props.c)}><Scene {...props}/></Stage>, Explore};

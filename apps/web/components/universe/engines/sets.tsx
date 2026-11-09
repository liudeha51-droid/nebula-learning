'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Segmented, Slider} from '../stage';
import {sets, A, B, U, type SetsConfig} from '@/lib/universe/engines/sets';
import {eseg, lerp} from '@/lib/universe/math';
import type {EngineView} from './types';

type Op = 'none' | 'and' | 'or' | 'notA';
const CA: [number, number] = [320, 230], CB: [number, number] = [480, 230], R = 140;
const region = (x: number) => (A.includes(x) && B.includes(x) ? 'both' : A.includes(x) ? 'A' : B.includes(x) ? 'B' : 'out');
function pos(x: number, i: number): [number, number] {
  const r = region(x); const k = U.filter(v => region(v) === r).indexOf(x);
  if (r === 'both') return [400, 170 + k * 40]; if (r === 'A') return [250 + (k % 2) * 40, 200 + Math.floor(k / 2) * 50]; if (r === 'B') return [520 + (k % 2) * 40, 200 + Math.floor(k / 2) * 50];
  void i; return [120 + k * 60, 410];
}
function Venn({op, placed = 99, t = 1}: {op: Op; placed?: number; t?: number}) {
  const shade = (r: string) => op === 'and' ? r === 'both' : op === 'or' ? r !== 'out' : op === 'notA' ? r === 'B' || r === 'out' : false;
  return <g><rect x={60} y={50} width={680} height={390} rx={14} fill={op === 'notA' ? C.accent : 'none'} fillOpacity={op === 'notA' ? .08 * t : 0} stroke={C.line}/><T x={90} y={70} size={14} color={C.muted}>U</T>
    <defs><clipPath id="u-venn-a"><circle cx={CA[0]} cy={CA[1]} r={R}/></clipPath></defs>
    <circle cx={CA[0]} cy={CA[1]} r={R} fill={op === 'or' ? C.ones : op === 'notA' ? '#15141d' : 'none'} fillOpacity={op === 'or' ? .25 * t : op === 'notA' ? 1 : 0} stroke={C.ones} strokeWidth={3}/>
    <circle cx={CB[0]} cy={CB[1]} r={R} fill={op === 'or' || op === 'notA' ? (op === 'notA' ? C.accent : C.tens) : 'none'} fillOpacity={op === 'or' ? .25 * t : op === 'notA' ? .08 * t : 0} stroke={C.tens} strokeWidth={3}/>
    {op === 'notA' && <circle cx={CA[0]} cy={CA[1]} r={R} fill="#15141d" stroke={C.ones} strokeWidth={3}/>}
    {op === 'and' && <circle cx={CB[0]} cy={CB[1]} r={R} fill={C.unknown} fillOpacity={.35 * t} clipPath="url(#u-venn-a)"/>}
    <T x={CA[0] - 90} y={CA[1] - 120} size={18} color={C.ones} weight={700}>A</T><T x={CB[0] + 90} y={CB[1] - 120} size={18} color={C.tens} weight={700}>B</T>
    {U.slice(0, placed).map((x, i) => { const q = pos(x, i); return <T key={x} x={q[0]} y={q[1]} size={18} weight={shade(region(x)) ? 700 : 400} color={shade(region(x)) ? '#fff' : C.muted}>{x}</T>; })}</g>;
}
function Nested({t = 1, probe}: {t?: number; probe?: number}) {
  const X = (v: number) => 120 + v * 100;
  return <g><line x1={80} x2={720} y1={330} y2={330} stroke={C.muted} strokeWidth={2}/>{[0, 1, 2, 3, 4, 5].map(v => <g key={v}><line x1={X(v)} x2={X(v)} y1={324} y2={336} stroke={C.muted}/><T x={X(v)} y={354} size={13}>{v}</T></g>)}
    <rect x={X(1)} y={240} width={lerp(0, 720 - X(1), t)} height={30} rx={6} fill={C.tens} opacity={.35}/><T x={X(1) + 40} y={225} size={14} color={C.tens}>Q: x &gt; 1</T>
    <rect x={X(2)} y={280} width={lerp(0, 720 - X(2), t)} height={30} rx={6} fill={C.ones} opacity={.5}/><T x={X(2) + 40} y={300} size={14} color="#15141d">P: x &gt; 2</T>
    {probe !== undefined && <><circle cx={X(probe)} cy={330} r={8} fill={C.unknown}/><T x={X(probe)} y={380} size={14} color={C.unknown}>x = {probe}: {probe > 2 ? 'in P and Q' : probe > 1 ? 'in Q only' : 'in neither'}</T></>}</g>;
}

function Scene({c, scene, p}: {c: SetsConfig; scene: number; p: number}) {
  if (c.mode === 'conditions') return <g><Nested t={scene < 2 ? 0 : scene === 2 ? eseg(p, 0, .8) : 1} probe={scene === 3 ? 1.5 : undefined}/><T x={W / 2} y={60} size={22} weight={600}>{scene >= 4 ? 'P ⊆ Q ⇔ p ⇒ q' : 'p: x > 2    q: x > 1'}</T>{scene >= 4 && <T x={W / 2} y={100} size={16} color={C.muted}>p is sufficient for q; q is necessary for p</T>}</g>;
  const op: Op = scene < 3 ? 'none' : scene === 3 ? (['and', 'or', 'notA'] as Op[])[Math.min(2, Math.floor(p * 3))] : 'and';
  return <g><Venn op={op} placed={scene < 2 ? 0 : scene === 2 ? Math.ceil(p * 12) : 12} t={1}/><T x={W / 2} y={30} size={18}>{op === 'and' ? 'A ∩ B' : op === 'or' ? 'A ∪ B' : op === 'notA' ? '∁ᵤA' : 'A = factors of 12 · B = even numbers'}</T></g>;
}

function Explore({c}: {c: SetsConfig}) {
  const [op, setOp] = useState<Op>('and'); const [probe, setProbe] = useState(1.5);
  if (c.mode === 'conditions') return <Stage label="Conditions" controls={<><Slider label="Test x" value={probe} min={0} max={5} step={.25} onChange={setProbe}/><Readout>{probe > 2 ? 'p true ⇒ q true' : probe > 1 ? 'q true but p false: q does not imply p' : 'both false'}</Readout></>}><Nested probe={probe}/></Stage>;
  const members = U.filter(x => op === 'and' ? A.includes(x) && B.includes(x) : op === 'or' ? A.includes(x) || B.includes(x) : op === 'notA' ? !A.includes(x) : false);
  return <Stage label="Set operations" controls={<><Segmented label="Operation" value={op} onChange={setOp} options={[['and', 'A ∩ B'], ['or', 'A ∪ B'], ['notA', '∁A']]}/><Readout>{'{'}{members.join(', ')}{'}'} · {members.length} elements</Readout></>}><Venn op={op}/></Stage>;
}

export const setsView: EngineView<SetsConfig> = {Scene: props => <Stage label={sets.describe(props.c)}><Scene {...props}/></Stage>, Explore};

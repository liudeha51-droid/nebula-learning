'use client';
import {useState} from 'react';
import {Stage, T, C, W, Stepper, Readout, Slider, Segmented} from '../stage';
import {fraction, fr, frS, mixed, type FractionConfig} from '@/lib/universe/engines/fraction';
import {eseg, fmt, gcd, lcm, lerp, seg} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

const PERSON = [C.ones, C.tens, C.hundreds, C.thousands, C.accent, C.unknown, '#c8e07a', '#ffd0a0', '#9fd8ff'];

function Bar({x, y, w = 560, h = 56, d, shaded, color = C.hundreds, sub = 1, label, lineOpacity = 1, shadeFrom = 0}: {x: number; y: number; w?: number; h?: number; d: number; shaded: number; color?: string; sub?: number; label?: string; lineOpacity?: number; shadeFrom?: number}) {
  const pw = w / d;
  return <g><rect x={x} y={y} width={w} height={h} rx={6} fill="#1f1d2b" stroke={C.line} strokeWidth={2}/>
    {range(d).map(i => i >= shadeFrom && i < shadeFrom + shaded && <rect key={i} x={x + i * pw + 1} y={y + 1} width={pw - 2} height={h - 2} rx={4} fill={color} opacity={.8}/>)}
    {range(d * sub).map(i => i > 0 && <line key={i} x1={x + (i * w) / (d * sub)} x2={x + (i * w) / (d * sub)} y1={y} y2={y + h} stroke="#ffffff" strokeOpacity={i % sub === 0 ? .55 : .3 * lineOpacity} strokeWidth={i % sub === 0 ? 2 : 1}/>)}
    {label && <T x={x + w + 40} y={y + h / 2} size={24} weight={600} color={color}>{label}</T>}</g>;
}
function Pie({cx, cy, r, d, shaded, color = C.ones, cuts = 1, angles, colors}: {cx: number; cy: number; r: number; d: number; shaded: number; color?: string; cuts?: number; angles?: number[]; colors?: string[]}) {
  const a = angles ?? range(d + 1).map(i => (i / d) * 360);
  const pt = (deg: number) => [cx + r * Math.cos((deg - 90) * Math.PI / 180), cy + r * Math.sin((deg - 90) * Math.PI / 180)];
  return <g><circle cx={cx} cy={cy} r={r} fill="#2b2533" stroke="#5a4f6e" strokeWidth={3}/>
    {range(a.length - 1).map(i => { const [x1, y1] = pt(a[i]), [x2, y2] = pt(a[i + 1]); const big = a[i + 1] - a[i] > 180 ? 1 : 0; const fill = colors ? colors[i] : i < shaded ? color : undefined;
      return <g key={i}>{fill && <path d={`M${cx} ${cy}L${x1} ${y1}A${r} ${r} 0 ${big} 1 ${x2} ${y2}Z`} fill={fill} opacity={.85}/>}
        {cuts > 0 && a.length > 2 && <line x1={cx} y1={cy} x2={x1} y2={y1} stroke="#15141d" strokeWidth={3} opacity={cuts}/>}</g>; })}</g>;
}

function Scene({c, scene, p}: {c: FractionConfig; scene: number; p: number}) {
  const [an, ad] = c.a, [bn, bd] = c.b;
  switch (c.mode) {
    case 'compare': case 'common': { const L = lcm(ad, bd); const regrid = scene >= 3 && ad !== bd && an !== bn; const k = regrid ? eseg(scene === 3 ? p : 1, 0, .6) : 0;
      const s = an * bd - bn * ad;
      return <g><Bar x={100} y={110} d={ad} shaded={an} sub={regrid && k > .5 ? L / ad : 1} color={C.ones} label={k > .5 ? `${an * L / ad}/${L}` : fr(c.a)}/>
        <Bar x={100} y={230} d={bd} shaded={bn} sub={regrid && k > .5 ? L / bd : 1} color={C.tens} label={k > .5 ? `${bn * L / bd}/${L}` : fr(c.b)}/>
        {scene >= 2 && <line x1={100} x2={100} y1={90} y2={310} stroke={C.accent} strokeDasharray="4 4"/>}
        {scene >= 2 && <><line x1={100 + 560 * an / ad} x2={100 + 560 * an / ad} y1={100} y2={300} stroke={C.ones} strokeWidth={2} strokeDasharray="3 5"/><line x1={100 + 560 * bn / bd} x2={100 + 560 * bn / bd} y1={100} y2={300} stroke={C.tens} strokeWidth={2} strokeDasharray="3 5"/></>}
        <T x={W / 2} y={50} size={28} weight={600}>{fr(c.a)} {scene >= 4 ? (s > 0 ? '>' : s < 0 ? '<' : '=') : '?'} {fr(c.b)}</T></g>; }
    case 'add-same': { const join = scene === 2 ? eseg(p, .1, .8) : scene > 2 ? 1 : 0; const pw = 560 / ad;
      return <g><Bar x={100} y={150} d={ad} shaded={an} color={C.ones}/>
        {range(bn).map(i => <rect key={i} x={100 + (an + i) * pw + 1} y={lerp(260, 151, join)} width={pw - 2} height={54} rx={4} fill={C.tens} opacity={.85}/>)}
        <T x={W / 2} y={60} size={28} weight={600}>{fr(c.a)} + {fr(c.b)} = {scene >= 4 ? `${an + bn}/${ad}` : '?'}</T>
        {scene === 3 && <T x={W / 2} y={330} size={20} color={C.muted}>every piece is still 1/{ad}</T>}</g>; }
    case 'equivalent': { const k = scene < 2 ? 1 : scene === 2 ? 2 : scene === 3 ? 2 + Math.min(2, Math.floor(p * 3)) : 4;
      return <g><Bar x={100} y={150} d={c.d} shaded={c.n} sub={k}/><T x={W / 2} y={60} size={30} weight={600}>{c.n}/{c.d}{k > 1 ? ` = ${c.n * k}/${c.d * k}` : ''}</T>
        {scene >= 4 && <T x={W / 2} y={300} size={22} color={C.muted}>{range(4).map(i => `${c.n * (i + 1)}/${c.d * (i + 1)}`).join(' = ')}</T>}</g>; }
    case 'simplify': { const g = gcd(c.n, c.d); const merge = scene === 2 ? seg(p, .2, .9) : scene > 2 ? 1 : 0;
      return <g><Bar x={100} y={150} d={c.d / g} shaded={c.n / g} sub={g} lineOpacity={1 - merge}/>
        <T x={W / 2} y={60} size={30} weight={600}>{c.n}/{c.d}{merge >= 1 ? ` = ${frS(c.n, c.d)}` : ''}</T>
        {scene >= 3 && <T x={W / 2} y={300} size={20} color={C.muted}>{c.n} ÷ {g} = {c.n / g}, {c.d} ÷ {g} = {c.d / g}</T>}</g>; }
    case 'add-diff': { const L = lcm(ad, bd); const sub = c.op === 'sub'; const regrid = scene >= 3; const R = sub ? an * L / ad - bn * L / bd : an * L / ad + bn * L / bd;
      return <g><Bar x={100} y={90} d={ad} shaded={an} sub={regrid ? L / ad : 1} color={C.ones} label={regrid ? `${an * L / ad}/${L}` : fr(c.a)}/>
        <Bar x={100} y={170} d={bd} shaded={bn} sub={regrid ? L / bd : 1} color={C.tens} label={regrid ? `${bn * L / bd}/${L}` : fr(c.b)}/>
        {scene >= 4 && <Bar x={100} y={280} d={L} shaded={R} color={C.hundreds} label={frS(R, L)}/>}
        <T x={W / 2} y={45} size={26} weight={600}>{fr(c.a)} {sub ? '−' : '+'} {fr(c.b)} = {scene >= 4 ? frS(R, L) : '?'}</T>
        {scene === 2 && <T x={W / 2} y={290} size={20} color={C.warn}>1/{ad} and 1/{bd} are different sizes</T>}</g>; }
    case 'improper': { const pies = Math.ceil(c.n / c.d); const filled = scene < 2 ? 0 : scene === 2 ? Math.floor(p * c.n) : c.n;
      return <g>{range(pies).map(k => <Pie key={k} cx={W / 2 + (k - (pies - 1) / 2) * 170} cy={210} r={70} d={c.d} shaded={Math.max(0, Math.min(c.d, filled - k * c.d))} color={C.ones}/>)}
        <T x={W / 2} y={60} size={30} weight={600}>{c.n}/{c.d}{scene >= 3 ? ` = ${mixed(c.n, c.d)}` : ''}</T></g>; }
    case 'division-link': { const persons = c.d; const assemble = scene >= 4;
      return <g>{range(c.n).map(k => <Pie key={k} cx={W / 2 + (k - (c.n - 1) / 2) * 160} cy={assemble ? 150 : 200} r={assemble ? 50 : 65} d={c.d} shaded={0} cuts={scene >= 2 ? (scene === 2 ? p : 1) : 0} colors={scene >= 3 ? range(c.d).map(j => PERSON[j % 9]) : undefined}/>)}
        {assemble && <><Pie cx={W / 2} cy={330} r={60} d={c.d} shaded={c.n} color={PERSON[0]}/><T x={W / 2 + 120} y={330} size={22} color={PERSON[0]} anchor="start">person 1: {c.n}/{c.d}</T></>}
        <T x={W / 2} y={40} size={26} weight={600}>{c.n} ÷ {c.d} = {scene >= 4 ? `${c.n}/${c.d}` : '?'}</T>
        {scene === 3 && range(persons).map(j => <T key={j} x={120 + j * 90} y={330} size={16} color={PERSON[j % 9]}>person {j + 1}</T>)}</g>; }
    case 'of-quantity': { const g = c.whole / c.d; const grouped = scene >= 2; const taken = scene >= 3 ? c.n : 0;
      return <g>{range(c.whole).map(i => { const row = Math.floor(i / g), col = i % g; const x = grouped ? 220 + col * 40 : 140 + (i % 12) * 44, y = grouped ? 100 + row * 54 : 120 + Math.floor(i / 12) * 44;
        return <circle key={i} cx={x} cy={y} r={14} fill={row < taken ? C.ones : '#4a4560'}/>; })}
        {grouped && range(c.d).map(row => <rect key={row} x={196} y={78 + row * 54} width={g * 40 + 8} height={44} rx={10} fill="none" stroke={row < taken ? C.ones : C.line}/>)}
        <T x={W / 2} y={30} size={24} weight={600}>{c.n}/{c.d} of {c.whole} = {scene >= 4 ? c.n * g : '?'}</T></g>; }
    case 'whole-from-part': { const unit = c.part / c.n; const showWhole = scene >= 3;
      return <g><Bar x={120} y={170} d={c.d} shaded={c.n} color={C.tens}/>
        <path d={`M120 160 V145 H${120 + 560 * c.n / c.d} V160`} fill="none" stroke={C.tens} strokeWidth={2}/><T x={120 + 280 * c.n / c.d} y={128} size={20} color={C.tens}>{c.part}</T>
        {scene >= 2 && range(c.n).map(i => <T key={i} x={120 + (i + .5) * 560 / c.d} y={198} size={18} weight={700} color="#15141d">{unit}</T>)}
        {showWhole && <><path d={`M120 240 V255 H680 V240`} fill="none" stroke={C.ones} strokeWidth={2}/><T x={400} y={278} size={22} color={C.ones}>whole = {c.d} × {unit} = {c.d * unit}</T>{range(c.d - c.n).map(i => <T key={i} x={120 + (c.n + i + .5) * 560 / c.d} y={198} size={18} color={C.muted}>{unit}</T>)}</>}
        <T x={W / 2} y={50} size={24} weight={600}>{c.n}/{c.d} of ? = {c.part}</T></g>; }
    case 'multiply': { const s = 260, x0 = 270, y0 = 90; const first = scene >= 2 ? (scene === 2 ? p : 1) : 0; const second = scene >= 3 ? (scene === 3 ? p : 1) : 0;
      return <g><rect x={x0} y={y0} width={s} height={s} fill="#1f1d2b" stroke={C.line} strokeWidth={2}/>
        {first > 0 && <rect x={x0} y={y0} width={s * an / ad * first} height={s} fill={C.ones} opacity={.35}/>}
        {second > 0 && <rect x={x0} y={y0} width={s * an / ad} height={s * bn / bd * second} fill={C.unknown} opacity={.55}/>}
        {range(ad).map(i => i > 0 && <line key={'c' + i} x1={x0 + s * i / ad} x2={x0 + s * i / ad} y1={y0} y2={y0 + s} stroke="#fff" strokeOpacity={.35}/>)}
        {scene >= 3 && range(bd).map(i => i > 0 && <line key={'r' + i} x1={x0} x2={x0 + s} y1={y0 + s * i / bd} y2={y0 + s * i / bd} stroke="#fff" strokeOpacity={.35}/>)}
        <T x={x0 + s * an / ad / 2} y={y0 - 14} size={18} color={C.ones}>{fr(c.a)}</T><T x={x0 - 30} y={y0 + s * bn / bd / 2} size={18} color={C.unknown}>{fr(c.b)}</T>
        <T x={W / 2} y={40} size={26} weight={600}>{fr(c.a)} × {fr(c.b)} = {scene >= 4 ? `${an * bn}/${ad * bd}${frS(an * bn, ad * bd) !== `${an * bn}/${ad * bd}` ? ` = ${frS(an * bn, ad * bd)}` : ''}` : '?'}</T></g>; }
    case 'divide': { const A = an / ad, B = bn / bd; const max = Math.ceil(A); const x0 = 90, w = 620; const X = (v: number) => x0 + (v / max) * w; const q = A / B; const jumps = scene < 2 ? 0 : scene === 2 ? Math.floor(p * q + .001) : Math.floor(q + 1e-9);
      return <g><line x1={x0} x2={x0 + w} y1={260} y2={260} stroke={C.muted} strokeWidth={2}/>
        {range(max * bd + 1).map(i => <line key={i} x1={X(i / bd)} x2={X(i / bd)} y1={i % bd === 0 ? 248 : 254} y2={i % bd === 0 ? 272 : 266} stroke={C.muted}/>)}
        {range(max + 1).map(i => <T key={i} x={X(i)} y={292} size={16}>{i}</T>)}
        <rect x={x0} y={226} width={X(A) - x0} height={14} rx={4} fill={C.hundreds} opacity={.6}/>
        {range(jumps).map(j => <path key={j} d={`M${X(j * B)} 240 Q${(X(j * B) + X((j + 1) * B)) / 2} ${200 - Math.min(40, 400 / q)} ${X((j + 1) * B)} 240`} fill="none" stroke={C.ones} strokeWidth={2.5}/>)}
        {scene >= 3 && <T x={W / 2} y={150} size={24} color={C.ones}>{fmt(q)} jumps of {fr(c.b)}</T>}
        <T x={W / 2} y={60} size={26} weight={600}>{ad === 1 ? an : fr(c.a)} ÷ {fr(c.b)} = {scene >= 3 ? fmt(q) : '?'}</T></g>; }
    default: { const unequal = scene === 2; const angles = unequal ? [0, 60, 200, 260, 360].slice(0, Math.min(c.d, 4) + 1) : undefined;
      const shade = scene >= 4 ? c.n : 0;
      return <g><Pie cx={250} cy={220} r={110} d={unequal ? Math.min(c.d, 4) : c.d} shaded={shade} angles={unequal && angles && angles.length > 2 ? [...angles.slice(0, -1), 360] : undefined} cuts={scene >= 2 ? (scene === 3 ? p : 1) : 0} color={C.ones}/>
        {scene >= 3 && <Bar x={420} y={190} w={320} d={c.d} shaded={shade} color={C.ones}/>}
        {unequal && <T x={250} y={370} size={22} color={C.warn}>Unequal pieces — not quarters!</T>}
        {scene >= 5 && <><T x={580} y={110} size={60} weight={700} color={C.ones}>{c.n}</T><line x1={545} x2={615} y1={145} y2={145} stroke={C.ink} strokeWidth={3}/><T x={580} y={300} size={60} weight={700} color={C.hundreds}>{c.d}</T>
          <T x={680} y={110} size={14} color={C.muted} anchor="start">numerator: parts taken</T><T x={680} y={300} size={14} color={C.muted} anchor="start">denominator: equal parts</T></>}
        {scene === 4 && <T x={W / 2} y={60} size={28} weight={600}>{c.n}/{c.d}</T>}</g>; }
  }
}

/** Explore: change the numbers and see the discovered state of the same model update instantly. */
function Explore({c}: {c: FractionConfig}) {
  const two = ['compare', 'common', 'add-same', 'add-diff', 'multiply', 'divide'].includes(c.mode);
  const [a, setA] = useState(c.a), [b, setB] = useState(c.b), [n, setN] = useState(c.n), [d, setD] = useState(c.d), [whole, setWhole] = useState(c.whole), [part, setPart] = useState(c.part);
  const [op, setOp] = useState(c.op); const [k, setK] = useState(2);
  let cfg: FractionConfig = {...c, a, b, n, d, whole, part, op}; let readout = '';
  if (c.mode === 'add-same') { cfg = {...cfg, b: [Math.min(b[0], a[1] - a[0]), a[1]]}; readout = `${fr(cfg.a)} + ${fr(cfg.b)} = ${cfg.a[0] + cfg.b[0]}/${a[1]}`; }
  if (c.mode === 'add-diff') { const L = lcm(a[1], b[1]); const R = op === 'sub' ? a[0] * L / a[1] - b[0] * L / b[1] : a[0] * L / a[1] + b[0] * L / b[1]; if (R < 0) cfg = {...cfg, op: 'add'}; readout = `${fr(a)} ${cfg.op === 'sub' ? '−' : '+'} ${fr(b)} = ${frS(Math.abs(cfg.op === 'sub' ? R : a[0] * L / a[1] + b[0] * L / b[1]), L)} (common denominator ${L})`; }
  if (c.mode === 'compare' || c.mode === 'common') { const s = a[0] * b[1] - b[0] * a[1]; readout = `${fr(a)} ${s > 0 ? '>' : s < 0 ? '<' : '='} ${fr(b)} · common denominator ${lcm(a[1], b[1])}`; }
  if (c.mode === 'multiply') readout = `${fr(a)} × ${fr(b)} = ${a[0] * b[0]}/${a[1] * b[1]} = ${frS(a[0] * b[0], a[1] * b[1])}`;
  if (c.mode === 'divide') readout = `${fr(a)} ÷ ${fr(b)} = ${fmt((a[0] / a[1]) / (b[0] / b[1]))}`;
  if (c.mode === 'equivalent') readout = `${n}/${d} = ${n * k}/${d * k}`;
  if (c.mode === 'simplify') readout = `${n}/${d} = ${frS(n, d)} (divide by ${gcd(n, d)})`;
  if (c.mode === 'improper') readout = `${n}/${d} = ${mixed(n, d)}`;
  if (c.mode === 'of-quantity') { cfg = {...cfg, whole: Math.max(d, Math.round(whole / d) * d)}; readout = `${n}/${d} of ${cfg.whole} = ${cfg.whole / d * n}`; }
  if (c.mode === 'whole-from-part') { cfg = {...cfg, part: Math.max(n, Math.round(part / n) * n)}; readout = `whole = ${cfg.part} ÷ ${n} × ${d} = ${cfg.part / n * d}`; }
  if (c.mode === 'division-link') readout = `${n} ÷ ${d} = ${n}/${d}`;
  if (c.mode === 'parts') readout = `${n} of ${d} equal parts = ${n}/${d}`;
  const sceneFor = c.mode === 'equivalent' ? 3 : c.mode === 'divide' ? 3 : 5;
  const fracStep = (label: string, f: number[], set: (v: number[]) => void, maxN = 12) => <><Stepper label={`${label} top`} value={f[0]} min={c.mode === 'divide' && label === 'Second' ? 1 : 0} max={maxN} onChange={v => set([v, f[1]])}/><Stepper label={`${label} bottom`} value={f[1]} min={1} max={12} onChange={v => set([f[0], v])}/></>;
  return <Stage label={readout} controls={<>
    {two ? <>{fracStep('First', a, setA)}{c.mode !== 'add-same' ? fracStep('Second', b, setB) : <Stepper label="Second top" value={b[0]} min={0} max={a[1] - a[0]} onChange={v => setB([v, a[1]])}/>}
      {c.mode === 'add-diff' && <Segmented label="Operation" value={op} onChange={setOp} options={[['add', '+'], ['sub', '−']]}/>}</>
      : <><Stepper label="Numerator" value={n} min={c.mode === 'whole-from-part' || c.mode === 'division-link' ? 1 : 0} max={c.mode === 'improper' || c.mode === 'division-link' ? 24 : d} onChange={setN}/><Stepper label="Denominator" value={d} min={1} max={12} onChange={v => { setD(v); if (n > v && !['improper', 'division-link'].includes(c.mode)) setN(v); }}/>
        {c.mode === 'equivalent' && <Slider label="Cut each part into" value={k} min={1} max={6} onChange={setK}/>}
        {c.mode === 'of-quantity' && <Stepper label="Whole" value={whole} min={d} max={48} step={d} onChange={setWhole}/>}
        {c.mode === 'whole-from-part' && <Stepper label="Known part" value={part} min={n} max={60} step={n} onChange={setPart}/>}</>}
    <Readout>{readout}</Readout></>}>
    {c.mode === 'equivalent' ? <><Bar x={100} y={150} d={d} shaded={n} sub={k}/><T x={W / 2} y={60} size={30} weight={600}>{readout}</T></>
      : c.mode === 'simplify' ? <><Bar x={100} y={110} d={d} shaded={n} color={C.ones}/><Bar x={100} y={230} d={d / gcd(n, d)} shaded={n / gcd(n, d)}/><T x={W / 2} y={50} size={28}>{readout}</T></>
      : <Scene c={cfg} scene={sceneFor} p={1}/>}
  </Stage>;
}

export const fractionView: EngineView<FractionConfig> = {Scene: props => <Stage label={fraction.describe(props.c)}><Scene {...props}/></Stage>, Explore};

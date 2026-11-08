'use client';
import {useState} from 'react';
import {Stage, T, C, W, Stepper, Readout, Slider, Segmented, Handle} from '../stage';
import {area, inLeaf, leafCounts, type AreaConfig} from '@/lib/universe/engines/area';
import {clamp, eseg, lerp} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

type Pt = [number, number];
/** Unit-coordinate frame (y up) mapped onto the stage. */
const frame = (ox: number, oy: number, s: number) => ({X: (u: number) => ox + u * s, Y: (v: number) => oy - v * s, s});
const poly = (pts: Pt[], f: ReturnType<typeof frame>) => pts.map(([u, v]) => `${f.X(u)},${f.Y(v)}`).join(' ');
function GridBg({f, cols, rows}: {f: ReturnType<typeof frame>; cols: number; rows: number}) {
  return <g>{range(cols + 1).map(i => <line key={'v' + i} x1={f.X(i)} x2={f.X(i)} y1={f.Y(0)} y2={f.Y(rows)} stroke="#fff" strokeOpacity={.07}/>)}{range(rows + 1).map(j => <line key={'h' + j} x1={f.X(0)} x2={f.X(cols)} y1={f.Y(j)} y2={f.Y(j)} stroke="#fff" strokeOpacity={.07}/>)}</g>;
}
const fit = (wu: number, hu: number) => Math.min(48, 620 / wu, 300 / hu);

function Rect({l, w, tiles, walk = -1, f}: {l: number; w: number; tiles: number; walk?: number; f: ReturnType<typeof frame>}) {
  const per = 2 * (l + w); const d = walk * per; const along = (t: number): Pt => t <= l ? [t, 0] : t <= l + w ? [l, t - l] : t <= 2 * l + w ? [l - (t - l - w), w] : [0, w - (t - 2 * l - w)];
  return <g><rect x={f.X(0)} y={f.Y(w)} width={l * f.s} height={w * f.s} fill="#1f1d2b" stroke={C.ink} strokeWidth={2}/>
    {range(Math.min(tiles, l * w)).map(i => <rect key={i} x={f.X(i % l) + 2} y={f.Y(Math.floor(i / l) + 1) + 2} width={f.s - 4} height={f.s - 4} rx={3} fill={Math.floor(i / l) % 2 ? C.tens : C.ones} opacity={.7}/>)}
    {walk >= 0 && <><polyline points={range(Math.ceil(d * 4) + 1).map(k => { const p = along(Math.min(d, k / 4)); return `${f.X(p[0])},${f.Y(p[1])}`; }).join(' ')} fill="none" stroke={C.unknown} strokeWidth={5}/>{(() => { const p = along(d); return <circle cx={f.X(p[0])} cy={f.Y(p[1])} r={9} fill={C.unknown}/>; })()}</>}
    <T x={f.X(l / 2)} y={f.Y(0) + 22} size={16} color={C.muted}>{l}</T><T x={f.X(0) - 18} y={f.Y(w / 2)} size={16} color={C.muted}>{w}</T></g>;
}

/** Copy of shape `t1` that starts offset by (dx,dy), turns 180° about its own centre, then slides to its
 *  final place: the 180° rotation of t1 about point m. Every vertex stays visible throughout. */
function rotJoin(t1: Pt[], m: Pt, join: number, dx: number, dy: number): Pt[] {
  const n = t1.length; const g: Pt = [t1.reduce((s, q) => s + q[0], 0) / n + dx, t1.reduce((s, q) => s + q[1], 0) / n + dy];
  const turn = eseg(join, 0, .5) * Math.PI, slide = eseg(join, .5, 1); const gFinal: Pt = [2 * m[0] - (g[0] - dx), 2 * m[1] - (g[1] - dy)];
  return t1.map(([u, v]) => { const x = u + dx - g[0], y = v + dy - g[1]; const rx = x * Math.cos(turn) - y * Math.sin(turn), ry = x * Math.sin(turn) + y * Math.cos(turn); return [g[0] + rx + (gFinal[0] - g[0]) * slide, g[1] + ry + (gFinal[1] - g[1]) * slide] as Pt; });
}

function Scene({c, scene, p}: {c: AreaConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'perimeter': { const s = fit(c.l, c.w); const f = frame(W / 2 - c.l * s / 2, 300, s); const per = 2 * (c.l + c.w);
      if (scene === 3) { const t = eseg(p, .1, .8); return <g><Rect l={c.l} w={c.w} tiles={0} f={f}/><line x1={lerp(f.X(0), 400 - per * 12, t)} x2={lerp(f.X(c.l), 400 + per * 12, t)} y1={lerp(300, 380, t)} y2={lerp(300, 380, t)} stroke={C.unknown} strokeWidth={5}/><T x={W / 2} y={410} size={18} color={C.unknown}>{per} m of fence in one line</T></g>; }
      return <g><Rect l={c.l} w={c.w} tiles={0} f={f} walk={scene === 2 ? p : scene > 2 ? 1 : -1}/><T x={W / 2} y={50} size={24} weight={600}>{scene >= 4 ? `C = (${c.l} + ${c.w}) × 2 = ${per}` : scene === 2 ? `walked ${Math.round(p * per)} m` : 'How long is the fence?'}</T></g>; }
    case 'perimeter-vs-area': { const half = c.perimeter / 2; const opts = range(Math.floor(half / 2)).map(i => i + 1); const k = scene < 2 ? 0 : scene === 2 ? Math.min(opts.length - 1, Math.floor(p * opts.length)) : opts.length - 1;
      const wd = opts[k], ln = half - wd; const s = Math.min(26, 360 / ln); const f = frame(80, 330, s);
      return <g><rect x={f.X(0)} y={f.Y(wd)} width={ln * s} height={wd * s} fill={C.tens} opacity={.35} stroke={C.tens} strokeWidth={3}/><T x={f.X(ln / 2)} y={f.Y(wd) - 16} size={16}>{ln} × {wd}</T>
        {scene >= 3 && opts.map((w2, i) => <g key={i}><rect x={560 + i * 34} y={330 - (half - w2) * w2 * 3} width={26} height={(half - w2) * w2 * 3} fill={i === opts.length - 1 ? C.ones : C.hundreds} opacity={.8}/><T x={573 + i * 34} y={345} size={11} color={C.muted}>{half - w2}×{w2}</T><T x={573 + i * 34} y={322 - (half - w2) * w2 * 3} size={11}>{(half - w2) * w2}</T></g>)}
        <T x={W / 2} y={45} size={22} weight={600}>perimeter {c.perimeter} m · area {ln * wd} m²</T></g>; }
    case 'parallelogram': { const s = fit(c.base + c.slant, c.h); const f = frame(W / 2 - (c.base + c.slant) * s / 2, 340, s); const cut = scene === 3 ? eseg(p, .15, .85) : scene > 3 ? 1 : 0;
      const body: Pt[] = [[c.slant, 0], [c.base, 0], [c.base + c.slant, c.h], [c.slant, c.h]]; const tri: Pt[] = [[0, 0], [c.slant, 0], [c.slant, c.h]].map(([u, v]) => [u + cut * c.base, v]) as Pt[];
      return <g><GridBg f={f} cols={c.base + c.slant} rows={c.h}/>
        {scene < 3 ? <polygon points={poly([[0, 0], [c.base, 0], [c.base + c.slant, c.h], [c.slant, c.h]], f)} fill={C.hundreds} opacity={.45} stroke={C.hundreds} strokeWidth={3}/>
          : <><polygon points={poly(body, f)} fill={C.hundreds} opacity={.45} stroke={C.hundreds} strokeWidth={2}/><polygon points={poly(tri, f)} fill={C.unknown} opacity={.6} stroke={C.unknown} strokeWidth={2}/></>}
        {scene >= 2 && <line x1={f.X(c.slant)} x2={f.X(c.slant)} y1={f.Y(0)} y2={f.Y(c.h)} stroke={C.ones} strokeWidth={2} strokeDasharray="6 4"/>}
        {scene >= 2 && <T x={f.X(c.slant) + 18} y={f.Y(c.h / 2)} size={16} color={C.ones}>h={c.h}</T>}<T x={f.X(c.slant + c.base / 2)} y={f.Y(0) + 22} size={16} color={C.muted}>base {c.base}</T>
        <T x={W / 2} y={45} size={24} weight={600}>{scene >= 4 ? `${c.base} × ${c.h} = ${c.base * c.h}` : scene === 1 ? 'What can it become?' : 'parallelogram'}</T></g>; }
    case 'triangle': { const s = fit(c.base * 1.6, c.h); const f = frame(W / 2 - c.base * s * .8, 340, s); const join = scene === 3 ? eseg(p, .1, .9) : scene > 3 ? 1 : 0; const copy = scene >= 2;
      const T1: Pt[] = [[0, 0], [c.base, 0], [c.apex, c.h]]; const shown = rotJoin(T1, [(c.base + c.apex) / 2, c.h / 2], join, c.base * .7 + 1, 0);
      return <g><GridBg f={f} cols={Math.ceil(c.base * 1.6)} rows={c.h}/><polygon points={poly(T1, f)} fill={C.ones} opacity={.5} stroke={C.ones} strokeWidth={3}/>
        {copy && <polygon points={poly(shown, f)} fill={C.tens} opacity={.5} stroke={C.tens} strokeWidth={3}/>}
        <line x1={f.X(c.apex)} x2={f.X(c.apex)} y1={f.Y(0)} y2={f.Y(c.h)} stroke={C.unknown} strokeDasharray="5 4"/>
        <T x={W / 2} y={45} size={24} weight={600}>{scene >= 4 ? `${c.base} × ${c.h} ÷ 2 = ${c.base * c.h / 2}` : 'triangle: base ' + c.base + ', height ' + c.h}</T></g>; }
    case 'trapezoid': { const off = (c.b - c.a) / 2; const s = fit(c.a + c.b, c.h); const f = frame(W / 2 - (c.a + c.b) * s / 2, 340, s); const join = scene === 3 ? eseg(p, .1, .9) : scene > 3 ? 1 : 0;
      const T1: Pt[] = [[0, 0], [c.b, 0], [off + c.a, c.h], [off, c.h]]; const cur = rotJoin(T1, [(c.b + off + c.a) / 2, c.h / 2], join, 0, c.h + .8);
      return <g><GridBg f={f} cols={c.a + c.b} rows={c.h}/><polygon points={poly(T1, f)} fill={C.ones} opacity={.5} stroke={C.ones} strokeWidth={3}/>
        {scene >= 2 && <polygon points={poly(cur, f)} fill={C.tens} opacity={.5} stroke={C.tens} strokeWidth={3}/>}
        <T x={W / 2} y={45} size={22} weight={600}>{scene >= 4 ? `(${c.a} + ${c.b}) × ${c.h} ÷ 2 = ${(c.a + c.b) * c.h / 2}` : `top ${c.a}, bottom ${c.b}, height ${c.h}`}</T></g>; }
    case 'composite': { const s = 40; const f = frame(240, 360, s);
      if (c.shape === 'house') { const parts = scene >= 2; return <g><GridBg f={f} cols={8} rows={8}/><polygon points={poly([[0, 0], [6, 0], [6, 4], [0, 4]], f)} fill={C.ones} opacity={parts ? .55 : .35} stroke={C.ink}/><polygon points={poly([[0, 4], [6, 4], [3, 7]], f)} fill={parts ? C.tens : C.ones} opacity={parts ? .55 : .35} stroke={C.ink}/>
        {scene >= 3 && <><T x={f.X(3)} y={f.Y(2)} size={18}>6 × 4 = 24</T><T x={f.X(3)} y={f.Y(5)} size={15}>6 × 3 ÷ 2 = 9</T></>}<T x={W / 2} y={30} size={22} weight={600}>{scene >= 4 ? '24 + 9 = 33' : 'house shape'}</T></g>; }
      const L: Pt[] = [[0, 0], [4, 0], [4, 2], [2, 2], [2, 5], [0, 5]]; const other = scene === 3;
      return <g><GridBg f={f} cols={6} rows={6}/><polygon points={poly(L, f)} fill={C.ones} opacity={.35} stroke={C.ink} strokeWidth={2}/>
        {scene === 2 && <><rect x={f.X(0)} y={f.Y(2)} width={4 * s} height={2 * s} fill={C.ones} opacity={.5}/><rect x={f.X(0)} y={f.Y(5)} width={2 * s} height={3 * s} fill={C.tens} opacity={.5}/><T x={f.X(2)} y={f.Y(1)} size={16}>4 × 2 = 8</T><T x={f.X(1)} y={f.Y(3.5)} size={16}>2 × 3 = 6</T></>}
        {other && <><rect x={f.X(0)} y={f.Y(5)} width={4 * s} height={5 * s} fill="none" stroke={C.accent} strokeDasharray="6 4" strokeWidth={2}/><rect x={f.X(2)} y={f.Y(5)} width={2 * s} height={3 * s} fill={C.bad} opacity={.3}/><T x={f.X(3)} y={f.Y(3.5)} size={15} color={C.bad}>− 2 × 3</T></>}
        <T x={W / 2} y={30} size={22} weight={600}>{scene === 2 ? '8 + 6 = 14' : scene === 3 ? '20 − 6 = 14' : scene >= 4 ? 'Area = 14 square units' : 'L-shaped room'}</T></g>; }
    case 'units': { const fill = scene === 2 ? Math.floor(p * 100) : scene > 2 ? 100 : 0; const zoom = scene === 3 ? eseg(p, .1, .8) : scene > 3 ? 1 : 0; const big = lerp(240, 24, zoom);
      return <g>{range(fill).map(i => <rect key={i} x={280 + (i % 10) * big / 10} y={90 + Math.floor(i / 10) * big / 10} width={big / 10 - 1} height={big / 10 - 1} fill={C.ones} opacity={.7}/>)}
        <rect x={280} y={90} width={big} height={big} fill="none" stroke={C.ink} strokeWidth={2}/>
        {zoom > 0 && <>{range(100).map(i => <rect key={'m' + i} x={280 + (i % 10) * 24} y={90 + Math.floor(i / 10) * 24} width={23} height={23} fill="none" stroke={C.hundreds} strokeOpacity={zoom * .5}/>)}<rect x={280} y={90} width={240} height={240} fill="none" stroke={C.hundreds} strokeWidth={3} opacity={zoom}/></>}
        <T x={W / 2} y={50} size={24} weight={600}>{zoom > .5 ? '1 m² = 100 dm²' : `1 dm² = ${fill || '?'} cm²`}</T></g>; }
    case 'irregular': { const s = 52; const f = frame(140, 400, s); const k = leafCounts(1); const show = scene >= 2 ? 1 : 0; const showP = scene >= 3 ? 1 : 0;
      return <g><GridBg f={f} cols={10} rows={7}/>{range(10).map(x => range(7).map(y => { let inside = 0; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if (inLeaf(x + (i + .5) / 6, y + (j + .5) / 6)) inside++;
        const full = inside === 36, part = inside > 0 && !full; return (full && show) || (part && showP) ? <rect key={x + '-' + y} x={f.X(x) + 2} y={f.Y(y + 1) + 2} width={s - 4} height={s - 4} fill={full ? C.tens : C.warn} opacity={.35}/> : null; }))}
        <g opacity={.4}>{range(50).map(i => range(35).map(j => inLeaf((i + .5) / 5, (j + .5) / 5) ? <rect key={i + '.' + j} x={f.X(i / 5)} y={f.Y((j + 1) / 5)} width={s / 5 + .5} height={s / 5 + .5} fill="#7fdc8f"/> : null))}</g>
        <T x={W / 2} y={30} size={22} weight={600}>{scene >= 4 ? `${k.full} + ${k.partial} ÷ 2 ≈ ${k.estimate}` : scene >= 3 ? `${k.full} full, ${k.partial} partial` : scene >= 2 ? `${k.full} full squares` : 'Estimate the leaf'}</T></g>; }
    default: { const s = fit(c.l, c.w); const f = frame(W / 2 - c.l * s / 2, 330, s); const tiles = scene < 2 ? 0 : scene === 2 ? Math.floor(p * c.l * c.w + .5) : c.l * c.w;
      return <g><Rect l={c.l} w={c.w} tiles={tiles} f={f}/><T x={W / 2} y={45} size={24} weight={600}>{scene >= 4 ? `${c.l} × ${c.w} = ${c.l * c.w}` : scene >= 2 ? `${tiles} unit squares` : 'How much surface?'}</T>{scene === 3 && <T x={W / 2} y={400} size={18} color={C.muted}>{c.w} rows of {c.l}</T>}</g>; }
  }
}

function Explore({c}: {c: AreaConfig}) {
  const [l, setL] = useState(c.l), [w, setW] = useState(c.w), [base, setBase] = useState(c.base), [h, setH] = useState(c.h), [shift, setShift] = useState(c.mode === 'triangle' ? c.apex : c.slant), [a, setA] = useState(c.a), [b, setB] = useState(c.b);
  const [method, setMethod] = useState<'add' | 'subtract'>('add'); const [step, setStep] = useState(1);
  if (c.mode === 'parallelogram' || c.mode === 'triangle') { const s = 34; const f = frame(120, 340, s); const pts: Pt[] = c.mode === 'triangle' ? [[0, 0], [base, 0], [shift, h]] : [[0, 0], [base, 0], [base + shift, h], [shift, h]]; const A = c.mode === 'triangle' ? base * h / 2 : base * h;
    return <Stage label={`Area ${A}`} controls={<><Stepper label="Base" value={base} min={2} max={12} onChange={setBase}/><Stepper label="Height" value={h} min={1} max={7} onChange={setH}/><Slider label={c.mode === 'triangle' ? 'Top point' : 'Slant'} value={shift} min={-3} max={c.mode === 'triangle' ? base + 3 : 6} step={.5} onChange={setShift}/><Readout>Drag the top: area stays {c.mode === 'triangle' ? `${base} × ${h} ÷ 2` : `${base} × ${h}`} = {A}</Readout></>}>
      <GridBg f={f} cols={16} rows={8}/><polygon points={poly(pts, f)} fill={C.hundreds} opacity={.45} stroke={C.hundreds} strokeWidth={3}/>
      <line x1={f.X(c.mode === 'triangle' ? shift : shift)} x2={f.X(c.mode === 'triangle' ? shift : shift)} y1={f.Y(0)} y2={f.Y(h)} stroke={C.ones} strokeDasharray="5 4"/>
      <Handle x={f.X(shift)} y={f.Y(h)} label="Slide the top" onMove={x => setShift(clamp(Math.round(((x - 120) / s) * 2) / 2, -3, c.mode === 'triangle' ? base + 3 : 6))}/>
      <T x={W / 2} y={40} size={24} weight={600}>area = {A}</T></Stage>; }
  if (c.mode === 'trapezoid') return <Stage label={`Trapezoid area ${(a + b) * h / 2}`} controls={<><Stepper label="Top" value={a} min={0} max={b} onChange={setA}/><Stepper label="Bottom" value={b} min={1} max={10} onChange={setB}/><Stepper label="Height" value={h} min={1} max={6} onChange={setH}/><Readout>({a} + {b}) × {h} ÷ 2 = {(a + b) * h / 2}{a === 0 ? ' — a triangle!' : a === b ? ' — a parallelogram!' : ''}</Readout></>}><Scene c={{...c, a: Math.min(a, b), b, h}} scene={4} p={1}/></Stage>;
  if (c.mode === 'composite') return <Stage label={`Composite area by ${method}`} controls={<><Segmented label="Method" value={method} onChange={setMethod} options={[['add', 'Split and add'], ['subtract', 'Complete and subtract']]}/><Readout>Both methods give the same area.</Readout></>}><Scene c={c} scene={c.shape === 'house' ? 3 : method === 'add' ? 2 : 3} p={1}/></Stage>;
  if (c.mode === 'units') return <Stage label="Area units" controls={<Readout>1 m² = 100 dm² = 10 000 cm²</Readout>}><Scene c={c} scene={4} p={1}/></Stage>;
  if (c.mode === 'irregular') { const k = leafCounts(step); return <Stage label={`Estimate ${k.estimate}`} controls={<><Segmented label="Grid" value={String(step)} onChange={v => setStep(Number(v))} options={[['1', '1 cm grid'], ['0.5', '0.5 cm grid']]}/><Readout>full {k.full}, partial {k.partial} → estimate ≈ {k.estimate.toFixed(2)} cm²</Readout></>}><Scene c={c} scene={4} p={1}/></Stage>; }
  if (c.mode === 'perimeter-vs-area') { const half = c.perimeter / 2; const wd = clamp(w, 1, half - 1); return <Stage label="Fixed perimeter" controls={<><Slider label="Width" value={wd} min={1} max={half - 1} onChange={setW}/><Readout>{half - wd} × {wd}: perimeter {c.perimeter}, area {(half - wd) * wd}</Readout></>}>
    <rect x={100} y={330 - wd * 22} width={(half - wd) * 22} height={wd * 22} fill={C.tens} opacity={.35} stroke={C.tens} strokeWidth={3}/><T x={W / 2} y={45} size={24}>area {(half - wd) * wd} m²</T></Stage>; }
  const s = fit(l, w); const f = frame(W / 2 - l * s / 2, 330, s);
  return <Stage label={`${l} by ${w}`} controls={<><Stepper label="Length" value={l} min={1} max={12} onChange={setL}/><Stepper label="Width" value={w} min={1} max={7} onChange={setW}/><Readout>area {l} × {w} = {l * w} · perimeter ({l} + {w}) × 2 = {2 * (l + w)}</Readout></>}>
    <Rect l={l} w={w} tiles={l * w} f={f} walk={c.mode === 'perimeter' ? 1 : -1}/></Stage>;
}

export const areaView: EngineView<AreaConfig> = {Scene: props => <Stage label={area.describe(props.c)}><Scene {...props}/></Stage>, Explore};

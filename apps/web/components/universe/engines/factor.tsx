'use client';
import {useState} from 'react';
import {Stage, T, C, W, Readout, Slider, Stepper} from '../stage';
import {factor, type FactorConfig} from '@/lib/universe/engines/factor';
import {arrangements, factors, gcd, isPrime, lcm, primeFactors} from '@/lib/universe/math';
import {range} from '@/lib/universe/engines/util';
import type {EngineView} from './types';

function Rects({n, shown, active = -1}: {n: number; shown: number; active?: number}) {
  const arr = arrangements(n).slice(0, shown); const s = Math.min(16, 300 / n + 6);
  const xs = arr.map((_, i) => 60 + arr.slice(0, i).reduce((acc, [, k]) => acc + k * s + 30, 0));
  return <g>{arr.map(([r, k], i) => { const ox = xs[i]; return <g key={i} opacity={active < 0 || active === i ? 1 : .35}>{range(r * k).map(t => <rect key={t} x={ox + (t % k) * s} y={120 + Math.floor(t / k) * s} width={s - 2} height={s - 2} rx={2} fill={[C.ones, C.tens, C.hundreds, C.thousands, C.accent][i % 5]}/>)}<T x={ox + (k * s) / 2} y={110} size={14}>{r} × {k}</T></g>; })}</g>;
}
function Chart({mark, crossed, n = 100}: {mark: (k: number) => string | null; crossed?: (k: number) => boolean; n?: number}) {
  const s = 34, x0 = W / 2 - 5 * s, y0 = 70;
  return <g>{range(n).map(i => { const k = i + 1; const col = mark(k); const x = crossed?.(k); return <g key={k}><rect x={x0 + (i % 10) * s} y={y0 + Math.floor(i / 10) * s} width={s - 3} height={s - 3} rx={4} fill={col ?? C.panel} opacity={x ? .25 : col ? .85 : 1}/><T x={x0 + (i % 10) * s + (s - 3) / 2} y={y0 + Math.floor(i / 10) * s + (s - 3) / 2} size={12} color={col && !x ? '#15141d' : C.muted}>{k}</T></g>; })}</g>;
}
type Node = {v: number; kids?: [Node, Node]};
function tree(n: number): Node { if (isPrime(n) || n < 4) return {v: n}; const d = factors(n).find(f => f > 1 && f < n && f * f <= n) ?? 2; return {v: n, kids: [tree(d), tree(n / d)]}; }
function Tree({node, x, y, spread, depth, maxDepth}: {node: Node; x: number; y: number; spread: number; depth: number; maxDepth: number}) {
  return <g>{node.kids && depth < maxDepth && node.kids.map((k, i) => { const nx = x + (i ? spread : -spread), ny = y + 80; return <g key={i}><line x1={x} y1={y + 16} x2={nx} y2={ny - 16} stroke={C.muted}/><Tree node={k} x={nx} y={ny} spread={spread / 1.8} depth={depth + 1} maxDepth={maxDepth}/></g>; })}
    <circle cx={x} cy={y} r={20} fill={isPrime(node.v) ? C.ones : C.panel} stroke={isPrime(node.v) ? C.ones : C.line}/><T x={x} y={y} size={15} weight={700} color={isPrime(node.v) ? '#15141d' : C.ink}>{node.v}</T></g>;
}

function Scene({c, scene, p}: {c: FactorConfig; scene: number; p: number}) {
  switch (c.mode) {
    case 'primes': { const stage = scene < 2 ? 0 : scene === 2 ? 2 : scene === 3 ? [3, 5, 7][Math.min(2, Math.floor(p * 3))] : 99;
      const crossed = (k: number) => k === 1 ? stage > 0 : [2, 3, 5, 7].some(q => q <= stage && k > q && k % q === 0);
      return <g><Chart mark={k => (stage >= 99 && isPrime(k) ? C.ones : stage > 0 && [2, 3, 5, 7].includes(k) && k <= stage ? C.ones : null)} crossed={crossed}/><T x={W / 2} y={36} size={20} weight={600}>{stage >= 99 ? '25 primes below 100' : stage ? `multiples of ${stage} crossed out` : 'which numbers survive?'}</T></g>; }
    case 'multiples': { const upto = scene < 2 ? 0 : scene === 2 ? Math.floor(p * 100) : 100; return <g><Chart mark={k => (k % c.n === 0 && k <= upto ? C.tens : null)}/><T x={W / 2} y={36} size={20} weight={600}>multiples of {c.n}</T></g>; }
    case 'divisibility': { const ds = String(c.n).split(''); return <g>{ds.map((d, i) => <g key={i}><rect x={W / 2 - ds.length * 45 + i * 90} y={100} width={80} height={90} rx={10} fill={C.panel} stroke={(scene === 2 && i === ds.length - 1) || scene === 3 ? C.ones : C.line} strokeWidth={2}/><T x={W / 2 - ds.length * 45 + i * 90 + 40} y={145} size={44} weight={700}>{d}</T></g>)}
      {scene >= 3 && <T x={W / 2} y={240} size={22} color={C.ones}>digit sum {ds.join(' + ')} = {ds.reduce((s, d) => s + Number(d), 0)}</T>}
      {scene >= 4 && [2, 3, 5].map((d, i) => <T key={d} x={250 + i * 150} y={320} size={22} color={c.n % d === 0 ? C.good : C.bad}>÷{d}: {c.n % d === 0 ? '✓' : '✗'}</T>)}</g>; }
    case 'gcf': { const g = gcd(c.a, c.b); const s = Math.min(18, 600 / c.b, 300 / c.a); const try_ = scene < 2 ? 0 : scene === 2 ? 1 + Math.floor(p * g) : g; const fits = c.a % try_ === 0 && c.b % try_ === 0;
      return <g><rect x={100} y={90} width={c.b * s} height={c.a * s} fill="#1f1d2b" stroke={C.ink}/>{try_ > 0 && range((c.a / try_) | 0).map(i => range((c.b / try_) | 0).map(j => <rect key={i + '-' + j} x={100 + j * try_ * s + 1} y={90 + i * try_ * s + 1} width={try_ * s - 2} height={try_ * s - 2} fill={fits ? C.tens : C.bad} opacity={.5}/>))}
        <T x={W / 2 + 200} y={50} size={20} weight={600}>{try_ ? `${try_} × ${try_} tiles ${fits ? 'fit exactly' : 'leave gaps'}` : `${c.a} × ${c.b}`}</T>{scene >= 3 && <T x={W / 2} y={420} size={14} color={C.muted}>common factors: {factors(g).join(', ')}</T>}</g>; }
    case 'lcm': { const l = lcm(c.a, c.b); const max = l * 2; const X = (t: number) => 80 + (t / max) * 640; const now = scene < 2 ? 0 : scene === 2 ? p * max : max;
      return <g><line x1={80} x2={720} y1={240} y2={240} stroke={C.muted}/>{range(max + 1).filter(t => t <= now).map(t => <g key={t}>{t % c.a === 0 && <circle cx={X(t)} cy={200} r={8} fill={C.ones}/>}{t % c.b === 0 && <circle cx={X(t)} cy={280} r={8} fill={C.tens}/>}{t % c.a === 0 && t % c.b === 0 && scene >= 3 && <rect x={X(t) - 12} y={180} width={24} height={120} rx={8} fill="none" stroke={C.unknown} strokeWidth={2}/>}</g>)}
        {range(max / Math.min(c.a, c.b) + 1).map(i => <T key={i} x={X(i * Math.min(c.a, c.b))} y={320} size={11} color={C.muted}>{i * Math.min(c.a, c.b)}</T>)}<T x={60} y={200} size={14} color={C.ones}>{c.a}s</T><T x={60} y={280} size={14} color={C.tens}>{c.b}s</T><T x={W / 2} y={60} size={22} weight={600}>{scene >= 3 ? `together at ${l}, ${2 * l}…` : 'blink, blink…'}</T></g>; }
    case 'tree': { const depth = scene < 2 ? 0 : scene === 2 ? 1 + Math.floor(p * 3) : 9; return <g><Tree node={tree(c.n)} x={W / 2} y={80} spread={150} depth={0} maxDepth={depth}/>{scene >= 4 && <T x={W / 2} y={420} size={24} weight={600}>{c.n} = {primeFactors(c.n).join(' × ')}</T>}</g>; }
    default: { const arr = arrangements(c.n); const shown = scene < 2 ? 1 : scene === 2 ? Math.max(1, Math.ceil(p * arr.length)) : arr.length; return <g><Rects n={c.n} shown={shown}/><T x={W / 2} y={50} size={22} weight={600}>{scene >= 4 ? `factors: ${factors(c.n).join(', ')}` : `${c.n} tiles`}</T></g>; }
  }
}

function Explore({c}: {c: FactorConfig}) {
  const [n, setN] = useState(c.n), [a, setA] = useState(c.a), [b, setB] = useState(c.b);
  const cfg = {...c, n, a, b};
  const readout = c.mode === 'gcf' ? `GCF(${a}, ${b}) = ${gcd(a, b)}` : c.mode === 'lcm' ? `LCM(${a}, ${b}) = ${lcm(a, b)}` : c.mode === 'tree' ? `${n} = ${primeFactors(n).join(' × ') || n}` : c.mode === 'divisibility' ? `${n}: ÷2 ${n % 2 ? '✗' : '✓'} ÷3 ${n % 3 ? '✗' : '✓'} ÷5 ${n % 5 ? '✗' : '✓'} · ${n % 2 ? 'odd' : 'even'}` : `${n}: ${factors(n).length} factors (${factors(n).join(', ')}) · ${isPrime(n) ? 'prime' : n === 1 ? 'neither' : 'composite'}`;
  return <Stage label={readout} controls={<>{c.mode === 'gcf' || c.mode === 'lcm' ? <><Stepper label="a" value={a} min={2} max={c.mode === 'gcf' ? 30 : 12} onChange={setA}/><Stepper label="b" value={b} min={2} max={c.mode === 'gcf' ? 36 : 15} onChange={setB}/></>
    : <Slider label="Number" value={n} min={1} max={c.mode === 'divisibility' ? 999 : c.mode === 'tree' ? 200 : c.mode === 'rectangles' ? 36 : 12} onChange={setN}/>}<Readout>{readout}</Readout></>}>
    <Scene c={cfg} scene={c.mode === 'primes' ? 4 : c.mode === 'multiples' ? 3 : 4} p={1}/></Stage>;
}

export const factorView: EngineView<FactorConfig> = {Scene: props => <Stage label={factor.describe(props.c)}><Scene {...props}/></Stage>, Explore};

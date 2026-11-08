'use client';
import {useMemo, useState} from 'react';
import Link from 'next/link';
import {Search} from 'lucide-react';
import {DOMAINS, POINTS, CHAPTERS, getPoint, ancestry, unlocks, related} from '@/lib/universe/curriculum';
import type {DomainId, KnowledgePoint} from '@/lib/universe/types';
import {levelsOf, useProgress} from '@/lib/universe/progress';

const COL = 172, LEFT = 150, TOP = 46, GAP = 27, PER_ROW = 5;
export const GRADE_COLORS = ['#ffd27a', '#7fdcc4', '#8ec9ff', '#b9a2ff', '#ff9fd0', '#ffab84'];

/**
 * KnowledgeConnectionGraph — every knowledge point placed by grade (columns) and domain (rows).
 * Prerequisite edges are stored explicitly in the curriculum; selecting a node lights its
 * ancestors (what it builds on) and descendants (what it unlocks) across grades.
 */
export function KnowledgeMap({focus, compact = false}: {focus?: string; compact?: boolean}) {
  const {progress} = useProgress();
  const [selected, setSelected] = useState<string | null>(focus ?? null);
  const [domain, setDomain] = useState<DomainId | 'all'>('all');
  const [query, setQuery] = useState('');

  const layout = useMemo(() => {
    const chapterOrder = new Map(CHAPTERS.map(c => [c.id, c.grade * 100 + c.order]));
    const cells = new Map<string, KnowledgePoint[]>();
    for (const p of POINTS) { const k = `${p.domain}|${p.grade}`; cells.set(k, [...(cells.get(k) ?? []), p]); }
    for (const list of cells.values()) list.sort((a, b) => (chapterOrder.get(a.chapter)! - chapterOrder.get(b.chapter)!));
    const bands: {id: DomainId; y: number; h: number}[] = []; let y = TOP;
    for (const d of DOMAINS) { const rows = Math.max(1, ...[1, 2, 3, 4, 5, 6].map(g => Math.ceil((cells.get(`${d.id}|${g}`)?.length ?? 0) / PER_ROW))); const h = rows * GAP + 26; bands.push({id: d.id, y, h}); y += h; }
    const pos = new Map<string, {x: number; y: number}>();
    for (const b of bands) for (let g = 1; g <= 6; g++) (cells.get(`${b.id}|${g}`) ?? []).forEach((p, i) => pos.set(p.id, {x: LEFT + (g - 1) * COL + 22 + (i % PER_ROW) * 29, y: b.y + 20 + Math.floor(i / PER_ROW) * GAP}));
    return {bands, pos, height: y + 10};
  }, []);

  const focusSet = useMemo(() => {
    if (!selected) return null;
    return {up: new Set(ancestry(selected).map(p => p.id)), down: new Set(descendants(selected)), rel: new Set(related(selected).map(p => p.id))};
  }, [selected]);
  const q = query.trim().toLowerCase();
  const matches = (p: KnowledgePoint) => (domain === 'all' || p.domain === domain) && (!q || p.title.toLowerCase().includes(q) || p.title_zh.includes(q) || p.topics.some(t => t.toLowerCase().includes(q)));
  const sel = selected ? getPoint(selected) : undefined;
  const width = LEFT + 6 * COL + 10;

  return <div className={'u-map ' + (compact ? 'compact' : '')}>
    <div className="u-map-tools">
      <label className="u-search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search concepts, e.g. fraction, 圆, area" aria-label="Search knowledge points"/></label>
      <div className="u-chips" role="radiogroup" aria-label="Filter by domain">
        <button role="radio" aria-checked={domain === 'all'} className={domain === 'all' ? 'on' : ''} onClick={() => setDomain('all')}>All domains</button>
        {DOMAINS.map(d => <button key={d.id} role="radio" aria-checked={domain === d.id} className={domain === d.id ? 'on' : ''} onClick={() => setDomain(d.id)}>{d.title}</button>)}
      </div>
    </div>
    <div className="u-map-scroll">
      <svg viewBox={`0 0 ${width} ${layout.height}`} width={width} height={layout.height} role="img" aria-label="Cross-grade knowledge map. An accessible list follows.">
        {[1, 2, 3, 4, 5, 6].map(g => <g key={g}><rect x={LEFT + (g - 1) * COL} y={TOP - 30} width={COL - 8} height={layout.height - TOP + 20} rx={10} fill={GRADE_COLORS[g - 1]} opacity={.035}/>
          <text x={LEFT + (g - 1) * COL + 12} y={TOP - 12} fill={GRADE_COLORS[g - 1]} fontSize={12} fontWeight={650} letterSpacing={1.2}>GRADE {g}</text></g>)}
        {layout.bands.map(b => { const d = DOMAINS.find(x => x.id === b.id)!; return <g key={b.id}><line x1={10} x2={width - 10} y1={b.y} y2={b.y} stroke="#ffffff" strokeOpacity={.06}/>
          <text x={12} y={b.y + 18} fill="#c9c3da" fontSize={11.5} fontWeight={600}>{d.title}</text><text x={12} y={b.y + 34} fill="#8d879e" fontSize={11}>{d.title_zh}</text></g>; })}
        {POINTS.flatMap(p => p.prerequisites.map(pre => {
          const a = layout.pos.get(pre)!, b = layout.pos.get(p.id)!;
          // Ancestor chain: both ends lie on the path into the selection. Descendant chain: both ends lie on the path out of it.
          const up = !!focusSet && focusSet.up.has(pre) && (p.id === selected || focusSet.up.has(p.id));
          const down = !!focusSet && focusSet.down.has(p.id) && (pre === selected || focusSet.down.has(pre));
          const mx = (a.x + b.x) / 2;
          return <path key={pre + '>' + p.id} d={`M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`} fill="none" stroke={up ? '#ffd27a' : down ? '#7fdcc4' : '#ffffff'} strokeOpacity={up || down ? .8 : focusSet ? .03 : .07} strokeWidth={up || down ? 1.6 : 1}/>;
        }))}
        {POINTS.map(p => {
          const {x, y} = layout.pos.get(p.id)!; const done = levelsOf(progress[p.id]).length; const on = matches(p);
          const role = !focusSet ? 'none' : p.id === selected ? 'self' : focusSet.up.has(p.id) ? 'up' : focusSet.down.has(p.id) ? 'down' : focusSet.rel.has(p.id) ? 'rel' : 'dim';
          const r = role === 'self' ? 9 : 6.5;
          return <g key={p.id} className="u-map-node" opacity={!on ? .12 : role === 'dim' ? .25 : 1} onClick={() => setSelected(p.id === selected ? null : p.id)} tabIndex={-1}>
            <title>{`${p.title} · ${p.title_zh} (Grade ${p.grade})`}</title>
            <circle cx={x} cy={y} r={r + 7} fill="transparent"/>
            {role === 'rel' && <circle cx={x} cy={y} r={r + 4} fill="none" stroke="#b9a2ff" strokeDasharray="2 2"/>}
            <circle cx={x} cy={y} r={r} fill={done ? GRADE_COLORS[p.grade - 1] : '#26233a'} stroke={role === 'up' ? '#ffd27a' : role === 'down' ? '#7fdcc4' : GRADE_COLORS[p.grade - 1]} strokeWidth={role === 'self' ? 3 : 1.6}/>
            {done === 6 && <circle cx={x} cy={y} r={2.4} fill="#15141d"/>}
          </g>;
        })}
        {sel && (() => { const {x, y} = layout.pos.get(sel.id)!; const right = x > width - 260; return <g pointerEvents="none"><rect x={right ? x - 250 : x + 14} y={y - 14} width={236} height={28} rx={6} fill="#0f0e16" stroke="#ffffff22"/><text x={right ? x - 240 : x + 24} y={y + 4} fill="#fff" fontSize={12}>{sel.title.length > 34 ? sel.title.slice(0, 33) + '…' : sel.title}</text></g>; })()}
      </svg>
    </div>
    <div className="u-map-legend"><span><i className="dot up"/>Builds on (prerequisites)</span><span><i className="dot down"/>Unlocks (later concepts)</span><span><i className="dot rel"/>Related</span><span><i className="dot done"/>Started by you</span></div>
    {sel && <div className="u-map-detail panel" aria-live="polite">
      <div><span className="eyebrow">GRADE {sel.grade} · {DOMAINS.find(d => d.id === sel.domain)!.title.toUpperCase()}</span><h3>{sel.title} <span lang="zh-CN" className="zh">{sel.title_zh}</span></h3><p>{sel.description}</p>
        <p className="muted">Builds on {sel.prerequisites.length} · unlocks {unlocks(sel.id).length} · related {related(sel.id).length}</p></div>
      <Link className="button primary" href={`/universe/k/${sel.id}`}>Open knowledge point</Link>
    </div>}
    {!compact && <details className="u-map-list"><summary>Accessible list of all {POINTS.length} knowledge points</summary>
      {[1, 2, 3, 4, 5, 6].map(g => <section key={g}><h4>Grade {g}</h4><ul>{POINTS.filter(p => p.grade === g && matches(p)).map(p => <li key={p.id}>
        <button className="text-button" aria-pressed={selected === p.id} onClick={() => setSelected(p.id)}>{p.title}</button> <span lang="zh-CN" className="zh">{p.title_zh}</span> · <Link href={`/universe/k/${p.id}`}>open</Link>
        {p.prerequisites.length > 0 && <small> — builds on {p.prerequisites.map(i => getPoint(i)!.title).join('; ')}</small>}</li>)}</ul></section>)}
    </details>}
  </div>;
}

function descendants(id: string): string[] {
  const seen = new Set<string>(); const queue = unlocks(id).map(p => p.id);
  while (queue.length) { const n = queue.shift()!; if (seen.has(n)) continue; seen.add(n); queue.push(...unlocks(n).map(p => p.id)); }
  return [...seen];
}

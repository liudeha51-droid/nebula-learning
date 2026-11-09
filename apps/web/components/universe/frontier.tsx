'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ChevronRight, ExternalLink, FlaskConical, Mountain} from 'lucide-react';
import {FRONTIER, LEVELS, STATUS_LABEL, REPO, REPO_NOTE, frontierByLevel, type FrontierItem} from '@/lib/universe/frontier';
import {getPoint} from '@/lib/universe/curriculum';
import {EXPLORERS} from './frontier-explorers';

function Card({item, open, onToggle}: {item: FrontierItem; open: boolean; onToggle: () => void}) {
  const Explorer = item.explorer ? EXPLORERS[item.explorer] : null; const st = STATUS_LABEL[item.status];
  return <article className={`u-frontier-card${open ? ' open' : ''}`} id={item.id}>
    <header><div><h3>{item.title}</h3><span lang="zh-CN" className="zh">{item.title_zh}</span></div><span className={`u-status s-${item.status}`} title={st.note}>{st.label}</span></header>
    <p className="u-frontier-q"><strong>The question.</strong> {item.question}</p>
    <p className="muted"><strong>Why it matters.</strong> {item.why}</p>
    <div className="u-frontier-claim"><span className="eyebrow">{item.level === 4 ? 'WHAT OPENAI’S MODEL DID' : 'WHAT OPENAI CLAIMED'}</span><p>{item.openai}</p></div>
    {item.answer && <div className="u-frontier-answer"><span className="eyebrow">ANSWER · CHECKED BY COMPUTATION IN THIS APP</span><p><strong>{item.answer}</strong></p><ol>{item.idea?.map((s, i) => <li key={i}>{s}</li>)}</ol></div>}
    <div className="u-frontier-foot">
      {Explorer && <button className={`button ${open ? '' : 'primary'}`} aria-expanded={open} onClick={onToggle}><FlaskConical size={15}/>{open ? 'Hide explorer' : 'Try it yourself'}</button>}
      <span className="u-frontier-learn">Learn first: {item.learn.map(id => { const p = getPoint(id); return p ? <Link key={id} href={`/universe/k/${id}`}>{p.title.replace('Signature: ', '')}</Link> : null; })}</span>
    </div>
    {open && Explorer && <div className="u-frontier-explorer"><Explorer/></div>}
    <details className="u-frontier-sources"><summary>Sources ({item.sources.length})</summary><ul>{item.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}<ExternalLink size={11}/></a></li>)}</ul></details>
  </article>;
}

/** The Frontier: problems OpenAI models tackled, from the Millennium Prize Problems down to the olympiad level. */
export function FrontierPage() {
  const [open, setOpen] = useState<string | null>(null);
  return <>
    <nav className="u-crumbs" aria-label="Breadcrumb"><span><Link href="/universe">Universe</Link><ChevronRight size={13}/></span><span><strong>The frontier</strong></span></nav>
    <section className="u-frontier-hero">
      <span className="pill"><Mountain size={13}/> THE FRONTIER · 数学前沿</span>
      <h1>Problems AI has taken on — explained for high-school students</h1>
      <p>From the hardest open questions in mathematics down to olympiad problems, ordered by difficulty. Each entry says what the problem asks, why it matters, exactly what OpenAI claimed, and how far that claim has been checked. Most entries have an explorer you can play with.</p>
      <div className="u-frontier-caveat"><strong>Read the claims carefully.</strong> {REPO_NOTE} <a href={REPO} target="_blank" rel="noreferrer">github.com/openai/math <ExternalLink size={11}/></a></div>
      <dl className="u-frontier-legend">{Object.entries(STATUS_LABEL).map(([k, v]) => <div key={k}><dt><span className={`u-status s-${k}`}>{v.label}</span></dt><dd>{v.note}</dd></div>)}</dl>
      <nav className="u-chips" aria-label="Difficulty levels">{LEVELS.map(l => <a key={l.level} href={`#level-${l.level}`}>Level {l.level}: {l.title.split(':')[0]}</a>)}</nav>
    </section>
    {LEVELS.map(l => <section key={l.level} id={`level-${l.level}`} className="u-frontier-level" aria-labelledby={`level-${l.level}-h`}>
      <div className="section-title lower-heading"><div><div className="eyebrow">LEVEL {l.level} · {l.level === 1 ? 'HARDEST' : l.level === 4 ? 'MOST ACCESSIBLE' : 'RESEARCH'} · {l.title_zh}</div><h2 id={`level-${l.level}-h`}>{l.title}</h2><p className="muted">{l.blurb}</p></div></div>
      <div className="u-frontier-grid">{frontierByLevel(l.level).map(item => <Card key={item.id} item={item} open={open === item.id} onToggle={() => setOpen(open === item.id ? null : item.id)}/>)}</div>
    </section>)}
    <p className="muted u-version">{FRONTIER.length} problems · repository snapshot: commit 4eaee87 (29 October 2026) · news sources as of October 2026. Difficulty is a rough guide: problems within a level are not ranked against each other, except the olympiad problems, which run from hardest to easiest.</p>
  </>;
}

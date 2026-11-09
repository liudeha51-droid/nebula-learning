'use client';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, Backpack, Check, ChevronRight, Flag, Lock, Route, Sprout} from 'lucide-react';
import {LEARNING_JOURNEYS, getLearningJourney, journeysThrough, type LearningJourney} from '@/lib/universe/learning-journeys';
import {getPoint} from '@/lib/universe/curriculum';
import {levelsOf, useProgress} from '@/lib/universe/progress';
import {gradeStyle, GRADE_COLORS} from './knowledge-map';
import {CAPSTONES} from './capstones';

/** A stop counts as collected once any learning level of its lesson is done. */
function useCollected(j: LearningJourney) { const {progress} = useProgress(); return j.stations.map(s => levelsOf(progress[s.id]).length > 0); }

/** The big picture: a winding road from the seed idea through every stop to the capstone. */
function BigPicture({j, collected}: {j: LearningJourney; collected: boolean[]}) {
  const n = j.stations.length, W = 900, H = 210; const X = (i: number) => 90 + (i * (W - 220)) / (n - 1), Y = (i: number) => (i % 2 ? 70 : 140);
  const pts = j.stations.map((_, i) => [X(i), Y(i)] as const); const end = [W - 60, 105] as const;
  const road = [[24, 150] as const, ...pts, end].map((p, i, a) => { if (!i) return `M${p[0]} ${p[1]}`; const q = a[i - 1], mx = (q[0] + p[0]) / 2; return `C${mx} ${q[1]} ${mx} ${p[1]} ${p[0]} ${p[1]}`; }).join('');
  const done = collected.filter(Boolean).length;
  return <svg className="u-lj-map" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Journey map: ${done} of ${n} tools collected, then the capstone.`}>
    <path d={road} fill="none" stroke="currentColor" strokeOpacity={.18} strokeWidth={16} strokeLinecap="round"/>
    <path d={road} fill="none" stroke={j.colour} strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round"/>
    <g><circle cx={24} cy={150} r={13} fill={j.colour}/><text x={24} y={182} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">start</text></g>
    {j.stations.map((s, i) => { const p = getPoint(s.id)!; const [x, y] = pts[i]; const on = collected[i];
      return <a key={s.id} href={`#stop-${i + 1}`} aria-label={`Stop ${i + 1}: ${s.tool}${on ? ', collected' : ''}`}>
        <circle cx={x} cy={y} r={22} style={{fill: `var(--grade-${p.grade}, ${GRADE_COLORS[p.grade - 1]})`}} opacity={on ? 1 : .35} stroke="currentColor" strokeOpacity={.35} strokeWidth={2}/>
        <text x={x} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill={on ? '#15141d' : 'currentColor'}>{on ? '✓' : i + 1}</text>
        <text x={x} y={y + (i % 2 ? -32 : 42)} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">{s.tool}</text>
        <text x={x} y={y + (i % 2 ? -48 : 58)} textAnchor="middle" fontSize={11} fill="currentColor" opacity={.75}>Grade {p.grade}</text></a>; })}
    <a href="#capstone" aria-label="Capstone"><path d={`M${end[0]} ${end[1] - 30} l9 19 21 3 -15 15 4 21 -19 -10 -19 10 4 -21 -15 -15 21 -3z`} fill={j.colour} stroke="currentColor" strokeOpacity={.4} strokeWidth={2}/>
      <text x={end[0]} y={end[1] + 50} textAnchor="middle" fontSize={13} fontWeight={800} fill="currentColor">use it all</text></a>
  </svg>;
}

function JourneyCard({j}: {j: LearningJourney}) {
  const collected = useCollected(j); const done = collected.filter(Boolean).length; const grades = j.stations.map(s => getPoint(s.id)!.grade);
  return <Link href={`/universe/journeys/${j.id}`} className="u-lj-card" style={{'--lj': j.colour} as React.CSSProperties}>
    <span className="eyebrow">GRADES {grades[0]}–{grades[grades.length - 1]} · {j.stations.length} STOPS</span>
    <strong>{j.title}</strong><span lang="zh-CN" className="zh">{j.title_zh}</span>
    <span className="u-lj-seed"><Sprout size={14}/>{j.seed}</span><span className="u-lj-dest"><Flag size={14}/>{j.destination}</span>
    <span className="u-lj-dots" aria-label={`${done} of ${j.stations.length} collected`}>{j.stations.map((s, i) => <i key={s.id} className={collected[i] ? 'on' : ''} style={gradeStyle(getPoint(s.id)!.grade)}/>)}<em>{done}/{j.stations.length}</em></span>
  </Link>;
}
export function JourneyCards() { return <div className="u-lj-cards">{LEARNING_JOURNEYS.map(j => <JourneyCard key={j.id} j={j}/>)}</div>; }

export function JourneysIndex() {
  return <>
    <nav className="u-crumbs" aria-label="Breadcrumb"><span><Link href="/universe">Universe</Link><ChevronRight size={13}/></span><span><strong>Learning journeys</strong></span></nav>
    <div className="page-heading"><div><div className="eyebrow">LEARNING JOURNEYS · 学习之旅</div><h1>From one idea to the big picture</h1>
      <p>Each journey starts with one simple idea from primary school. Every stop is a lesson that hands you one new tool. At the end, a real problem needs all of them at once.</p></div></div>
    <JourneyCards/></>;
}

export function JourneyPage({id}: {id: string}) {
  const j = getLearningJourney(id); const collected = useCollected(j ?? LEARNING_JOURNEYS[0]);
  if (!j) return <p>Unknown journey. <Link href="/universe/journeys">See all journeys</Link></p>;
  const Capstone = CAPSTONES[j.capstone.id]; const done = collected.filter(Boolean).length; const next = collected.findIndex(c => !c);
  return <div className="u-lj" style={{'--lj': j.colour} as React.CSSProperties}>
    <nav className="u-crumbs" aria-label="Breadcrumb"><span><Link href="/universe">Universe</Link><ChevronRight size={13}/></span><span><Link href="/universe/journeys">Learning journeys</Link><ChevronRight size={13}/></span><span><strong>{j.title}</strong></span></nav>
    <section className="u-lj-hero">
      <span className="eyebrow">LEARNING JOURNEY · 学习之旅</span><h1>{j.title} <span lang="zh-CN" className="zh">{j.title_zh}</span></h1>
      <p className="u-lj-question">{j.question}</p>
      <div className="u-lj-ends"><span><Sprout size={16}/><b>Start with one idea:</b> {j.seed}</span><ArrowRight size={18} aria-hidden/><span><Flag size={16}/><b>End up able to:</b> {j.destination}</span></div>
      <BigPicture j={j} collected={collected}/>
      <div className="button-row">{next >= 0 ? <Link className="button primary" href={`/universe/k/${j.stations[next].id}`}>{done ? 'Continue' : 'Start'} at stop {next + 1}: {j.stations[next].tool} <ArrowRight size={15}/></Link> : <a className="button primary" href="#capstone">All tools collected — use them <ArrowRight size={15}/></a>}<a className="button" href="#capstone">Jump to the capstone</a></div>
    </section>
    <div className="u-lj-body">
      <ol className="u-lj-stops">{j.stations.map((s, i) => { const p = getPoint(s.id)!; const on = collected[i];
        return <li key={s.id} id={`stop-${i + 1}`} className={`u-lj-stop${on ? ' done' : ''}`} style={gradeStyle(p.grade)}>
          <span className="u-lj-num">{on ? <Check size={18}/> : i + 1}</span>
          <div><span className="eyebrow">STOP {i + 1} · GRADE {p.grade} · {on ? 'TOOL COLLECTED' : 'NEW TOOL'}</span>
            <h3>{s.tool}</h3><code className="u-lj-rule">{s.rule}</code>
            <p>{s.why}</p>
            {i > 0 && <p className="u-lj-builds">Builds on stop {i}: <b>{j.stations[i - 1].tool}</b></p>}
            <Link className="small-link" href={`/universe/k/${s.id}`}>Lesson: {p.title.replace('Signature: ', '')} <span lang="zh-CN">{p.title_zh}</span> <ArrowRight size={13}/></Link></div>
        </li>; })}</ol>
      <aside className="u-lj-kit" aria-label="Your toolkit"><h3><Backpack size={18}/> Your toolkit · {done}/{j.stations.length}</h3>
        <ul>{j.stations.map((s, i) => <li key={s.id} className={collected[i] ? 'on' : ''}>{collected[i] ? <Check size={14}/> : <Lock size={14}/>}<span><b>{s.tool}</b><small>{s.rule}</small></span></li>)}</ul>
        <p className="muted">A tool is collected when you finish any level of its lesson. The capstone is open any time — tools you have not collected yet are still explained.</p></aside>
    </div>
    <section id="capstone" className="u-lj-capstone"><span className="eyebrow">CAPSTONE · 学以致用 · PUT IT ALL TOGETHER</span><h2>{j.capstone.title}</h2><p>{j.capstone.intro}</p>
      <Capstone j={j}/></section>
  </div>;
}

/** Shown on a lesson page: where this lesson sits on each journey, with the previous and next stops. */
export function JourneyBanner({pointId}: {pointId: string}) {
  const on = journeysThrough(pointId); if (!on.length) return null;
  return <div className="u-lj-banners">{on.map(({journey: j, index: i}) => { const prev = j.stations[i - 1], next = j.stations[i + 1];
    return <div key={j.id} className="u-lj-banner" style={{'--lj': j.colour} as React.CSSProperties}><Route size={18}/>
      <span>Stop <b>{i + 1} of {j.stations.length}</b> on the learning journey <Link href={`/universe/journeys/${j.id}`}><b>{j.title}</b></Link>: here you collect <b>{j.stations[i].tool}</b>.</span>
      <span className="u-lj-banner-nav">{prev && <Link href={`/universe/k/${prev.id}`}><ArrowLeft size={13}/>{prev.tool}</Link>}{next ? <Link href={`/universe/k/${next.id}`}>{next.tool}<ArrowRight size={13}/></Link> : <Link href={`/universe/journeys/${j.id}#capstone`}>Capstone<ArrowRight size={13}/></Link>}</span></div>; })}</div>;
}

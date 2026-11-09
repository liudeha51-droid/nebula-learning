'use client';
import {useEffect, useMemo, useState, useCallback} from 'react';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, Check, ChevronRight, Compass, Map as MapIcon, Sparkles, Layers, BookOpenCheck, Link2, Clapperboard, AlertTriangle, Cloud, CloudOff} from 'lucide-react';
import {CHAPTERS, DOMAINS, POINTS, WORLDS, CURRICULUM_VERSION, getChapter, getDomain, getPoint, getWorld, pointsInChapter, chaptersInGrade, unlocks, related} from '@/lib/universe/curriculum';
import {LOGIC} from '@/lib/universe/engines';
import {LEVELS, type DomainId, type Grade, type KnowledgePoint} from '@/lib/universe/types';
import {ProgressContext, levelsOf, useProgress, useProgressState} from '@/lib/universe/progress';
import {VIEWS} from './engines';
import {MathAnimationPlayer, type PlayerPrefs} from './player/math-animation-player';
import {StudentPrediction} from './player/student-prediction';
import {ChallengePanel} from './player/challenge-panel';
import {Tex} from './player/tex';
import {KnowledgeMap, STAGES, gradeStyle} from './knowledge-map';
import {FrontierPage} from './frontier';
import {JourneysIndex, JourneyPage, JourneyBanner, JourneyCards} from './learning-journeys';
import {SoundContext, playTone} from './stage';

const PREFS_KEY = 'nebula-universe-prefs-v1';
/** Free-flowing journeys: continuous, imaginative sequences that drift and morph. */
const JOURNEYS = ['g4-times-circle', 'g5-clock-stars', 'g6-snowflake-group', 'g6-rolling-pi', 'g9-wallpaper', 'g10-epicycles', 'g10-quintic-roots', 'g11-halving', 'g11-sunflower'];
const SIGNATURE = ['g6-cake', 'g6-cone-pour', 'g5-parallelogram', 'g1-make-ten', 'g8-pythagorean', 'g9-complete-square', 'g10-sine-graph', 'g10-am-gm', 'g11-ellipse', 'g11-rate-of-change', 'g12-normal', 'g6-circle-area'];

function usePrefs(): [PlayerPrefs, (p: PlayerPrefs) => void] {
  // Rendered only on the client (the shell waits for the session check), so storage can be read lazily.
  const [prefs, setPrefsState] = useState<PlayerPrefs>(() => { const base = {muted: false, captions: true, narrate: false}; try { const raw = localStorage.getItem(PREFS_KEY); return raw ? {...base, ...JSON.parse(raw)} : base; } catch { return base; } });
  const setPrefs = (p: PlayerPrefs) => { setPrefsState(p); try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch { /* ignore */ } };
  return [prefs, setPrefs];
}
function useReducedMotion(profileReduced: boolean) {
  const [system, setSystem] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const m = window.matchMedia('(prefers-reduced-motion: reduce)'); const on = () => setSystem(m.matches); m.addEventListener('change', on); return () => m.removeEventListener('change', on); }, []);
  return profileReduced || system;
}

/** Router for /universe, /universe/map, /universe/grade/:n and /universe/k/:id inside the existing app shell. */
export default function UniverseApp({path, profileReducedMotion}: {path: string; profileReducedMotion: boolean}) {
  const progress = useProgressState();
  const reduced = useReducedMotion(profileReducedMotion);
  const parts = path.split('/').filter(Boolean);
  let page: React.ReactNode;
  if (parts.length === 1) page = <UniverseHome/>;
  else if (parts[1] === 'map') page = <MapPage/>;
  else if (parts[1] === 'frontier') page = <FrontierPage/>;
  else if (parts[1] === 'journeys' && !parts[2]) page = <JourneysIndex/>;
  else if (parts[1] === 'journeys' && parts[2]) page = <JourneyPage key={parts[2]} id={parts[2]}/>;
  else if (parts[1] === 'grade' && /^([1-9]|1[0-2])$/.test(parts[2] ?? '')) page = <GradePage grade={Number(parts[2]) as Grade}/>;
  else if (parts[1] === 'k' && parts[2] && getPoint(parts[2])) page = <PointPage key={parts[2]} point={getPoint(parts[2])!} reduced={reduced}/>;
  else page = <div className="empty"><Compass size={28}/><h3>Uncharted region</h3><p>This part of the universe does not exist yet.</p><Link className="button" href="/universe">Back to the universe</Link></div>;
  return <ProgressContext.Provider value={progress}><div className="u-root">{page}</div></ProgressContext.Provider>;
}

function Sync() {
  const {synced} = useProgress();
  return <span className="u-sync" title={synced ? 'Progress saved to your account' : 'Progress saved on this device; will sync when the server is reachable'}>{synced ? <Cloud size={13}/> : <CloudOff size={13}/>}{synced ? 'Progress synced' : 'Saved locally'}</span>;
}
function LevelDots({mask}: {mask: number | undefined}) {
  const done = levelsOf(mask);
  return <span className="u-dots" aria-label={`${done.length} of 6 levels completed`}>{LEVELS.map(l => <i key={l.n} className={done.includes(l.n) ? 'on' : ''}/>)}</span>;
}
const ready = (p: KnowledgePoint) => !!VIEWS[p.animation_type] && !!LOGIC[p.animation_type];

function UniverseHome() {
  const {progress} = useProgress();
  const engines = new Set(POINTS.map(p => p.animation_type));
  const built = [...engines].filter(e => VIEWS[e] && LOGIC[e]).length;
  return <>
    <section className="u-hero">
      <div className="u-hero-copy">
        <span className="pill"><Sparkles size={13}/> THE ANIMATED MATHEMATICS UNIVERSE</span>
        <h1>Mathematics is something<br/>you can <span className="accent">explore</span>.</h1>
        <p lang="zh-CN" className="zh-lead">数学，是可以探索的世界。</p>
        <p>Twelve worlds, from counting to calculus. Watch quantities form, move the objects yourself, predict before you are told, and discover why the equations are true.</p>
        <div className="button-row"><Link className="button primary" href="/universe/grade/1">Start in Grade 1 <ArrowRight size={16}/></Link><Link className="button" href="/universe/map"><MapIcon size={16}/>Open the knowledge map</Link><Link className="button" href="/universe/journeys"><Compass size={16}/>Learning journeys</Link><Link className="button" href="/universe/frontier"><Sparkles size={16}/>The frontier</Link><Sync/></div>
      </div>
      <dl className="u-stats">
        <div><dt>Grade worlds</dt><dd>{WORLDS.length}</dd></div><div><dt>Chapters</dt><dd>{CHAPTERS.length}</dd></div>
        <div><dt>Knowledge points</dt><dd>{POINTS.length}</dd></div><div><dt>Animation engines live</dt><dd>{built}/{engines.size}</dd></div>
      </dl>
    </section>
    <div className="section-title lower-heading"><div><div className="eyebrow">LEARNING JOURNEYS · 学习之旅</div><h2>From one idea to the big picture</h2><p className="muted">Start with one simple idea, collect a new tool at every stop, then use them all together on a real problem.</p></div><Link className="small-link" href="/universe/journeys">All journeys <ArrowRight size={13}/></Link></div>
    <JourneyCards/>
    {STAGES.map(([stage, label, zh, grades]) => <section key={stage} aria-labelledby={`u-stage-${stage}`}>
      <div className="section-title lower-heading"><div><div className="eyebrow">{label.toUpperCase()} · {zh} · GRADES {grades[0]}–{grades[grades.length - 1]}</div><h2 id={`u-stage-${stage}`}>{stage === 'primary' ? 'Primary worlds' : stage === 'junior' ? 'Junior secondary worlds' : 'Senior secondary worlds'}</h2>{stage !== 'primary' && <p className="muted">{stage === 'junior' ? 'People’s Education Press (人教版) Grades 7–9 sequence.' : 'People’s Education Press A edition (人教A版 2019): required books 1–2 and selective-required books 1–3.'}</p>}</div></div>
      <div className="u-worlds">{WORLDS.filter(w => w.stage === stage).map(w => {
        const pts = POINTS.filter(p => p.grade === w.grade); const levels = pts.reduce((s, p) => s + levelsOf(progress[p.id]).length, 0);
        return <Link key={w.grade} href={`/universe/grade/${w.grade}`} className={`u-world g${w.grade}`} style={gradeStyle(w.grade)}>
          <span className="u-world-num">{w.grade}</span>
          <span className="eyebrow">GRADE {w.grade} · {w.world.toUpperCase()}</span>
          <h3>{w.title}</h3><span lang="zh-CN" className="zh">{w.title_zh}</span>
          <p>{w.objective}</p>
          <span className="u-world-meta">{chaptersInGrade(w.grade).length} chapters · {pts.length} knowledge points{books(w.grade) ? ` · ${books(w.grade)}` : ''}</span>
          <span className="u-bar"><i style={{width: `${(levels / (pts.length * 6)) * 100}%`}}/></span>
        </Link>;
      })}</div></section>)}
    <div className="section-title lower-heading"><div><div className="eyebrow">SIGNATURE EXPERIENCES</div><h2>Moments of discovery</h2></div></div>
    <div className="u-signature">{SIGNATURE.map(id => { const p = getPoint(id)!; return <Link key={id} href={`/universe/k/${id}`} className="u-sig-card" style={gradeStyle(p.grade)}>
      <span className="eyebrow">GRADE {p.grade}</span><strong>{p.title.replace('Signature: ', '')}</strong><span lang="zh-CN" className="zh">{p.title_zh.replace('招牌动画：', '')}</span><small>{p.description}</small>{!ready(p) && <em>Storyboard preview</em>}</Link>; })}</div>
    <div className="section-title lower-heading"><div><div className="eyebrow">FLOWING ANIMATIONS · 流动的数学</div><h2>Let the mathematics flow</h2><p className="muted">Continuous, free-flowing animations: watch an idea grow, drift and transform — then take the controls and let it run.</p></div></div>
    <div className="u-signature u-journeys">{JOURNEYS.map(id => { const p = getPoint(id)!; return <Link key={id} href={`/universe/k/${id}`} className="u-sig-card" style={gradeStyle(p.grade)}>
      <span className="eyebrow">GRADE {p.grade} · ANIMATION</span><strong>{p.title.replace('Signature: ', '')}</strong><span lang="zh-CN" className="zh">{p.title_zh.replace('招牌动画：', '')}</span><small>{p.description}</small></Link>; })}</div>
    <Link href="/universe/frontier" className="u-frontier-teaser"><span className="eyebrow">THE FRONTIER · 数学前沿</span><strong>Problems AI has taken on, from the Millennium Prize Problems to the olympiad</strong><span>The seven $1 million problems, famous conjectures and IMO 2025 problems — what they ask, what OpenAI claimed, how far it has been checked, and explorers to try. <ArrowRight size={14}/></span></Link>
    <div className="section-title lower-heading"><div><div className="eyebrow">CROSS-GRADE KNOWLEDGE SYSTEM</div><h2>How the ideas connect</h2><p className="muted">Select any point to light up what it builds on and what it unlocks in later grades.</p></div><Link className="small-link" href="/universe/map">Full screen <ArrowRight size={13}/></Link></div>
    <section className="panel"><KnowledgeMap compact/></section>
    <p className="muted u-version">Curriculum {CURRICULUM_VERSION} · aligned to the Mainland China compulsory education mathematics curriculum (Grades 1–9; Grades 7–9 follow the 人教版 sequence) and the senior high school standard (人教A版 required and selective-required books). The free elective courses (选修 A–E) are not included. Animations run in your browser; only your progress is stored.</p>
  </>;
}

function MapPage() {
  return <><Crumbs items={[['Universe', '/universe'], ['Knowledge map', '']]}/>
    <div className="page-heading"><div><div className="eyebrow">KNOWLEDGE CONNECTION GRAPH · 知识图谱</div><h1>{POINTS.length} ideas, one universe</h1><p>Columns are grades, rows are the knowledge systems. Lines are explicit prerequisite relationships — filter by school stage to zoom in.</p></div></div>
    <section className="panel"><KnowledgeMap/></section></>;
}

function Crumbs({items}: {items: [string, string][]}) {
  return <nav className="u-crumbs" aria-label="Breadcrumb">{items.map(([label, href], i) => <span key={i}>{href ? <Link href={href}>{label}</Link> : <strong>{label}</strong>}{i < items.length - 1 && <ChevronRight size={13}/>}</span>)}</nav>;
}

/** Textbook volumes a grade draws on, e.g. 必修第一册 / 必修第二册. */
function books(grade: Grade) { return [...new Set(chaptersInGrade(grade).map(c => c.book).filter(Boolean))].join(' / '); }

function GradePage({grade}: {grade: Grade}) {
  const {progress} = useProgress();
  const w = getWorld(grade);
  const [domain, setDomain] = useState<DomainId | 'all'>('all');
  const chapters = chaptersInGrade(grade);
  return <div style={gradeStyle(grade)}>
    <Crumbs items={[['Universe', '/universe'], [`Grade ${grade}`, '']]}/>
    <section className={`u-world-banner g${grade}`}>
      <div><span className="eyebrow">GRADE {grade} · {w.world.toUpperCase()}</span><h1>{w.title}</h1><p lang="zh-CN" className="zh-lead">{w.title_zh}</p><p>{w.objective}</p></div>
      <div className="u-grade-nav">{grade > 1 && <Link className="button" href={`/universe/grade/${grade - 1}`}><ArrowLeft size={15}/>Grade {grade - 1}</Link>}{grade < 12 && <Link className="button" href={`/universe/grade/${grade + 1}`}>Grade {grade + 1}<ArrowRight size={15}/></Link>}</div>
    </section>
    <div className="u-chips" role="radiogroup" aria-label="Filter by domain">
      <button role="radio" aria-checked={domain === 'all'} className={domain === 'all' ? 'on' : ''} onClick={() => setDomain('all')}>All</button>
      {DOMAINS.filter(d => POINTS.some(p => p.grade === grade && p.domain === d.id)).map(d => <button key={d.id} role="radio" aria-checked={domain === d.id} className={domain === d.id ? 'on' : ''} onClick={() => setDomain(d.id)}>{d.title} <span lang="zh-CN">{d.title_zh}</span></button>)}
    </div>
    {chapters.map(ch => { const pts = pointsInChapter(ch.id).filter(p => domain === 'all' || p.domain === domain); if (!pts.length) return null;
      return <section key={ch.id} className="u-chapter">
        <div className="u-chapter-head"><span className="u-chapter-num">{String(ch.order).padStart(2, '0')}</span><div><h2>{ch.title} <span lang="zh-CN" className="zh">{ch.title_zh}</span></h2>{ch.book && <span className="u-book" lang="zh-CN">{grade >= 10 ? '人教A版' : '人教版'} · {ch.book}</span>}<p>{ch.objective}</p></div></div>
        <div className="u-points">{pts.map(p => <Link key={p.id} href={`/universe/k/${p.id}`} className="u-point-card">
          <span className="eyebrow">{getDomain(p.domain).title}</span><strong>{p.title}</strong><span lang="zh-CN" className="zh">{p.title_zh}</span>
          <small>{p.description}</small>
          <span className="u-point-foot"><LevelDots mask={progress[p.id]}/>{ready(p) ? <span className="u-tag live"><Clapperboard size={12}/>Interactive</span> : <span className="u-tag"><Layers size={12}/>Storyboard</span>}</span>
        </Link>)}</div>
      </section>; })}
  </div>;
}

function PointPage({point, reduced}: {point: KnowledgePoint; reduced: boolean}) {
  const {progress, mark} = useProgress();
  const [prefs, setPrefs] = usePrefs();
  const [level, setLevel] = useState<number>(1);
  const [startScene, setStartScene] = useState(0);
  const [predicted, setPredicted] = useState(() => levelsOf(progress[point.id]).includes(3));
  const logic = LOGIC[point.animation_type]; const view = VIEWS[point.animation_type];
  const chapter = getChapter(point.chapter)!; const world = getWorld(point.grade);
  const scenes = useMemo(() => logic ? logic.scenes(logic.parse(point.interaction_config)) : [], [logic, point]);
  const done = levelsOf(progress[point.id]);
  const sound = useCallback((s: Parameters<typeof playTone>[0]) => { if (!prefs.muted) playTone(s); }, [prefs.muted]);
  useEffect(() => { if (level === 4 || level === 6) mark(point.id, level); }, [level, mark, point.id]);
  const onComplete = useCallback(() => mark(point.id, 1), [mark, point.id]);
  const onPredict = useCallback(() => { setPredicted(true); mark(point.id, 3); }, [mark, point.id]);
  const idx = POINTS.findIndex(p => p.id === point.id); const prev = POINTS[idx - 1], next = POINTS[idx + 1];

  return <div style={gradeStyle(point.grade)}>
    <Crumbs items={[['Universe', '/universe'], [`Grade ${point.grade}`, `/universe/grade/${point.grade}`], [chapter.title, `/universe/grade/${point.grade}`], [point.title, '']]}/>
    <header className="u-point-head">
      <div><span className="eyebrow">GRADE {point.grade} · {world.world.toUpperCase()} · {getDomain(point.domain).title.toUpperCase()}</span>
        <h1>{point.title}</h1><p lang="zh-CN" className="zh-lead">{point.title_zh}</p></div>
      <div className="u-point-meta"><Sync/><LevelDots mask={progress[point.id]}/></div>
    </header>
    <JourneyBanner pointId={point.id}/>
    <div className="u-objective"><BookOpenCheck size={17}/><div><strong>Learning objective</strong><ul>{point.learning_objectives.map(o => <li key={o}>{o}</li>)}</ul></div></div>

    <nav className="u-levels" role="tablist" aria-label="Learning levels (any order)">{LEVELS.map(l =>
      <button key={l.n} role="tab" aria-selected={level === l.n} className={(level === l.n ? 'on ' : '') + (done.includes(l.n) ? 'done' : '')} onClick={() => setLevel(l.n)}>
        <b>{done.includes(l.n) ? <Check size={13}/> : l.n}</b><span>{l.title}<small lang="zh-CN">{l.zh}</small></span></button>)}</nav>
    <p className="muted u-level-blurb">{LEVELS[level - 1].blurb} You can visit the levels in any order.</p>

    <SoundContext.Provider value={sound}>
      {!logic || !view ? <Unbuilt point={point}/> : <>
        {level === 1 && <MathAnimationPlayer key={startScene} logic={logic} view={view} config={point.interaction_config} reduced={reduced} prefs={prefs} setPrefs={setPrefs} startScene={startScene} predicted={predicted} onPredict={onPredict} onComplete={onComplete}/>}
        {level === 2 && <div className="u-explore" onPointerDownCapture={() => mark(point.id, 2)} onKeyDownCapture={e => { if (e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow')) mark(point.id, 2); }}>
          <p className="u-hint"><Sparkles size={15}/>Free exploration: change the numbers, move the objects and watch what stays the same.</p>
          <view.Explore c={logic.parse(point.interaction_config)}/></div>}
        {level === 3 && <div className="u-discover"><StudentPrediction prediction={logic.prediction(logic.parse(point.interaction_config))} onAnswered={() => onPredict()} onWatch={() => { setStartScene(logic.prediction(logic.parse(point.interaction_config)).revealScene); setLevel(1); }}/></div>}
        {level === 4 && <section className="panel u-understand">
          <div className="eyebrow">WHAT WE DISCOVERED</div><h2>{point.description}</h2>
          {point.formula && <div className="u-formula"><Tex block>{point.formula}</Tex></div>}
          <h3>The storyboard, scene by scene</h3>
          <ol className="u-storyboard">{scenes.map((s, i) => <li key={s.id}><button className="text-button" onClick={() => { setStartScene(i); setLevel(1); }}><b>{String(i + 1).padStart(2, '0')}</b> {s.title}</button><span className={'u-purpose ' + s.purpose}>{s.purpose}</span><p>{s.narration}</p></li>)}</ol>
          <h3><AlertTriangle size={16}/> Common misconceptions</h3><ul className="u-misconceptions">{point.misconceptions.map(m => <li key={m}>{m}</li>)}</ul>
          <p className="muted">Topics covered: {point.topics.join(' · ')}</p>
        </section>}
        {level === 5 && <ChallengePanel logic={logic} config={point.interaction_config} assessment={point.assessment} onSolved={() => mark(point.id, 5)}/>}
        {level === 6 && <Extend point={point}/>}
      </>}
    </SoundContext.Provider>
    <nav className="u-pager" aria-label="Neighbouring knowledge points">{prev && <Link href={`/universe/k/${prev.id}`} className="button"><ArrowLeft size={15}/><span className="u-pager-label">{prev.title}</span></Link>}<span/>{next && <Link href={`/universe/k/${next.id}`} className="button"><span className="u-pager-label">{next.title}</span><ArrowRight size={15}/></Link>}</nav>
  </div>;
}

function Unbuilt({point}: {point: KnowledgePoint}) {
  return <section className="panel u-unbuilt"><Layers size={26}/><h3>Animation in production</h3>
    <p>The <code>{point.animation_type}</code> engine for this knowledge point has not been built yet. The curriculum data, misconceptions, assessment and connections are available below and in the other levels.</p>
    <ul>{point.assessment.map(q => <li key={q.id}>{q.prompt}</li>)}</ul></section>;
}

function Extend({point}: {point: KnowledgePoint}) {
  const pre = point.prerequisites.map(id => getPoint(id)!); const next = unlocks(point.id); const rel = related(point.id);
  const Card = ({p}: {p: KnowledgePoint}) => <Link href={`/universe/k/${p.id}`} className="u-link-card" style={gradeStyle(p.grade)}><span className="eyebrow">GRADE {p.grade}</span><strong>{p.title}</strong><span lang="zh-CN" className="zh">{p.title_zh}</span></Link>;
  return <div className="u-extend">
    <section className="panel"><div className="eyebrow">EXTENSION ACTIVITIES · 拓展</div><h3>Keep exploring</h3><ul>{point.extension_activities.map(x => <li key={x}>{x}</li>)}</ul></section>
    <section className="panel u-connections">
      <div><h3><ArrowLeft size={15}/> Builds on</h3>{pre.length ? pre.map(p => <Card key={p.id} p={p}/>) : <p className="muted">A starting point — no prerequisites.</p>}</div>
      <div className="u-self"><span className="eyebrow">YOU ARE HERE</span><strong>{point.title}</strong></div>
      <div><h3>Unlocks <ArrowRight size={15}/></h3>{next.length ? next.map(p => <Card key={p.id} p={p}/>) : <p className="muted">A summit for now.</p>}</div>
    </section>
    {rel.length > 0 && <section className="panel"><h3><Link2 size={15}/> Related ideas</h3><div className="u-related">{rel.map(p => <Card key={p.id} p={p}/>)}</div></section>}
    <section className="panel"><h3>See it in the whole universe</h3><KnowledgeMap focus={point.id} compact/></section>
  </div>;
}

'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Pause,Play,RotateCcw,SlidersHorizontal,Sparkles} from 'lucide-react';
import {ANIMATIONS,initialParams,type AnimationSpec,type Params} from '@/lib/animations';
import type {KnowledgeNode} from '@/lib/api';
import {Formula} from './formula-editor';
import {SCENES} from './animation-scenes';

const SPEEDS=[.25,.5,1] as const;
const prefersReducedMotion=()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Stage({spec,concept,reducedMotion}:{spec:AnimationSpec;concept:string;reducedMotion:boolean}) {
  const calm=useState(()=>reducedMotion||prefersReducedMotion())[0];
  const [params,setParams]=useState<Params>(()=>initialParams(spec));
  const [time,setTime]=useState(0);
  const [playing,setPlaying]=useState(!calm);
  const [speed,setSpeed]=useState<number>(1);
  const [width,setWidth]=useState(0);
  const frame=useRef<HTMLDivElement>(null);
  const canvas=useRef<HTMLCanvasElement>(null);

  const duration=spec.duration(params);
  const t=Math.min(time,duration);
  const ended=!spec.loop&&t>=duration;
  const running=playing&&!ended;
  const height=Math.round(Math.min(470,Math.max(250,width*.56)));

  useEffect(()=>{
    const element=frame.current;if(!element)return;
    const observer=new ResizeObserver(entries=>setWidth(Math.floor(entries[0].contentRect.width)));
    observer.observe(element);return()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    if(!running)return;
    let id=0,last=performance.now();
    const tick=(now:number)=>{
      const step=Math.min(.05,(now-last)/1000)*speed;last=now;
      setTime(previous=>{const next=Math.min(previous,duration)+step;return spec.loop?next%duration:Math.min(next,duration)});
      id=requestAnimationFrame(tick);
    };
    id=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(id);
  },[running,speed,duration,spec.loop]);

  useEffect(()=>{
    const element=canvas.current;const context=element?.getContext('2d');
    if(!element||!context||!width)return;
    const ratio=Math.min(2,window.devicePixelRatio||1);
    if(element.width!==Math.round(width*ratio)||element.height!==Math.round(height*ratio)){element.width=Math.round(width*ratio);element.height=Math.round(height*ratio)}
    context.setTransform(ratio,0,0,ratio,0,0);context.clearRect(0,0,width,height);
    SCENES[spec.id](context,width,height,params,t);
  },[spec.id,params,t,width,height]);

  function change(key:string,value:number){setParams(current=>({...current,[key]:value}));if(!spec.loop)setTime(0)}
  function toggle(){if(ended){setTime(0);setPlaying(true)}else setPlaying(!playing)}
  const readings=spec.readings(params,t);

  return <div className="anim-layout">
    <section className="panel anim-stage" aria-labelledby="anim-title">
      <div className="section-title"><div><span className="pill">{concept}</span><h2 id="anim-title">{spec.title}</h2></div><Link className="small-link" href={spec.subject==='math'?'/nebula':'/physics'}>Concept map <ArrowUpRight size={14}/></Link></div>
      <p>{spec.summary}</p>
      <div ref={frame} className="anim-canvas" style={{height}}><canvas ref={canvas} style={{width:'100%',height}} role="img" aria-label={`${spec.title}. ${spec.summary} Current values are listed under “Live values”.`}/></div>
      <div className="anim-transport">
        <button className="primary" onClick={toggle}>{running?<><Pause size={16}/>Pause</>:ended?<><RotateCcw size={16}/>Replay</>:<><Play size={16}/>Play</>}</button>
        <button onClick={()=>setTime(0)} aria-label="Restart animation from the beginning"><RotateCcw size={15}/>Restart</button>
        <label className="anim-scrub">Time <output>{t.toFixed(1)} s</output><input type="range" aria-label="Animation time" min={0} max={duration} step="any" value={t} onChange={e=>{setPlaying(false);setTime(Number(e.target.value))}}/></label>
        <label className="anim-speed">Speed<select aria-label="Playback speed" value={speed} onChange={e=>setSpeed(Number(e.target.value))}>{SPEEDS.map(s=><option key={s} value={s}>{s}×</option>)}</select></label>
      </div>
      {calm&&<p className="muted" role="note">Reduced motion is on, so this animation starts paused. Press Play, or drag the time slider to step through it.</p>}
    </section>
    <aside className="panel anim-side">
      <div className="section-title"><h3><SlidersHorizontal size={15}/> Adjust</h3><button className="anim-reset" onClick={()=>{setParams(initialParams(spec));if(!spec.loop)setTime(0)}}>Reset values</button></div>
      {spec.params.map(q=><label key={q.key} className="anim-slider"><span>{q.label}<output>{params[q.key]}{q.unit}</output></span><input type="range" aria-label={q.label} min={q.min} max={q.max} step={q.step} value={params[q.key]} onChange={e=>change(q.key,Number(e.target.value))}/></label>)}
      <h3>Live values</h3>
      <dl className="anim-readings">{readings.map(r=><div key={r.label}><dt>{r.label}</dt><dd>{r.value}</dd></div>)}</dl>
      <Formula value={'\\displaystyle '+spec.formula}/>
      <p className="gentle-note"><Sparkles size={15}/><span><strong>What to notice.</strong> {spec.notice}</span></p>
      {spec.caveat&&<p className="muted">{spec.caveat}</p>}
    </aside>
  </div>;
}

export default function ConceptAnimations({topic,nodes,reducedMotion}:{topic:string|null;nodes:KnowledgeNode[];reducedMotion:boolean}) {
  const [subject,setSubject]=useState<'all'|'math'|'physics'>('all');
  const spec=ANIMATIONS.find(a=>a.id===topic)||ANIMATIONS[0];
  const name=(a:AnimationSpec)=>nodes.find(n=>n.id===a.node)?.name||(a.subject==='math'?'Mathematics':'Physics');
  const listed=ANIMATIONS.filter(a=>subject==='all'||a.subject===subject);
  return <>
    <div className="page-heading"><div><div className="eyebrow">SEE THE IDEA MOVE</div><h1>Animation lab</h1><p>Twelve high school concepts you can play, pause and reshape. Change a value and watch what follows.</p></div><span className="pill">{ANIMATIONS.length} animations · mathematics &amp; physics</span></div>
    <Stage key={spec.id} spec={spec} concept={name(spec)} reducedMotion={reducedMotion}/>
    <div className="section-title lower-heading"><h2>All animations</h2><div className="anim-filter" role="group" aria-label="Filter animations by subject">{([['all','All'],['math','Mathematics'],['physics','Physics']] as const).map(([value,label])=><button key={value} className={subject===value?'active':''} aria-pressed={subject===value} onClick={()=>setSubject(value)}>{label}</button>)}</div></div>
    <div className="concept-grid">{listed.map(a=><Link key={a.id} href={`/animations?topic=${a.id}`} scroll={false} aria-current={a.id===spec.id?'true':undefined} className={'concept anim-card '+(a.id===spec.id?'selected':'')} onClick={()=>window.scrollTo({top:0,behavior:reducedMotion||prefersReducedMotion()?'auto':'smooth'})}><span className="concept-star">{a.subject==='math'?'∑':'⚛'}</span><strong>{a.title}</strong><small>{a.summary}</small><span>{name(a)}</span></Link>)}</div>
    <p className="muted">These are idealised textbook models: no air resistance or friction unless a control says otherwise. They illustrate a concept and are separate from the question bank, so nothing here reveals the answer to a pending question.</p>
  </>;
}

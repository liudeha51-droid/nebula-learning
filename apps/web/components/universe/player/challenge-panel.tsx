'use client';
import {useMemo, useState} from 'react';
import {Check, RefreshCw, HelpCircle, X} from 'lucide-react';
import type {AssessmentQuestion, Challenge, EngineConfig, EngineLogic} from '@/lib/universe/types';
import {checkAnswer, fmt, rng} from '@/lib/universe/math';
import {useSound} from '../stage';

type Q = {prompt: string; kind: 'number' | 'choice'; options?: string[]; answer: number | string; tolerance?: number; unit?: string; hint?: string; explanation: string};

function Question({q, onSolved, label}: {q: Q; onSolved: () => void; label: string}) {
  const sound = useSound();
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'right' | 'wrong'>('idle');
  const [tries, setTries] = useState(0);
  const submit = (v: string) => {
    const ok = checkAnswer(v, q.answer, q.tolerance ?? 0);
    setState(ok ? 'right' : 'wrong'); setTries(tries + 1); sound(ok ? 'success' : 'error'); if (ok) onSolved();
  };
  const shown = typeof q.answer === 'number' ? fmt(q.answer) : q.answer;
  return <div className={'u-question ' + state}>
    <span className="eyebrow">{label}</span>
    <p className="u-question-prompt">{q.prompt}</p>
    {q.kind === 'choice' ? <div className="u-options" role="radiogroup" aria-label="Answer choices">{q.options?.map(o =>
      <button type="button" key={o} role="radio" aria-checked={value === o} className={value === o ? 'on' : ''} disabled={state === 'right'} onClick={() => { setValue(o); submit(o); }}>{o}</button>)}</div>
      : <form className="u-answer" onSubmit={e => { e.preventDefault(); if (value.trim()) submit(value); }}>
        <input aria-label="Your answer" inputMode="decimal" value={value} disabled={state === 'right'} onChange={e => { setValue(e.target.value); setState('idle'); }} placeholder="Type a number, fraction like 3/4, or decimal"/>
        {q.unit && <span className="u-unit">{q.unit}</span>}<button className="primary" disabled={state === 'right' || !value.trim()}>Check</button></form>}
    {state === 'right' && <p className="u-feedback good" role="status"><Check size={15}/> Correct. {q.explanation}</p>}
    {state === 'wrong' && <p className="u-feedback bad" role="status"><X size={15}/> Not yet. {tries >= 1 && q.hint ? <>Hint: {q.hint}</> : null}</p>}
    {state === 'wrong' && tries >= 2 && <details className="u-solution"><summary><HelpCircle size={14}/> Show the reasoning</summary><p>Answer: <strong>{shown}{q.unit ? ' ' + q.unit : ''}</strong>. {q.explanation}</p></details>}
  </div>;
}

/** Level 5: a fresh, engine-generated application challenge plus the authored comprehension check. */
export function ChallengePanel({logic, config, assessment, onSolved}: {logic: EngineLogic<unknown>; config: EngineConfig; assessment: AssessmentQuestion[]; onSolved: () => void}) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e6));
  const challenge: Challenge = useMemo(() => logic.challenge(logic.parse(config), rng(seed)), [logic, config, seed]);
  return <div className="u-apply">
    <section className="panel">
      <div className="section-title"><div><div className="eyebrow">APPLICATION CHALLENGE · NEW EVERY TIME</div><h3>Use what you discovered</h3></div>
        <button onClick={() => setSeed(seed + 1)}><RefreshCw size={15}/>New problem</button></div>
      <Question key={seed} q={challenge} onSolved={onSolved} label="Challenge"/>
    </section>
    {assessment.length > 0 && <section className="panel">
      <div className="eyebrow">COMPREHENSION CHECK</div><h3>Can you explain it?</h3>
      {assessment.map((q, i) => <Question key={q.id} q={{...q, hint: undefined}} onSolved={() => {}} label={`Question ${i + 1}`}/>)}
    </section>}
  </div>;
}

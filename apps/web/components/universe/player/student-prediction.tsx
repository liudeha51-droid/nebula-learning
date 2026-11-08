'use client';
import {useState} from 'react';
import {Lightbulb, Eye} from 'lucide-react';
import type {Prediction} from '@/lib/universe/types';
import {useSound} from '../stage';

/** Predict → lock in → reveal. Predictions are for thinking, never for scoring. */
export function StudentPrediction({prediction, onAnswered, onWatch, compact = false}: {prediction: Prediction; onAnswered: (correct: boolean) => void; onWatch: () => void; compact?: boolean}) {
  const sound = useSound();
  const [choice, setChoice] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const correct = choice === prediction.answer;
  return <div className={'u-prediction ' + (compact ? 'compact' : '')}>
    <div className="u-prediction-head"><Lightbulb size={18}/><span>Predict first</span></div>
    <p className="u-prediction-q">{prediction.prompt}</p>
    <div className="u-options" role="radiogroup" aria-label="Your prediction">
      {prediction.options.map(o => <button type="button" role="radio" aria-checked={choice === o.id} key={o.id} disabled={locked}
        className={(choice === o.id ? 'on ' : '') + (locked && o.id === prediction.answer ? 'right' : '')} onClick={() => { setChoice(o.id); sound('click'); }}>{o.label}</button>)}
    </div>
    {!locked ? <button className="primary" disabled={!choice} onClick={() => { setLocked(true); sound(correct ? 'success' : 'whoosh'); onAnswered(correct); }}>Lock in my prediction</button>
      : <div className="u-reveal" role="status">
        <p><strong>{correct ? 'Your prediction matches.' : 'Interesting — the model shows something different.'}</strong> {prediction.explanation}</p>
        <button className="primary" onClick={onWatch}><Eye size={16}/>Watch it happen</button>
      </div>}
  </div>;
}

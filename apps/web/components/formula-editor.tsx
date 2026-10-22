'use client';
import {useEffect,useRef} from 'react';
import katex from 'katex';
export function Formula({value}:{value:string}) {
  let html='';try{html=katex.renderToString(value||'\\text{Your formula appears here}',{throwOnError:false,trust:false,strict:'warn',output:'htmlAndMathml'})}catch{html='Invalid formula'}
  return <div className="formula-preview" dangerouslySetInnerHTML={{__html:html}}/>;
}
export default function FormulaEditor({value,onChange}:{value:string;onChange:(s:string)=>void}) {
  const host=useRef<HTMLDivElement>(null);
  const field=useRef<import('mathlive').MathfieldElement|null>(null);
  const callback=useRef(onChange);
  const current=useRef(value);
  useEffect(()=>{callback.current=onChange},[onChange]);
  useEffect(()=>{
    let disposed=false;
    const element=host.current;
    void import('mathlive').then(({MathfieldElement})=>{
      if(disposed||!host.current)return;
      MathfieldElement.fontsDirectory='/mathlive/fonts';
      const el=new MathfieldElement();el.value=current.current;el.mathVirtualKeyboardPolicy='manual';el.setAttribute('aria-label','Structured formula editor');
      el.addEventListener('input',()=>callback.current(el.value));host.current.replaceChildren(el);field.current=el;
    });
    return()=>{disposed=true;field.current=null;element?.replaceChildren()};
  },[]);
  useEffect(()=>{current.current=value;if(field.current&&field.current.value!==value)field.current.value=value},[value]);
  const templates=[['Fraction','\\frac{#0}{#0}'],['Root','\\sqrt{#0}'],['Power','{#0}^{#0}'],['Integral','\\int_{#0}^{#0} #0 \\,dx'],['Sum','\\sum_{n=1}^{#0} #0'],['Vector','\\vec{#0}'],['Force','F=ma'],['Matrix','\\begin{pmatrix}#0&#0\\\\#0&#0\\end{pmatrix}']];
  return <div className="formula-editor"><div className="formula-toolbar">{templates.map(([name,latex])=><button key={name} type="button" onClick={()=>{field.current?.insert(latex);field.current?.focus();if(field.current)callback.current(field.current.value)}}>{name}</button>)}</div><div ref={host}/><label>Editable LaTeX source<textarea aria-label="LaTeX source" value={value} onChange={e=>onChange(e.target.value)} rows={2}/></label><Formula value={value}/></div>
}

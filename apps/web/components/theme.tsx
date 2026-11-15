'use client';
import {useSyncExternalStore} from 'react';
import {Check,Palette} from 'lucide-react';
import {THEMES,DEFAULT_THEME,applyTheme,readTheme,subscribeTheme,themeColor,type ThemeId} from '@/lib/themes';

/** The active theme. Components that draw to a canvas use this to recolour and redraw. */
export function useTheme():ThemeId {return useSyncExternalStore(subscribeTheme,readTheme,()=>DEFAULT_THEME)}

/** Topbar shortcut: steps to the next theme. The full picker is on the profile page. */
export function ThemeCycle() {
  const theme=useTheme();
  const index=THEMES.findIndex(t=>t.id===theme),next=THEMES[(index+1)%THEMES.length];
  return <button className="theme-cycle" aria-label={`Theme: ${THEMES[index].name}. Switch to ${next.name}`} title={`Theme: ${THEMES[index].name}`} onClick={()=>applyTheme(next.id)}><Palette size={18}/></button>;
}

export function ThemePicker() {
  const theme=useTheme();
  return <fieldset className="theme-picker"><legend>Colour theme</legend><div role="radiogroup" aria-label="Colour theme" className="theme-options">{THEMES.map(t=>{
    const c=(hex:string)=>themeColor(hex,t.id);
    return <button type="button" key={t.id} role="radio" aria-checked={theme===t.id} className={'theme-option '+(theme===t.id?'selected':'')} onClick={()=>applyTheme(t.id)}>
      <span className="theme-swatch" aria-hidden="true" style={{background:c('#111018'),borderColor:c('#2d2a3a')}}><i style={{background:c('#191821'),borderColor:c('#2d2a3a')}}><b style={{background:c('#bba7f5')}}/><b style={{background:c('#92d5c4')}}/><b style={{background:c('#d8b87d')}}/></i></span>
      <span><strong>{t.name}{theme===t.id&&<Check size={14}/>}</strong><small>{t.description}</small></span>
    </button>})}</div><p className="muted">Saved on this device only. It applies before you sign in and does not change your learning record.</p></fieldset>;
}

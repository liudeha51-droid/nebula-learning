/** UI themes. The base stylesheet is the Nebula palette; every other theme is a
 * deterministic transform of those colours. The same transform generates
 * app/themes.css (scripts/generate-themes.ts) and recolours the canvases at
 * runtime, so CSS and drawings can never drift apart. Erasable-only TypeScript:
 * the generator imports this file directly under Node. */

export const THEMES=[
  {id:'nebula',name:'Nebula',description:'The original deep violet night sky.',dark:true},
  {id:'aurora',name:'Aurora',description:'Dark teal with violet highlights.',dark:true},
  {id:'ember',name:'Ember',description:'Dark and warm, with coral accents.',dark:true},
  {id:'daylight',name:'Daylight',description:'A light theme for bright rooms.',dark:false},
] as const;
export type ThemeId=typeof THEMES[number]['id'];
export const DEFAULT_THEME:ThemeId='nebula';
export const THEME_STORAGE_KEY='nebula-theme';
export const isTheme=(value:unknown):value is ThemeId=>THEMES.some(t=>t.id===value);

type Hsl=[number,number,number];
const within=(h:number,low:number,high:number)=>h>=low&&h<=high;
const TRANSFORMS:Record<ThemeId,(c:Hsl)=>Hsl>={
  nebula:c=>c,
  // violet becomes teal, and the mint accent takes violet's place
  aurora:([h,s,l])=>[within(h,225,300)?h-80:within(h,150,200)?h+100:h,s,l],
  // violet becomes coral; amber moves to sky blue so warnings still stand apart
  ember:([h,s,l])=>[within(h,225,300)?(h+122)%360:within(h,25,55)?h+160:h,s,l],
  // lightness is inverted, on a curve that keeps page backgrounds near white and pushes
  // mid-tone accents dark enough to read as text
  daylight:([h,s,l])=>{const f=1-Math.pow(l,1.35);return [h,s,Math.max(0,f-.22*Math.pow(4*f*(1-f),1.5))]},
};

function toHsl(r:number,g:number,b:number):Hsl {
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2,d=max-min;
  if(d===0)return [0,0,l];
  const s=d/(1-Math.abs(2*l-1));
  const h=max===r?((g-b)/d+6)%6:max===g?(b-r)/d+2:(r-g)/d+4;
  return [h*60,s,l];
}
function toRgb([h,s,l]:Hsl):[number,number,number] {
  const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
  const [r,g,b]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
  return [r+m,g+m,b+m].map(v=>Math.round(Math.min(1,Math.max(0,v))*255)) as [number,number,number];
}
const hex2=(v:number)=>v.toString(16).padStart(2,'0');

const cache=new Map<string,string>();
/** Recolour one #rgb, #rgba, #rrggbb or #rrggbbaa colour for a theme. Alpha is preserved. */
export function themeColor(color:string,theme:ThemeId):string {
  if(theme==='nebula')return color;
  const key=theme+color;const hit=cache.get(key);if(hit)return hit;
  let body=color.slice(1);
  if(!/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(body)||color[0]!=='#')return color;
  if(body.length<=4)body=[...body].map(ch=>ch+ch).join('');
  const [r,g,b]=[0,2,4].map(i=>parseInt(body.slice(i,i+2),16));
  const out='#'+toRgb(TRANSFORMS[theme](toHsl(r,g,b))).map(hex2).join('')+body.slice(6).toLowerCase();
  cache.set(key,out);return out;
}

const HEX=/#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi;
/** Dark, nearly neutral colours inside a box-shadow are real shadows: keep them dark in light themes. */
function isShadow(color:string):boolean {
  let body=color.slice(1);if(body.length<=4)body=[...body].map(ch=>ch+ch).join('');
  const [r,g,b]=[0,2,4].map(i=>parseInt(body.slice(i,i+2),16));
  return toHsl(r,g,b)[2]<.12;
}
/** Recolour every hex colour in one CSS declaration value. */
export function themeValue(property:string,value:string,theme:ThemeId):string {
  const light=!THEMES.find(t=>t.id===theme)!.dark;
  if(property==='color-scheme')return light?'light':value;
  const shadow=light&&/shadow/.test(property);
  return value.replace(HEX,color=>shadow&&isShadow(color)?color:themeColor(color,theme));
}

/** Scope a selector to a theme. The attribute lives on <html>. */
export function themeSelector(selector:string,theme:ThemeId):string {
  const scope=`[data-theme=${theme}]`,trimmed=selector.trim();
  if(/^(:root|html)\b/.test(trimmed))return trimmed.replace(/^(:root|html)/,match=>match+scope);
  return `${scope} ${trimmed}`;
}

// ---------- Browser state: one theme per device, kept in localStorage ----------

const listeners=new Set<()=>void>();
export function readTheme():ThemeId {
  if(typeof document==='undefined')return DEFAULT_THEME;
  const value=document.documentElement.dataset.theme;
  return isTheme(value)?value:DEFAULT_THEME;
}
export function applyTheme(theme:ThemeId) {
  document.documentElement.dataset.theme=theme;
  try{localStorage.setItem(THEME_STORAGE_KEY,theme)}catch{/* private mode: the theme still applies for this visit */}
  listeners.forEach(notify=>notify());
}
export function subscribeTheme(notify:()=>void) {listeners.add(notify);return()=>{listeners.delete(notify)}}
/** Runs before first paint (inlined in the document head) so a saved theme never flashes the default. */
export const THEME_BOOT_SCRIPT=`try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});document.documentElement.dataset.theme=${JSON.stringify(THEMES.map(t=>t.id))}.indexOf(t)>=0?t:${JSON.stringify(DEFAULT_THEME)}}catch(e){document.documentElement.dataset.theme=${JSON.stringify(DEFAULT_THEME)}}`;

import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {THEMES,themeColor,themeValue,themeSelector,isTheme,THEME_BOOT_SCRIPT} from './themes';
import {generateThemes} from '../scripts/generate-themes';

/** WCAG relative luminance contrast between two #rrggbb colours. */
function contrast(a:string,b:string) {
  const lum=(hex:string)=>{const [r,g,bl]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*bl};
  const [hi,lo]=[lum(a),lum(b)].sort((x,y)=>y-x);return (hi+.05)/(lo+.05);
}

describe('themes',()=>{
  it('leaves the base theme untouched and preserves alpha and format',()=>{
    expect(themeColor('#bba7f5','nebula')).toBe('#bba7f5');
    for(const t of THEMES.filter(x=>x.id!=='nebula')){
      expect(themeColor('#aa87eb12',t.id)).toMatch(/^#[0-9a-f]{6}12$/);
      expect(themeColor('#0009',t.id)).toMatch(/^#[0-9a-f]{6}99$/);
      expect(themeColor('not-a-colour',t.id)).toBe('not-a-colour');
    }
  });
  it('keeps neutral greys neutral in dark themes and inverts them in the light theme',()=>{
    expect(themeColor('#808080','aurora')).toBe('#808080');expect(themeColor('#808080','ember')).toBe('#808080');
    expect(themeColor('#000000','daylight')).toBe('#ffffff');expect(themeColor('#ffffff','daylight')).toBe('#000000');
  });
  it('keeps body, muted and accent text readable on page and panel backgrounds in every theme',()=>{
    for(const t of THEMES){
      const c=(hex:string)=>themeColor(hex,t.id);
      for(const surface of ['#111018','#191821','#201e2a']){
        expect(contrast(c('#eeecf5'),c(surface)),`${t.id} text`).toBeGreaterThan(7);
        expect(contrast(c('#aaa6b9'),c(surface)),`${t.id} muted`).toBeGreaterThan(4.5);
        for(const accent of ['#bba7f5','#92d5c4','#d8b87d'])expect(contrast(c(accent),c(surface)),`${t.id} ${accent}`).toBeGreaterThan(4.5);
      }
      expect(contrast(c('#211b35'),c('#bba7f5')),`${t.id} primary button`).toBeGreaterThan(4.5);
    }
  });
  it('recolours declarations, keeps real shadows dark, and scopes selectors',()=>{
    expect(themeValue('color-scheme','dark','daylight')).toBe('light');expect(themeValue('color-scheme','dark','aurora')).toBe('dark');
    expect(themeValue('box-shadow','20px 0 70px #0009','daylight')).toBe('20px 0 70px #0009');
    expect(themeValue('border','1px solid #2d2a3a','ember')).toBe('1px solid '+themeColor('#2d2a3a','ember'));
    expect(themeSelector(':root','aurora')).toBe(':root[data-theme=aurora]');expect(themeSelector(' .panel','aurora')).toBe('[data-theme=aurora] .panel');
  });
  it('validates stored values and boots only known themes',()=>{
    expect(isTheme('ember')).toBe(true);expect(isTheme('neon')).toBe(false);expect(isTheme(null)).toBe(false);
    for(const t of THEMES)expect(THEME_BOOT_SCRIPT).toContain(`"${t.id}"`);
  });
  it('has an up-to-date generated stylesheet (run: node scripts/generate-themes.ts)',()=>{
    expect(readFileSync('app/themes.css','utf8')).toBe(generateThemes(readFileSync('app/globals.css','utf8')));
  });
});

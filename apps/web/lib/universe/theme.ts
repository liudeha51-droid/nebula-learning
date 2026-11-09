'use client';
import {useSyncExternalStore} from 'react';

/** Universe colour theme: "bright" (child-friendly, the default) or "night" (the original dark look). */
export type UniverseTheme = 'bright' | 'night';
const KEY = 'nebula-universe-theme';
const listeners = new Set<() => void>();
export function readTheme(): UniverseTheme { try { return localStorage.getItem(KEY) === 'night' ? 'night' : 'bright'; } catch { return 'bright'; } }
export function setUniverseTheme(t: UniverseTheme) { try { localStorage.setItem(KEY, t); } catch { /* storage may be unavailable */ } listeners.forEach(l => l()); }
const subscribe = (l: () => void) => { listeners.add(l); const onStorage = (e: StorageEvent) => { if (e.key === KEY) l(); }; window.addEventListener('storage', onStorage); return () => { listeners.delete(l); window.removeEventListener('storage', onStorage); }; };
export const useUniverseTheme = () => useSyncExternalStore(subscribe, readTheme, () => 'bright' as UniverseTheme);

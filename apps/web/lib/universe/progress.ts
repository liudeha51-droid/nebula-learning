'use client';
import {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {api} from '@/lib/api';

/** Level completion per knowledge point as a 6-bit mask (bit 0 = Observe … bit 5 = Extend). */
export type ProgressMap = Record<string, number>;
const LOCAL_KEY = 'nebula-universe-progress-v1';

function readLocal(): ProgressMap { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') as ProgressMap; } catch { return {}; } }
function writeLocal(m: ProgressMap) { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(m)); } catch { /* storage unavailable */ } }

export const levelsOf = (mask: number | undefined) => [1, 2, 3, 4, 5, 6].filter(l => ((mask ?? 0) >> (l - 1)) & 1);

export interface ProgressApi {progress: ProgressMap; mark: (id: string, level: number) => void; synced: boolean}
export const ProgressContext = createContext<ProgressApi>({progress: {}, mark: () => {}, synced: false});
export const useProgress = () => useContext(ProgressContext);

/** Server-persisted progress (FastAPI) with a local cache so learning never blocks on the network. */
export function useProgressState(): ProgressApi {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [synced, setSynced] = useState(false);
  useEffect(() => {
    // Hydrate from the local cache after mount (localStorage is unavailable during server rendering).
    const local = readLocal();
    let live = true;
    api<{items: {kp_id: string; levels: number}[]}>('/universe/progress').then(r => {
      if (!live) return;
      const server: ProgressMap = {}; for (const i of r.items) server[i.kp_id] = i.levels;
      const merged: ProgressMap = {...server}; for (const [k, v] of Object.entries(local)) merged[k] = (merged[k] ?? 0) | v;
      setProgress(merged); writeLocal(merged); setSynced(true);
      // Push any levels that only exist locally (e.g. completed while offline).
      for (const [k, v] of Object.entries(local)) if (((server[k] ?? 0) | v) !== (server[k] ?? 0)) for (const l of levelsOf(v)) void api(`/universe/progress/${k}`, 'PUT', {level: l}).catch(() => {});
    }).catch(() => { if (live) setProgress(local); });
    return () => { live = false; };
  }, []);
  const ref = useRef(progress);
  useEffect(() => { ref.current = progress; }, [progress]);
  const mark = useCallback((id: string, level: number) => {
    const bit = 1 << (level - 1); const prev = ref.current;
    if (((prev[id] ?? 0) & bit) !== 0) return;
    const next = {...prev, [id]: (prev[id] ?? 0) | bit}; ref.current = next; setProgress(next); writeLocal(next);
    void api(`/universe/progress/${id}`, 'PUT', {level}).then(() => setSynced(true)).catch(() => setSynced(false));
  }, []);
  return {progress, mark, synced};
}

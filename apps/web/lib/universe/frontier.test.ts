import {describe, expect, it} from 'vitest';
import {FRONTIER, LEVELS, STATUS_LABEL, frontierByLevel} from './frontier';
import {getPoint} from './curriculum';

describe('the frontier page content', () => {
  it('starts with exactly the seven Millennium Prize Problems', () => {
    expect(LEVELS.map(l => l.level)).toEqual([1, 2, 3, 4]);
    expect(frontierByLevel(1).map(f => f.id).sort()).toEqual(['bsd', 'hodge', 'navier-stokes', 'p-vs-np', 'poincare', 'riemann', 'yang-mills']);
    expect(FRONTIER.findIndex(f => f.level !== 1)).toBe(7);
  });
  it('is honest about status: only Poincaré is solved, Navier–Stokes is a disputed claim', () => {
    const st = Object.fromEntries(frontierByLevel(1).map(f => [f.id, f.status]));
    expect(st).toEqual({'navier-stokes': 'claim-disputed', 'riemann': 'open', 'p-vs-np': 'open', 'bsd': 'open', 'hodge': 'open', 'yang-mills': 'open', 'poincare': 'solved-by-humans'});
  });
  it('orders the olympiad problems from hardest to easiest and gives checked answers', () => {
    expect(frontierByLevel(4).map(f => f.id)).toEqual(['imo-p3', 'imo-p5', 'imo-p1', 'imo-p4']);
    for (const f of frontierByLevel(4)) { expect(f.answer, f.id).toBeTruthy(); expect(f.idea?.length, f.id).toBeGreaterThan(1); expect(f.status).toBe('competition'); }
  });
  it('links to real knowledge points and real sources', () => {
    for (const f of FRONTIER) {
      expect(new Set(FRONTIER.map(x => x.id)).size).toBe(FRONTIER.length);
      expect(STATUS_LABEL[f.status], f.id).toBeDefined();
      expect(f.learn.length, f.id).toBeGreaterThan(0);
      for (const id of f.learn) expect(getPoint(id), `${f.id} → ${id}`).toBeDefined();
      expect(f.sources.length, f.id).toBeGreaterThan(0);
      for (const s of f.sources) expect(s.url, f.id).toMatch(/^https:\/\//);
      for (const t of [f.question, f.why, f.openai]) expect(t.length, f.id).toBeGreaterThan(40);
    }
  });
  it('cites a Lean formalisation whenever the status says one is listed', () => {
    for (const f of FRONTIER.filter(x => x.status === 'claim-lean')) expect(f.sources.some(s => s.url.includes('/lean/docs/')), f.id).toBe(true);
  });
});

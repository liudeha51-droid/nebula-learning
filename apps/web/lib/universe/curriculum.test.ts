import {describe, expect, it} from 'vitest';
import {CHAPTERS, POINTS, WORLDS, DOMAINS, getPoint, ancestry, unlocks} from './curriculum';
import {LOGIC} from './engines';
import {checkAnswer, rng} from './math';

describe('six-grade curriculum integrity', () => {
  it('covers twelve grades (primary, junior and senior secondary) with chapters and knowledge points', () => {
    expect(WORLDS).toHaveLength(12);
    for (const g of [7, 8, 9, 10, 11, 12]) {
      expect(CHAPTERS.filter(c => c.grade === g).length, `grade ${g}`).toBeGreaterThanOrEqual(3);
      expect(POINTS.filter(p => p.grade === g).length, `grade ${g}`).toBeGreaterThanOrEqual(10);
      expect(CHAPTERS.filter(c => c.grade === g).every(c => !!c.book), `grade ${g} chapters name their PEP volume`).toBe(true);
    }
    for (const g of [1, 2, 3, 4, 5, 6]) {
      expect(CHAPTERS.filter(c => c.grade === g).length).toBeGreaterThanOrEqual(6);
      expect(POINTS.filter(p => p.grade === g).length).toBeGreaterThanOrEqual(20);
    }
    // Chapter counts follow the blueprint: 6, 7, 9, 8, 8, 9.
    expect([1, 2, 3, 4, 5, 6].map(g => CHAPTERS.filter(c => c.grade === g).length)).toEqual([6, 7, 9, 8, 8, 9]);
  });
  it('uses unique, stable, grade-prefixed identifiers', () => {
    const ids = POINTS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of POINTS) { expect(p.id).toMatch(/^g([1-9]|1[0-2])-[a-z0-9-]+$/); expect(p.id.startsWith(`g${p.grade}-`)).toBe(true); expect(p.animation_id).toBe(`anim-${p.id}`); }
    expect(new Set(CHAPTERS.map(c => c.id)).size).toBe(CHAPTERS.length);
  });
  it('stores explicit relationships that resolve and never point to a later grade as a prerequisite', () => {
    for (const p of POINTS) {
      for (const pre of p.prerequisites) { const q = getPoint(pre); expect(q, `${p.id} → ${pre}`).toBeDefined(); expect(q!.grade).toBeLessThanOrEqual(p.grade); expect(pre).not.toBe(p.id); }
      for (const r of p.related_concepts) expect(getPoint(r), `${p.id} ~ ${r}`).toBeDefined();
      expect(DOMAINS.map(d => d.id)).toContain(p.domain);
      expect(CHAPTERS.find(c => c.id === p.chapter)?.grade).toBe(p.grade);
    }
  });
  it('has an acyclic prerequisite graph', () => {
    for (const p of POINTS) expect(ancestry(p.id).map(a => a.id)).not.toContain(p.id);
  });
  it('connects grades: most later-grade points build on earlier knowledge', () => {
    const later = POINTS.filter(p => p.grade > 1);
    expect(later.filter(p => p.prerequisites.length > 0).length / later.length).toBeGreaterThan(.85);
    expect(unlocks('g1-count-to-10').length).toBeGreaterThan(2);
  });
  it('gives every point objectives, misconceptions, assessment and extension', () => {
    for (const p of POINTS) {
      expect(p.learning_objectives.length, p.id).toBeGreaterThan(0);
      expect(p.misconceptions.length, p.id).toBeGreaterThan(0);
      expect(p.assessment.length, p.id).toBeGreaterThan(0);
      expect(p.extension_activities.length, p.id).toBeGreaterThan(0);
      expect(p.topics.length, p.id).toBeGreaterThan(0);
      expect(p.title_zh, p.id).toMatch(/[一-鿿]/);
    }
  });
  it('has internally consistent assessment answers', () => {
    for (const p of POINTS) for (const q of p.assessment) {
      if (q.kind === 'choice') { expect(q.options, q.id).toBeDefined(); expect(q.options, q.id).toContain(q.answer); }
      else { expect(typeof q.answer, q.id).toBe('number'); expect(checkAnswer(String(q.answer), q.answer, q.tolerance), q.id).toBe(true); }
    }
  });
});

describe('animation engine coverage', () => {
  it('every knowledge point has a registered engine with a valid configuration', () => {
    for (const p of POINTS) {
      const logic = LOGIC[p.animation_type];
      expect(logic, `${p.id}: engine ${p.animation_type}`).toBeDefined();
      const c = logic!.parse(p.interaction_config);
      expect(logic!.validate(c), p.id).toEqual([]);
    }
  });
  it('every storyboard follows the discovery structure and every challenge is self-consistent', () => {
    for (const p of POINTS) {
      const logic = LOGIC[p.animation_type]!; const c = logic.parse(p.interaction_config);
      const scenes = logic.scenes(c);
      expect(scenes.length, p.id).toBeGreaterThanOrEqual(5);
      expect(scenes[0].purpose, p.id).toBe('introduce');
      expect(scenes.some(s => s.purpose === 'discover'), p.id).toBe(true);
      expect(scenes.some(s => s.purpose === 'explain'), p.id).toBe(true);
      // Formal explanation comes only after discovery.
      expect(scenes.findIndex(s => s.purpose === 'explain'), p.id).toBeGreaterThan(scenes.findIndex(s => s.purpose === 'discover'));
      for (const s of scenes) { expect(s.narration.length, `${p.id}/${s.id}`).toBeGreaterThan(10); expect(s.duration).toBeGreaterThan(0); }
      const pr = logic.prediction(c);
      expect(pr.options.map(o => o.id), p.id).toContain(pr.answer);
      expect(pr.revealScene, p.id).toBeGreaterThan(0); expect(pr.revealScene, p.id).toBeLessThan(scenes.length);
      // The prediction gate must come before the formal explanation.
      expect(pr.revealScene, p.id).toBeLessThanOrEqual(scenes.findIndex(s => s.purpose === 'explain'));
      for (let seed = 1; seed <= 25; seed++) {
        const ch = logic.challenge(c, rng(seed));
        if (ch.kind === 'choice') expect(ch.options, `${p.id} seed ${seed}`).toContain(String(ch.answer));
        else { expect(typeof ch.answer).toBe('number'); expect(Number.isFinite(ch.answer as number), `${p.id} seed ${seed}`).toBe(true); expect(checkAnswer(String(ch.answer), ch.answer, ch.tolerance), `${p.id} seed ${seed}`).toBe(true); }
      }
      expect(logic.describe(c).length).toBeGreaterThan(20);
    }
  });
});

import type {Chapter, Domain, DomainId, Grade, GradeWorld, KnowledgePoint} from '../types';
import {grade1} from './grade1';
import {grade2} from './grade2';
import {grade3} from './grade3';
import {grade4} from './grade4';
import {grade5} from './grade5';
import {grade6} from './grade6';

export const CURRICULUM_VERSION = '2026.11-universe-1';

export const DOMAINS: Domain[] = [
  {id: 'number', title: 'Number Systems', title_zh: '数的认识', summary: 'Whole numbers, place value, fractions, decimals, percentages and negative numbers.'},
  {id: 'operations', title: 'Arithmetic Operations', title_zh: '数的运算', summary: 'The four operations, algorithms, estimation and arithmetic laws.'},
  {id: 'relationships', title: 'Quantitative Relationships', title_zh: '数量关系', summary: 'Measurement, money, time, rates, ratios, algebra and problem solving.'},
  {id: 'geometry', title: 'Geometry', title_zh: '图形与几何', summary: 'Shapes, angles, area, volume, position and transformation.'},
  {id: 'statistics', title: 'Statistics and Probability', title_zh: '统计与概率', summary: 'Classification, data, charts, averages and chance.'},
];

export const WORLDS: GradeWorld[] = [
  {grade: 1, title: 'Discovering Numbers and Shapes', title_zh: '发现数与形', world: 'The Meadow of First Numbers', motif: 'Playful objects that respond when counted', objective: 'Number sense, quantity, basic arithmetic, spatial awareness and elementary measurement.'},
  {grade: 2, title: 'Multiplication, Division and Number Structures', title_zh: '乘除与数的结构', world: 'The Grouping Machines', motif: 'Counting machines that bundle tens and build arrays', objective: 'Multiplication and division through grouping, repeated addition, sharing and place value.'},
  {grade: 3, title: 'Fractions and Measurement', title_zh: '分数与测量', world: 'The Exploration Laboratories', motif: 'Laboratories for cutting, measuring and testing', objective: 'Structured reasoning and early abstraction: multi-digit operations, fractions and measurement.'},
  {grade: 4, title: 'Large Numbers, Laws and Geometry', title_zh: '大数、运算律与几何', world: 'The Architecture of Mathematics', motif: 'Number architecture and geometric structures', objective: 'Systematic calculation, mathematical properties and geometric relationships.'},
  {grade: 5, title: 'Fractions, Algebra, Area and Volume', title_zh: '分数、方程、面积与体积', world: 'The Transformation Laboratory', motif: 'Cutting, rearranging and constructing in 3D', objective: 'From arithmetic to algebraic thinking, transformations and three-dimensional measurement.'},
  {grade: 6, title: 'Connections and Proportional Worlds', title_zh: '比例世界与知识联结', world: 'The Proportional Cosmos', motif: 'Dynamic geometry and proportional systems', objective: 'Integrate primary mathematics and prepare for secondary mathematics.'},
];

const all = [grade1, grade2, grade3, grade4, grade5, grade6];
export const CHAPTERS: Chapter[] = all.flatMap(g => g.chapters);
export const POINTS: KnowledgePoint[] = all.flatMap(g => g.points);

const byId = new Map(POINTS.map(p => [p.id, p]));
const chapterById = new Map(CHAPTERS.map(c => [c.id, c]));
const unlockMap = new Map<string, string[]>();
for (const p of POINTS) for (const pre of p.prerequisites) unlockMap.set(pre, [...(unlockMap.get(pre) ?? []), p.id]);

export const getPoint = (id: string) => byId.get(id);
export const getChapter = (id: string) => chapterById.get(id);
export const getWorld = (g: Grade) => WORLDS[g - 1];
export const getDomain = (id: DomainId) => DOMAINS.find(d => d.id === id)!;
export const pointsInGrade = (g: Grade) => POINTS.filter(p => p.grade === g);
export const chaptersInGrade = (g: Grade) => CHAPTERS.filter(c => c.grade === g);
export const pointsInChapter = (id: string) => POINTS.filter(p => p.chapter === id);
/** Knowledge points that list `id` as a prerequisite (explicit reverse edges). */
export const unlocks = (id: string) => (unlockMap.get(id) ?? []).map(i => byId.get(i)!).filter(Boolean);
/** Related concepts in both directions (relations are symmetric for navigation). */
export function related(id: string): KnowledgePoint[] {
  const p = byId.get(id); if (!p) return [];
  const ids = new Set(p.related_concepts);
  for (const q of POINTS) if (q.related_concepts.includes(id)) ids.add(q.id);
  ids.delete(id);
  return [...ids].map(i => byId.get(i)!).filter(Boolean);
}
/** All transitive prerequisites, nearest first. */
export function ancestry(id: string): KnowledgePoint[] {
  const seen = new Set<string>(); const out: KnowledgePoint[] = []; const queue = [...(byId.get(id)?.prerequisites ?? [])];
  while (queue.length) { const next = queue.shift()!; if (seen.has(next)) continue; seen.add(next); const p = byId.get(next); if (p) { out.push(p); queue.push(...p.prerequisites); } }
  return out;
}

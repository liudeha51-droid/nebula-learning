import type {Chapter, Domain, DomainId, Grade, GradeWorld, KnowledgePoint} from '../types';
import {grade1} from './grade1';
import {grade2} from './grade2';
import {grade3} from './grade3';
import {grade4} from './grade4';
import {grade5} from './grade5';
import {grade6} from './grade6';
import {grade7} from './grade7';
import {grade8} from './grade8';
import {grade9} from './grade9';
import {grade10} from './grade10';
import {grade11} from './grade11';
import {grade12} from './grade12';

export const CURRICULUM_VERSION = '2026.11-universe-2';

export const DOMAINS: Domain[] = [
  {id: 'number', title: 'Number Systems', title_zh: '数的认识', summary: 'Whole numbers, place value, fractions, decimals, percentages and negative numbers.'},
  {id: 'operations', title: 'Arithmetic Operations', title_zh: '数的运算', summary: 'The four operations, algorithms, estimation and arithmetic laws.'},
  {id: 'relationships', title: 'Quantitative Relationships', title_zh: '数量关系', summary: 'Measurement, money, time, rates, ratios, algebra and problem solving.'},
  {id: 'functions', title: 'Functions', title_zh: '函数', summary: 'Coordinates, functions, sequences, trigonometric functions and derivatives (secondary school).'},
  {id: 'geometry', title: 'Geometry', title_zh: '图形与几何', summary: 'Shapes, angles, area, volume, position and transformation.'},
  {id: 'statistics', title: 'Statistics and Probability', title_zh: '统计与概率', summary: 'Classification, data, charts, averages and chance.'},
];

export const WORLDS: GradeWorld[] = [
  {grade: 1, stage: 'primary', title: 'Discovering Numbers and Shapes', title_zh: '发现数与形', world: 'The Meadow of First Numbers', motif: 'Playful objects that respond when counted', objective: 'Number sense, quantity, basic arithmetic, spatial awareness and elementary measurement.'},
  {grade: 2, stage: 'primary', title: 'Multiplication, Division and Number Structures', title_zh: '乘除与数的结构', world: 'The Grouping Machines', motif: 'Counting machines that bundle tens and build arrays', objective: 'Multiplication and division through grouping, repeated addition, sharing and place value.'},
  {grade: 3, stage: 'primary', title: 'Fractions and Measurement', title_zh: '分数与测量', world: 'The Exploration Laboratories', motif: 'Laboratories for cutting, measuring and testing', objective: 'Structured reasoning and early abstraction: multi-digit operations, fractions and measurement.'},
  {grade: 4, stage: 'primary', title: 'Large Numbers, Laws and Geometry', title_zh: '大数、运算律与几何', world: 'The Architecture of Mathematics', motif: 'Number architecture and geometric structures', objective: 'Systematic calculation, mathematical properties and geometric relationships.'},
  {grade: 5, stage: 'primary', title: 'Fractions, Algebra, Area and Volume', title_zh: '分数、方程、面积与体积', world: 'The Transformation Laboratory', motif: 'Cutting, rearranging and constructing in 3D', objective: 'From arithmetic to algebraic thinking, transformations and three-dimensional measurement.'},
  {grade: 6, stage: 'primary', title: 'Connections and Proportional Worlds', title_zh: '比例世界与知识联结', world: 'The Proportional Cosmos', motif: 'Dynamic geometry and proportional systems', objective: 'Integrate primary mathematics and prepare for secondary mathematics.'},
  {grade: 7, stage: 'junior', title: 'Rational Numbers and the Algebra Gateway', title_zh: '有理数与代数之门', world: 'The Algebra Gateway', motif: 'Signed numbers moving on an infinite line', objective: 'Rational and real numbers, expressions, equations, inequalities and the coordinate plane (人教版七年级).'},
  {grade: 8, stage: 'junior', title: 'Proof, Pythagoras and Linear Functions', title_zh: '证明、勾股与一次函数', world: 'The Proof Workshop', motif: 'Congruent shapes, area proofs and straight-line graphs', objective: 'Triangles and congruence, symmetry, polynomial algebra, radicals, the Pythagorean theorem, linear functions and data analysis (人教版八年级).'},
  {grade: 9, stage: 'junior', title: 'Quadratics, Circles and Similarity', title_zh: '二次、圆与相似', world: 'The Curve Observatory', motif: 'Parabolas, circles and similar shapes', objective: 'Quadratic equations and functions, rotation, circles, probability, inverse functions, similarity and trigonometric ratios (人教版九年级).'},
  {grade: 10, stage: 'senior', title: 'Functions, Trigonometry, Vectors and Space', title_zh: '函数、三角、向量与空间', world: 'The Function Cosmos', motif: 'Families of curves and vectors in motion', objective: '人教A版 必修第一册 (sets, inequalities, functions, exponentials, logarithms, trigonometry) and 必修第二册 (vectors, complex numbers, solid geometry, statistics, probability).'},
  {grade: 11, stage: 'senior', title: 'Analytic Geometry, Sequences and Calculus', title_zh: '解析几何、数列与导数', world: 'The Analytic Observatory', motif: 'Conic sections, infinite sequences and tangent lines', objective: '人教A版 选择性必修第一册 (space vectors, lines and circles, conic sections) and 第二册 (sequences, derivatives).'},
  {grade: 12, stage: 'senior', title: 'Counting, Distributions and Data Models', title_zh: '计数、分布与数据模型', world: 'The Probability Laboratory', motif: 'Galton boards, Pascal triangles and regression lines', objective: '人教A版 选择性必修第三册: counting principles, random variables and distributions, and paired-data analysis.'},
];

const all = [grade1, grade2, grade3, grade4, grade5, grade6, grade7, grade8, grade9, grade10, grade11, grade12];
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

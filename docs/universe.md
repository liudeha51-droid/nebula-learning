# Mathematics Universe (Grades 1–12)

The Mathematics Universe is an interactive, animated mathematics curriculum inside the existing app shell at **`/universe`**. It covers three school stages:

| Stage | Grades | Source sequence | Knowledge points | Chapters |
| --- | --- | --- | --- | --- |
| Primary 小学 | 1–6 | Mainland China compulsory-education mathematics curriculum | 198 | 47 |
| Junior secondary 初中 | 7–9 | People’s Education Press (人教版) 七年级上册 … 九年级下册 | 60 | 31 |
| Senior secondary 高中 | 10–12 | 人教A版 (2019): 必修第一册, 必修第二册, 选择性必修第一、二、三册 | 55 | 18 |
| **Total** | | | **313** | **96** |

The totals include five **journeys** (see below), which are signature points inside existing chapters.

The senior “elective” content included is the **selective-required (选择性必修) books 1–3**. The free elective courses (选修 A–E: e.g. university-preparatory, engineering, economics, humanities and physical-education/arts mathematics) are **not** included. Grades 10–12 are a teaching order, not an official grade assignment: schools schedule the senior books differently. It is not a separate application: it uses the same Next.js catch-all route, login, sidebar and design tokens, and stores learner progress in the existing FastAPI backend.

## Routes

| Route | What it shows |
| --- | --- |
| `/universe` | Twelve grade worlds grouped by school stage, signature experiences, journeys, and a compact knowledge map |
| `/universe/map` | Full cross-grade knowledge connection graph, with search, a school-stage filter, a domain filter and an accessible list |
| `/universe/grade/{1-12}` | One grade world: chapters (secondary chapters are labelled with their textbook volume), knowledge-point cards and a domain filter |
| `/universe/k/{id}` | A knowledge point with six learning levels |

## Curriculum data model (`apps/web/lib/universe/`)

- `types.ts`: `KnowledgePoint` has the fields the blueprint requires: `id`, `grade`, `domain`, `chapter`, `title` (+ `title_zh`), `description`, `learning_objectives`, `prerequisites`, `related_concepts`, `animation_id`, `animation_type`, `interaction_config`, `misconceptions`, `assessment`, `extension_activities`. It also has `topics` (the blueprint topics it covers) and an optional LaTeX `formula`.
- `curriculum/grade1.ts` … `grade6.ts`: **198 knowledge points in 47 chapters** (including two journeys). Chapters per grade follow the blueprint: 6 / 7 / 9 / 8 / 8 / 9. IDs are stable and grade-prefixed (`g5-parallelogram`).
- `curriculum/grade7.ts` … `grade12.ts`: **115 knowledge points in 49 chapters** (12 / 10 / 9 / 10 / 5 / 3 chapters; 24 / 20 / 16 / 28 / 17 / 10 points, including three journeys). Every secondary chapter records its textbook volume in `Chapter.book` (for example `必修第一册`). `GradeWorld.stage` and `stageOf(grade)` give the school stage.
- Relationships are stored explicitly: `prerequisites` is a directed edge list (an acyclic graph, always pointing to the same or an earlier grade, and crossing stages where it should, e.g. `g10-am-gm` builds on `g8-expand`), and `related_concepts` is treated as symmetric. Reverse edges ("unlocks") and transitive ancestry are derived in `curriculum/index.ts`.
- Domains are the five knowledge systems from the blueprint (Number Systems, Arithmetic Operations, Quantitative Relationships, Geometry, Statistics & Probability) plus **Functions (函数)** for the secondary function strand.

## Animation architecture

Each **engine** comes in two parts:

1. **Pure logic** in `lib/universe/engines/<engine>.ts`, implementing `EngineLogic<C>`:
   - `parse`/`validate` for the config
   - `scenes` (the storyboard, with narration per scene)
   - `prediction` (asked before the reveal scene)
   - `challenge` (a fresh problem from a seeded RNG, with a computed answer)
   - `describe` (a text alternative)
2. A **view** in `components/universe/engines/<engine>.tsx`, with two parts:
   - `Scene({c, scene, p})`: a pure function of scene index and progress
   - `Explore({c})`: stateful free manipulation

Because every frame is computed from `(scene, progress)`, scrubbing, step playback, replay and reduced motion all go through the same code path. With reduced motion on, each scene shows its final frame with no tweening.

47 engines cover every knowledge point. The 28 primary engines:

`counting`, `objects` (make-ten, break-ten), `place-value` (万/亿 grouping and Chinese number reading), `column` (carrying and borrowing kept in step with blocks), `array` (groups → array, rotation, area model, distributive), `division` (sharing, grouping, remainders, long division), `laws` (order-of-operations pathways, arithmetic laws), `fraction` (13 modes), `decimal`, `number-line`, `angle` (draggable dynamic geometry), `area` (cut-and-rearrange derivations), `circle` (sector rearrangement and the **Cake Transformation**), `solid` (SVG 3D projection: unit cubes, folding nets, cylinder unrolling and slicing, **cone-pouring experiment**), `balance` (algebra), `measure`, `clock`, `money`, `data`, `probability`, `percent`, `proportion`, `coordinate`, `factor`, `sorting`, `transform`, `reasoning`, `shapes`.

The 18 secondary engines (each with several modes; secondary points also reuse `balance`, `angle`, `transform`, `solid` and `probability`):

| Engine | Modes | What learners see and do |
| --- | --- | --- |
| `rational` | line, absolute, compare, add, multiply, power | Signed numbers as moves on a number line; sign rules as direction reversals |
| `tiles` | like-terms, brackets, expand, diff-squares, factor, simplify, complete-square | Algebra tiles: expanding as area, factoring by rearranging, completing the square by filling the corner |
| `pythag` | sqrt, irrational, radical, proof, converse | √2 on the number line, Zhao Shuang (赵爽) rearrangement proof, converse with a draggable triangle |
| `geo2` | complement, vertical, parallel, triangle-inequality, polygon, congruence, bisector, perp-bisector, isosceles, midline, inscribed, tangent, arc-length, similar | Dynamic geometry with draggable points for junior proofs and circle theorems |
| `func` | quadrants, system, fractional, linear, linear-ineq, roots, quadratic, quadratic-max, inverse, quad-ineq, mapping, parity, power, exponential, log, bisection | Function graphs that morph with parameters, intersections, the bisection method |
| `inequality` | properties, line, am-gm | Order flipping under ×(−1), solution sets on a number line, the four-rectangle AM–GM proof |
| `sets` | operations, conditions | Venn diagram shading; nested sets for sufficient/necessary conditions |
| `analysis` | sampling, stratified, histogram, center, variance, boxplot | Random and stratified samples of 1000 students, histogram construction, mean vs median, deviations, PEP percentiles |
| `regression` | correlation, least-squares, contingency | Residual squares that shrink as the line is fitted; r; a 2×2 table with χ² |
| `trig` | right, height, radian, unit-circle, wave, transform, sum-formula, laws | Similar triangles, the unit circle unrolling into a sine wave, A sin(ωx + φ) dials, law of cosines |
| `vector` | add, dot | Draggable arrows, head-to-tail sums, projection “shadow” for the dot product |
| `complex` | plane, multiply | Points in the complex plane; × i as a quarter turn |
| `space` | pyramid, relations, perpendicular, vectors, normal | Rotatable cube/prism (drag or arrow keys): three pyramids fill a prism, skew lines, line ⊥ plane, normal vectors |
| `conic` | line, distance, circle, ellipse, hyperbola, parabola | Focus-and-string tracing, distance-sum/difference readouts, asymptotes, reflection to the focus |
| `sequence` | arithmetic, geometric, induction | Bars and Gauss pairing, S − qS, falling dominoes |
| `derivative` | secant, rules, monotonic, optimize | Secant shrinking to a tangent, slope graph tracing (sin x)′ = cos x, sign of f′, the open-box problem |
| `combin` | dice, tree, perm-comb, pascal | 6 × 6 dice table, tree diagrams, podium vs committee, Yang Hui’s triangle |
| `distribution` | classical, independence, conditional, expectation, binomial, normal | Sample-space cards, area model for independence, probability trees, binomial bars, a Galton board |

### Journeys (free-flowing sequences)

The `journey` engine (`lib/universe/engines/journey.ts`, `components/universe/engines/journey.tsx`) holds five continuous, imaginative sequences. Instead of stepping through a diagram, each follows one image as it grows, drifts and morphs. Scene time flows across scene boundaries, so the motion never resets between scenes. Their Explore modes run on a free-running animation clock with play/pause; it starts paused when the operating system requests reduced motion.

| Point | Journey | Imagery |
| --- | --- | --- |
| `g4-times-circle` | Times tables on a circle | Point k is threaded to m·k mod n. ×2 draws a cardioid; the multiplier drifts and new “flowers” (m − 1 petals) bloom |
| `g6-rolling-pi` | Unrolling π | A 1 m wheel rolls and paints 3.14159… m; Liu Hui’s 割圆术 polygons (6 → 3072 sides) squeeze π; 祖冲之’s bounds |
| `g10-epicycles` | Circles that draw waves | Circles ride on circles; their tip draws a wave that stiffens from a sine into a square (or sawtooth) wave |
| `g11-halving` | Halving forever | 1/2 + 1/4 + … paints a square while the camera dives endlessly into the self-similar corner (a seamless loop) |
| `g11-sunflower` | The sunflower’s secret angle | The seed angle sweeps until it locks at the golden angle 137.508°; 13 and 21 spiral arms; Fibonacci ratios → φ |

The journeys are also listed in their own row on the home page.

Plotting helpers shared by the secondary engines are in `components/universe/plot.tsx` (`frame`, `Axes`, `Curve`, `Pt`); 3D projection helpers (`Mesh`, `Rotator`, `project`) are exported from the `solid` view.

The shared components map to the blueprint's proposed names as follows:

| Blueprint name | Implementation |
| --- | --- |
| MathAnimationPlayer | `components/universe/player/math-animation-player.tsx`: transport controls, speed, captions, optional read-aloud (Web Speech), mutable synthesised sound, keyboard shortcuts, and a **prediction gate** that pauses before the reveal scene |
| InteractiveTimeline | `player/interactive-timeline.tsx`: scrubber, scene chips, prediction marker |
| StudentPrediction | `player/student-prediction.tsx`: predict → lock in → reveal → "watch it happen" |
| KnowledgeConnectionGraph | `components/universe/knowledge-map.tsx` |
| NumberModel, FractionModel, GeometryCanvas, ShapeTransformer, MeasurementSimulator, AlgebraBalance, StatisticsVisualizer | The `counting`/`place-value`, `fraction`, `angle`, `area`/`transform`, `measure`, `balance` and `data` engines |

Shared primitives live in `components/universe/stage.tsx`: the SVG stage, quantity colours, keyboard-accessible drag handles, steppers, sliders and sound.

**Quantity colours are the same in every grade:** ones = amber, tens = mint, hundreds = violet, thousands = coral, unknowns = pink.

## Learning levels

Each knowledge point has six levels: Observe, Explore, Discover, Understand, Apply and Extend.

- Learners can visit the levels in any order.
- Observe completes when playback reaches the end.
- Explore completes on the first interaction.
- Discover completes when a prediction is locked in.
- Understand and Extend complete when opened.
- Apply completes when a generated challenge is solved.
- The formal formula and the explanation scene always come **after** the discovery scene. A test enforces this.

## Progress API

- `GET /api/v1/universe/progress` returns `{items: [{kp_id, levels, updated}]}`. `levels` is a 6-bit mask (bit 0 = Observe).
- `PUT /api/v1/universe/progress/{kp_id}` with body `{level: 1..6}` ORs that level into the mask. It is idempotent.
  - `kp_id` must match `^g([1-9]|1[0-2])-[a-z0-9-]{2,70}$` (grades 1–12).
  - Each learner is capped at 500 rows.
  - Requests require a login and the same-origin header.
- Table `universe_progress` is created by Alembic revision `0002`.
- The browser keeps a local copy, so progress made offline syncs on the next load.

## Verification performed

| Check | Result |
| --- | --- |
| Backend `pytest` | 153 passed (5 universe tests, including grade 7–12 ids accepted and grade 0/13 rejected) |
| Alembic `upgrade head` → `check` → `downgrade base` → `upgrade head` (disposable SQLite) | clean, no drift (verified with the primary release; the secondary work changes no schema) |
| `npm run lint`, `npm run typecheck` | clean |
| `vitest` | 18 passed (the per-point tests run over all 313 points) |
| `next build` | succeeds |

The vitest suite covers:
- curriculum integrity: unique IDs, resolvable acyclic edges, answer consistency
- per knowledge point: storyboard structure, prediction-before-explanation, 25 seeded challenges, config validation
- maths helpers: order of operations, Chinese number reading, column and long-division algorithms, answer parsing, and rounding of values in exponential notation
- secondary curriculum shape: every grade 7–12 world has at least 3 chapters and 10 points, and every secondary chapter names its textbook volume

Browser checks used headless Chromium against the running app, logged in as a development learner:
- **All 308 knowledge points at 1280 px and at 390 px** (and the five journeys, added afterwards, at both widths): every scene chip, Explore with button interactions, and Apply. No page errors and no horizontal page overflow.
- Contact sheets of the discover scene and the Explore mode of every secondary engine and journey were inspected by eye. Journey Explore modes were checked to keep moving by default and to start paused with reduced motion. This found and fixed: a NaN in scenes opened at their first frame (a `fix()` rounding bug for values like `3.7e-12`), an incorrect expected value in the prize-wheel scene, and several overlapping labels.
- End-to-end flow: prediction gate → reveal → resume, comprehension answer, server persistence (level mask), progress surviving a reload, solving on the algebra balance, knowledge-map selection, and the existing routes (`/`, `/practice`, `/nebula`, `/notes`, `/analytics`). For the secondary stages: the Grade 12 page and its textbook label, a senior point (`g10-am-gm`) answered in Apply and manipulated in Explore with the level persisted by the API, and the map's Senior secondary filter.

## Known limitations and remaining work

- **Content review.** The curriculum text, misconceptions and questions were written for this implementation and are consistency-tested, but they have **not** been reviewed by teachers. Some topics differ between textbook editions (for example inverse proportion and the trapezoid definition); these are labelled as enrichment or textbook-dependent.
- **Secondary scope.**
  - The free elective courses (选修 A–E) are not included.
  - Junior chapters follow the PEP sequence as a whole. The older and the 2024-revised PEP editions place a few chapters in different volumes, so a chapter’s `book` label may not match every school’s copy.
  - Grades 10–12 are a teaching order for the 人教A版 books, not an official grade assignment.
  - The secondary stages are coarser than primary: 112 points for nine junior volumes and five senior books.
  - Some textbook sections appear only in narration, questions or a neighbouring point, without an animation of their own. Examples: oblique (斜二测) drawing, recursive sequences beyond arithmetic/geometric, composite-function derivatives, the hypergeometric distribution, Bayes’ formula, and the mathematical-modelling activities.
- **Language.** Titles are bilingual (English/中文). Narration, captions and explanations are English only.
- **Production polish.** The visuals are clear SVG animations, not a cinematic production. Camera movement is minimal, there is no ambient music (only short synthesised effects), and 3D uses a lightweight custom SVG projection rather than Three.js.
- **Explore depth varies.** Some modes (for example mass units, codes and logic grids) explore by changing parameters rather than by direct manipulation.
- **Accessibility.** Every stage has a text description, captions, and keyboard support for drag handles, scrubber and transport. It has not been audited with screen readers or for colour contrast.
- **Browser coverage.** Only headless Chromium was used. Safari, Firefox, real tablets and real phones were not tested.
- **Database.** Migration `0002` was verified on SQLite only. PostgreSQL acceptance is still subject to the Compose limitation in `docs/limitations.md`.
- **Apply level.** Only the generated challenge marks Apply complete; the authored comprehension questions do not.

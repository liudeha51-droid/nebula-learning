# Mathematics Universe (Grades 1–12)

The Mathematics Universe is an interactive, animated mathematics curriculum inside the existing app shell at **`/universe`**. It covers three school stages:

| Stage | Grades | Source sequence | Knowledge points | Chapters |
| --- | --- | --- | --- | --- |
| Primary 小学 | 1–6 | Mainland China compulsory-education mathematics curriculum | 200 | 47 |
| Junior secondary 初中 | 7–9 | People’s Education Press (人教版) 七年级上册 … 九年级下册 | 61 | 31 |
| Senior secondary 高中 | 10–12 | 人教A版 (2019): 必修第一册, 必修第二册, 选择性必修第一、二、三册 | 56 | 18 |
| **Total** | | | **317** | **96** |

The totals include nine **journeys** (see below), which are signature points inside existing chapters.

The senior “elective” content included is the **selective-required (选择性必修) books 1–3**. The free elective courses (选修 A–E: e.g. university-preparatory, engineering, economics, humanities and physical-education/arts mathematics) are **not** included. Grades 10–12 are a teaching order, not an official grade assignment: schools schedule the senior books differently. It is not a separate application: it uses the same Next.js catch-all route, login, sidebar and design tokens, and stores learner progress in the existing FastAPI backend.

## Routes

| Route | What it shows |
| --- | --- |
| `/universe` | Twelve grade worlds grouped by school stage, signature experiences, journeys, and a compact knowledge map |
| `/universe/journeys` | Learning journeys: guided routes from one simple idea, through lessons across grades, to a capstone that uses every tool |
| `/universe/journeys/{id}` | One learning journey: big-picture map, stops, toolkit and capstone |
| `/universe/frontier` | The frontier: problems OpenAI models have taken on, ordered by difficulty from the seven Millennium Prize Problems to IMO 2025, with status, sources and explorers |
| `/universe/map` | Full cross-grade knowledge connection graph, with search, a school-stage filter, a domain filter and an accessible list |
| `/universe/grade/{1-12}` | One grade world: chapters (secondary chapters are labelled with their textbook volume), knowledge-point cards and a domain filter |
| `/universe/k/{id}` | A knowledge point with six learning levels |

## Curriculum data model (`apps/web/lib/universe/`)

- `types.ts`: `KnowledgePoint` has the fields the blueprint requires: `id`, `grade`, `domain`, `chapter`, `title` (+ `title_zh`), `description`, `learning_objectives`, `prerequisites`, `related_concepts`, `animation_id`, `animation_type`, `interaction_config`, `misconceptions`, `assessment`, `extension_activities`. It also has `topics` (the blueprint topics it covers) and an optional LaTeX `formula`.
- `curriculum/grade1.ts` … `grade6.ts`: **200 knowledge points in 47 chapters** (including four journeys). Chapters per grade follow the blueprint: 6 / 7 / 9 / 8 / 8 / 9. IDs are stable and grade-prefixed (`g5-parallelogram`).
- `curriculum/grade7.ts` … `grade12.ts`: **117 knowledge points in 49 chapters** (12 / 10 / 9 / 10 / 5 / 3 chapters; 24 / 20 / 17 / 29 / 17 / 10 points, including five journeys). Every secondary chapter records its textbook volume in `Chapter.book` (for example `必修第一册`). `GradeWorld.stage` and `stageOf(grade)` give the school stage.
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

The `journey` engine (`lib/universe/engines/journey.ts`, `components/universe/engines/journey.tsx`, `journey-algebra.tsx`) holds nine continuous, imaginative sequences. Instead of stepping through a diagram, each follows one image as it grows, drifts and morphs. Scene time flows across scene boundaries, so the motion never resets between scenes. Their Explore modes run on a free-running animation clock with play/pause; it starts paused when the operating system requests reduced motion.

| Point | Journey | Imagery |
| --- | --- | --- |
| `g4-times-circle` | Times tables on a circle | Point k is threaded to m·k mod n. ×2 draws a cardioid; the multiplier drifts and new “flowers” (m − 1 petals) bloom |
| `g6-rolling-pi` | Unrolling π | A 1 m wheel rolls and paints 3.14159… m; Liu Hui’s 割圆术 polygons (6 → 3072 sides) squeeze π; 祖冲之’s bounds |
| `g10-epicycles` | Circles that draw waves | Circles ride on circles; their tip draws a wave that stiffens from a sine into a square (or sawtooth) wave |
| `g11-halving` | Halving forever | 1/2 + 1/4 + … paints a square while the camera dives endlessly into the self-similar corner (a seamless loop) |
| `g11-sunflower` | The sunflower’s secret angle | The seed angle sweeps until it locks at the golden angle 137.508°; 13 and 21 spiral arms; Fibonacci ratios → φ |
| `g6-snowflake-group` | A snowflake’s symmetries | A glowing snowflake turns by 60° and flips; its 12 moves gather into a ring and fill a coloured group table (D6). Explore: turn and flip it yourself and see the move highlighted in the table |
| `g5-clock-stars` | Clock arithmetic and the circle of fifths | 9 + 5 ≡ 2 (mod 12); hopping 7 notes draws the circle of fifths; each step k closes after 12 ÷ gcd(12, k) hops. Explore: any n and k, with optional musical notes |
| `g9-wallpaper` | Seventeen ways to repeat | A golden motif multiplies into p1 → p2 → p4 → p4m and p6m patterns; pentagons leave a gap while hexagons fit (only 2-, 3-, 4-, 6-fold turns); 17 wallpaper groups, 230 space groups |
| `g10-quintic-roots` | Roots that dance | The roots of x⁵ − x − c move as c circles one branch point and two of them swap; the four swaps generate all 120 permutations (S5), Galois’s reason there is no quintic formula. Explore: drag c yourself |

The last four were made after the video *抽象代数 · 结构之美* (“Abstract algebra: the beauty of structure”). They take its scenes and glowing look, rebuilt as interactive SVG. Their maths is tested in `journey-algebra.test.ts`:
- the 12 snowflake moves satisfy the group laws
- the hop rule holds for every step
- each loop for c returns to c = 1 and swaps exactly two roots, and together the swaps generate a group of order 120

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

## Learning journeys (`/universe/journeys`)

Each learning journey starts from **one simple idea** from primary school. It then visits a series of existing lessons, usually across several grades, and each lesson hands the learner **one new tool**. It ends in a **capstone** problem that needs all the tools at once.

| Journey | Seed idea | Stops (grades) | Capstone |
| --- | --- | --- | --- |
| Measure the Earth 测量地球 | An angle is an amount of turn | angles (3) → degrees (4) → circumference (6) → proportion (6) → parallel lines (7) → arc length (9) | Eratosthenes: from a 7.2° shadow and 800 km to the Earth’s circumference and radius |
| Is this game fair? 这个游戏公平吗 | A whole can be shared into equal parts | fractions (3) → chance (6) → experiments (6) → listing outcomes (9) → classical probability (10) → expected value (12) | Run a dice stall: probability, expected value, the fair prize, and 1,000 simulated games |
| The biggest garden 最大的菜园 | Perimeter is the distance around a shape | perimeter (3) → equations (5) → expressions (7) → functions (8) → parabolas (9) → rate of change (11) → optimisation (11) | 40 m of fence against a wall, solved by table, vertex and derivative, all agreeing |
| How fast do things grow? 增长有多快 | Multiplication is repeated equal groups | multiplication (2) → percentage change (6) → powers (7) → exponential functions (10) → logarithms (10) → geometric series (11) | Doubling time with logarithms (and the rule of 72); yearly deposits summed as a geometric series |
| Where am I? How GPS works 我在哪里 | A position is a pair of numbers | ordered pairs (5) → coordinate plane (7) → systems of equations (7) → Pythagoras (8) → distance formula (11) → circle equations (11) | Trilateration: three tower distances → three circles → two straight lines → solve for the phone |

How it fits together:

- **Journey page:**
  - the question, the seed idea and the destination
  - a big-picture road map (stops coloured by grade, ticked off as they are collected)
  - stop cards: the tool, its rule, why it matters and what it builds on, with a link to the lesson
  - a toolkit panel
  - the capstone
- **Collecting tools.** A stop counts as collected when any learning level of its lesson is done, so it uses the existing progress API.
- **Capstone steps.** Every worked step names the tools it uses and links back to their stops.
- **Lesson pages** show a banner with the stop number and the previous and next stops.
- **Where the code lives:**
  - content and capstone maths: `lib/universe/learning-journeys.ts`
  - views: `components/universe/learning-journeys.tsx` and `capstones.tsx`
- **Tests** (`learning-journeys.test.ts`) check:
  - that every stop is a real lesson
  - that grades never go down along a journey
  - that no stop depends on a later stop in the prerequisite graph
  - each capstone's maths:
    - Eratosthenes gives 40,000 km
    - sum 7 paying ¥6 on a ¥1 stake is exactly fair
    - table, vertex and derivative agree
    - logarithmic doubling time matches compounding
    - the series matches year-by-year saving
    - trilateration recovers the phone exactly
- **Browser checks:**
  - every journey page at 1280 and 390 px, with no errors and no overflow
  - each capstone's controls exercised
  - progress shown to update the toolkit after a lesson level is completed
  - a WCAG AA contrast audit of the journey pages, index and banner in the bright theme

The home page's animation row is now called **Flowing animations**, so that “learning journeys” always means these guided routes.

## The frontier (`/universe/frontier`)

A page of mathematics problems that OpenAI models have tackled, written for high-school students and ordered by difficulty:

1. **The seven Millennium Prize Problems.** Each gets a plain-language statement and an honest status.
   - Poincaré was solved by Perelman.
   - Navier–Stokes is a **disputed, unverified** OpenAI claim from September 2026.
   - For the other five, the page lists OpenAI's claimed partial or related results (e.g. a zero-free region for ζ, the Hodge conjecture for CM abelian varieties, special cases of BSD, a 2-D toy model with a mass gap, ETH and Subset Sum results near P vs NP). It says plainly that none of these solves the problem.
2. **Famous conjectures:** colouring the plane, the irrationality exponent of π, Erdős's arithmetic-progression conjecture, short Egyptian fractions, crossing numbers, multiplication below n log n.
3. **Research puzzles with one-sentence statements:** Snaky, largest prime factors of n and n + 1, Heilbronn's triangle problem, three-machine scheduling.
4. **IMO 2025 Problems 3, 5, 1 and 4** (hardest first), which OpenAI's experimental model solved in July 2025. The IMO did not officially certify the result.

**Content and sources.** `lib/universe/frontier.ts` holds the content. Each entry has a status label:
- open
- solved by humans
- disputed claim
- claim with a Lean formalisation listed
- claim without one
- competition result

Every entry cites sources. Repository facts come from `github.com/openai/math` at commit `4eaee87` (29 October 2026); news facts are as of October 2026.

**Explorers.** Fourteen explorers live in `components/universe/frontier-explorers.tsx`:
- blowup of y′ = y²
- prime counting with Li(x)
- subset sum
- rational points on y² = x³ − 2 by chord-and-tangent, with point counts mod p
- loops on a sphere and a torus
- colouring the Moser spindle
- best fractions for π
- Egyptian fractions
- largest prime factors
- a two-player Snaky board (the shape taken from the paper's definition)
- the four IMO problems

Their exact maths (BigInt rationals, 50-digit π, sieves) is in `lib/universe/frontier-math.ts`.

**Verification.**
- `frontier-math.test.ts` re-checks the IMO answers by computation:
  - sunny-line constructions for n = 3–8
  - the divisor-sequence formula for every start below 6000
  - the bonza example satisfies the condition for every a, b ≤ 60
  - the game outcome on both sides of 1/√2
- It also checks that the Moser spindle has no proper 3-colouring.
- Separately, an exhaustive search for n = 3, 4, 5 confirmed that k = 2 sunny lines is impossible.
- `frontier.test.ts` checks:
  - that the page opens with exactly the seven Millennium problems, with the statuses above
  - that every knowledge-point link resolves
  - that every "Lean formalisation listed" entry cites its Lean notes

**Limitations.**
- The OpenAI claims are summarised from the repository's own descriptions and from news coverage. This app does not verify them.
- The session that built this page could not reach the official IMO site, OpenAI's announcement pages or erdosproblems.com; IMO statements are paraphrased and their answers were re-derived by computation.

## Colour themes

The Universe has a bright, child-friendly theme, **on by default**, and the original night theme. A **Night / Bright** button in the top bar switches between them; the choice is saved in the browser.

- The theme applies to the Universe pages, including the sidebar and top bar while on them. The rest of the site (practice, physics graph, analytics, …) keeps the night theme.
- Implementation:
  - `app/playful.css` holds every rule, scoped under `.app-shell[data-theme="playful"]`.
  - `lib/universe/theme.ts` stores the choice.
  - `gradeStyle()` in `knowledge-map.tsx` gives each grade a vivid colour plus a darker text shade in the bright theme, falling back to the pastels in the night theme.
- Look:
  - a warm cream background with soft colour blobs
  - sunny-yellow "chunky" buttons, rounded cards and pill shapes
  - the rounded Nunito font, bundled locally via `@fontsource-variable/nunito`
- Animation stages and the knowledge map stay a deep night-sky "board" inside a thick, grade-coloured frame. Every engine was designed for a dark canvas, so this keeps their contrast; the controls and captions around them are light.
- Contrast was measured, not guessed. A browser script sampled the real background behind every visible text element (about 3,700 across the home page, grade pages, a lesson's Observe/Explore/Apply/Understand levels, the map and the frontier, at 1280 px and 390 px). All of them meet WCAG AA, after five fixes found by the audit. SVG text inside the stages was excluded, since those canvases are unchanged.

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
| `vitest` | 44 passed (the per-point tests run over all 317 points) |
| `next build` | succeeds |

The vitest suite covers:
- curriculum integrity: unique IDs, resolvable acyclic edges, answer consistency
- per knowledge point: storyboard structure, prediction-before-explanation, 25 seeded challenges, config validation
- maths helpers: order of operations, Chinese number reading, column and long-division algorithms, answer parsing, and rounding of values in exponential notation
- secondary curriculum shape: every grade 7–12 world has at least 3 chapters and 10 points, and every secondary chapter names its textbook volume

Browser checks used headless Chromium against the running app, logged in as a development learner:
- **All 308 knowledge points at 1280 px and at 390 px** (and the nine journeys, added afterwards, at both widths): every scene chip, Explore with button interactions, and Apply. No page errors and no horizontal page overflow.
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

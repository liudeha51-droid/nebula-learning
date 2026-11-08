# Mathematics Universe (Grades 1–6)

The Mathematics Universe is an interactive, animated primary mathematics curriculum inside the existing app shell at **`/universe`**. It follows the Mainland China compulsory-education mathematics curriculum. It is not a separate application: it uses the same Next.js catch-all route, login, sidebar and design tokens, and stores learner progress in the existing FastAPI backend.

## Routes

| Route | What it shows |
| --- | --- |
| `/universe` | Six grade worlds, signature experiences, and a compact knowledge map |
| `/universe/map` | Full cross-grade knowledge connection graph, with search, domain filter and an accessible list |
| `/universe/grade/{1-6}` | One grade world: chapters, knowledge-point cards and a domain filter |
| `/universe/k/{id}` | A knowledge point with six learning levels |

## Curriculum data model (`apps/web/lib/universe/`)

- `types.ts`: `KnowledgePoint` has the fields the blueprint requires: `id`, `grade`, `domain`, `chapter`, `title` (+ `title_zh`), `description`, `learning_objectives`, `prerequisites`, `related_concepts`, `animation_id`, `animation_type`, `interaction_config`, `misconceptions`, `assessment`, `extension_activities`. It also has `topics` (the blueprint topics it covers) and an optional LaTeX `formula`.
- `curriculum/grade1.ts` … `grade6.ts`: **196 knowledge points in 47 chapters**. Chapters per grade follow the blueprint: 6 / 7 / 9 / 8 / 8 / 9. IDs are stable and grade-prefixed (`g5-parallelogram`).
- Relationships are stored explicitly: `prerequisites` is a directed edge list (an acyclic graph, always pointing to the same or an earlier grade), and `related_concepts` is treated as symmetric. Reverse edges ("unlocks") and transitive ancestry are derived in `curriculum/index.ts`.
- Domains are the five knowledge systems from the blueprint: Number Systems, Arithmetic Operations, Quantitative Relationships, Geometry, and Statistics & Probability.

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

28 engines cover every knowledge point:

`counting`, `objects` (make-ten, break-ten), `place-value` (万/亿 grouping and Chinese number reading), `column` (carrying and borrowing kept in step with blocks), `array` (groups → array, rotation, area model, distributive), `division` (sharing, grouping, remainders, long division), `laws` (order-of-operations pathways, arithmetic laws), `fraction` (13 modes), `decimal`, `number-line`, `angle` (draggable dynamic geometry), `area` (cut-and-rearrange derivations), `circle` (sector rearrangement and the **Cake Transformation**), `solid` (SVG 3D projection: unit cubes, folding nets, cylinder unrolling and slicing, **cone-pouring experiment**), `balance` (algebra), `measure`, `clock`, `money`, `data`, `probability`, `percent`, `proportion`, `coordinate`, `factor`, `sorting`, `transform`, `reasoning`, `shapes`.

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
  - `kp_id` must match `^g[1-6]-[a-z0-9-]{2,70}$`.
  - Each learner is capped at 500 rows.
  - Requests require a login and the same-origin header.
- Table `universe_progress` is created by Alembic revision `0002`.
- The browser keeps a local copy, so progress made offline syncs on the next load.

## Verification performed

| Check | Result |
| --- | --- |
| Backend `pytest` | 152 passed (4 new universe tests) |
| Alembic `upgrade head` → `check` → `downgrade base` → `upgrade head` (disposable SQLite) | clean, no drift |
| `npm run lint`, `npm run typecheck` | clean |
| `vitest` | 17 passed |
| `next build` | succeeds |

The vitest suite covers:
- curriculum integrity: unique IDs, resolvable acyclic edges, answer consistency
- per knowledge point: storyboard structure, prediction-before-explanation, 25 seeded challenges, config validation
- maths helpers: order of operations, Chinese number reading, column and long-division algorithms, answer parsing

Browser checks used headless Chromium against the running app, logged in as a development learner:
- **All 196 knowledge points at 1280 px and at 390 px**: every scene chip, Explore with button interactions, and Apply. No page errors and no horizontal page overflow.
- End-to-end flow: prediction gate → reveal → resume, comprehension answer, server persistence (level mask), progress surviving a reload, solving on the algebra balance, knowledge-map selection, and the existing routes (`/`, `/practice`, `/nebula`, `/notes`, `/analytics`).

## Known limitations and remaining work

- **Content review.** The curriculum text, misconceptions and questions were written for this implementation and are consistency-tested, but they have **not** been reviewed by teachers. Some topics differ between textbook editions (for example inverse proportion and the trapezoid definition); these are labelled as enrichment or textbook-dependent.
- **Language.** Titles are bilingual (English/中文). Narration, captions and explanations are English only.
- **Production polish.** The visuals are clear SVG animations, not a cinematic production. Camera movement is minimal, there is no ambient music (only short synthesised effects), and 3D uses a lightweight custom SVG projection rather than Three.js.
- **Explore depth varies.** Some modes (for example mass units, codes and logic grids) explore by changing parameters rather than by direct manipulation.
- **Accessibility.** Every stage has a text description, captions, and keyboard support for drag handles, scrubber and transport. It has not been audited with screen readers or for colour contrast.
- **Browser coverage.** Only headless Chromium was used. Safari, Firefox, real tablets and real phones were not tested.
- **Database.** Migration `0002` was verified on SQLite only. PostgreSQL acceptance is still subject to the Compose limitation in `docs/limitations.md`.
- **Apply level.** Only the generated challenge marks Apply complete; the authored comprehension questions do not.

# PR #2 — Animation lab: 12 → 20

Scope: draft pull request only. This change does not merge, release, deploy, update
the backend, alter question answers, or change learner records.

## Why each step exists

1. Preserve the twelve existing pure models in apps/web/lib/animations.ts. This
   keeps the original animation mathematics, one playback clock and controls.
2. Fill existing taxonomy gaps rather than inventing backend nodes. The six
   missing domains are numbers, algebra, equations, magnetism, thermal and modern.
3. Add two different knowledge points: Riemann sums illustrate integration rather
   than derivatives; Snell refraction illustrates ray optics rather than standing
   waves. The knowledge map now supports two links for one taxonomy node.
4. Separate implementation into lib/animation-expansion.ts (pure mathematics,
   metadata and readings) and components/animation-expansion-scenes.ts (Canvas
   2D frames). Scene rendering consumes the existing theme palette.
5. Add numerical tests for the physical or mathematical claims and Canvas
   coordinate smoke checks; separately exercise browser navigation and controls.
6. Add pull-request-only CI so results can be checked without deploying the app.

## Added animations

| Taxonomy node | Animation id | Knowledge point | Idealisation |
| --- | --- | --- | --- |
| math.numbers | fraction-addition | Fraction addition | Positive fractions |
| math.algebra | area-model | Binomial area multiplication | Positive lengths |
| math.equations | equation-balance | Equal operations on both sides | Positive coefficient |
| physics.magnetism | coil-induction | Faraday rotating-coil voltage | No electrical load |
| physics.thermal | boyles-law | Isothermal gas compression | Ideal gas |
| physics.modern | photoelectric-effect | Photon energy threshold | Single-photon model |
| math.calculus | riemann-sum | Right Riemann integration | Increasing x power |
| physics.waves | refraction | Snell refraction and critical angle | Ideal flat interface |

Final catalogue: 20 distinct IDs mapped to 18 original taxonomy nodes;
10 mathematics and 10 physics. math.calculus and physics.waves each have two animations.

## Numerical invariants under test

- Fraction numerator/denominator reduction and a position equal to the sum.
- Four binomial tiles sum to the entire rectangular area.
- A solved equation remains balanced through subtraction and division.
- Induction voltage is maximal when magnetic flux crosses zero.
- Isothermal piston compression leaves PV unchanged.
- Photoemission requires photon energy above the work function.
- Right-endpoint sums converge down toward the integral.
- Snell angles obey the index ratio, including total internal reflection.

## Verification

From apps/web run:

    npm ci
    npm run test
    npm run typecheck
    npm run lint
    npm run build

The pull-request workflow .github/workflows/animation-models.yml runs these
four gates. Browser E2E must be separately executed against the real signed-in
development app. apps/web/tests/browser-workflows.mjs calls
validateAnimations(tab,base) in apps/web/tests/animation-lab.mjs, which covers
20 deep links, Canvas presence, filter counts, sliders, scrubbing, replay,
pause, restart and reduced playback speed.

The npm test:e2e script only prints instructions and exits nonzero.
Do not report it as a pass. Unit tests do not certify visual layout.

## Exclusions and risks

No backend changes, no migration, no real account state modification, no
answer-gate changes, no auto-merge and no production publish. Physical models
are illustrative rather than laboratory-accurate. PR draft status is retained.

# Execution verification — 2026-10-22 (Asia/Shanghai)

## Delivery boundary

Working integrated **local development MVP**. Not the full production definition of done from the master specification. Existing parent SAMA source/executables were not modified. Project dependencies, cache, database and logs are isolated in this child project.

## Commands actually executed and outcomes

| Gate | Actual result |
| --- | --- |
| Python 3.12 virtual environment + dependency installation | Passed; exact requirements freeze retained |
| npm install, package-lock refresh | Passed with project-local npm cache |
| Explicit Alembic upgrade, idempotent seed | Passed; active development bank has 72 items |
| `python -m pytest -q --junitxml=../../qa/backend-tests.xml` | **148 passed**, one upstream Starlette/httpx deprecation warning |
| `npm run lint` | Passed, no remaining ESLint errors/warnings on final run |
| `npm run typecheck` | Passed |
| `npm test` | **3 passed** (Vitest) |
| `npm run build` | Passed, optimized Next.js production build |
| `python -m alembic check` | Passed, no pending upgrade operations |
| Separate DB upgrade → check → downgrade → upgrade | Passed on disposable SQLite file, not learner DB |
| `python -m compileall -q services/api/app scripts` | Passed |
| `scripts/start-local.ps1`, stop and restart | Passed; verified owned processes; HTTP 200 and health through frontend proxy |
| API and standalone frontend listener | Both bound to **127.0.0.1** only, ports 8410 and 3410 |
| Online SQLite backup integrity | Backup created with SQLite backup API; integrity check passed. Full restoration not rehearsed |

## Real browser acceptance

`apps/web/tests/browser-workflows.mjs` was executed using the selected in-app browser against the live local Next.js/FastAPI application. **12 named student assertions passed**, recorded in `browser-results.json`:

1. Profile goals saved.
2. Eight-question diagnostic completed through real backend grading.
3. Reload preserved submissions and the answer hold.
4. Backend concept selection enabled covered practice.
5. Practice also withheld answers for ten minutes.
6. Notes/LaTeX saved.
7. Scientific calculator returned 5 for sin(pi/2)+sqrt(16).
8. Degree mode returned 0.5 for sin(30).
9. Saved formula survived a full reload.
10. Evidence-aware analytics rendered.
11. Physics graph rendered.
12. Student administrative access was denied.

`apps/web/tests/admin-workflow.mjs` then executed **7 named administrator browser assertions**, recorded in `admin-browser-results.json`: inspect overview/evidence, revalidate preserved revision, reject it, prevent invalid release activation, activate a valid development release, and roll back. The same agent-created development learner was temporarily provisioned offline as an administrator for this fixture; its role was restored to **student** immediately afterward. No public privilege-escalation endpoint was used, and the original active release was restored.

Four responsive viewport checks at **375, 768, 1024 and 1440 CSS pixels** found no document horizontal overflow in the loaded dashboard. This is not full device/screen-reader acceptance. The old Cytoscape custom wheel-sensitivity warning was removed from the final source.

## Ten-minute rule — deterministic and real-time evidence

- Every answer submission stores authoritative server time. Student item responses contain no feedback/key/solution until 600 seconds have elapsed. Diagnosis/exam also requires completion.
- Unit/integration tests cover 599-second withholding, 601-second availability, early completion, forged client timing, analytics/mastery/review side channels and duplicate submissions.
- A real browser diagnostic answer was submitted at **17:46:01 Beijing time**, with no DB timestamp or server-clock modification. A screenshot during the hold showed the countdown and no key/solution. At the later server observation more than **713 seconds** had elapsed; the browser then displayed “Answer: C” and “5 + 5 = 10”. See `delayed-feedback-real-time.json`, `delayed-answer.png`, and `answer-unlocked-after-ten-minutes.jpg`.
- This establishes before/after real-time behavior, not millisecond-precision browser observation exactly at the 600th second.

## Failures encountered and repaired

- Global npm cache EEXIST: used project-local cache without clearing unrelated files.
- Next.js telemetry config EXDEV: disabled telemetry for build processes, no global config rewrite.
- Initial fixture blind-solver regex missed coefficients such as `2x`: corrected and all fixtures tested.
- Initial revision test assumed ordering of UUIDs: selected immutable original by ID instead.
- Initial browser harness read async results too soon and used overescaped regexes: added visible-state waits and simpler selectors; final named suites passed.
- Initial sidebar could hide bottom items in short viewports: enabled internal sidebar scrolling.
- Repeated revision creation initially conflicted on fingerprint: made identical revision requests idempotent and added an assertion.
- An intermediate screenshot taken while replacing build assets caught the loading screen; it is **not used as responsive acceptance evidence**. The final standalone server was restarted, styled dashboard readiness awaited and new screenshots/checks captured.

## Explicitly not run / not accepted

- Docker Compose, real PostgreSQL/Redis deployment, distributed worker/scheduler operation: tools/services unavailable.
- Real paid AI calls and vendor independence: no credentials supplied. Gateway transports tested with mocks only.
- Full-bank generation/repair/refresh: current scheduler records a blocked result safely, not successful refresh.
- Production security/privacy audit, dependency vulnerability certification, backup restore rehearsal, psychometric calibration, true transfer/retention learning gains and large-graph performance.

No currently failing automated test is concealed by these exclusions. `npm run test:e2e` prints instructions and exits nonzero because this suite intentionally requires an existing selected in-app browser session; the actual browser runner results above are the acceptance evidence, not that wrapper command.

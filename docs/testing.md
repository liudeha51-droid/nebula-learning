# Testing and evidence

## Automated layers

Backend pytest tests use a separate in-memory SQLite database per test and deterministic mocks. The application’s real student database is not cleared or time-shifted by tests. Coverage includes all 72 fixtures; incorrect keys/options/solutions/units, unknown templates, missing fields, unsafe arithmetic, solver/reviewer disagreement, timeout and malformed provider JSON, call-budget limits, blind DTO isolation, owner/admin restrictions, drafts/notes/profile persistence, unique attempts, delayed feedback and hidden analytics, adaptive tier rules, release failure/activation/pinning/rollback, mock production prohibition and configuration guards.

The 600-second gate is tested immediately before and after the boundary, for practice and completed/uncompleted diagnostic/exam sessions. Completion does not shorten it. Extra client timing fields are rejected. Feedback materialization is checked for idempotency. These are deterministic clock-boundary tests, not a claim that every test literally waits ten minutes.

Frontend Vitest tests exercise transport errors, same-origin write headers and null-vs-zero display semantics. ESLint, strict TypeScript and production Next.js build are separate quality gates. Unit tests alone are not UI acceptance.

## Browser checks

The live local Next.js/FastAPI application is inspected through the in-app browser, not a disconnected mock HTML page. Actual visual evidence is in `qa/`. Checks include isolated student login, dashboard zero-evidence state, diagnostic draft/submit/complete, delayed answer countdown, reload persistence, notes/structured formula insertion, concept map selection, practice calculator and administration denial. Final per-check status is recorded in `qa/verification.md`.

The administrator release workflow is exercised both via authenticated FastAPI integration tests and a separate 7-assertion browser suite using an offline-provisioned isolated admin fixture. The temporary role and original active release were restored afterward. See qa/admin-browser-results.json.

## Migration gates

Alembic `upgrade head`, `check`, `downgrade base`, `upgrade head` run against a separate disposable SQLite file. The real learner DB is never downgraded. PostgreSQL DDL and Compose integration require an available container environment before acceptance.

## Known verification limits

No paid model call, Docker/PostgreSQL/Redis deployment, worker/broker end-to-end run, full production security audit, calibrated learning study or data restoration rehearsal was performed. The CI-style local test results do not certify those areas. Current Starlette TestClient emits an upstream httpx deprecation warning; this is recorded rather than silently described as a failure.

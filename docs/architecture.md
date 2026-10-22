# Architecture & repository audit

## Audit

The original working directory contained a non-Git Python/SAMA/Steam desktop application, compiled executables and existing user work. No Nebula application, Node package or compatible learning database existed there. A new independent Git repository was created in the `nebula-learning` child directory; no parent application file was edited. The requested Next.js/FastAPI architecture is therefore used rather than adapting unrelated SAMA entrypoints.

Python 3.12 was selected for an isolated `.venv`; Node 24 was available. The background Codex-DevVM doctor reported no VM process, and startup returned cancellation. Local project-scoped verification was used. Docker, PostgreSQL CLI and Redis server were not available. This is a disclosed acceptance limitation, not a reason to pretend container tests passed.

## Components

- `apps/web/app`: App Router entry, same-origin reverse proxy, responsive design tokens.
- `apps/web/components`: student shell/dashboard, answering, notes/formulas, calculator, interactive graph, analytics and administration.
- `apps/web/lib/api.ts`: typed transport/DTO boundary, errors and missing-evidence formatting.
- `services/api/app/models.py`: ORM schema and immutable question-content guard.
- `validation.py`: strict candidate schema, bounded rational evaluator, SI quantity verification, deliberately limited fixture providers.
- `ai.py`: isolated JSON gateway generator/blind-solver/reviewer adapters, token/call budgets, timeouts and redacted telemetry. Not yet orchestrated into production generation.
- `learning.py`: mastery snapshots, release-scoped selection, analytics, **600-second feedback gate** and deferred evidence materialization.
- `releases.py`: coverage/evidence validation and transactional singleton active pointer.
- `tasks.py`: dedicated Celery periodic refresh check, persistent deduplicated blocked-job record when real generation is unavailable.
- `migrations`: explicit frozen v1 DDL; new schema changes require new revisions.

## Core flows

1. Explicit migration/seed makes a development release available.
2. Session start pins the active release ID. Each item pins an immutable version ID.
3. Drafts persist without answer keys. Submission transaction writes exactly one attempt per item and advances the target tier.
4. Response omits correctness/key/solution until `server_now >= attempt.created + 600 seconds`. Non-practice sessions additionally must be completed.
5. Eligible feedback causes idempotent mastery snapshot/review materialization. Parallel evidence synchronization uses a user-row write lock and unique attempt snapshot key.
6. Dashboard/graph/analytics query actual persisted records; future/unmeasured metrics remain null.
7. Release activation revalidates coverage and mandatory evidence inside the switch transaction. Failed publication cannot change the active pointer. Sessions already started keep the old release.

## Deliberate boundaries

No production content is certified by development mocks. No calls to real AI are made while loading or answering a student question. No public cloud hosting was provisioned because it would require replacing the requested Python/PostgreSQL architecture or supplying infrastructure not available here. No live global task automation was installed: the schedule belongs to the application’s dedicated Celery service.

The taxonomy is a first domain-level scaffold, not the requested fully expanded hierarchical curriculum. Diagram node lightness describes question coverage; mastery is shown in the detail panel, not fabricated graph colors.

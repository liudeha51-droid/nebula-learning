# Nebula Learning

An evidence-led mathematics and physics learning workspace. **This repository is a working local development MVP, not a completed production platform.** The original SAMA desktop application in the parent directory is untouched.

## Start here

Open the local application at **http://127.0.0.1:3410** after starting both services. Use **Try a development learner** for a new isolated student, or register a persistent student account. A development session cookie lasts 12 hours. Do not clear browser storage if you want to revisit that learner.

### Your requested answer-disclosure rule

**An answer, correctness result and explanation become available 600 seconds after that particular answer was submitted.** Diagnostic and examination modes also require session completion. Completing a session early, refreshing, visiting analytics, reconnecting, or sending a forged client timestamp cannot shorten the server-side delay. The answering page polls for availability and displays a countdown. Mastery and review schedules are materialized only once feedback is eligible, so dashboards do not expose correctness early. It is **not** a 10-minute delay from opening the page or from starting the whole assessment.

## Implemented

- Next.js App Router, React/strict TypeScript, Tailwind v4 plus a custom responsive scientific design system.
- FastAPI, validated inputs, SQLAlchemy, Alembic and a PostgreSQL-compatible schema. SQLite is the tested local fallback.
- Student registration/login/logout, Argon2 password hashes, revocable hashed opaque sessions, role checks and same-origin write protection.
- 18 mathematics/physics taxonomy domains; 10 typed relationships; 6 domains currently have question coverage.
- 72 hand-authored parameterized development questions, immutable question-version content, fingerprints, review evidence, idempotent seeding.
- Fail-closed schema, sealed-fixture blind solving, canonical explanation checking, bounded SymPy rational arithmetic and Pint SI-unit checks. All mock evidence is explicitly labelled. Production activation rejects it.
- Release-pinned diagnostic/practice/examination sessions; drafts/flags/resume, deterministic A/B/C/D grading, duplicate-submission protection, examination deadline and calculator policy.
- The **10-minute disclosure hold**, including analytics/mastery/review-queue side-channel protection.
- Beta(1,1) heuristic estimates, independent first exposures, provisional target-tier changes and uncertainty-aware recommendations. No scientific calibration claimed.
- Interactive Cytoscape mathematics and physics maps, searchable accessible concept list, coverage-gap details and concept-specific practice.
- Private autosaved notes, editable MathLive structures/LaTeX source, KaTeX preview; safe scientific calculator with degree/radian and session history.
- Real persisted accuracy/exposure/difficulty metrics, with missing transfer/retention evidence shown as unavailable, not invented percentages.
- Administrator question/evidence inspection, revision drafts, review decisions, candidate validation, atomic release-pointer switching, rollback and audit records.
- Dedicated Celery worker/beat configuration with a 14-day default refresh check. Unconfigured generation records a blocked job and keeps the active bank unchanged.
- Optional server-only JSON gateway adapter classes with timeouts, retry/call budgets and redacted telemetry; **only mocked HTTP transports were tested**. Not connected to unattended generation.

See [known limitations](docs/limitations.md) and [development checklist](docs/checklist.md) before interpreting this list as completion of the master specification.

## Architecture

```text
browser -> Next.js :3410 -> same-origin /api proxy -> FastAPI :8410
                                                       |
                                            SQLAlchemy / Alembic
                                                       |
                                     PostgreSQL (Compose) / SQLite (local)

Celery beat -> Redis -> worker -> observable blocked refresh / future generation
                        no live AI during ordinary student requests
```

The application uses real backend persistence; the mock boundary is **question-provider review**, not saving, grading, sessions or analytics. The development bank is deliberately small and not production-certified.

## Local setup (Windows PowerShell)

Prerequisites: Python 3.12 and Node.js 24/npm. No global packages or operating-system settings need modification.

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r services\api\requirements.txt
cd apps\web
npm ci --cache ../../.npm-cache
$env:NEXT_TELEMETRY_DISABLED='1'
npm run build
cd ..\..
```

Database migration and seed:

```powershell
cd services\api
..\..\.venv\Scripts\python -m alembic upgrade head
..\..\.venv\Scripts\python -m app.cli seed
```

Start API in that terminal:

```powershell
..\..\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8410
```

Start frontend in another terminal:

```powershell
cd apps\web
$env:NEXT_TELEMETRY_DISABLED='1'
npm run dev
```

Or, after building, use `scripts/start-local.ps1` for hidden, loopback-only processes, and `scripts/stop-local.ps1` for verified recorded-process shutdown. The launcher refuses to stop any existing port owner. Logs remain local in `qa/`; it does not change SAMA processes.

`next start` is available locally but emits a standalone-output warning. The Docker image correctly runs the generated standalone server.

## Administrator setup

No hardcoded administrator password, public admin signup, or student-to-admin switch exists. In the API directory:

```powershell
..\..\.venv\Scripts\python -m app.cli admin
```

Enter an administrator email and a private password at the prompts. The password prompt does not echo. Sign out of a development student before signing into this administrator. Never publish a development database or backup.

## Configuration

The API reads environment variables or an untracked `.env` **in its working directory**. The root `.env.example` documents fields but is not automatically loaded from a different directory. Local defaults use `services/api/nebula.db`. Environment values override `.env`. Credentials belong only on the server.

- `DATABASE_URL`: SQLAlchemy URL; local SQLite by default, `postgresql+psycopg://...` for Compose.
- `ENVIRONMENT`: `development` by default. Production disables demo login, blocks fixture seeding, requires PostgreSQL and secure cookies, and refuses mock-evidence releases.
- `SECURE_COOKIES`: false for loopback HTTP; true only behind verified HTTPS.
- `REDIS_URL`, `REFRESH_DAYS` (14 by default), `AI_PROVIDER` (mock).
- `API_INTERNAL_URL`: frontend build-time reverse-proxy destination; private backend service address, not an AI credential.

Gateway adapters require explicit server-side construction with separate provider/model/role configurations. There is **no active paid AI integration**. No keys are required for the development student workflow.

## Docker Compose

From the root, prepare a **private** root `.env` using `.env.example`, replace the PostgreSQL password with a URL-safe random value, then:

```powershell
docker compose --env-file .env -f infra/docker-compose.yml up --build
docker compose --env-file .env -f infra/docker-compose.yml logs -f api worker scheduler
```

The provided Compose stack is **development**, binds only `127.0.0.1:3410` on the host, and stores PostgreSQL/Redis/beat data in named volumes. Do not run `down -v` against data you want to preserve. **Docker was unavailable in this execution environment; container/PostgreSQL/Redis integration has not been accepted.**

## Tests actually runnable without paid services

```powershell
cd services\api
..\..\.venv\Scripts\python -m pytest -q
..\..\.venv\Scripts\python -m alembic check
cd ..\..\apps\web
npm run lint
npm run typecheck
npm test
npm run build
```

See `qa/backend-tests.xml`, `qa/verification.md`, and `docs/testing.md` for actual execution results. Clock-boundary tests use isolated databases and test-only clock manipulation; there is no production clock override endpoint.

## Common troubleshooting

- npm `EEXIST` in a global cache: use the project-local cache shown above. Do not clear unrelated global caches.
- Next.js telemetry config `EXDEV`: set `NEXT_TELEMETRY_DISABLED=1` for the command; no global Next.js configuration change is required.
- Blank dashboard or login failure: verify `/api/v1/health`, API port 8410, frontend port 3410 and API proxy destination. Do not infer worker health from API health.
- Missing database tables: run Alembic before seeding. Seeding is explicit, not triggered by web page loads.
- Formula editor font errors: static fonts and licenses are included under `apps/web/public/mathlive/`; no CDN is needed.
- Empty analytics immediately after submitting: expected during the 10-minute answer hold. In diagnostic/exam mode finish the session too.
- Queue refresh returns 503: Redis/worker is unavailable. This never activates an incomplete bank.

## Deployment and safety

Read [security](docs/security.md), [operations](docs/operations.md), [deployment checklist](docs/deployment.md) and [limitations](docs/limitations.md). Do not expose this development preview publicly. Real deployment still needs reviewed content, AI integration acceptance, rate limits, HTTPS, database/queue concurrency testing, backup restoration rehearsal and independent security/privacy review.

Framework implementation references checked during development: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [FastAPI security guidance](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/). Authentication here uses opaque server sessions, not JWTs.

# API contract v1

Interactive OpenAPI: `/api/docs`; machine schema: `/api/openapi.json`. All routes below are prefixed `/api/v1`. Browser calls are same-origin through Next.js. Use the HttpOnly session cookie and `X-Nebula-Client: web` for writes.

| Routes | Access | Behavior |
| --- | --- | --- |
| GET `/health` | public | API/DB reachability only, not Redis/worker/model acceptance |
| POST `/auth/register`, `/auth/login`, `/auth/logout` | auth lifecycle | Students cannot select role in signup |
| POST `/auth/demo` | development only | New isolated learner, never admin |
| GET `/me`, PUT `/profile` | current user | Validated goals/preferences; history retained |
| GET `/graph?subject=math` | student | Taxonomy, typed edges, coverage and disclosed mastery |
| GET `/dashboard` | student | Eligible statistics, recommendations, recent own sessions |
| POST `/assessments` | student | `{subject,mode,node_id?}` pins current release |
| GET `/assessments/{sid}` | owner | Sanitized items, stored drafts and feedback gating |
| PUT `/assessments/{sid}/items/{iid}/draft` | owner | `{selected?,flagged}`; submitted answers locked |
| POST `/assessments/{sid}/items/{iid}/answer` | owner | `{selected,seconds,calculator_used?}`; immutable/idempotent |
| POST `/assessments/{sid}/complete` | owner | Completes session; does not bypass 600-second hold |
| GET `/notes`, PUT `/notes/{nid}` | owner | title/body/formula/node; notes list capped at 100 |
| POST `/calculate` | student | expression/degrees/precision/session_id; safe grammar |
| GET `/analytics` | student | subject/node/tier/start/end filters; pending feedback excluded |
| GET `/reviews` | student | Disclosed-evidence review schedules |
| GET `/admin/overview` | admin | Active bank, counts, provider status, jobs and audit |
| GET `/admin/questions?offset=0&limit=30` | admin | Version content and review evidence; max 100/page |
| POST `/admin/questions/{vid}/revision` | admin | Preserved draft revision of a fixture |
| POST `/admin/questions/{vid}/decision` | admin | action/reason; released-version edits rejected |
| GET/POST `/admin/releases` | admin | List/build candidate; `{copy_active:false}` makes an empty failure fixture |
| POST `/admin/releases/{rid}/validate` | admin | Coverage and evidence report |
| POST `/admin/releases/{rid}/activate` | admin | `{reason}`; revalidation and transactional switch/rollback |
| POST `/admin/refresh` | admin | Enqueue check; 503 if broker unavailable, never fake success |

## Delayed item feedback

Items always omit the standard key at top level. Before disclosure: `submitted=true`, `feedback=null`, `feedback_available_at=<server UTC ISO timestamp>`. After delay and mode prerequisites: feedback includes correctness, authoritative answer, canonical solution and `insufficient_evidence` error category. Response also includes server time and `feedback_delay_seconds=600`. Client-supplied creation/disclosure timestamps are rejected as extra fields.

Dates stored without timezone in SQL are interpreted as UTC; external disclosure timestamps include `Z`. API response errors use `detail`; 401/403/404/409/422 distinguish sign-in, authorization, missing ownership, conflicts and invalid input. No secrets appear in errors.

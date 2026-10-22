# Known limitations — honest completion boundary

This is a useful integrated local MVP, not fulfilment of every checkbox in the 29-section master request.

## Highest-priority remaining work

1. Accept the PostgreSQL/Redis/Celery Compose stack with real concurrent requests, worker restarts, locks, duplicate jobs and recovery. Docker was unavailable here.
2. Implement complete real generation orchestration with distinct providers, stored model/prompt versions, human review, strict result DTOs, bounded repair, persisted cost budgets and fail-closed full-bank refresh. The gateway adapter alone is not that pipeline.
3. Expand taxonomy below domain level, normalize subject/curriculum/permission catalogs and build reviewed curriculum-specific question coverage. Only 6/18 domains and provisional L1-L3 currently have fixtures. No L4/L5 coverage.
4. Add robust numeric/expression/multi-step rubric grading, domain-sensitive equivalence, vector/precision reasoning, explicit hints and ambiguity review. Current student answering is single-choice only.
5. Implement prerequisite remediation, cross-subject allocation, learning plans, calibrated tier policies and comparable baseline/follow-up/transfer/retention instruments. Do not report causal learning gains from this heuristic.
6. Complete privacy/security hardening, rate limiting, identity recovery, restricted DB roles and immutable triggers, audit export, data anonymization/deletion, tested encrypted backups and restoration.
7. Expand browser automation, component tests, hundreds-node graph performance and screen-reader acceptance. Current graph has 9 nodes per subject; realistic large-taxonomy usability is not proven.

## Additional MVP boundaries

- All mock-provider evidence remains labelled; production activation rejects it. No safe production verified bank has been supplied.
- Only exact-version repeats are excluded from independent evidence; numeric variants can still inflate mastery. They are therefore never claimed as transfer evidence.
- Answer result and learning analytics are hidden for 10 minutes; target difficulty can still reveal an indirect adaptive signal.
- Free notes are linked to concepts, not a fully normalized question-annotation/scratch hierarchy. Note lists cap at 100 and lack full pagination/deletion UI.
- Login is local-session oriented, not full federated identity or parental consent.
- Examination server deadline is enforced, but unanswered items are not automatically scored as failures and the UI does not auto-close an expired exam.
- Dashboard metrics count disclosed attempts, so pending submissions are visible in the workspace/session list but do not increment accuracy cards.
- Admin graph/config/provider pages accurately expose read-only policy/status; they are not fully editable management consoles.
- Candidate release builder copies the active fixture bank or creates an empty test candidate. It does not yet author diverse new releases or expose membership editing.
- Question revision currently preserves content with a small stem suffix. A full revision editor/import membership UI is not implemented.
- Failed review attempts that return an exception before commit do not yet persist a separate failure audit record.
- No public deployment or production availability SLA is claimed.

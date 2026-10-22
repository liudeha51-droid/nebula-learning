# Database and integrity

Migration v0001 creates: users, opaque login sessions, knowledge nodes/edges, stable question identities, immutable question versions, review evidence, releases/membership, singleton active pointer, assessments/items, attempts, mastery snapshots, notes, review schedules, jobs and audit logs.

Roles are a constrained `student/admin` field, not yet a general roles/permissions catalog. Profiles are validated JSON on users, not a separate learner-profile table. Subjects/curricula are currently enumerated/profile values rather than normalized catalog tables. Learning plans and provider configuration persistence are not yet implemented. These are intentional MVP gaps, not claims that every requested logical entity exists.

## Constraints

- Foreign keys for question versions, nodes, release membership, assessments/items, attempts, notes and mastery evidence.
- Unique user emails, fingerprints, release memberships, session positions and session/version pairs.
- Exactly one attempt per item and one mastery snapshot per attempt.
- Singleton active pointer ID = 1; question tier between 1 and 5; no edge self-links.
- Attempt references an item and exact version. Session references a release. The API only draws new items from that release and never rewrites old attempts during release changes.
- ORM updates to version content/fingerprint/node/tier/identity raise an error. Database-owner SQL is outside this guard: production still requires restricted DB roles and immutable-content triggers.

## Transactions

The request DB dependency commits once after a successful operation and rolls back on exceptions. Answer attempts, draft state, adaptive state and next item are committed together. Feedback materialization uses a user-row write lock. PostgreSQL release switching locks the singleton pointer; invalid checks roll back the switch. SQLite is a local fallback, not evidence that PostgreSQL concurrency works.

## Migrations and retention

Run Alembic explicitly. The initial DDL is frozen source, not a dynamic call to current ORM metadata. Upgrade/check/downgrade/upgrade were rehearsed on a separate local SQLite file; no learner data was deleted. Future migrations must be new revisions. Never downgrade a populated production database merely to test migration code.

There are no user-data deletion endpoints in this build. No refresh deletes releases, versions, notes or attempts. User export/anonymization/retention controls are unimplemented deployment blockers.

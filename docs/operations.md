# Operations, refresh and recovery

## Refresh

`app.tasks:celery` defines a dedicated beat interval of `REFRESH_DAYS * 86400` seconds (14 days default). Redis brokers jobs and stores worker results. A persistent bucket key deduplicates refresh checks. The current task **records blocked status** because the end-to-end real generator/reviewer pipeline is not configured. This is deliberately not a successful question refresh.

There is no web-server timer and no question generation during a student page load. Queue submission reports 503 if the broker is unavailable. No task can activate a partial release in this build. Generation batching, persisted per-provider budgets, repair/regression workflows and real full-bank refresh are still required.

## Release rehearsal

1. Authenticate as administrator; record active release.
2. Create an empty candidate and validate. Missing coverage must fail; activation must return 409 and active release remain unchanged.
3. Create a candidate copying active fixtures; validate the explicit development coverage policy.
4. Start a student session, activate candidate, start another session; only the second uses the new release.
5. Activate the old valid release with a reason to roll back. Do not delete either bank. Audit logs record both pointers.

## Local backup

`python scripts/backup-sqlite.py services/api/nebula.db PRIVATE_BACKUP_DIRECTORY` uses SQLite’s online backup API and runs `PRAGMA integrity_check`. It refuses to overwrite a same-timestamp file. Backups include accounts and personal learning records. Keep them private and outside delivered source archives.

For restore: stop only this application’s verified processes, retain the current DB as a recovery copy, restore a chosen backup, run integrity and migration checks, then restart and verify learner notes/attempts/release pinning. **Full restore acceptance has not been rehearsed.** Never delete the original as part of an unverified restore.

For PostgreSQL use authenticated `pg_dump` with credentials through the host secret mechanism, encrypted storage and a separate restore database. PostgreSQL backup/restore commands were not executed here because the runtime was unavailable. Do not label backups healthy merely because a backup path exists.

## Scope and monitoring

Local preview is loopback only. Launch scripts record only owned PIDs and verify command lines before stopping. API health proves API/DB connection, not worker readiness, model availability or public browser reachability. Admin console displays known job failures and mock-provider limitations. Logs are local; no global app configuration, proxy, browser account or SAMA service was modified.

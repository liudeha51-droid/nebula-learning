# Deployment checklist — do not publish the development stack as production

- [ ] Provision and accept PostgreSQL/Redis/worker/scheduler with persistent volumes.
- [ ] Run migrations in a single controlled deployment step; backup before upgrades.
- [ ] Replace development fixtures with reviewed non-mock release evidence; keep all historical versions.
- [ ] Configure separate generation/blind/reviewer models through server secrets; verify actual calls, retries and budgets.
- [ ] Verify complete 14-day refresh path, candidate coverage, failed generation and rollback.
- [ ] Deploy HTTPS reverse proxy; enforce expected origin/host, secure cookies, CSP and traffic limits.
- [ ] Set production environment; verify demo endpoints and fixture seeding are disabled.
- [ ] Create administrator via private prompt/approved provisioning, never embedded password.
- [ ] Add rate limiting, recovery, abuse controls, DB immutability enforcement and privacy retention/anonymization policies.
- [ ] Rehearse encrypted backup restoration into a separate database and inspect notes/attempts/release references.
- [ ] Run complete student and admin browser regression at desktop/tablet/mobile sizes with accessibility review.
- [ ] Verify the ten-minute disclosure gate across restarts, multiple devices and concurrent API reads.
- [ ] Audit dependencies and server/client bundles for exposed secrets.
- [ ] Record remaining educational calibration limitations; do not claim validated psychometrics or zero hallucinations.

# Security boundaries

## Implemented

- Argon2id password hashing via argon2-cffi; no administrator default password.
- Random 320-bit opaque bearer session cookie, HttpOnly, SameSite=Strict, 12-hour expiry. Only SHA-256 token hashes stored server-side. Logout revokes the token.
- Secure cookie mandatory for `ENVIRONMENT=production`; PostgreSQL mandatory there too.
- Every student-owned session/note checks the authenticated owner. Administrator endpoints enforce role server-side; a navigation link never grants access.
- No question-bank listing, unpublished answer keys or AI evidence in student APIs. Submitted feedback gated by server time and session rules.
- All writes require `X-Nebula-Client: web`; cross-site fetch metadata is rejected, CORS is not enabled. This makes the same-origin proxy the browser boundary.
- Bounded arithmetic/calculator AST, no Python/JavaScript `eval`, no arbitrary SymPy parser evaluation, conservative unit grammar.
- KaTeX trust disabled; React escapes note text; no raw note HTML rendering.
- Mock evidence blocked from production activation. Demo login and fixture seeding disabled in production.
- Private AI keys stay in server adapter memory and are excluded from repr and telemetry. No real key is included in the repository or examples.

## Not production-ready

Rate limiting, account lockout, verified email/recovery, MFA, OIDC, multi-device session management UI, CSP hardening, abuse controls and security event alerting are not complete. Administrative revision editing/membership workflows are limited. The app is not certified for minors’ privacy or any jurisdiction’s educational data rules. Do not claim compliance.

Do not publicly expose this development stack. In addition to security review, production needs HTTPS/reverse-proxy origin configuration, rate limiting, restricted DB roles, immutable data triggers, retention/anonymization, encrypted tested backups, dependency audit and actual PostgreSQL/Redis concurrency acceptance. Test passing is not a penetration test.

Local source bundles must exclude `.env`, database files, login records, private backups, `node_modules`, `.venv` and caches. Database backups contain accounts and learning records and must never be included in a public artifact.

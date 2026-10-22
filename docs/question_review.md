# Question quality and publication policy

## Current supported content

The exact supported deterministic bank is 72 scalar single-choice fixtures: addition, linear equations, rectangle area, constant-speed distance, net force/mass acceleration and parallel-force work. The three internal tiers are **provisional numeric variants**, not independently calibrated L1/L2/L3 problem classes. L4/L5 are absent.

Each question has a stable identity and immutable version. SHA-256 fingerprints normalize stem whitespace/case plus option mappings. Each variant family is tracked; exact first exposure is not interpreted as unfamiliar transfer.

## Pipeline

1. Pydantic strict structural validation: required fields, four distinct A/B/C/D options, answer mapping, subject and tier.
2. Fresh `BlindInput` object includes **only stem, options, subject**. Generator key, solution and verifier expression are never included.
3. Fixture blind solver parses the bounded template family; unknown prose yields inconclusive.
4. Fixture reviewer requires sealed stem grammar and its canonical explanation. This is explicitly **not** real independent AI or human review.
5. Bounded AST arithmetic creates SymPy rational values without evaluating arbitrary symbolic code. Pint checks option units for the supported SI formats. Exactly one option must match.
6. Required agreement produces an approved development candidate. Exceptions, incorrect keys, malformed output, reviewer refusal, missing units or uncertainty keep it unapproved.

Do not use this limited validator to certify open mathematical proofs, missing physical assumptions, vectors, arbitrary expressions, extraneous roots or domain-sensitive symbolic transformations. Such cases are unsupported/inconclusive, not automatically verified.

## Administrative lifecycle

Versions begin as drafts. A preserved revision can be revalidated, approved when current checks pass, rejected or quarantined. Used/release-member versions reject in-place decisions; create a revision instead. Review evidence is append-only through supported API paths. Full fine-grained DRAFT → solver → reviewer transition history and release membership editing are not implemented.

Release activation rechecks schema, blind answer agreement, reviewer acceptance, deterministic verification and the development coverage policy. A production environment refuses mock evidence even when all fixture checks pass. Administrator approval is not a bypass for missing mandatory checks.

There is no claim of zero hallucinations or truly independent model diversity. Optional gateway adapters are mock-transport tested; generation orchestration, human review signatures, model configuration persistence and real model acceptance remain blocked work.

## Corpus and coverage

The fixtures are generated deterministically by `app.seed.fixture_questions()` and can be exported with `scripts/export-bank.py`. Seeding is explicit, transactional and idempotent. Unit tests cover every fixture and deliberately defective schema/key/option/unit/solution/provider cases. A release requires four fixtures per selected domain per L1-L3 tier (72 total) under the **development-only** policy. The other 12 domains and L4/L5 remain visible coverage gaps.

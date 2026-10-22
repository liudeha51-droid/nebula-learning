# Adaptive learning and the 10-minute disclosure policy

## Explainable initial heuristic

- Start target tier L1 below grade 8; otherwise L2. Age, curriculum, proficiency and intensity are saved preferences, but only grade currently changes initialization. Do not imply curriculum-specific diagnostic calibration.
- Two consecutive correct responses raise the target tier; two consecutive incorrect responses lower it, bounded L1-L5.
- Choose the nearest available tier within the pinned release. Unavailable tiers do not fabricate questions.
- Recommendations use `0.6 * (1 - mean) + 0.4 / sqrt(n + 1)`. Every fourth selection relaxes priority for exploration. This is a heuristic, not a validated IRT/CAT model.
- Per-node mastery uses Beta(1,1). Only first exposure to the exact version without hints increments evidence. Fewer than four independent observations remains **insufficient evidence**, regardless of a displayed provisional mean.
- Response duration is self-reported context, not a cause of ability classification. Incorrect responses use `insufficient_evidence` rather than a guessed misconception.

## Disclosure timing (user requirement)

For each submitted attempt, the authoritative time is stored server UTC. Feedback unlocks at `created + 600 seconds`. Draft saving and flagging do not start or reset the clock. A retried identical submission returns the same attempt and deadline; changed submitted answers are rejected.

Practice: requires the 600-second delay. Diagnostic/examination: requires both delay **and session completion**. Early completion does not bypass the delay. The API omits the entire feedback object before eligibility. It also excludes pending correctness from analytics, mastery overlays and review intervals. The browser countdown is advisory; changing the computer/browser clock cannot authorize disclosure. The answering page refreshes eligible feedback automatically.

Mastery and review rows are materialized on subsequent authenticated reads once eligible, not by an in-memory web timer. This preserves delay semantics across server restarts. Unique snapshot-per-attempt plus serialized user synchronization prevents duplicate evidence updates on parallel reads.

Target difficulty still adapts internally during the session. A student may observe a tier change; the system does not claim to eliminate every statistical side channel from adaptive item selection. Exact keys, correctness and explanations are withheld.

## Reviews and analytics limitations

Incorrect eligible answers schedule the concept one day later; correct answers three days later. These simple intervals are not a validated spaced-repetition model. Transfer and delayed-retention accuracy are null until explicit comparable instruments exist. No claimed learning gain is derived from a raw score change. Comparable baseline/follow-up assessments, prerequisite remediation, cross-concept practice allocation and calibrated difficulty remain next-stage work.

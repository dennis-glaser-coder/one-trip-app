# NOREYO V5.72 — Natural Search Safety QA

Base: current V5.71 main.

## V5.71.1 paint hardening
- Existing natural-language primary search remains the main UI.
- MutationObserver reacts only to relevant added UI nodes instead of every subtree mutation.
- requestAnimationFrame work is coalesced with a single paintQueued guard.
- Text/ARIA writes are idempotent to avoid self-triggered mutation churn.
- Product-mode placeholder refresh remains intact.
- V5.72 safety is loaded once from the V5.71 entry module.

Local checks:
- JavaScript syntax PASS.
- 5/5 static observer/idempotency checks PASS.

## V5.72 family + traveller safety
- Parses explicit adult counts and `zu zweit`.
- Parses child counts and ages including `1 Kind, 5 Jahre`, multiple child ages, and babies in months.
- Complete family data writes to searchState.childAges.
- `ohne Kinder` / `nur Erwachsene` clears stale child ages.
- Missing child ages fail closed before live search and open the traveller planner.
- Manual valid traveller correction releases the pending block.
- Phrases such as `für eine Woche` do not count as explicit adult intent, preventing accidental adult-count overwrite.
- Existing V5.56 parser remains the source for destination/date/budget/preferences.

Local checks:
- JavaScript syntax PASS.
- Family/adult parser matrix 7/7 PASS.

## Security
- No LiteAPI API key in the new browser module.
- No Supabase service-role key in the new browser module.
- site.zip unchanged.

## Still open
- Real deployed iPhone Safari E2E.
- Real Supabase/LiteAPI family search E2E.
- Full favorites/trips/profile/auth/cancellation regression before finished status.

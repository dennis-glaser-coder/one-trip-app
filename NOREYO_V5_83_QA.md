# NOREYO V5.83–V5.86 QA

## V5.83
- JavaScript syntax: PASS.
- Published modal / RAF / mobile assertions: 8/8 PASS.
- Travel DNA V5.64 `polishIntro` mutation/RAF loop guard present.

## V5.84
- JavaScript syntax: PASS.
- Search / lifecycle / security assertions: 12/12 PASS.
- Hotel airport exception, IATA validation, date ordering, past-date guard, traveller/child-age validation, double-submit, result-settled release, aria-live and BFCache cleanup covered.

## V5.85
- JavaScript syntax: PASS.
- Core family matrix: 9/9 PASS.
- Additional child-age forms: 6/6 PASS.
- Manual traveller-state validation: 4/4 PASS.
- Complete family input writes `searchState.childAges`.
- `ohne Kinder` clears stale child ages.
- Incomplete child ages fail closed before live search and open the traveller planner.
- A manually corrected traveller planner clears the pending AI-family block after save.
- Regression fixed during self-review: `1 Kind, 5 Jahre` no longer duplicates the age.

## V5.86
- JavaScript syntax: PASS.
- Adult-intent guard matrix: 7/7 PASS.
- Duration wording such as `für eine Woche` cannot silently overwrite the adult count.
- Explicit forms such as `2 Erwachsene`, `zwei Personen`, or `zu zweit` remain allowed to update adults.

Basis: current V5.67 main.
`site.zip` unchanged; no LiteAPI/Supabase service secrets added to frontend code.

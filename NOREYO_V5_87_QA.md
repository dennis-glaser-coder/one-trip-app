# NOREYO V5.83–V5.87 QA

## Basis
- Rebased directly on current V5.68 `main`.
- Branch compare at publication: 6 commits ahead, 0 behind.
- `site.zip` unchanged.

## V5.83
- JavaScript syntax: PASS.
- Modal / RAF / mobile assertions: 8/8 PASS.
- Travel DNA mutation/RAF loop guard, focus trap, Escape, focus return, VisualViewport, scroll/BFCache safety, 44px touch targets.

## V5.84
- JavaScript syntax: PASS.
- Search / lifecycle / security assertions: 12/12 PASS.
- Destination, airport, date, traveller and child-age validation plus double-submit and busy lifecycle.

## V5.85
- JavaScript syntax: PASS.
- Core family matrix: 9/9 PASS.
- Additional child-age forms: 6/6 PASS.
- Manual traveller-state validation: 4/4 PASS.
- Complete child ages write to `searchState.childAges`; `ohne Kinder` clears stale ages; incomplete family data fails closed.
- Manual traveller correction clears the pending AI block after save.
- Self-review regression fixed: `1 Kind, 5 Jahre` no longer duplicates the age.

## V5.86
- JavaScript syntax: PASS.
- Adult-intent matrix: 7/7 PASS.
- Duration phrases such as `für eine Woche` do not overwrite adults; explicit adult/traveller wording still may.

## V5.87
- JavaScript syntax: PASS.
- Result observer rebind assertions: 8/8 PASS.
- Rebinds after `#results` replacement and disconnects on `pagehide`, so busy release keeps working after view/rerender transitions.

## Security
- No LiteAPI key added to browser code.
- No Supabase service-role key added to browser code.
- Provider logic remains server-side.

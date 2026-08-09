# NOREYO V5.74 — V5.73 multimodal + family safety

Base: current V5.73 main.

## V5.73.1 hardening
- Multimodal search paint work is coalesced with a single RAF queue.
- MutationObserver only schedules work for relevant search-card nodes instead of every subtree mutation.
- Product-mode rerender remains intact.
- Local object URLs are revoked when photos change and on pagehide.
- Only image MIME types are accepted for preview.
- UI no longer implies that selected photos already affect the live search; it explicitly states that image analysis is not active yet.
- No fallback runtime loader is used; V5.74 JS/CSS are loaded exactly once by the V5.74 outer loader.

Checks:
- JavaScript syntax PASS.
- 8/8 observer/image/readability static checks PASS.

## V5.74 family + traveller safety
- Parses explicit adult counts and `zu zweit`.
- Parses child counts and ages, including singular child cases, `5 und 8 Jahre`, `5 Jahre und 8 Jahre`, and babies in months.
- Multiple babies expressed in months are normalized to age 0 for provider occupancy.
- Complete family data writes to `searchState.childAges`.
- `ohne Kinder` / `nur Erwachsene` clears stale child ages.
- Missing child ages fail closed before live search and open the traveller planner.
- Manual valid traveller correction releases the pending block.
- `für eine Woche` is not interpreted as adult intent.
- Existing V5.56 parser remains authoritative for destination/date/budget/preferences.

Checks:
- JavaScript syntax PASS.
- Family/adult parser matrix 10/10 PASS.

## iPhone readability
- Tiny 6–9px helper text in V5.73 is raised into a more readable mobile range.
- Image and search actions are at least 48px tall on normal mobile widths.
- <=360px layout stacks image + search actions to avoid cramped two-column controls.
- Reduced-motion handling retained.

## Loader / cache
- Outer BUILD is V5.74.
- All external enhancer assets use cache key 574.
- `site.zip` request uses `noreyo-574`.
- V5.74 JS/CSS are explicitly included in the generated document.

## Security
- No LiteAPI API key in new browser modules.
- No Supabase service-role key in new browser modules.
- `site.zip` unchanged.

## Still open
- Real deployed iPhone Safari E2E.
- Real Supabase/LiteAPI family-search E2E.
- Full Favorites / Trips / Profile / Auth / Cancellation regression before finished status.

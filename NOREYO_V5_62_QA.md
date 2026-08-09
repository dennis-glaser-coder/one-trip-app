# NOREYO V5.62 QA

## Scope
V5.62 hardens the current V5.41 GitHub build without replacing the native search/planner implementation inside `site.zip`.

## Mobile Safari / iPhone
- `visualViewport` height is tracked and exposed as `--noreyo-visual-height`.
- Software-keyboard detection hides the floating bottom navigation while an input is focused and the viewport is reduced.
- Open planner/filter sheets hide the bottom navigation and lock body scroll.
- Sheet height is limited by the visible Safari viewport.
- Planner/filter close and counter controls have at least 44 px touch targets.
- `prefers-reduced-motion` disables non-essential smooth transitions.

## Modal accessibility
- Open planner/filter receives `role="dialog"` and `aria-modal="true"`.
- Label is derived from the current sheet heading when no explicit ARIA label exists.
- Focus moves into the sheet, is trapped while open, and returns to the opener after close.
- Escape activates the native close control when available.

## Product mode CTA
- Package: `Pauschalreise suchen`
- Hotel: `Live-Hotels finden`
- Flight: `Live-Flüge finden`

The enhanced CTA still delegates to the existing native search button; no separate search implementation is introduced.

## Cache / deployment
`index.html` is bumped to BUILD 5.62 and uses asset cache key `562` for `site.zip`, `noreyo-v533.*`, `noreyo-v534.css`, and `noreyo-v541.*`. This prevents an iPhone/Safari client from continuing to use cached V5.41 enhancer assets after deployment.

## Validation
- `noreyo-v541.js`: `node --check` PASS.
- 18/18 static modal/mobile/security checks PASS.
- `index.html` inline loader: `node --check` PASS.
- V5.62 cache-key assertions PASS.
- Branch comparison: only enhancer CSS/JS, loader, and this QA file are changed; `site.zip` remains untouched.
- No LiteAPI or Supabase privileged secret is introduced in frontend code.

## Still open
- Real-device iPhone Safari interaction test after deploy.
- Full live-search/Supabase/LiteAPI integration still lives primarily in the embedded `site.zip` and should be migrated out of the binary bundle incrementally.
- Auth/cloud-trip/cancellation modules from the separate development stack still need physical integration into this repository before the project can be called complete.

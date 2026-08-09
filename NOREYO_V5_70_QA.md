# NOREYO V5.70 – Safari / AI / Cruise Safety QA

## Basis
V5.70 basiert direkt auf dem aktuellen `main` mit V5.56 AI-Wunschsuche und der bereits gemergten Kreuzfahrt-/Sucharchitektur.

## Gefundene Regressionen beim Port von V5.69
1. V5.69 kannte `cruise` noch nicht und hätte Kreuzfahrt im Fallback als Pauschalreise behandeln können.
2. V5.56 besitzt einen eigenen iOS-Body-Lock für die AI-Suche. Ein zweiter allgemeiner Fixed-Body-Lock darf dort nicht gesetzt werden.
3. V5.44 (Zielplaner) und V5.56 (AI) hatten keinen eigenen `pagehide`-Cleanup. Bei Safari BFCache konnte ein privater Fixed-Body-Lock im Seitenzustand hängen bleiben.

## V5.70 Änderungen
- Produktmodus erkennt `window.NOREYO_V552.isCruise()` und `data-noreyo-product="cruise"`.
- Search-Guard ignoriert den bewusst noch nicht live angebundenen Kreuzfahrt-CTA.
- V5.52 Cruise-Picker wird als Dialog erkannt, bekommt Fokus-Trap, Escape und normalen V5.70 Scroll-Lock.
- V5.56 AI-Dialog wird als Dialog erkannt, behält aber ausschließlich seinen eigenen Scroll-Lock.
- V5.44 Zielplaner behält seinen spezialisierten Scroll-Lock.
- `pagehide` entfernt private V5.44/V5.56 Lock-Klassen synchron und stellt die Scrollposition aus `body.style.top` wieder her.
- `pageshow` normalisiert einen aus BFCache zurückkehrenden spezialisierten Dialog durch sauberes Schließen, damit kein halb-gesperrter Zustand übrig bleibt.
- Bottom-Navigation wird bei offenem Dialog bzw. Software-Tastatur ausgeblendet.
- Native Package/Hotel/Flight Search behält Datums-, Airport-, Reisenden- und Kinderalter-Guard sowie Double-Submit-Schutz.
- Hotel-only bleibt ohne Abflughafen gültig.
- Package/Flight: 1–6 IATA-förmige Abflughäfen.
- Maximal 9 Reisende; Kinderalter 0–17; maximal ein Infant <=1 pro Erwachsenem.

## Loader / Cache
- Loader-Build: `5.70`
- Asset-Cache-Key: `570`
- `site.zip`: unverändert, nur Cache-URL auf `noreyo-570`
- V5.56 AI bleibt geladen; V5.70 wird danach geladen.

## Security
- kein LiteAPI-Key im V5.70 Browsercode
- kein Supabase Service Role Key im V5.70 Browsercode
- keine Providerlogik in V5.70 verschoben

## Repo-Check
- Branch: `agent/v570-safari-ai-cruise-safety`
- basiert auf aktuellem `main`
- Diff: `index.html`, `noreyo-v570.css`, `noreyo-v570.js`, diese QA-Datei
- `site.zip` unverändert

## Noch offen
- echter iPhone-Safari-Gerätetest nach Deployment
- echte LiteAPI/Supabase-End-to-End-Suche
- AI Wunschsuche mit realer Familie/Kinderalter-Konfiguration gegen Native Search
- Auth/Cloud/Cancellation weiter aus `site.zip` herauslösen

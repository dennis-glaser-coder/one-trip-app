# NOREYO V5.67 – Loader / Planner Fail-Closed QA

## Änderungen
- Loader jetzt `BUILD 5.67` / Asset-Key `567`.
- `noreyo-v567.js` wird nach V5.63/V5.66 geladen.
- Abflughafen-Planner schlägt fehl statt still weiterzulaufen, wenn keine Auswahloptionen gerendert wurden.
- Package/Flight verlangt mindestens einen und höchstens sechs Abflughäfen.
- Sichtbare Abflughäfen werden vor Live-Suche auf IATA-Form `AAA` geprüft.
- Hotel-only bleibt ohne Abflughafen zulässig.
- Ziel-Planner schlägt fehl, wenn keine Zieloptionen geladen oder keine Option ausgewählt ist.
- Validierungsfehler sind `role=alert` / `aria-live=assertive`.
- Transiente V5.67-Fehler werden vor Safari `pagehide` entfernt.
- `site.zip` bleibt unverändert.
- Keine LiteAPI-/Supabase-Secrets im Browsercode.

## Selbstprüfung
- `noreyo-v567.js` `node --check`: PASS.
- V5.67 Guard-/Security-Assertions: 11/11 PASS.
- Repo-Loader nach Commit geprüft: `BUILD='5.67'`, `ASSET_BUILD='567'`, `noreyo-v567.js?build=567` wird injiziert.

## Weiter offen
- echter iPhone-Safari-Test nach Deployment;
- Kernlogik in `site.zip` weiterhin schrittweise in Textmodule migrieren;
- Live-Suche/Auth/Cloud/Cancellation noch nicht vollständig aus dem Binärbundle herausgelöst.

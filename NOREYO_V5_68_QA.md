# NOREYO V5.68 – Product-Mode Safe Planner Guard QA

## Korrektur gegenüber dem verworfenen V5.67-Guard
Der erste Fail-Closed-Guard las den Produktmodus über `window.productMode`. Ein top-level `let productMode` der nativen App ist jedoch keine `window`-Property. Dadurch hätte Hotel-only fälschlich wie Pauschalreise behandelt und ein Abflughafen verlangt werden können.

V5.68 liest deshalb zuerst den global-lexikalischen Bezeichner via `typeof productMode !== 'undefined'` und nutzt anschließend einen DOM-Fallback über aktiven Product-Switch / `data-product-mode` / sichtbares Label.

## Guardrails
- Hotel-only darf ohne Abflughafen suchen.
- Pauschalreise und Flug benötigen mindestens einen Abflughafen.
- höchstens 6 Abflughäfen.
- sichtbare Abflughafencodes müssen 3-stellige IATA-Form besitzen.
- fehlend gerenderte Airport-Optionen schlagen fail-closed statt still zu speichern.
- fehlend gerenderte Zieloptionen schlagen fail-closed.
- Ziel muss aktiv ausgewählt sein.
- Fehlerhost: `role=alert` + `aria-live=assertive`.
- transiente Fehler werden bei Safari `pagehide` entfernt.
- native Planner-/Search-Funktionen werden nicht ersetzt.
- `site.zip` bleibt unverändert.
- keine LiteAPI-/Supabase-Secrets im Browsercode.

## Loader
- `BUILD='5.68'`
- `ASSET_BUILD='568'`
- `noreyo-v568.js?build=568` wird explizit injiziert.
- die bekannte V5.67-Datei wurde aus dem Branch entfernt.

## Selbstprüfung
- `noreyo-v568.js` `node --check`: PASS.
- V5.68 Guard-/Security-Assertions: 11/11 PASS.
- Repo-Loader nach Commit kontrolliert: V5.68/568 + V568-Injektion vorhanden.

## Weiter offen
- echter iPhone-Safari-Test nach Deployment;
- Kernlogik aus `site.zip` schrittweise in Textmodule migrieren;
- Live-Suche/Auth/Cloud/Cancellation noch nicht vollständig aus dem Binärbundle herausgelöst.

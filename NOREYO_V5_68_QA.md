# NOREYO V5.68 – Rebased Safari / Planner Safety QA

## Basis
V5.68 wurde neu auf dem zu diesem Zeitpunkt aktuellen `main` aufgebaut, damit die parallel hinzugekommenen First-Screen-/CTA-Verbesserungen erhalten bleiben.

## Übernommene aktuelle Main-Änderungen
- kompakter Hero / Search-Card für sichtbaren CTA auf dem ersten iPhone-Screen;
- CTA als eigenes Grid-Element zwischen vier Kernfeldern und optionalen Zusatzfeldern;
- Main-/Extra-Cell-Reihenfolge über `noreyo-v541-main-cell` / `noreyo-v541-extra-cell`.

## Zusätzliche V5.68-Härtung
- produktabhängige CTA: Pauschalreise / Live-Hotels / Live-Flüge;
- `visualViewport` für iPhone-Safari-Keyboard;
- Bottom-Navigation bei offenem Modal/Keyboard verborgen;
- Dialog-Semantik, Fokus-Trap, Escape, Fokus-Rückgabe;
- Modal-Scroll-Lock mit synchronem `pagehide`-Restore für BFCache;
- mindestens 44px kritische Touchziele;
- `prefers-reduced-motion`;
- Datums-/Reisenden-/Kinderalter-Validierung;
- Double-Submit-Schutz der nativen Live-Suche;
- Fail-Closed Ziel-/Airport-Guard;
- Hotel-only ohne Airport; Package/Flight 1–6 IATA-förmige Origins;
- global-lexikalischer `productMode` wird korrekt gelesen, DOM-Fallback vorhanden.

## Loader
- `BUILD='5.68'`
- `ASSET_BUILD='568'`
- V533, V541, V563 und V568 werden einzeln cache-gebustet injiziert.
- `site.zip` bleibt unverändert.

## Sicherheit
- keine LiteAPI-/Supabase-Secrets im Browsercode;
- native Search-/Planner-Funktionen werden nicht ersetzt.

## Selbstprüfung
- V5.68 Guard-/Security-Assertions lokal: 11/11 PASS.
- `noreyo-v568.js` lokal `node --check`: PASS.
- V5.66 Scroll-/Search-Guard wurde unverändert aus dem zuvor geprüften Branch übernommen.
- Repo-Inhalte nach jedem Commit erneut gelesen/abgeglichen.

## Noch offen
- echter iPhone-Safari-Test nach Deployment;
- Live-Suche/Auth/Cloud/Cancellation schrittweise aus `site.zip` herauslösen;
- Provider-/Supabase-E2E noch nicht vollständig live durchgetestet.

# NOREYO V5.74 – Adult-only AI State Cleanup QA

## Gefundene Regression
V5.71 behandelte `ohne Kinder`, `keine Kinder` und `nur Erwachsene` bewusst nicht als offenen Familienzustand. Dabei blieb aber `searchState.childAges` aus einer vorherigen Suche unverändert.

Beispiel:
1. vorherige Suche: 2 Erwachsene + Kinder 5/8;
2. neue AI-Eingabe: `2 Erwachsene ohne Kinder`;
3. ohne Fix konnten `[5,8]` im nativen Search State verbleiben.

Das ist für Live-Suche kritisch, weil ein optisch kinderloser Suchauftrag mit alter Familienbelegung an Hotel-/Flight-Provider gehen kann.

## Fix
Neue V5.74-Schicht:
- erkennt explizite Adult-only-Angaben;
- wartet auf den nativen AI-Apply-Handoff;
- setzt danach `searchState.childAges=[]`;
- übernimmt eine explizit genannte Erwachsenenzahl;
- ruft vorhandene UI-/Persist-Funktionen auf;
- verändert keine Provider-Secrets oder Providerlogik.

## Loader
- Build: `5.74`
- Cache-Key: `574`
- Reihenfolge: V5.71 → V5.74 → V5.72 → V5.70
- `site.zip` inhaltlich unverändert.

## Regressionstest
- explizites `ohne Kinder` erkannt: PASS
- Adult-only bleibt ohne Family-Pending-State: PASS
- alte Kinderalter werden gelöscht: PASS
- Erwachsenenzahl bleibt korrekt: PASS
- normale Familie `2 Erwachsene und 2 Kinder, 5 und 8 Jahre`: PASS
- JavaScript Syntax: PASS

## Repo
- Branch: `agent/v570-safari-ai-cruise-safety`
- Draft PR: #19
- PR nach Update weiterhin mergebar.

## Noch offen
- echter iPhone-Safari-Test nach Deployment;
- reale Supabase/LiteAPI-E2E-Familiensuche;
- Auth/Cloud/Cancellation weiter aus `site.zip` herauslösen.

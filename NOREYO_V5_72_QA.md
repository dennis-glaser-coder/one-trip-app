# NOREYO V5.72 – Safari / AI / Family Safety QA

## Basis
V5.72 baut auf dem aktuellen V5.56-AI-/Cruise-Stack auf. Während der Arbeit ist `main` um einen reinen V5.56-CSS-Feinschliff weitergelaufen; die Branch-Änderungen berühren `noreyo-v556.css` nicht und bleiben mergebar.

## Paket 1 – Safari / Modal / Cruise Safety (V5.70)
Gefundene Regressionen beim alten V5.69-Port:
1. `cruise` wurde noch nicht erkannt und konnte als Pauschalreise behandelt werden.
2. V5.56 AI besitzt einen eigenen iOS-Body-Lock; ein zweiter allgemeiner Fixed-Body-Lock würde konkurrieren.
3. V5.44 Zielplaner und V5.56 AI hatten keinen eigenen `pagehide`-Cleanup; Safari BFCache konnte private Locks konservieren.

Korrekturen:
- Cruise-Modus über `NOREYO_V552.isCruise()` / `data-noreyo-product`.
- Cruise-CTA wird nicht vom Package/Flight-Live-Search-Guard abgefangen.
- Cruise-Picker: Dialog-Semantik, Fokus-Trap, Escape, normaler V5.70 Scroll-Lock.
- AI-Dialog: Fokus-/Bottom-Nav-Safety, aber ausschließlich V5.56 Scroll-Lock.
- Zielplaner: ausschließlich V5.44 Scroll-Lock.
- `pagehide` entfernt V5.44/V5.56 Lock-Klassen synchron und stellt Scrollposition aus `body.style.top` wieder her.
- `pageshow` normalisiert BFCache-Rückkehr mit offenem spezialisierten Dialog durch sauberes Schließen.
- 44px kritische Touchziele, VisualViewport, Reduced Motion, Keyboard/Nav-Safety.

## Paket 2 – AI Familien-/Kinderalter-Handoff (V5.71)
Gefundene Lücke in V5.56:
- AI erkennt Erwachsene, übernimmt aber keine Kinderalter in `searchState.childAges`.

V5.71 ergänzt:
- Kinderanzahl aus `1 Kind`, `2 Kinder`, Wortzahlen usw.
- Alterslisten wie `2 Kinder, 5 und 8 Jahre`.
- Einzelangaben wie `Kind 4 Jahre`.
- Baby-Angabe in Monaten wird als Alter 0 behandelt.
- `ohne Kinder`, `keine Kinder`, `nur Erwachsene` erzeugen bewusst KEINEN Familien-Pending-State.
- vollständige Familie wird nach nativer AI-Übernahme in `searchState.childAges` geschrieben und persistiert.
- unvollständige Familie wird sichtbar als offen markiert und NICHT stillschweigend verworfen.

Parser-Testfälle nach zwei gefundenen Regressionen:
- `2 Erwachsene und 2 Kinder, 5 und 8 Jahre` → PASS
- `2 Erwachsene, 2 Kinder` → PASS, unvollständig
- `1 Erwachsener und 2 Kinder, 0 und 1 Jahre` → PASS, Infant-Regel blockiert
- `zu zweit ohne Kinder` → PASS, kein Familien-Pending
- `2 Erwachsene und ein Kind 4 Jahre` → PASS
- `2 Erwachsene mit Baby 8 Monate` → PASS

Ergebnis: **6/6 Parserfälle PASS**.

Zusätzliche Regression behoben:
- erster Entwurf nutzte einen globalen MutationObserver, der durch das eigene Einfügen des Familienblocks selbst erneut hätte feuern können.
- ersetzt durch gezielte Analyze-/Ctrl-Enter-Hooks; kein self-triggering DOM-Loop.

## Paket 3 – Fail-Closed Live Search (V5.72)
- Wenn AI Kinder erkannt hat, aber Kinderanzahl/Alter noch nicht vollständig sind, startet Package/Hotel/Flight nicht.
- Stattdessen öffnet NOREYO den bestehenden Reisenden-Planer.
- Nach manueller vollständiger Eingabe wird der Pending-State automatisch aufgelöst.
- Kreuzfahrt bleibt aus diesem Live-Search-Guard ausgenommen, solange keine Live-Cruise-Provideranbindung existiert.

## Bestehende Search-Guards
- Ziel erforderlich.
- Package/Flight: 1–6 IATA-förmige Airports.
- Hotel-only: kein Airport nötig.
- gültige ISO-Daten, Checkout nach Checkin, keine vergangene Anreise.
- 1–9 Erwachsene/Reisende gesamt max. 9.
- Kinderalter 0–17.
- maximal ein Infant <=1 pro Erwachsenem.
- Double Submit der nativen Live-Suche blockiert.

## Loader / Cache
- Loader-Build `5.72`
- Asset-Key `572`
- lädt V5.56 AI, danach V5.70, V5.71, V5.72.
- `site.zip` inhaltlich unverändert; nur Cache-URL `noreyo-572`.

## Security
- kein LiteAPI-Key in V570/V571/V572 Browsercode.
- kein Supabase Service Role Key im Browsercode.
- keine Providerlogik in Browser-Schichten verschoben.

## Repo
- Branch: `agent/v570-safari-ai-cruise-safety`
- PR: #19 (Draft)
- Branch-Änderungen berühren `site.zip` nicht.

## Noch offen
- echter iPhone-Safari-Gerätetest nach Deployment.
- reale Supabase/LiteAPI-E2E-Suche mit Familie/Kinderalter.
- Auth/Cloud/Cancellation weiter aus `site.zip` herauslösen.

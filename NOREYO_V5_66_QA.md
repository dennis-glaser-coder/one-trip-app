# NOREYO V5.66 – Search / Planner Safety QA

## Änderungspaket

Der bereits geladene Safari-Enhancer `noreyo-v563.js` wurde additiv erweitert. Native Planner-, Search- und Routing-Funktionen aus `site.zip` werden nicht ersetzt.

### Planner-Schutz

- Zeitraum: zwei echte `input[type=date]` müssen valide sein.
- Rückreise muss nach der Anreise liegen.
- Anreise in der Vergangenheit wird blockiert.
- Reisende: mindestens ein Erwachsener, maximal 9 Reisende.
- Für jedes Kind muss ein Alter 0–17 vorhanden sein.
- Mehr Infants 0–1 als Erwachsene werden blockiert.
- Package/Flight: mindestens ein Abflughafen.
- Hotel-only darf ohne Abflughafen suchen.
- Fehler erscheinen als `role=alert` direkt im Planner und fokussieren das betroffene Feld.

### Live-Suche

Vor dem nativen Search-Handler wird nur der sichtbare Planner-Snapshot plausibilisiert:
- Ziel vorhanden
- Abflug vorhanden, sofern nicht Hotel-only
- Zeitraum vorhanden
- Reisende vorhanden

Es werden keine Provider-Payloads im Enhancer erzeugt und keine internen Bundle-States überschrieben.

### Double-submit / Mobile Safari

- nur der native `.liveSearchButton` startet den Busy-Lock;
- der zusätzliche V5.41 CTA darf weiterhin den nativen Button auslösen;
- ein zweiter Search-Tap während des laufenden Requests wird abgefangen;
- `aria-busy` / disabled werden gesetzt;
- Lock wird bei View-Wechsel, nach 15 Sekunden Failsafe oder vor `pagehide` gelöst;
- bestehender synchroner BFCache-Scroll-Fix bleibt erhalten.

## Regression / Sicherheit

Lokale Checks vor Commit:
- `node --check noreyo-v563-next.js`: PASS
- 11/11 statische Guard-/Security-Assertions: PASS
- keine Provider- oder Supabase-Secrets im Browsercode
- `site.zip` unverändert

## Rest-Risiken

- Der Loader steht weiterhin auf Cache-Key `565`; GitHub Pages kann die aktualisierte `noreyo-v563.js` kurzfristig unter derselben Asset-URL cachen. Der nächste Loader-Bump sollte auf V5.66/566 erfolgen, sobald `index.html` sicher als Text aktualisiert werden kann.
- echter iPhone-Safari-End-to-End-Test bleibt erforderlich.
- Live-Suche/Auth/Cloud/Cancellation müssen weiterhin schrittweise aus dem binären Bundle herausgelöst werden.

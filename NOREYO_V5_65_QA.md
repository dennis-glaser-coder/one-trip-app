# NOREYO V5.65 QA

## Scope
V5.65 baut auf V5.64 auf. `site.zip` bleibt unverändert; der Fix betrifft ausschließlich die aktive Safari-Modal-/Scroll-Lock-Schicht und deren Cache-Key.

## Gefundener BFCache-Randfall
Beim Schließen eines normalen Modals darf die Scroll-Rückgabe per `requestAnimationFrame` erfolgen. Beim Safari-Event `pagehide` ist das jedoch riskant: Safari kann die Seite in den BFCache einfrieren, bevor der RAF-Callback gelaufen ist. Dann kann die wiederhergestellte Seite an Scrollposition 0 statt an der ursprünglichen Position erscheinen.

## Fix
`noreyo-v563.js` besitzt jetzt `restoreScroll(y, synchronous)` und `unlockScroll({ synchronous })`.

- normaler Modal-Close: Scroll-Restore weiter im nächsten RAF;
- `pagehide`: Body-Styles und Scrollposition werden **synchron** wiederhergestellt;
- `pageshow`: vorhandener Modalzustand wird erneut sauber synchronisiert.

## Automatisierter Regressionstest
Simulierter Safari-Ablauf mit Scrollposition 412 px:

1. `noreyo-modal-open` aktiv;
2. Body wird auf `position: fixed` und `top: -412px` gesetzt;
3. `pagehide` wird ausgelöst;
4. vorherige Body-Inline-Styles werden wiederhergestellt;
5. `scrollTo(412)` erfolgt synchron;
6. für den pagehide-Restore wird **kein** `requestAnimationFrame` verwendet.

Ergebnis: **4/4 PASS**.

Zusätzlich: `noreyo-v563.js` besteht `node --check`.

## Loader / Cache
- Build: `5.65`
- Asset-Key: `565`
- `site.zip?build=noreyo-565`
- `noreyo-v563.js?build=565`

Damit kann Safari nicht bei einer zuvor gecachten V5.64-Version des Scroll-Lock-Skripts hängen bleiben.

## Noch offen
- echter iPhone-Safari-Test nach Deployment;
- insbesondere Planner öffnen/schließen bei gescrollter Seite, Mail/App-Wechsel, Zurück-Navigation und BFCache;
- Kernlogik aus `site.zip` bleibt der nächste große Architekturblock.

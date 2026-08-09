# NOREYO V5.64 QA

## Ausgangspunkt
V5.64 baut auf dem aktuellen V5.62/V5.63 Branch auf und verändert `site.zip` weiterhin nicht.

## Gefundener Integrationsfehler
`noreyo-v563.js` war bereits im Branch vorhanden, wurde vom HTML-Loader aber nicht injiziert. Dadurch wäre der neue iPhone/Safari Scroll-Lock- und BFCache-Fix nach Deployment wirkungslos geblieben.

V5.64 lädt jetzt explizit:
- `noreyo-v533.js`
- `noreyo-v541.js`
- `noreyo-v563.js`

Alle mit Cache-Key `564`.

## Zweite Loader-Härtung
Die bisherige Injektion war gruppiert: Wenn z. B. `noreyo-v533.js` bereits im eingebetteten `site.zip` vorhanden gewesen wäre, wären neuere Enhancer in derselben Gruppe nicht nachgeladen worden.

V5.64 injiziert deshalb jedes CSS-/JS-Asset einzeln über `injectBefore(...)` und prüft jeweils seinen eigenen Marker. Dadurch ist der Loader unabhängig davon, welche ältere Enhancer-Version bereits im Bundle steckt.

## Mobile Safari
`noreyo-v563.js` ist jetzt tatsächlich aktiv und ergänzt V5.62 um:
- feste Body-Scrollposition bei offenem Planner/Filter;
- Wiederherstellung der ursprünglichen Body-Inline-Styles;
- Rückkehr zur vorherigen Scrollposition;
- `pagehide`-Cleanup vor Safari BFCache;
- `pageshow`-Recovery, falls Safari einen stale Modal-State restauriert.

## Build / Cache
- Loader-Build: `5.64`
- Asset-Key: `564`
- `site.zip?build=noreyo-564`
- jedes Enhancer-Asset erhält `?build=564`

## Regression / Sicherheit
- native Such-/Planner-Logik in `site.zip` bleibt unangetastet;
- keine LiteAPI-, Supabase-Service-Role- oder sonstigen Provider-Secrets im Browser;
- V5.62 Dialog-/Fokus-/Keyboard-Verhalten bleibt bestehen;
- V5.63 Scroll-Lock-Code wird jetzt vom produktiven Loader erreicht.

## Noch offen
- echter iPhone-Safari-Test nach Deployment, insbesondere: Planner öffnen → scrollen → schließen; Keyboard öffnen/schließen; App Hintergrund/Vordergrund; Zurück-Navigation mit BFCache.
- vollständige Live-Suche/Auth/Cloud-/Cancellation-Integration liegt weiterhin teilweise außerhalb des binären `site.zip` und muss schrittweise in das echte Repository übernommen werden.

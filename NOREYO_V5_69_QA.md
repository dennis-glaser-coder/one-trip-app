# NOREYO V5.69 – Safari / Planner Safety auf V5.50 Main

## Ausgangspunkt
V5.69 wurde direkt auf den aktuellen V5.50-`main` gesetzt. Damit bleiben die bereits gemergten All-Inclusive-/Verpflegungsfixes und die vereinheitlichte Suchbox-Reihenfolge erhalten.

## Integrationsprinzip
- `site.zip` unverändert.
- Bestehende V533/V541/V544/V546/V547/V548 Enhancer unverändert.
- Additiv: `noreyo-v569.css` + `noreyo-v569.js`.
- Loader cache-busted auf BUILD 5.69 / Asset 569.

## Safari / Planner
- `visualViewport` / Software-Tastatur.
- Bottom-Nav bei Modal oder Keyboard ausblenden.
- Dialog-Semantik, Fokus-Trap, Escape, Fokus-Rückgabe.
- allgemeiner Body-Scroll-Lock mit vollständigem Style-Restore.
- synchroner `pagehide`-Restore für BFCache.
- mindestens 44px kritische Touchziele.
- Reduced Motion.

### Wichtige Regression behoben
V5.44 besitzt bereits einen spezialisierten iOS-Scroll-Lock für den Ziel-Dialog. V5.69 erkennt diesen Dialog und setzt dort bewusst **keinen zweiten Body-Fixed-Lock**. V5.44 bleibt für Ziel/Keyboard zuständig; V5.69 übernimmt die übrigen Modals.

## Search Safety
Vor nativer Live-Suche:
- Ziel erforderlich.
- Hotel-only ohne Airport zulässig.
- Package/Flight: 1–6 IATA-förmige Airports.
- valide ISO-Daten, Checkout nach Check-in, keine vergangene Anreise.
- mindestens 1 Erwachsener, maximal 9 Reisende.
- Kinderalter 0–17.
- höchstens ein Infant 0–1 pro Erwachsenem.
- Double-submit der nativen `.liveSearchButton` blockiert.

## Produktmodus / CTA
- Package → Pauschalreise suchen
- Hotel → Live-Hotels finden
- Flight → Live-Flüge finden

## Selbstprüfung
- `noreyo-v569.js`: Node-Syntax PASS.
- 12/12 Safari/Search/Security Checks PASS.
- zusätzlicher V5.44/V5.69 Lock-Ownership-Check PASS.
- Inline Loader Syntax PASS.
- keine LiteAPI-/Supabase-Secrets im Frontend.
- `site.zip` unverändert.

## Offen
- echter Deployment-Test auf iPhone/Safari.
- reale Supabase/LiteAPI E2E-Suche mit Kinderaltern.
- weitere Herauslösung von Auth/Cloud/Cancellation aus `site.zip`.

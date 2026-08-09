# NOREYO V5.75 – AI Adult-Intent Guard QA

## Gefundene Regression
Die native V5.56-AI-Funktion `parseAdults()` akzeptiert Zahlwörter nach `für/fuer/mit/zu` auch dann, wenn `Person/Erwachsener` fehlt.

Dadurch kann z. B. `für eine Woche nach Mallorca` als `1 Erwachsener` interpretiert werden.

## Fix
V5.75 schützt den bestehenden Reisenden-State beim AI-Apply:
- nur explizite Angaben wie `2 Erwachsene`, `2 Personen`, `3 Reisende` oder `zu zweit` dürfen die Erwachsenenzahl verändern;
- reine Dauer-/Zahlwortformulierungen wie `für eine Woche` gelten NICHT als Adult-Intent;
- vor dem nativen AI-Apply wird die aktuelle Erwachsenenzahl gesichert;
- nach dem nativen Handoff wird ein unbegründeter Adult-Overwrite zurückgesetzt und persistiert.

## Zusammenspiel
Loader-Reihenfolge:
V5.71 → V5.74 → V5.75 → V5.72 → V5.70

- V5.71: Familie/Kinderalter
- V5.74: Adult-only löscht alte childAges
- V5.75: schützt adults vor Dauer-Falschpositiven
- V5.72: blockiert unvollständige Familien-Suche
- V5.70: generische Search/Safari Guards

## Tests
- `für eine Woche nach Mallorca` ist kein Adult-Intent: PASS
- `für 2 Erwachsene nach Mallorca` wird erkannt: PASS
- `zu zweit nach Mallorca` wird erkannt: PASS
- falscher nativer Overwrite 2 → 1 wird auf 2 zurückgesetzt: PASS
- kein unnötiger State-Write bei unverändertem Wert: PASS
- JavaScript Syntax: PASS

## Security / Regression
- keine Provider-Secrets im Browsercode
- `site.zip` unverändert
- Cache/Loader auf 5.75 / 575
- bestehende Ziel-/Airport-/Datum-/Kinderalter-/Infant-/Double-submit-Guards bleiben unverändert.

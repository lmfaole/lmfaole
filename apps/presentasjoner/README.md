# Presentasjoner

Samling av mine presentasjoner (offentlig mappe i lmfaole/lmfaole). Selve `.pptx`-filene og arbeidsgiver-malen er ikke med her. Alle lages i PowerPoint (`.pptx`).

## Struktur

```
<år>-<måned>-<tittel>/
  <tittel>.pptx       # ikke versjonert her
  presentasjon.json   # innholdet i .pptx-filen (påkrevd, se under)
  README.md           # fakta, tidsplan, kilder, kreditering (se maler/README-mal.md)
  bilder/             # bildene som brukes, og KREDITERING.md
```

## Konvensjoner

- Format: PowerPoint (`.pptx`)
- Én mappe per presentasjon
- Hver presentasjon har en `README.md` basert på `maler/README-mal.md` (retningslinjer: `skills/presentation-readme/SKILL.md`)
- Hver presentasjon har en `presentasjon.json`, siden `.pptx`-filen ikke er her

## presentasjon.json

Det repoet tar vare på av selve presentasjonen. For hver slide lagres:

- layout, tittel og tekst (etter plassholder);
- tekstbokser;
- bilder (som filer i `bilder/`, med alt-tekst);
- video og lyd;
- lenker;
- tidsstempel og foredragsnotater.

Formatet er `presentasjon.schema.json`.

Lag eller oppdater filen etter hver endring i `.pptx`-filen:

```bash
python3 -m venv /tmp/pptxvenv && /tmp/pptxvenv/bin/pip install python-pptx
/tmp/pptxvenv/bin/python scripts/pptx_to_json.py <sti til>/<tittel>.pptx <mappe her>
python3 scripts/check.py
```

Det andre argumentet trengs bare når `.pptx`-filen ligger utenfor repoet. Bilder skrevet med `null` mangler i `bilder/`; legg dem dit og kjør på nytt.

`scripts/check.py` kjøres i CI (`.github/workflows/presentasjoner.yml`). Den krever at:

- hver mappe `<år>-…` har `README.md` og en gyldig `presentasjon.json`;
- slidene er nummerert uten hull;
- bildene finnes;
- alle bilder og videoer har alt-tekst eller er merket som dekorative.

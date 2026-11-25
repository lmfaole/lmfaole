---
name: pptx-builder
description: Generate .pptx PowerPoint decks programmatically with python-pptx (16:9, layouts/masters, bullets, images, native charts, tables, speaker notes) from a JSON/YAML outline, and check results. Use when asked to create or script a presentation or slides.
---

# pptx-builder

## Quick start

```bash
python3 -m venv /tmp/pptxvenv && /tmp/pptxvenv/bin/pip install python-pptx pillow pyyaml   # pyyaml only for .yaml outlines
/tmp/pptxvenv/bin/python presentasjoner/skills/pptx-builder/scripts/build_deck.py outline.json /tmp/out.pptx [--template base.pptx]
```

Keep the venv and scratch output outside the repo. Decks are tracked with Git LFS (`.pptx`), so don't commit generated test decks.

Outline (JSON or YAML; slide `type`: `title`, `section`, `bullets`, `image`, `chart`, `table`; every slide takes `notes`):

```json
{"theme": {"font": "Calibri", "title_color": "1F3864", "accent": "2E75B6"},
 "slides": [
  {"type": "title", "title": "Deck", "subtitle": "Sub", "notes": "Say hi"},
  {"type": "bullets", "title": "Points", "bullets": ["a", ["nested", 1]], "image": "pic.png"},
  {"type": "chart", "title": "Sales", "chart": {"kind": "column", "categories": ["A","B"], "series": {"2024": [1,2]}}},
  {"type": "table", "title": "T", "table": [["H1","H2"],["a","b"]]}]}
```

Chart kinds: `bar`, `column`, `line`, `pie`. Image paths are relative to the outline file. `--template` reuses the masters/layouts/theme of an existing .pptx; its existing slides are dropped and empty placeholders pruned. Map slide types to the template's layout names with a top-level `"layouts": {"title": "Forside", "section": "Skilleark sort", "bullets": "Uten linje"}` (otherwise English default names are tried, then default indexes). Title slides accept `"extra": {"<placeholder idx>": "text"}`. Optional `"theme": {"body_pt": 28, "title_pt": 40}` sets font sizes. The Fremtind template is `maler/fremtind-mal.pptx`; `--keep-existing` keeps the template's slides as a hidden appendix after the new ones, and a slide accepts `"layout"` and `"hidden"`. PDF export for visual checks works on macOS via PowerPoint AppleScript (`save active presentation in POSIX file "x.pdf" as save as PDF`), then render pages with `pymupdf`.

The other way: `scripts/pptx_to_json.py` (in `presentasjoner/`) writes a deck's content to `presentasjon.json`, which every presentation folder needs. It records layouts, placeholder text, pictures in `bilder/`, media, links and notes; `scripts/check.py` checks it against `presentasjon.schema.json`. That format is a record of the deck, not an outline for `build_deck.py`.

## Facts and gotchas

Verified by running the script (python-pptx 1.0.2, Python 3.15): 7-slide deck with all slide types, notes, picture, native column/pie charts and table builds, and reopens; the same outline works as YAML.

- **Default template is 4:3** (docs: "a 4x3 aspect ratio presentation based on the 'White' template"). Setting `prs.slide_width/height` to 13.333x7.5 in only resizes the slide: I observed that the master/layout placeholders keep their 4:3 geometry (title stayed 9 in wide). `make_16x9()` in the script stretches the x/width of master and layout shapes that carry an explicit transform (inherited ones are skipped; scaling them too would double-scale).
- **Layouts**: a slide is always created from a layout (`prs.slides.add_slide(layout)`). The docs list the standard order: 0 Title, 1 Title and Content, 2 Section Header, 3 Two Content, 4 Comparison, 5 Title Only, 6 Blank, 7 Content with Caption, 8 Picture with Caption, but "there's no rule they have to appear in this order", so for custom templates look layouts up by `layout.name`.
- **Theme/master**: look comes from theme, slide master and layouts, so brand a deck by starting from a template file (`Presentation("brand.pptx")`), not by styling every shape. python-pptx has no API for creating new masters/themes; edit them in PowerPoint's Slide Master view. (PptxGenJS, by contrast, can define masters in code via `defineSlideMaster()`, per its docs.)
- **Notes** (innhold: se skillen `presentation-notes`): `slide.notes_slide.notes_text_frame.text = "..."` (tested; notes slide is created on first use, from the notes master).
- **Images**: `slide.shapes.add_picture(path, left, top)`; with only left/top the native size is used, so the script scales to fit a box preserving aspect ratio.
- **Charts**: `CategoryChartData` + `slide.shapes.add_chart(XL_CHART_TYPE..., x, y, cx, cy, data).chart` are native, editable charts (`add_chart` returns the graphic frame; `.chart` gives the chart).
- **Tables**: `shapes.add_table(rows, cols, left, top, width, height).table`, then `table.cell(r, c).text`.
- Placeholders left empty show "Click to add text" in edit mode; the script removes unused section-header placeholders.

## Visual checks (rendering)

- `soffice`/`libreoffice` and `pdftoppm` were **not installed** on this Mac; `brew` is available. Intended route (not run here): `brew install --cask libreoffice && brew install poppler`, then `soffice --headless --convert-to pdf --outdir /tmp/out deck.pptx` and `pdftoppm -r 80 -png /tmp/out/deck.pdf /tmp/out/slide`, then view the PNGs.
- Microsoft PowerPoint.app is installed. An AppleScript `save ... as save as PDF` attempt via `osascript` produced no file in my test (likely needs a permission prompt/sandbox access) — treat as unverified.
- `qlmanage -t` (Quick Look) hung on a .pptx in my test; don't rely on it.
- Without a renderer, validate structurally: reopen with `Presentation(path)`, assert every shape lies inside `prs.slide_width/height`, and check notes/text per slide.

## Sources opened while writing this

- python-pptx 1.0.0 docs: [Getting Started](https://python-pptx.readthedocs.io/en/latest/user/quickstart.html), [Presentations](https://python-pptx.readthedocs.io/en/latest/user/presentations.html), [Slides](https://python-pptx.readthedocs.io/en/latest/user/slides.html), [Charts](https://python-pptx.readthedocs.io/en/latest/user/charts.html), [Notes](https://python-pptx.readthedocs.io/en/latest/user/notes.html) (each read only in part, first few thousand characters).
- PptxGenJS: [Quick Start](https://gitbrent.github.io/PptxGenJS/docs/quick-start/), [Masters and Placeholders](https://gitbrent.github.io/PptxGenJS/docs/masters/). A Node alternative if code-defined masters are needed; not tested here.

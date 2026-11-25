---
name: presentation-review
description: Review PowerPoint (.pptx) presentations for quality before use. Checks accessibility (alt text, WCAG contrast, reading order, font sizes), consistency, text density, rendering, speaker notes and timing. Use when asked to review, QA, lint, or proof a presentation or slide deck.
---

# Presentation review

Review the deck and report findings; do not edit slides unless asked. Respond in the user's language (usually Norwegian).

## Workflow

1. Identify the deck(s) and audience, purpose and time slot. Ask/assume if unknown.
2. Run automated checks (see "Linting with python-pptx").
3. Render slides to images (`soffice --headless --convert-to pdf deck.pptx`, then `pdftoppm -r 50 -png deck.pdf out/slide`) and inspect visually. Write scratch output inside the repo, not `/tmp`.
4. Walk the checklist, then write the report.

## Checklist

### Accessibility
- [ ] Every meaningful picture, chart, diagram and SmartArt has concise alt text; decorative items are marked decorative. Alt text describes the message, not "image of".
- [ ] Contrast meets WCAG 2.x AA: 4.5:1 for normal text, 3:1 for large text (≥18 pt, or ≥14 pt bold) and for meaningful graphical parts (not every chart element; WCAG 1.4.11). Check text over images and gradients.
- [ ] Information is not conveyed by colour alone (add labels, patterns, shapes).
- [ ] Reading order (Selection Pane, bottom-to-top = read order) matches the visual order; title comes first.
- [ ] Every slide has a unique, descriptive title (use layout title placeholders).
- [ ] Use real layouts/placeholders, not loose text boxes; real tables with header rows, no merged/split cells, no blank cells for layout.
- [ ] Hyperlinks have meaningful text (not "click here"/raw URLs).
- [ ] Video has captions/transcript; no flashing content; animations are minimal.
- [ ] Fonts are legible: body ≥ 18 pt (prefer 24 pt), captions/footnotes ≥ 12 pt; sans-serif, avoid all-caps blocks.
- [ ] Norwegian legal context (IKT-forskriften, FOR-2013-06-21-732): private web solutions are required to meet WCAG 2.0 A/AA (excluding 1.2.3, 1.2.4, 1.2.5), not generally 2.1; public bodies follow EN 301 549 v3.2.1 (§ 4b). Presentations are documents, not web solutions, so treat this as context and WCAG 2.2 AA as the practical target. Verify the current wording on Lovdata.
- [ ] Run PowerPoint's Accessibility Checker (Review > Check Accessibility) as a cross-check.

### Consistency
- [ ] One theme: same fonts, colour palette, title position/size, margins, bullet style across slides.
- [ ] Content built on slide master/layouts; no manual overrides drifting from the template.
- [ ] Consistent capitalisation, punctuation, terminology, number/date formats and language (set proofing language, e.g. nb-NO).
- [ ] Logos, slide numbers and footers placed consistently; images aligned and not distorted.
- [ ] Spelling and grammar checked; no leftover placeholders, "lorem ipsum", TODOs or empty placeholders.

### Text density
- [ ] One main idea per slide; a headline stating the takeaway.
- [ ] Roughly ≤ 6 bullets and ≤ ~30–40 words per slide; no full paragraphs read aloud.
- [ ] Prefer visuals (simplified charts, diagrams) over tables of numbers; label charts directly, remove chart junk.
- [ ] Move detail to speaker notes, appendix or handout.

### Rendering
- [ ] Rendered output has no overflowing/clipped text, overlaps, or content outside the slide.
- [ ] Fonts are available on the presenting machine or embedded; fallback does not change layout.
- [ ] Images are sharp at projection size, with reasonable file size; correct aspect ratio (16:9 vs 4:3).
- [ ] Animations, transitions, embedded media and links work; embedded media is not just linked to missing local files.
- [ ] Check in slideshow mode and, if possible, on the target projector/screen. Keep a PDF backup.

### Speaker notes
- [ ] Each content slide has notes: key message, talking points, transitions, sources/data references.
- [ ] Notes are concise cues, not a verbatim script; no sensitive or internal remarks in a file that will be shared.
- [ ] Hidden slides, comments and metadata (author, revision history) reviewed before distribution.

### Rehearsal and timing
- [ ] Estimate duration: about 1–2 min per content slide (≈130–150 spoken words/min from notes); compare with the time slot and leave buffer for questions.
- [ ] Mark must-keep vs. cut-if-short slides; have an agenda/time checkpoints.
- [ ] Rehearse aloud at least once with a timer (PowerPoint Rehearse Timings / Presenter Coach); fix awkward transitions.
- [ ] Clear opening, structure signposting and closing with a call to action/summary.

## Linting with python-pptx

`pip install python-pptx`. Useful automated checks:

```python
from pptx import Presentation
from pptx.util import Pt
prs = Presentation("deck.pptx")
for i, s in enumerate(prs.slides, 1):
    if s.shapes.title is None or not s.shapes.title.text.strip():
        print(i, "missing title")
    if not (s.has_notes_slide and s.notes_slide.notes_text_frame is not None and s.notes_slide.notes_text_frame.text.strip()):
        print(i, "no speaker notes")
    words = 0
    for sh in s.shapes:
        if sh.shape_type == 13:  # picture
            descr = sh._element.xpath(".//p:cNvPr")[0].get("descr")
            if not descr:
                print(i, sh.name, "missing alt text")
        if sh.has_text_frame:
            words += len(sh.text_frame.text.split())
            for p in sh.text_frame.paragraphs:
                for r in p.runs:
                    if r.font.size and r.font.size < Pt(12):
                        print(i, sh.name, "font", r.font.size.pt, "pt")
    if words > 60:
        print(i, "dense:", words, "words")
```

Limits: sizes inherited from layouts/themes return `None`; contrast, overflow and reading order need rendering or manual inspection. Shape order in `s.shapes` is z-order, not necessarily reading order; verify in PowerPoint's Reading Order pane.

## Report format

```
# Review: <deck name>  (<n> slides, est. <x> min)
Summary: 2–3 sentences, overall verdict (Ready / Ready with fixes / Needs work).

## Critical (fix before presenting)
- Slide N – [Category] Problem → suggested fix
## Important
- ...
## Nice to have
- ...
## Passed checks
- Short list of areas that look good.
## Timing estimate
- Slides, notes word count, estimated minutes vs. slot.
```

Be specific (slide number, element, measured value such as contrast ratio or font size), prioritise by impact, and give one concrete fix per finding.

## Sources

- Microsoft: Make your PowerPoint presentations accessible to people with disabilities — https://support.microsoft.com/office/6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25
- Microsoft: Video — Improve accessibility with the Accessibility Checker — https://support.microsoft.com/office/a16f6de0-2f39-4a2b-8bd8-5ad801426c7f
- W3C WCAG 2.2: 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast, 1.1.1 Non-text Content, 1.3.2 Meaningful Sequence — https://www.w3.org/TR/WCAG22/
- Lovdata: Forskrift om universell utforming av IKT-løsninger — https://lovdata.no/dokument/SF/forskrift/2013-06-21-732
- Tilsynet for universell utforming av IKT (uutilsynet) — https://www.uutilsynet.no/
- python-pptx documentation — https://python-pptx.readthedocs.io/
- Presentation Zen / common guidance on one idea per slide and rehearsal (Garr Reynolds), and speaking-rate guidance of ~130–150 wpm.

## Notater

Skriv og vedlikehold foredragsnotater etter skillen `presentation-notes` (hybrid, fast mal per slide, kilder og «hvis du er bak»).

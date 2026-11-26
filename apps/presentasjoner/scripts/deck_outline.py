#!/usr/bin/env python3
"""Write a build_deck.py outline from a presentation's content (presentasjon.json).

Usage: deck_outline.py content/<folder> [outline.json]   (stdout when no file is given)

The outline builds the generic deck: the talk as this repository has it, in our own template
(maler/lmfaole-mal.pptx), with no trace of the employer's. The .pptx the talk was given from is not here,
so this is the one that can be downloaded.

What it does, and why it is this simple: the `text` keys of presentasjon.json are placeholder indexes in the
layouts of the private template, and nothing in this repository says what index 27 is. So the slide is
flattened the way the site shows it (src/views/SlideItem.tsx): the title, then every text in index order,
then the text boxes that are not a credit, the picture or the chart, the credits, the videos in words and
the links. Nothing is interpreted, so nothing of that template leaks in here.

Needs no packages. `build_deck.py` turns the outline into the .pptx, and `export.sh` runs both.
"""
import json
import re
import sys
from pathlib import Path

# Our own template's layouts, by the kind of slide build_deck.py makes.
LAYOUTS = {"title": "Forside", "section": "Skilleark", "bullets": "Innhold", "other": "Bilde"}

# A chart's one series takes the ink the design system draws a chart with (`--primary` in theme.css).
THEME = {"accent": "171717"}

# The same words as `isCredit` in src/lib/deck.ts: a text box that credits a picture, not a text of the slide.
CREDIT = re.compile(r"^(foto|bilde|illustrasjon|video|grafikk)\s*:", re.IGNORECASE)

SECTION_LAYOUTS = ("Skilleark", "Siste side")


def text_of(paragraph):
    """The words of a paragraph: a string, [text, level], or a bullet that has been given a link."""
    if isinstance(paragraph, str):
        return paragraph
    return paragraph["text"] if isinstance(paragraph, dict) else paragraph[0]


def level_of(paragraph):
    if isinstance(paragraph, str):
        return 0
    return int(paragraph.get("level", 0)) if isinstance(paragraph, dict) else int(paragraph[1])


def is_credit(box):
    return CREDIT.match(" ".join(text_of(p) for p in box).strip()) is not None


def texts(slide):
    """Every text of the slide in the order the site shows it: the placeholders by index, then the text boxes."""
    by_index = sorted((slide.get("text") or {}).items(), key=lambda item: int(item[0]))
    boxes = [box for box in slide.get("textboxes") or [] if not is_credit(box)]
    return [paragraph for _, paragraphs in by_index for paragraph in paragraphs] + [p for box in boxes for p in box]


def credits(slide):
    return [" ".join(text_of(p) for p in box) for box in slide.get("textboxes") or [] if is_credit(box)]


def kind_of(slide):
    layout = slide.get("layout") or ""
    if layout.startswith("Forside"):
        return "title"
    if layout.startswith(SECTION_LAYOUTS):
        return "section"
    return "bullets"


def link_bullets(bullets, links):
    """A link belongs to the line that is its words; one that has no line of its own becomes a line of its own."""
    out = list(bullets)
    for link in links:
        for index, item in enumerate(out):
            if text_of(item) == link["text"] and not isinstance(item, dict):
                out[index] = {"text": text_of(item), "level": level_of(item), "url": link["url"]}
                break
        else:
            out.append({"text": f"{link['text']}: {link['url']}", "level": 1, "url": link["url"]})
    return out


def picture_of(slide, folder):
    """The slide's first picture as an absolute path, with its alt text. A decorative picture carries nothing to read."""
    for item in slide.get("pictures") or []:
        if item.get("decorative") or not item.get("file"):
            continue
        path = folder / item["file"]
        if not path.exists():
            print(f"slide {slide['n']}: no picture at {path}", file=sys.stderr)
            continue
        return str(path.resolve()), item.get("alt") or ""
    return None, None


def chart_of(slide):
    """The slide's first chart as build_deck.py wants it: one list of values per series name."""
    for item in slide.get("charts") or []:
        series = {one["name"] or "Verdi": list(one["values"]) for one in item["series"]}
        kind = item["kind"] if item["kind"] in ("bar", "column", "line", "pie") else "column"
        return {"kind": kind, "categories": list(item["categories"]), "series": series}, item.get("title")
    return None, None


def slide_outline(slide, folder):
    kind = kind_of(slide)
    lines = texts(slide)
    title = slide.get("title")
    if title is None:  # a slide whose words are all in its placeholders (the last one): the first line names it
        title = text_of(lines[0]) if lines else ""
        lines = lines[1:]
    out = {"type": kind, "title": title}
    if kind in ("title", "section"):
        if lines:
            out["subtitle"] = "\n".join(text_of(line) for line in lines)
    else:
        for credit in credits(slide):
            lines.append([credit, 1])
        for media in slide.get("media") or []:
            lines.append([f"{'Video' if media['kind'] == 'video' else 'Lyd'}: {media['alt']}", 1])
        out["bullets"] = link_bullets(lines, slide.get("links") or [])
        image, alt = picture_of(slide, folder)
        chart, chart_title = chart_of(slide)
        if chart is not None:
            out["chart"] = chart
            out["alt"] = alt or chart_title or title
        elif image is not None:
            out["image"] = image
            out["alt"] = alt
    if slide.get("hidden"):
        out["hidden"] = True
    if slide.get("notes"):
        out["notes"] = slide["notes"]
    return out


MOST_CREDITS = 5


def credit_slides(folder):
    """The last slides: the pictures' credits, since the generic deck publishes third party CC pictures anew.

    A credit is a long line with a link in it, so only a few go on a slide; the rest continue on the next.
    """
    path = folder / "bilder" / "KREDITERING.md"
    if not path.exists():
        return []
    lines = [line[2:].strip() for line in path.read_text(encoding="utf-8").splitlines() if line.startswith("- ")]
    return [{"type": "bullets", "title": "Bildekreditering" if start == 0 else "Bildekreditering, fortsatt",
             "bullets": lines[start:start + MOST_CREDITS]}
            for start in range(0, len(lines), MOST_CREDITS)]


def outline(folder):
    deck = json.loads((folder / "presentasjon.json").read_text(encoding="utf-8"))
    if deck.get("aspect") not in (None, "16:9"):
        print(f"the deck is {deck['aspect']}, the template is 16:9", file=sys.stderr)
    slides = [slide_outline(slide, folder) for slide in deck["slides"]] + credit_slides(folder)
    return {"theme": THEME, "layouts": LAYOUTS, "slides": slides}


def main(argv):
    if not 2 <= len(argv) <= 3:
        return __doc__
    folder = Path(argv[1])
    if not (folder / "presentasjon.json").exists():
        return f"no presentasjon.json in {folder}"
    text = json.dumps(outline(folder), ensure_ascii=False, indent=2) + "\n"
    if len(argv) == 3:
        Path(argv[2]).write_text(text, encoding="utf-8")
        print(f"Wrote {argv[2]}")
    else:
        sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

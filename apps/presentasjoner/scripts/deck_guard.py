#!/usr/bin/env python3
"""Refuse a .pptx that carries the employer's template, before it is uploaded to a public address.

Usage: deck_guard.py <deck.pptx> [--template maler/lmfaole-mal.pptx] [--word <word> ...]

The generic deck and the deck the talk was given from have the same file name, and the R2 key is that name:
.gitignore guards git, not the bucket. So `export.sh` runs this on exactly the file it is about to upload.

Two checks, and the second is the one that does not depend on a word list:

1. No part that makes up the look -- the theme, the master, the layouts, the document properties -- mentions
   the employer. Those parts, not the slides, are where a template leaves its traces.
2. Every layout of the deck is a layout of our own template. A deck built on someone else's master cannot be,
   whatever it is called, so this catches a template whose words we never thought to list.

Needs no packages, so it can be run on any .pptx anywhere.
"""
import re
import sys
import zipfile
from pathlib import Path

# The traces a template leaves: the look, not the words of the talk. A slide may well name the employer.
LOOK = ("ppt/theme/", "ppt/slideLayouts/", "ppt/slideMasters/", "docProps/")

# The employer's name is no secret -- it is in the content of the talk; its template is what must not be published.
WORDS = ("fremtind",)

LAYOUT_NAME = re.compile(rb"<p:cSld[^>]*\sname=\"([^\"]*)\"")


def layout_names(deck):
    """The name of every slide layout in the file, as PowerPoint's Design view shows them."""
    with zipfile.ZipFile(deck) as zf:
        names = set()
        for part in zf.namelist():
            if re.fullmatch(r"ppt/slideLayouts/slideLayout\d+\.xml", part):
                found = LAYOUT_NAME.search(zf.read(part))
                names.add(found.group(1).decode("utf-8", "replace") if found else f"<nameless {part}>")
        return names


def word_hits(deck, words):
    """Every (part, word) where a part of the look mentions a word it must not."""
    with zipfile.ZipFile(deck) as zf:
        return [(part, word)
                for part in zf.namelist() if part.startswith(LOOK) and not part.endswith("/")
                for word in words if word.encode() in zf.read(part).lower()]


def problems(deck, template, words):
    out = [f"{part} mentions {word!r}" for part, word in word_hits(deck, words)]
    if template is not None:
        ours = layout_names(template)
        out += [f"the layout {name!r} is not one of our template's ({', '.join(sorted(ours))})"
                for name in sorted(layout_names(deck) - ours)]
    return out


def main(argv):
    args, template, words = argv[1:], None, list(WORDS)
    rest = []
    while args:
        head, *args = args
        if head == "--template" and args:
            template, *args = args
        elif head == "--word" and args:
            word, *args = args
            words.append(word.lower())
        else:
            rest.append(head)
    if len(rest) != 1:
        return __doc__
    deck = Path(rest[0])
    if not deck.is_file():
        return f"no deck at {deck}"
    if template is not None and not Path(template).is_file():
        return f"no template at {template}"
    found = problems(deck, Path(template) if template else None, words)
    if found:
        print(f"{deck.name} carries the employer's template, so it is not published:", file=sys.stderr)
        for line in found:
            print(f"  {line}", file=sys.stderr)
        return 1
    print(f"{deck.name}: nothing of the employer's template in it")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

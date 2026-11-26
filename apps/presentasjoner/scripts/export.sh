#!/usr/bin/env bash
# Builds the generic deck of a talk from content/<slug>/presentasjon.json and our own template, and puts it and
# a PDF of it in the R2 bucket `presentasjoner` at `<slug>/<the .pptx's name>.<ending>`, where the site serves
# them (`/presentasjoner/<slug>/…`). The .pptx the talk was given from is never touched and never uploaded.
# macOS with Microsoft PowerPoint (it makes the PDF), and wrangler logged in (`npx wrangler login`).
#
# Usage: scripts/export.sh <slug> [--pptx] [--pdf]        (no flag does both; <slug> is the folder in content/)
#
# The deck is built in a directory of its own that this script makes, and it uploads exactly those files: it
# takes no path, so no deck of yours can be published by mistake. Before anything is uploaded, every file goes
# through scripts/deck_guard.py, which refuses a deck that carries the employer's template.
set -euo pipefail

here="$(cd "$(dirname "$0")/.." && pwd)"
template="$here/maler/lmfaole-mal.pptx"
python="${PPTX_PYTHON:-/tmp/pptxvenv/bin/python}"
slug=""
want_pptx=""
want_pdf=""

for arg in "$@"; do
  case "$arg" in
    --pptx) want_pptx=1 ;;
    --pdf) want_pdf=1 ;;
    --all) want_pptx=1; want_pdf=1 ;;
    -*) echo "Ukjent flagg: $arg" >&2; exit 2 ;;
    *) if [ -n "$slug" ]; then echo "Bruk: $0 <slug> [--pptx] [--pdf]" >&2; exit 2; fi; slug="$arg" ;;
  esac
done
if [ -z "$slug" ]; then
  echo "Bruk: $0 <slug> [--pptx] [--pdf]" >&2
  exit 2
fi
if [ -z "$want_pptx$want_pdf" ]; then
  want_pptx=1
  want_pdf=1
fi

if [ ! -f "$here/content/$slug/presentasjon.json" ]; then
  echo "Finner ikke content/$slug/presentasjon.json: <slug> er mappen i content/" >&2
  exit 1
fi
if [ ! -f "$template" ]; then
  echo "Finner ikke maler/lmfaole-mal.pptx: den lages for hånd i PowerPoints utformingsvisning (se README)" >&2
  exit 1
fi
if ! "$python" -c 'import pptx' 2>/dev/null; then
  echo "python-pptx mangler i $python. Lag miljøet, eller sett PPTX_PYTHON:" >&2
  echo "  python3 -m venv /tmp/pptxvenv && /tmp/pptxvenv/bin/pip install python-pptx pillow" >&2
  exit 1
fi

name="$(python3 -c 'import json, sys; print(json.load(open(sys.argv[1], encoding="utf-8"))["file"])' "$here/content/$slug/presentasjon.json")"
stem="${name%.*}"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
pptx="$work/$stem.pptx"

python3 "$here/scripts/deck_outline.py" "$here/content/$slug" "$work/outline.json"
"$python" "$here/scripts/build_deck.py" "$work/outline.json" "$pptx" --template "$template"
python3 "$here/scripts/deck_guard.py" "$pptx" --template "$template"

if [ -n "$want_pdf" ]; then
  # PowerPoint is sandboxed: it can only write inside its own container.
  outdir="$HOME/Library/Containers/com.microsoft.Powerpoint/Data/tmp-pdf"
  pdf="$outdir/$stem.pdf"
  mkdir -p "$outdir"
  rm -f "$pdf"
  trap 'rm -rf "$work"; rm -f "$pdf"' EXIT

  # The deck has to be open in PowerPoint to be saved as PDF.
  open -a "Microsoft PowerPoint" "$pptx"
  for _ in $(seq 1 30); do
    if osascript -e "tell application \"Microsoft PowerPoint\" to get name of presentation \"$stem.pptx\"" >/dev/null 2>&1; then break; fi
    sleep 1
  done
  osascript -e "tell application \"Microsoft PowerPoint\" to save presentation \"$stem.pptx\" in (POSIX file \"$pdf\") as save as PDF"
  osascript -e "tell application \"Microsoft PowerPoint\" to close presentation \"$stem.pptx\" saving no" >/dev/null 2>&1 || true
  if [ ! -s "$pdf" ]; then
    echo "PowerPoint laget ingen PDF ($pdf)" >&2
    exit 1
  fi
fi

# The generic deck is kept in the repository too (content/<slug>/nedlasting/), so it can be opened locally and its history is in git.
# Its own folder, so the deck the talk was given from can never be mistaken for it: same name, other place.
mkdir -p "$here/content/$slug/nedlasting"
cp "$pptx" "$here/content/$slug/nedlasting/$stem.pptx"
if [ -n "$want_pdf" ]; then cp "$pdf" "$here/content/$slug/nedlasting/$stem.pdf"; fi
echo "Lagret i repoet: apps/presentasjoner/content/$slug/nedlasting/"

if [ -n "$want_pptx" ]; then
  (cd "$here" && npx wrangler r2 object put "presentasjoner/$slug/$stem.pptx" --file "$pptx" \
    --content-type application/vnd.openxmlformats-officedocument.presentationml.presentation --remote)
  echo "Lastet opp: https://lmfaole.party/presentasjoner/$slug/$stem.pptx"
fi
if [ -n "$want_pdf" ]; then
  (cd "$here" && npx wrangler r2 object put "presentasjoner/$slug/$stem.pdf" --file "$pdf" --content-type application/pdf --remote)
  echo "Lastet opp: https://lmfaole.party/presentasjoner/$slug/$stem.pdf"
fi

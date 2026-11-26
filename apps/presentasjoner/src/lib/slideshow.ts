/**
 * The talk as a slideshow in the browser: one slide at a time, with keys, buttons and swipes to move between them. The design system has no
 * slideshow, so this is the one place the app has CSS and a script of its own, and it is a file, not a page of the site: it is sent with the
 * `.html` (`?vis`) and needs nothing from the net but the fonts. Pure, so `slideshow.test.ts` runs it as it is: the markup of each slide and the
 * site's stylesheet are handed in, by the endpoint that has them.
 */
import { escapeHtml } from './html.ts'

export interface ShowSlide {
  n: number
  title: string
  /** A slide that is hidden in the talk and kept in reserve: it comes after the others and says so. */
  reserve: boolean
  /** The slide's markup, from the same components as the page. */
  body: string
  /** The speaker's notes as markup, or empty. */
  notes: string
}

/** What the slideshow adds to the site's stylesheet: the stage, the bar and the way the slides are laid out. Tokens of the design system only. */
export const SLIDESHOW_CSS = `
html{height:100%}
body{margin:0;min-height:100%;background:var(--background);color:var(--foreground)}
.show-slide{box-sizing:border-box;max-width:64rem;margin:0 auto;padding:2rem 1.5rem 6rem}
.show-slide>header{margin-bottom:1.5rem}
.show-kicker{margin:0;font-size:.875rem;color:var(--muted-foreground)}
.show-slide h2{margin:.25rem 0 0;font-size:clamp(1.75rem,4.5vw,3rem);line-height:1.15;font-weight:500}
.show-slide img{display:block;max-width:100%;max-height:60vh;height:auto;margin:1rem 0;border-radius:.5rem}
.show-notes{margin-top:2rem;padding-top:1rem;border-top:1px solid var(--border);font-size:.9375rem}
.js .show-slide[hidden]{display:none}
.js .show-notes{display:none}
.js.show-with-notes .show-notes{display:block}
.show-bar{display:none}
.js .show-bar{position:fixed;inset:auto 0 0 0;display:flex;gap:.5rem;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:.5rem 1rem;background:var(--background);border-top:1px solid var(--border)}
.show-bar button,.show-bar a{font:inherit;color:inherit;background:transparent;border:1px solid var(--border);border-radius:.5rem;padding:.5rem .875rem;min-height:2.75rem;min-width:2.75rem;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
.show-bar button:hover,.show-bar a:hover{background:var(--muted)}
.show-bar button:focus-visible,.show-bar a:focus-visible{outline:2px solid var(--foreground);outline-offset:2px}
.show-bar button[disabled]{opacity:.45;cursor:default}
.show-group{display:flex;gap:.5rem;align-items:center}
.show-count{min-width:4.5rem;text-align:center}
`

/** The script: shows one slide, from the address' `#<n>`, and moves on keys, buttons and swipes. No library, nothing stored, nothing sent. */
export const SLIDESHOW_JS = `
(() => {
  const root = document.documentElement
  root.classList.add('js')
  const slides = [...document.querySelectorAll('.show-slide')]
  const count = document.getElementById('show-count')
  const prev = document.getElementById('show-prev')
  const next = document.getElementById('show-next')
  const full = document.getElementById('show-full')
  const notes = document.getElementById('show-notes')
  let at = 0
  const fromHash = () => {
    const found = slides.findIndex((slide) => '#' + slide.dataset.n === location.hash)
    return found === -1 ? 0 : found
  }
  const show = (index, push) => {
    at = Math.min(Math.max(index, 0), slides.length - 1)
    slides.forEach((slide, i) => { slide.hidden = i !== at })
    const slide = slides[at]
    count.textContent = (slide.dataset.reserve === 'true' ? 'Reserve ' : '') + (at + 1) + ' / ' + slides.length
    prev.disabled = at === 0
    next.disabled = at === slides.length - 1
    if (push) history.replaceState(null, '', '#' + slide.dataset.n)
    window.scrollTo(0, 0)
  }
  const toggleFull = () => {
    if (!document.fullscreenEnabled) return
    if (document.fullscreenElement) document.exitFullscreen()
    else root.requestFullscreen()
  }
  const toggleNotes = () => {
    const on = root.classList.toggle('show-with-notes')
    notes.setAttribute('aria-pressed', String(on))
  }
  prev.addEventListener('click', () => show(at - 1, true))
  next.addEventListener('click', () => show(at + 1, true))
  notes.addEventListener('click', toggleNotes)
  if (document.fullscreenEnabled) full.addEventListener('click', toggleFull)
  else full.hidden = true
  addEventListener('hashchange', () => show(fromHash(), false))
  addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    const target = event.target
    const onControl = target instanceof HTMLElement && target.closest('button, a, summary, input, textarea, select')
    const key = event.key
    if (key === 'ArrowRight' || key === 'PageDown' || (key === ' ' && !onControl)) show(at + 1, true)
    else if (key === 'ArrowLeft' || key === 'PageUp') show(at - 1, true)
    else if (key === 'Home') show(0, true)
    else if (key === 'End') show(slides.length - 1, true)
    else if (key === 'f' || key === 'F') toggleFull()
    else if (key === 'n' || key === 'N') toggleNotes()
    else return
    event.preventDefault()
  })
  let startX = 0
  let startY = 0
  addEventListener('touchstart', (event) => { startX = event.changedTouches[0].clientX; startY = event.changedTouches[0].clientY }, { passive: true })
  addEventListener('touchend', (event) => {
    const dx = event.changedTouches[0].clientX - startX
    const dy = event.changedTouches[0].clientY - startY
    if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy)) show(at + (dx < 0 ? 1 : -1), true)
  }, { passive: true })
  show(fromHash(), false)
})()
`

/**
 * The slideshow as one file: the site's stylesheet and ours inline, every slide as a section, and the bar with the buttons. Without script
 * every slide is shown one under the other, so nothing is lost; with it, one at a time. The first slide is shown on opening.
 */
export function slideshowDocument({
  title,
  description,
  css,
  slides,
  backHref,
}: {
  title: string
  description?: string | undefined
  css: string
  slides: readonly ShowSlide[]
  /** Where «Til oversikten» goes: the talk's page. */
  backHref: string
}): string {
  const sections = slides.map(
    (slide) =>
      `<section class="show-slide" id="slide-${slide.n}" data-n="${slide.n}" data-reserve="${slide.reserve}" aria-label="${escapeHtml(`Slide ${slide.n}: ${slide.title}`)}">` +
      `<header><p class="show-kicker">${slide.reserve ? 'Reserveslide' : `Slide ${slide.n}`}</p><h2>${escapeHtml(slide.title)}</h2></header>` +
      slide.body +
      (slide.notes === '' ? '' : `<aside class="show-notes" aria-label="Notater"><h3>Notater</h3>${slide.notes}</aside>`) +
      '</section>',
  )
  return [
    '<!doctype html>',
    '<html lang="nb">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    `<title>${escapeHtml(title)}</title>`,
    ...(description === undefined ? [] : [`<meta name="description" content="${escapeHtml(description)}">`]),
    '<meta name="color-scheme" content="light dark">',
    `<style>${css}${SLIDESHOW_CSS}</style>`,
    '</head>',
    '<body>',
    `<main>${sections.join('')}</main>`,
    '<nav class="show-bar" aria-label="Slideshow">',
    `<a href="${escapeHtml(backHref)}">Til oversikten</a>`,
    '<div class="show-group">',
    '<button type="button" id="show-prev" aria-label="Forrige slide" disabled>←</button>',
    '<span class="show-count" id="show-count" role="status" aria-live="polite"></span>',
    '<button type="button" id="show-next" aria-label="Neste slide">→</button>',
    '</div>',
    '<div class="show-group">',
    '<button type="button" id="show-notes" aria-pressed="false" title="Vis eller skjul notater (N)">Notater</button>',
    '<button type="button" id="show-full" title="Fullskjerm (F)">Fullskjerm</button>',
    '</div>',
    '</nav>',
    `<script>${SLIDESHOW_JS}</script>`,
    '</body>',
    '</html>',
    '',
  ].join('\n')
}

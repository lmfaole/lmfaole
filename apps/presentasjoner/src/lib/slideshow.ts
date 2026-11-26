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

/** What the slideshow adds to the site's stylesheet: the stage, the bar, the progress line, the overview and the move between slides. Tokens of the design system only. */
export const SLIDESHOW_CSS = `
html{height:100%}
body{margin:0;min-height:100%;background:var(--background);color:var(--foreground)}
.show-slide{box-sizing:border-box;container-type:inline-size;max-width:72rem;margin:0 auto;padding:2rem 1.5rem 6rem}
.show-slide>header{margin-bottom:1.5rem}
.show-kicker{margin:0;font-size:.875rem;color:var(--muted-foreground)}
.show-slide h2{margin:.25rem 0 0;font-size:clamp(1.75rem,4.5vw + .5rem,4rem);line-height:1.1;font-weight:500;text-wrap:balance}
.show-slide img{display:block;max-width:100%;max-height:60dvh;height:auto;margin:1rem 0;border-radius:.5rem}
.show-notes{margin-top:2rem;padding-top:1rem;border-top:1px solid var(--border);font-size:.9375rem}
.show-bar,.show-progress{display:none}
.js body{overflow:hidden}
.js main{position:fixed;inset:0;display:flex;overflow-x:auto;overflow-y:hidden;overscroll-behavior:contain;scroll-snap-type:x mandatory;scrollbar-width:none}
.js main::-webkit-scrollbar{display:none}
.js .show-slide{flex:0 0 100%;height:100%;max-width:none;margin:0;padding:max(2rem,6dvh) max(1.5rem,8vw) 6rem;overflow-y:auto;display:flex;flex-direction:column;justify-content:center;background:var(--background);scroll-snap-align:start;scroll-snap-stop:always}
.js .show-slide>*{width:100%;max-width:72rem;margin-inline:auto}
.js .show-notes{display:none}
.js.show-with-notes .show-notes{display:block}
.js .show-progress{position:fixed;inset:0 0 auto 0;display:block;height:.25rem;background:var(--muted);z-index:2}
.js .show-progress::after{content:"";display:block;height:100%;background:var(--foreground);transform-origin:left;transform:scaleX(var(--progress,0));transition:transform var(--motion-duration-slow) var(--motion-ease-standard)}
.js .show-bar{position:fixed;inset:auto 0 0 0;z-index:2;display:flex;gap:.5rem;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:.5rem 1rem;background:var(--background);border-top:1px solid var(--border);transition:opacity var(--motion-duration-enter) var(--motion-ease-standard),translate var(--motion-duration-enter) var(--motion-ease-standard)}
.js.show-idle .show-bar:not(:focus-within){opacity:0;translate:0 100%}
.js.show-idle{cursor:none}
.show-bar button,.show-bar a{font:inherit;color:inherit;background:transparent;border:1px solid var(--border);border-radius:.5rem;padding:.5rem .875rem;min-height:2.75rem;min-width:2.75rem;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
.show-bar button:hover,.show-bar a:hover{background:var(--muted)}
.show-bar button:focus-visible,.show-bar a:focus-visible,.show-overview a:focus-visible,.show-overview button:focus-visible{outline:2px solid var(--foreground);outline-offset:2px}
.show-bar button[disabled]{opacity:.45;cursor:default}
.show-group{display:flex;gap:.5rem;align-items:center}
.show-count{min-width:4.5rem;text-align:center;font-variant-numeric:tabular-nums}
.show-overview{width:min(60rem,92vw);max-height:84dvh;padding:1.5rem;border:1px solid var(--border);border-radius:1rem;background:var(--background);color:var(--foreground)}
.show-overview::backdrop{background:oklch(0% 0 0 / .55)}
.show-overview[open]{transition:opacity var(--motion-duration-enter) var(--motion-ease-enter),scale var(--motion-duration-enter) var(--motion-ease-enter)}
@starting-style{.show-overview[open]{opacity:0;scale:.97}}
.show-overview h2{margin:0 0 1rem;font-size:1.25rem}
.show-overview ol{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:.5rem}
.show-overview a{display:flex;gap:.5rem;padding:.75rem;border:1px solid var(--border);border-radius:.5rem;color:inherit;text-decoration:none;min-height:2.75rem}
.show-overview a:hover,.show-overview a[aria-current=true]{background:var(--muted)}
.show-overview small{color:var(--muted-foreground);white-space:nowrap}
.show-overview form{margin:1rem 0 0;display:flex;justify-content:flex-end}
.show-overview button{font:inherit;color:inherit;background:transparent;border:1px solid var(--border);border-radius:.5rem;padding:.5rem .875rem;min-height:2.75rem;cursor:pointer}
/* CSS carousel (Chrome 135+): the browser's own buttons and markers on the track; elsewhere the bar and the script do it */
@supports selector(::scroll-button(*)) and selector(::scroll-marker){
  .js main{scroll-marker-group:after}
  .js .show-progress{display:none}
  .js main::scroll-marker-group{position:fixed;inset:0 0 auto 0;z-index:3;display:flex;gap:1px;height:.375rem}
  .js .show-slide::scroll-marker{content:"";flex:1;background:var(--muted);border-radius:0;outline-offset:-2px}
  .js .show-slide::scroll-marker:hover{background:var(--muted-foreground)}
  .js .show-slide::scroll-marker:target-current{background:var(--foreground)}
  .js .show-slide::scroll-marker:focus-visible{outline:2px solid var(--foreground)}
  .js main::scroll-button(left),.js main::scroll-button(right){position:fixed;top:50%;translate:0 -50%;z-index:3;width:3rem;height:3rem;border:1px solid var(--border);border-radius:50%;background:var(--background);color:var(--foreground);font:inherit;font-size:1.25rem;cursor:pointer;opacity:.7;transition:opacity var(--motion-duration-fast) var(--motion-ease-standard)}
  .js main::scroll-button(left){content:"←" / "Forrige slide";left:.75rem}
  .js main::scroll-button(right){content:"→" / "Neste slide";right:.75rem}
  .js main::scroll-button(*):hover,.js main::scroll-button(*):focus-visible{opacity:1}
  .js main::scroll-button(*):focus-visible{outline:2px solid var(--foreground);outline-offset:2px}
  .js main::scroll-button(*):disabled{opacity:.25;cursor:default}
}
@media (prefers-reduced-motion:reduce){
  .js .show-progress::after,.js .show-bar{transition:none}
}
`

/** The script: shows one slide, from the address' `#<n>`, and moves on keys, buttons and swipes, with a scroll-snap track between slides. No library, nothing stored, nothing sent. */
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
  const overview = document.getElementById('show-overview')
  const overviewButton = document.getElementById('show-overview-open')
  const links = [...overview.querySelectorAll('a')]
  const track = document.querySelector('main')
  const calm = matchMedia('(prefers-reduced-motion: reduce)')
  let at = 0
  const fromHash = () => {
    const found = slides.findIndex((slide) => '#' + slide.dataset.n === location.hash)
    return found === -1 ? 0 : found
  }
  const render = (index, push) => {
    at = index
    slides.forEach((slide, i) => { slide.inert = i !== at })
    const slide = slides[at]
    count.textContent = (slide.dataset.reserve === 'true' ? 'Reserve ' : '') + (at + 1) + ' / ' + slides.length
    prev.disabled = at === 0
    next.disabled = at === slides.length - 1
    root.style.setProperty('--progress', slides.length < 2 ? 1 : at / (slides.length - 1))
    links.forEach((link, i) => { if (i === at) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current') })
    if (push) history.replaceState(null, '', '#' + slide.dataset.n)
    slide.scrollTop = 0
  }
  const show = (index, push, instant) => {
    const to = Math.min(Math.max(index, 0), slides.length - 1)
    render(to, push)
    slides[to].scrollIntoView({ behavior: instant || calm.matches ? 'instant' : 'smooth', inline: 'start', block: 'nearest' })
  }
  const watcher = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const i = slides.indexOf(entry.target)
      if (entry.isIntersecting && i !== at) render(i, true)
    })
  }, { root: track, threshold: 0.6 })
  slides.forEach((slide) => watcher.observe(slide))
  const toggleFull = () => {
    if (!document.fullscreenEnabled) return
    if (document.fullscreenElement) document.exitFullscreen()
    else root.requestFullscreen()
  }
  const toggleNotes = () => {
    const on = root.classList.toggle('show-with-notes')
    notes.setAttribute('aria-pressed', String(on))
  }
  const openOverview = () => { if (!overview.open) overview.showModal() }
  prev.addEventListener('click', () => show(at - 1, true))
  next.addEventListener('click', () => show(at + 1, true))
  notes.addEventListener('click', toggleNotes)
  overviewButton.addEventListener('click', openOverview)
  links.forEach((link, i) => link.addEventListener('click', (event) => { event.preventDefault(); overview.close(); show(i, true) }))
  if (document.fullscreenEnabled) full.addEventListener('click', toggleFull)
  else full.hidden = true
  addEventListener('hashchange', () => show(fromHash(), false))
  addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || overview.open) return
    const target = event.target
    const onControl = target instanceof HTMLElement && target.closest('button, a, summary, input, textarea, select')
    const key = event.key
    if (key === 'ArrowRight' || key === 'PageDown' || (key === ' ' && !onControl)) show(at + 1, true)
    else if (key === 'ArrowLeft' || key === 'PageUp') show(at - 1, true)
    else if (key === 'Home') show(0, true)
    else if (key === 'End') show(slides.length - 1, true)
    else if (key === 'f' || key === 'F') toggleFull()
    else if (key === 'n' || key === 'N') toggleNotes()
    else if (key === 'o' || key === 'O' || key === 'g' || key === 'G') openOverview()
    else return
    event.preventDefault()
  })
  let idle
  const wake = () => {
    root.classList.remove('show-idle')
    clearTimeout(idle)
    idle = setTimeout(() => { if (document.fullscreenElement) root.classList.add('show-idle') }, 2500)
  }
  addEventListener('pointermove', wake)
  addEventListener('keydown', wake)
  let startX = 0
  let startY = 0
  addEventListener('touchstart', (event) => { startX = event.changedTouches[0].clientX; startY = event.changedTouches[0].clientY }, { passive: true })
  addEventListener('touchend', (event) => {
    const dx = event.changedTouches[0].clientX - startX
    const dy = event.changedTouches[0].clientY - startY
    if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy)) show(at + (dx < 0 ? 1 : -1), true)
  }, { passive: true })
  show(fromHash(), false, true)
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
    '<div class="show-progress" aria-hidden="true"></div>',
    `<main>${sections.join('')}</main>`,
    '<nav class="show-bar" aria-label="Slideshow">',
    `<a href="${escapeHtml(backHref)}">Til oversikten</a>`,
    '<div class="show-group">',
    '<button type="button" id="show-prev" aria-label="Forrige slide" disabled>←</button>',
    '<span class="show-count" id="show-count" role="status" aria-live="polite"></span>',
    '<button type="button" id="show-next" aria-label="Neste slide">→</button>',
    '</div>',
    '<div class="show-group">',
    '<button type="button" id="show-overview-open" title="Oversikt (O)">Oversikt</button>',
    '<button type="button" id="show-notes" aria-pressed="false" title="Vis eller skjul notater (N)">Notater</button>',
    '<button type="button" id="show-full" title="Fullskjerm (F)">Fullskjerm</button>',
    '</div>',
    '</nav>',
    '<dialog class="show-overview" id="show-overview" aria-labelledby="show-overview-title">',
    '<h2 id="show-overview-title">Oversikt</h2>',
    `<ol>${slides.map((slide) => `<li><a href="#${slide.n}"><small>${slide.reserve ? 'R' : ''}${slide.n}</small><span>${escapeHtml(slide.title)}</span></a></li>`).join('')}</ol>`,
    '<form method="dialog"><button>Lukk</button></form>',
    '</dialog>',
    `<script>${SLIDESHOW_JS}</script>`,
    '</body>',
    '</html>',
    '',
  ].join('\n')
}

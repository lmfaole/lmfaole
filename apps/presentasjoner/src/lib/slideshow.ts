/**
 * The talk as a slideshow in the browser: one slide at a time, with keys, buttons and swipes to move between them. The design system has no
 * slideshow, so this is the one place the app has CSS and a script of its own, and it is a file, not a page of the site: it is sent with the
 * `.html` (`?vis`) and needs nothing from the net but the fonts. Pure, so `slideshow.test.ts` runs it as it is: the markup of each slide and the
 * site's stylesheet are handed in, by the endpoint that has them.
 */
import { escapeHtml } from './html.ts'

/** The fixed arrangements a slide has, as in the template: each has its own places for the parts (`.show-stage[data-layout]`). */
export type ShowLayout = 'cover' | 'closing' | 'section-dark' | 'section-light' | 'picture-left' | 'picture-right' | 'picture-edge' | 'content'

export interface ShowSlide {
  n: number
  title: string
  /** A slide that is hidden in the talk and kept in reserve: it comes after the others and says so. */
  reserve: boolean
  layout: ShowLayout
  /** The line over the title, as plain text, or empty. */
  kicker: string
  /** The slide's text, links and videos in words, as markup from the same components as the page, or empty. */
  body: string
  /** The charts and pictures, as markup, or empty: they have their own place in the layout. */
  side: string
  /** The source and the credits, as markup, or empty: they sit at the foot. */
  foot: string
  /** The speaker's notes as markup, or empty. */
  notes: string
}

/** What the slideshow adds to the site's stylesheet: the stage, the bar, the progress line, the overview and the move between slides. Tokens of the design system only. */
export const SLIDESHOW_CSS = `
html{height:100%}
body{margin:0;min-height:100%;background:var(--background);color:var(--foreground)}
.show-slide{box-sizing:border-box;max-width:72rem;margin:0 auto;padding:2rem 1.5rem 6rem}
.show-kicker{margin:0;font-size:.875rem;color:var(--muted-foreground)}
.show-slide h2{margin:.25rem 0 0;font-size:clamp(1.75rem,4.5vw + .5rem,4rem);line-height:1.1;font-weight:500;text-wrap:balance}
.show-slide img{display:block;max-width:100%;max-height:60dvh;height:auto;margin:1rem 0;border-radius:.5rem}
.show-notes{margin-top:2rem;padding-top:1rem;border-top:1px solid var(--border);font-size:.9375rem}
.show-bar,.show-progress{display:none}
.js body{overflow:hidden}
.js main{position:fixed;inset:0;display:flex;overflow-x:auto;overflow-y:hidden;overscroll-behavior:contain;scroll-snap-type:x mandatory;scrollbar-width:none}
.js main::-webkit-scrollbar{display:none}
.js .show-slide{flex:0 0 100%;height:100%;max-width:none;margin:0;padding:0;overflow:hidden;position:relative;display:grid;place-items:center;background:color-mix(in oklch,var(--foreground) 12%,var(--background));scroll-snap-align:start;scroll-snap-stop:always}
.js .show-stage{box-sizing:border-box;inline-size:100%;block-size:100%;overflow-y:auto;display:grid;grid-template-columns:minmax(0,1fr);grid-template-areas:"kicker" "title" "side" "content" "foot";grid-template-rows:auto auto auto auto 1fr;align-content:start;gap:1rem;background:var(--background);color:var(--foreground);padding:max(2rem,6dvh) max(1.5rem,8vw) 6rem}
.show-kicker{grid-area:kicker}
.show-stage>h2{grid-area:title}
.show-content{grid-area:content}
.show-side{grid-area:side;min-inline-size:0}
.show-foot{grid-area:foot;align-self:end}
.js .show-notes{position:absolute;inset:auto 0 60px 0;max-height:40%;overflow-y:auto;margin:0;padding:1rem max(1.5rem,8vw);background:var(--popover);color:var(--popover-foreground);border-top:1px solid var(--border);z-index:1}
.js .show-notes{display:none}
.js.show-with-notes .show-notes{display:block}
.js .show-progress{position:fixed;inset:0 0 auto 0;display:block;height:4px;background:var(--muted);z-index:2}
.js .show-progress::after{content:"";display:block;height:100%;background:var(--foreground);transform-origin:left;transform:scaleX(var(--progress,0));transition:transform var(--motion-duration-slow) var(--motion-ease-standard)}
.js .show-bar{position:fixed;inset:auto 0 0 0;z-index:2;display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:8px 16px;font-size:16px;background:var(--background);border-top:1px solid var(--border);transition:opacity var(--motion-duration-enter) var(--motion-ease-standard),translate var(--motion-duration-enter) var(--motion-ease-standard)}
.js.show-idle .show-bar:not(:focus-within){opacity:0;translate:0 100%}
.js.show-idle{cursor:none}
.show-bar button,.show-bar a{font:inherit;color:inherit;background:transparent;border:1px solid var(--border);border-radius:8px;padding:8px 14px;min-height:44px;min-width:44px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
.show-bar button:hover,.show-bar a:hover{background:var(--muted)}
.show-bar button:focus-visible,.show-bar a:focus-visible,.show-overview a:focus-visible,.show-overview button:focus-visible{outline:2px solid var(--foreground);outline-offset:2px}
.show-bar button[disabled]{opacity:.45;cursor:default}
.show-group{display:flex;gap:8px;align-items:center}
.show-count{min-width:72px;text-align:center;font-variant-numeric:tabular-nums}
.show-overview[open]{transition:opacity var(--motion-duration-enter) var(--motion-ease-enter),scale var(--motion-duration-enter) var(--motion-ease-enter)}
@starting-style{.show-overview[open]{opacity:0;scale:.97}}
.show-overview::backdrop{background:oklch(0% 0 0 / .55)}
.show-overview ol{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:.5rem}
.show-overview a{display:flex;gap:.5rem;padding:.75rem;border:1px solid var(--border);border-radius:.5rem;color:inherit;text-decoration:none;min-height:2.75rem}
.show-overview a:hover,.show-overview a[aria-current=true]{background:var(--muted)}
.show-overview small{color:var(--muted-foreground);white-space:nowrap}
.show-overview form{margin:0}
.show-overview button{font:inherit;color:inherit;background:transparent;border:1px solid var(--border);border-radius:.5rem;padding:.5rem .875rem;min-height:2.75rem;cursor:pointer}
/* CSS carousel (Chrome 135+): the browser's own markers on the track and, from tablet width, its own arrows in the bar; elsewhere the bar and the script do it */
@supports selector(::scroll-button(*)) and selector(::scroll-marker){
  .js main{scroll-marker-group:after}
  .js .show-progress{display:none}
  .js main::scroll-marker-group{position:fixed;inset:0 0 auto 0;z-index:3;display:flex;gap:1px;height:6px}
  .js .show-slide::scroll-marker{content:"";flex:1;background:var(--muted);border-radius:0;outline-offset:-2px}
  .js .show-slide::scroll-marker:hover{background:var(--muted-foreground)}
  .js .show-slide::scroll-marker:target-current{background:var(--foreground)}
  .js .show-slide::scroll-marker:focus-visible{outline:2px solid var(--foreground)}
  .js main::scroll-button(left),.js main::scroll-button(right){display:none}
}
/* From tablet width the bar's two arrows are the browser's own: they sit where the hidden ones would, so the bar keeps its layout */
@media (min-width:48rem){
  @supports selector(::scroll-button(*)) and selector(::scroll-marker){
    .js .show-bar{display:grid;grid-template-columns:1fr auto 1fr}
    .js .show-bar>:first-child{justify-self:start}
    .js .show-bar>:last-child{justify-self:end}
    .js #show-prev,.js #show-next{visibility:hidden}
    .js main::scroll-button(left),.js main::scroll-button(right){position:fixed;inset-block-end:max(8px,env(safe-area-inset-bottom));z-index:3;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;inline-size:44px;block-size:44px;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--foreground);font:inherit;cursor:pointer;transition:opacity var(--motion-duration-enter) var(--motion-ease-standard),translate var(--motion-duration-enter) var(--motion-ease-standard)}
    .js main::scroll-button(left){content:"←" / "Forrige slide";inset-inline-start:calc(50% - 88px)}
    .js main::scroll-button(right){content:"→" / "Neste slide";inset-inline-start:calc(50% + 44px)}
    .js main::scroll-button(*):hover{background:var(--muted)}
    .js main::scroll-button(*):focus-visible{outline:2px solid var(--foreground);outline-offset:2px}
    .js main::scroll-button(*):disabled{opacity:.45;cursor:default}
    .js.show-idle main::scroll-button(*){opacity:0;translate:0 200%}
  }
}
/* On a wide screen the slide is a 16:9 stage in the middle of the window, and everything in it scales with it, as on a slide: the root size follows the stage.
   Each layout of the template has its own fixed places for the parts, as there. */
@media (min-width:48rem) and (min-aspect-ratio:1/1){
  html.js{font-size:max(12px,calc(min(100vw,100dvh*16/9)/60))}
  .js .show-stage{inline-size:min(100vw,calc(100dvh*16/9));block-size:auto;aspect-ratio:16/9;max-block-size:100dvh;padding:3rem 4rem 2.5rem;gap:0 3rem;box-shadow:0 1.5rem 4rem oklch(0% 0 0 / .25);overflow:hidden}
  .js .show-stage>h2{font-size:3rem}
  .js .show-content{font-size:1.375rem}
  .js .show-side img{max-block-size:100%}
  .js .show-stage{grid-template-rows:auto auto 1fr auto}
  .js .show-stage[data-layout=content]{grid-template-columns:3fr 2fr;grid-template-areas:"kicker kicker" "title title" "side content" "foot foot"}
  .js .show-stage[data-layout=content]:not(:has(.show-side)){grid-template-columns:minmax(0,1fr);grid-template-areas:"kicker" "title" "content" "foot"}
  .js .show-stage[data-layout=content]:not(:has(.show-content)){grid-template-columns:minmax(0,1fr);grid-template-areas:"kicker" "title" "side" "foot"}
  .js .show-stage[data-layout=content] :is(.show-side,.show-content){align-self:center}
  .js .show-stage[data-layout=content]:not(:has(.show-side)) .show-content{font-size:1.75rem;max-inline-size:44rem}
  .js .show-stage:is([data-layout=picture-left],[data-layout=picture-right],[data-layout=picture-edge]){grid-template-columns:1fr 1fr;grid-template-rows:1fr auto auto auto 1fr auto}
  .js .show-stage[data-layout=picture-left]{grid-template-areas:"side ." "side kicker" "side title" "side content" "side ." "foot foot"}
  .js .show-stage[data-layout=picture-right]{grid-template-areas:". side" "kicker side" "title side" "content side" ". side" "foot foot"}
  .js .show-stage[data-layout=picture-edge]{grid-template-columns:5fr 4fr;grid-template-areas:"side ." "side kicker" "side title" "side content" "side ." "side foot";padding:0 4rem 2.5rem 0}
  .js .show-stage[data-layout=picture-edge] .show-foot{padding-bottom:0}
  .js .show-stage:is([data-layout=picture-left],[data-layout=picture-right],[data-layout=picture-edge]) .show-side{align-self:stretch;min-block-size:0;overflow:hidden}
  .js .show-stage:is([data-layout=picture-left],[data-layout=picture-right],[data-layout=picture-edge]) .show-side :is(div,img){block-size:100%;inline-size:100%;margin:0}
  .js .show-stage:is([data-layout=picture-left],[data-layout=picture-right],[data-layout=picture-edge]) .show-side img{object-fit:cover;max-block-size:none;border-radius:var(--radius-2xl)}
  .js .show-stage[data-layout=picture-edge] .show-side img{border-radius:0 var(--radius-2xl) var(--radius-2xl) 0}
  .js .show-stage:is([data-layout=cover],[data-layout=closing]){grid-template-columns:minmax(0,40rem);grid-template-rows:1fr auto auto auto 1fr auto;grid-template-areas:"." "kicker" "title" "content" "." "foot"}
  .js .show-stage:is([data-layout=cover],[data-layout=closing])>h2{font-size:4.5rem}
  .js .show-stage:is([data-layout=section-dark],[data-layout=section-light]){grid-template-columns:minmax(0,44rem);grid-template-rows:1fr auto 1fr;grid-template-areas:"." "title" "."}
  .js .show-stage:is([data-layout=section-dark],[data-layout=section-light])>h2{font-size:4rem}
  .js .show-stage[data-layout=section-light]{background:var(--muted);color:var(--muted-foreground)}
  .js .show-stage[data-layout=section-light]>h2{color:var(--foreground)}
}
@media (prefers-reduced-motion:no-preference){
  .js .show-slide:not([inert]) .show-stage>*{animation:show-rise var(--motion-duration-reveal) var(--motion-ease-enter) both}
  .js .show-slide:not([inert]) :is(.show-content,.show-side){animation-delay:90ms}
}
@keyframes show-rise{from{transform:translateY(1.25rem)}}
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
      `<div class="show-stage" data-layout="${slide.layout}"${['cover', 'closing', 'section-dark'].includes(slide.layout) ? ' data-theme="dark"' : ''}>` +
      (slide.kicker === '' && !slide.reserve ? '' : `<p class="show-kicker">${escapeHtml(slide.reserve ? `Reserve${slide.kicker === '' ? '' : ` · ${slide.kicker}`}` : slide.kicker)}</p>`) +
      `<h2>${escapeHtml(slide.title)}</h2>` +
      (slide.body === '' ? '' : `<div class="show-content">${slide.body}</div>`) +
      (slide.side === '' ? '' : `<div class="show-side">${slide.side}</div>`) +
      (slide.foot === '' ? '' : `<footer class="show-foot">${slide.foot}</footer>`) +
      '</div>' +
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
    '<dialog class="show-overview" data-overlay="wide" closedby="any" id="show-overview" aria-labelledby="show-overview-title">',
    '<div data-overlay-body="">',
    '<h2 id="show-overview-title" class="font-medium">Oversikt</h2>',
    `<ol>${slides.map((slide) => `<li><a href="#${slide.n}"><small>${slide.reserve ? 'R' : ''}${slide.n}</small><span>${escapeHtml(slide.title)}</span></a></li>`).join('')}</ol>`,
    '<footer data-overlay-footer=""><form method="dialog"><button>Lukk</button></form></footer>',
    '</div>',
    '</dialog>',
    `<script>${SLIDESHOW_JS}</script>`,
    '</body>',
    '</html>',
    '',
  ].join('\n')
}

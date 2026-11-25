import type { ReactNode } from "react"

import type { IconName } from "../lib/icons"
import { FieldError } from "./field-error"
import { Icon } from "./icon"
import { AppMark } from "./wordmark"
import type { AppGlyph } from "../lib/brand"
import { PendingLabel } from "./pending-button"
import { Button } from "./ui/button"

export type FirstRunStep = {
  /** Names the step: its anchor (`#<id>-<step>`), what `initialStep` and the server's `validate` say. */
  id: string
  title: string
  /** A sentence or two on what the step is for. */
  description?: string
  icon?: IconName
  /** The step's fields: the native ones (`TextField`, `ChoiceCards`, `CheckboxList`, `ListField`) and the choices of looks (`ThemeChoice`, `EffectsChoice`, `TiltChoice`). */
  content?: ReactNode
}

/**
 * The first visit's introduction: the whole screen, a few calm steps where the visitor makes the app theirs (a username, what to show, the theme, the effects), and one form
 * (`method="post"` to `action`) that the server reads at the end, with the page to go back to in `back`. The server draws it `open` when the `seen` cookie lacks it, so nothing
 * flashes. Without JavaScript every step stands under the other in one scrolling page with one «Ferdig»; with `FirstRunEnhancer` (by `id`) it is a modal with one step at a time,
 * «Trinn 2 av 7» and a bar, «Tilbake» and «Neste», each step checked by `validateUrl` before the next. «Hopp over» (`skip=1`, without the browser's checks) leaves it for good at any
 * step; a small link, its target reaches down into the footer's padding. `initialStep` is where it opens (after the server found an error there); without JavaScript the server's redirect adds `#<id>-<step>` to scroll to it. Its look and
 * motion are in `first-run.css`. With `glyph`, the app's `AppMark` stands before the title, and large on the first step in place of its icon, where it
 * plays its gesture once (`reveal`): the first meeting with the app is where its mark is learned (guide «Brand»). When «Ferdig» sends the form, the
 * enhancer shows `FirstRunFinish` while the next page loads: the check drawn, then the mark's gesture, under a second, never in the way of the page.
 */
export function FirstRun({ id = "first-run", open, title, glyph, action, back, steps, initialStep, finishLabel = "Alt er klart", validateUrl }: { id?: string; open: boolean; title: string; /** The app's glyph, its mark before the title. */ glyph?: AppGlyph; action: string; back: string; steps: readonly FirstRunStep[]; initialStep?: string; /** Said as the form is sent from «Ferdig», over the check. */ finishLabel?: string; validateUrl?: string }) {
  const titleId = `${id}-title`
  return (
    <dialog id={id} open={open} closedby="none" aria-labelledby={titleId} data-first-run="" data-initial-step={initialStep} data-validate-url={validateUrl}>
      <form method="post" action={action} data-first-run-form="">
        <input type="hidden" name="back" value={back} />
        <header data-first-run-header="">
          <div data-first-run-column="" className="grid gap-2">
            <div className="flex items-baseline justify-between gap-4">
              {glyph === undefined ? (
                <p id={titleId} className="min-w-0 truncate font-medium">
                  {title}
                </p>
              ) : (
                <p id={titleId} className="flex min-w-0 items-center gap-2 self-center font-medium">
                  <AppMark glyph={glyph} size="sm" />
                  <span className="truncate">{title}</span>
                </p>
              )}
              <span className="text-muted-foreground text-sm tabular-nums">
                <span data-first-run-count="" hidden />
              </span>
            </div>
            <div data-first-run-progress="" aria-hidden="true" hidden className="flex gap-1">
              {steps.map((step) => (
                <span key={step.id} data-first-run-segment="" className="bg-muted data-done:bg-primary h-1 flex-1 rounded-full transition-colors duration-(--motion-duration-reveal)" />
              ))}
            </div>
          </div>
        </header>
        <div data-first-run-steps="" data-first-run-column="">
          {steps.map((step, index) => (
            <section key={step.id} id={`${id}-${step.id}`} data-step={step.id} aria-labelledby={`${id}-${step.id}-title`} className="grid content-start gap-6">
              <div className="grid justify-items-start gap-4">
                {glyph !== undefined && index === 0 ? (
                  <AppMark glyph={glyph} size="lg" reveal />
                ) : step.icon === undefined ? null : (
                  <span className="bg-muted text-foreground grid size-12 place-items-center rounded-full">
                    <Icon name={step.icon} size="lg" />
                  </span>
                )}
                <h2 id={`${id}-${step.id}-title`} tabIndex={-1} data-step-heading="" className="grid gap-1 outline-none">
                  <span className="text-muted-foreground text-sm font-medium">
                    Trinn {index + 1} av {steps.length}
                    <span className="sr-only">: </span>
                  </span>
                  <span className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{step.title}</span>
                </h2>
                {step.description === undefined ? null : (
                  <p className="text-muted-foreground min-w-0 text-lg [overflow-wrap:anywhere]">
                    {step.description}
                  </p>
                )}
                <div data-step-errors="" className="empty:hidden" />
              </div>
              {step.content === undefined ? null : <div className="grid gap-6">{step.content}</div>}
            </section>
          ))}
        </div>
        <footer data-first-run-footer="">
          <div data-first-run-column="" className="grid gap-1">
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="lg" data-first-run-back="" hidden>
                <Icon name="arrow-left" slot="start" />
                Tilbake
              </Button>
              <span className="flex-1" />
              <Button type="button" size="lg" data-first-run-next="" hidden>
                <PendingLabel pendingLabel="Sjekker …">
                  Neste
                  <Icon name="arrow-right" slot="end" />
                </PendingLabel>
              </Button>
              <Button type="submit" size="lg" data-first-run-done="">
                Ferdig
                <Icon name="done" slot="end" />
              </Button>
            </div>
            <div className="flex justify-center">
              <Button type="submit" name="skip" value="1" formNoValidate variant="link" size="sm" className="text-muted-foreground relative after:absolute after:inset-x-0 after:-top-0.5 after:-bottom-2 after:content-['']">
                Hopp over
              </Button>
            </div>
          </div>
        </footer>
        {/* The model of an error from the server, for the enhancer to copy under a field. Not a <template>: React draws a template's children into the element on the client but into its
            content on the server, so it would not hydrate. Hidden, it is not seen, read or sent. */}
        <div hidden data-first-run-error="">
          <FieldError id={`${id}-error-model`}>{null}</FieldError>
        </div>
      </form>
      <div hidden data-first-run-finish="">
        <FirstRunFinish {...(glyph === undefined ? {} : { glyph })} label={finishLabel} />
      </div>
    </dialog>
  )
}

/**
 * The first run's one celebration, shown by `FirstRunEnhancer` over the wizard as «Ferdig» sends the form, while the next page loads: a check drawn
 * in the brand's colour (`motion-draw`), then the app's mark plays its gesture (`AppMark reveal`), the whole under a second. It never holds the
 * page back: the form is already on its way. Once, at the end of the first run, never for a routine save. Under reduced motion it stands still.
 */
export function FirstRunFinish({ glyph, label }: { glyph?: AppGlyph; /** What is said over the check: «Alt er klart». */ label: string }) {
  return (
    <div className="grid justify-items-center gap-5 text-center [--motion-mark-delay:calc(var(--motion-duration-celebrate)/3)]">
      <span className="relative">
        {glyph === undefined ? null : <AppMark glyph={glyph} size="lg" reveal />}
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-brand ${glyph === undefined ? "size-14" : "bg-background absolute -right-3 -bottom-3 size-7 rounded-full"}`}
        >
          <circle cx="12" cy="12" r="10" pathLength="1" className="motion-draw origin-center -rotate-90" />
          <path d="M7.5 12.5l3 3 6-6.5" pathLength="1" className="motion-draw [animation-delay:calc(var(--motion-duration-celebrate)/3)]" />
        </svg>
      </span>
      <p tabIndex={-1} data-first-run-finish-label="" className="font-heading text-2xl font-semibold tracking-tight outline-none">
        {label}
      </p>
    </div>
  )
}

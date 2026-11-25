import { addSeen, SEEN_COOKIE, seenCookieString } from "@lmfaole/designsystem/lib/onboarding"
import { orderSections, parsePrefs, PREFS_COOKIE, prefsCookieString, serializePrefs } from "@lmfaole/designsystem/lib/preferences"
import { applyMove } from "@lmfaole/designsystem/lib/reorder"
import { cookies } from "next/headers"

import { DAY_COOKIE, dayCookieString, parseDaySettings, readDayForm, serializeDaySettings } from "../../../lib/day-settings"
import { githubLogin, publicRepo } from "../../../lib/github-check"
import { BASE } from "../../../lib/links"
import { SECTIONS } from "../../../lib/plan"
import { chosenPlaceCookies, parseChosenPlace } from "../../../lib/position"
import { parsePriceArea, priceAreaCookie } from "../../../lib/power"
import { backWith, checkSettings, FIRST_RUN, firstStep, mergeChoices, problemsCookie, readSettingsForm, refererPath, reposCookie, withoutSeen, type Problems } from "../../../lib/settings"
import { safeBack, userCookie } from "../../../lib/username"

const go = (location: string, setCookies: string[]): Response => {
  const headers = new Headers({ Location: location, "Cache-Control": "no-store" })
  for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
  return new Response(null, { status: 303, headers })
}

/**
 * The first-run wizard's and the settings page's endpoint, one plain form (no JavaScript needed). `validate=<step>` checks the step's
 * fields and answers `{ errors }` as JSON, keeping nothing (the wizard with JavaScript, before «Neste»). Otherwise it keeps what is
 * valid (`prefs`, `github_user`, `github_repos`), marks the wizard seen and goes back; what GitHub did not have goes back to the form
 * (`innstillinger-feil`, a couple of minutes), at the wizard's step. `skip=1` only marks it seen; `rerun=1` («Vis introen igjen») unmarks it.
 * The page to go back to is `back`, or, from the wizard (drawn on any page), the page it was sent from.
 *
 * The front page's order: `order` (comma ids, the design system's `ReorderList`) is kept in `prefs` (`order=`). `move=<id>:up|down` (its
 * buttons without JavaScript) moves the section in the submitted `order` (`applyMove`), saves the form with it and goes back to the page's
 * `#rekkefolge`, without «Lagret». The time of day (`startside_day`, lib/day-settings.ts) is only touched when the form has `day=1`, so the wizard leaves it
 * be: `mode`, `greeting`, `starts.<part>`, `weekend`, `weekenddays`, `show.<part>`, `weather.<part>`, `pulls.<part>` (`readDayForm`). `strom` (Posisjon) is the
 * price area for the price of power (`startside_strom`, lib/power.ts): `NO1`–`NO5`, or `auto` to guess it from the position again. `sted` (Posisjon) is a place
 * searched for and chosen, `lat,lon|name`: kept as the position with its name (`startside-sted`), in place of the device's.
 */
export async function POST(request: Request): Promise<Response> {
  const form = await request.formData().catch(() => new FormData())
  const jar = await cookies()
  const written = form.get("back")
  const back = safeBack(typeof written === "string" && written !== "" ? written : refererPath(request.headers.get("referer"), new URL(request.url).origin))
  const seen = jar.get(SEEN_COOKIE)?.value
  const read = readSettingsForm(form)
  const current = parsePrefs(jar.get(PREFS_COOKIE)?.value)
  const move = form.get("move")
  if (typeof move === "string" && move !== "") read.order = applyMove(orderSections(SECTIONS, read.order ?? current.order), move) as typeof read.order

  if (read.rerun) return go(backWith(back), [seenCookieString(withoutSeen(seen, FIRST_RUN), BASE), problemsCookie(null)])
  if (read.skip) return go(backWith(back), [seenCookieString(addSeen(seen, FIRST_RUN), BASE), problemsCookie(null)])
  const place = form.get("sted")
  if (typeof place === "string") {
    const chosen = parseChosenPlace(place)
    if (chosen !== null) return go(backWith(back, { saved: true }), [...chosenPlaceCookies(chosen, BASE), problemsCookie(null)])
  }

  const checked = await checkSettings(read, { user: githubLogin, publicRepo })
  const day = form.get("day") === "1" ? readDayForm(form, parseDaySettings(jar.get(DAY_COOKIE)?.value)) : undefined
  if (day?.errors.starts !== undefined) checked.errors.starts = day.errors.starts
  if (read.validate !== undefined) return Response.json({ errors: checked.errors }, { headers: { "Cache-Control": "no-store" } })

  const kept = [prefsCookieString(serializePrefs(mergeChoices(current, read)), BASE)]
  if (day !== undefined) kept.push(dayCookieString(serializeDaySettings(day.settings), BASE))
  if (checked.github !== undefined) kept.push(userCookie(checked.github))
  if (checked.repos !== undefined) kept.push(reposCookie(checked.repos))
  const strom = form.get("strom")
  if (typeof strom === "string") kept.push(priceAreaCookie(parsePriceArea(strom), BASE))

  const step = firstStep(checked.errors)
  if (step !== undefined) {
    const problems: Problems = {
      ...(read.fromWizard ? { step } : {}),
      errors: checked.errors,
      values: {
        ...(checked.errors.github === undefined ? {} : { github: read.github }),
        ...(checked.errors.repos === undefined ? {} : { repos: read.repos?.join("\n") }),
        ...(checked.errors.starts === undefined ? {} : { starts: day?.written.starts }),
      },
    }
    return go(read.fromWizard ? backWith(back, { step }) : `${backWith(back)}#${step}`, [...kept, problemsCookie(problems)])
  }
  if (typeof move === "string" && move !== "") return go(`${backWith(back)}#rekkefolge`, [...kept, problemsCookie(null)])
  return go(read.fromWizard ? backWith(back) : backWith(back, { saved: true }), [...kept, seenCookieString(addSeen(seen, FIRST_RUN), BASE), problemsCookie(null)])
}

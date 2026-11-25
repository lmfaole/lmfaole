import type { APIRoute } from 'astro'

import { planUsernames, settingsRedirect } from '../../lib/settings-form'
import { keepUsernames, userFound } from '../../lib/visitor-cookies'
import { safeBack } from '../../lib/users'

/**
 * Where the inline username form posts (no JS needed): `lastfm` and `trakt`, each checked with its service before it is kept in a cookie for a year; an empty field clears its cookie, a field that is
 * not in the form leaves it be. Then back to `back` (a path under the site's base only), with `brukernavn-feil` and `brukernavn-verdi` when a username was not found, for the page's form to say so.
 * «Innstillinger» and the first-run wizard post to `/api/innstillinger/`, which does the same and more.
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData().catch(() => new FormData())
  const plan = await planUsernames(form, userFound)
  await keepUsernames(cookies, plan)
  return new Response(null, { status: 303, headers: { Location: settingsRedirect(safeBack(form.get('back'), import.meta.env.BASE_URL), plan, false), 'Cache-Control': 'no-store' } })
}

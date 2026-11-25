import { githubLogin } from "../../../lib/github-check"
import { parseLogin, safeBack, userCookie, withError } from "../../../lib/username"

const redirect = (location: string, cookie?: string): Response =>
  new Response(null, { status: 303, headers: { Location: location, "Cache-Control": "no-store", ...(cookie === undefined ? {} : { "Set-Cookie": cookie }) } })

/**
 * The username form's endpoint (a plain form, no JavaScript): checks that GitHub has the user, keeps the name in the `github_user`
 * cookie and goes back to the page. An empty field forgets the name; an unknown one goes back with the error for the form to show.
 */
export async function POST(request: Request): Promise<Response> {
  const form = await request.formData().catch(() => new FormData())
  const back = safeBack(form.get("back"))
  const written = form.get("github")
  if (typeof written !== "string") return redirect(back)
  if (written.trim() === "") return redirect(back, userCookie(null))
  const login = parseLogin(written)
  const found = login === null ? null : await githubLogin(login).catch(() => null)
  return found === null ? redirect(withError(back, "github", written.trim())) : redirect(back, userCookie(found))
}

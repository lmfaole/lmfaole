import { Person } from "@lmfaole/designsystem/components/person"
import { transformedImage } from "@lmfaole/designsystem/lib/cloudflare"

import { avatarUrl } from "../lib/avatar"
import { env } from "../lib/env"

/** The picture as the browser asks for it: through the zone's Image Transformations (AVIF or WebP, 20 px at 2×) when `IMAGE_TRANSFORMS=1`, else straight from GitHub. */
function avatarSrc(login: string): string | null {
  const url = avatarUrl(login)
  return url !== null && env("IMAGE_TRANSFORMS") === "1" ? transformedImage(url, { width: 20, height: 20, dpr: 2 }) : url
}

/** A GitHub user by login, with their picture. */
export function GitHubPerson({ login }: { login: string }) {
  return <Person name={login} src={avatarSrc(login)} />
}

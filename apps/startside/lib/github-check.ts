import { env, mocking } from "./env"
import { upstream } from "./upstream"
import { parseLogin } from "./username"

const headers = (): Record<string, string> => {
  const token = env("GITHUB_TOKEN")
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), Accept: "application/vnd.github+json", "User-Agent": "startside", "X-GitHub-Api-Version": "2022-11-28" }
}

/** The login as GitHub writes it, or `null` where there is no such user: asked with the server's token (through the relay, which adds it). With mock data, any name is one. */
export async function githubLogin(login: string): Promise<string | null> {
  if (mocking()) return login
  const response = await upstream(`https://api.github.com/users/${login}`, { headers: headers(), revalidate: 3600 })
  if (!response.ok) return null
  const user = (await response.json()) as { login?: unknown; type?: unknown }
  return user.type === "User" ? parseLogin(user.login) : null
}

/**
 * A repository's `owner/name` as GitHub writes it, or `null` where there is none or it is not public: the token can read private
 * ones, and those must never be followed. `repo` is checked as `owner/name` before it comes here. With mock data, any name is one.
 */
export async function publicRepo(repo: string): Promise<string | null> {
  if (mocking()) return repo
  const response = await upstream(`https://api.github.com/repos/${repo}`, { headers: headers(), revalidate: 3600 })
  if (!response.ok) return null
  const found = (await response.json()) as { full_name?: unknown; private?: unknown; visibility?: unknown }
  return found.private === false && typeof found.full_name === "string" ? found.full_name : null
}

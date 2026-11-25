/** A GitHub login as it can be in an address: letters, digits and dashes, and a bot's `[bot]` is not part of its picture's address. */
function plain(login: string): string | null {
  // GitHub names Copilot's reviews and commits «Copilot», an account with no picture of its own; its reviewer bot has the logo.
  const name = /^copilot$/i.test(login) ? "copilot-pull-request-reviewer" : login.replace(/\[bot\]$/, "")
  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(name) ? name : null
}

/** The picture of a GitHub user (the browser asks github.com for it; no token, nothing from the API), or nothing for a name that is not a login. */
export function avatarUrl(login: string, size = 40): string | null {
  const name = plain(login)
  return name === null ? null : `https://github.com/${name}.png?size=${size}`
}

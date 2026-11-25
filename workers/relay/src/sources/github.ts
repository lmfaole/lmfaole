// GitHub, for startside: REST GETs and GraphQL queries (never a mutation: `readOnlyQuery`), with the relay's own token, so no page holds it. An
// `Authorization` of the ask is never passed on: the token is always the relay's.

import { STARTSIDE_AGENT, type Source } from "../source.ts"

export const GITHUB: Source = {
  for: "startside",
  agent: STARTSIDE_AGENT,
  post: { graphql: "graphql" },
  sign(headers, env) {
    if (env.GITHUB_TOKEN === undefined || env.GITHUB_TOKEN === "") return new Response("GITHUB_TOKEN er ikke satt", { status: 500 })
    headers.set("Authorization", `Bearer ${env.GITHUB_TOKEN}`)
    headers.set("X-GitHub-Api-Version", "2022-11-28")
    return undefined
  },
}

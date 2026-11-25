// What the relay knows of a source: how it is asked. The table of them is `routes.ts`; a source with more to it than a host has its own module in `sources/`.

/** The Worker's secrets (`wrangler.jsonc`). */
export interface Env {
  /** The key the apps ask with (`X-Upstream-Key`). */
  UPSTREAM_KEY?: string
  /** A second key, taken as well while a new one is handed out (`scripts/rotate-key.ts`); unset otherwise. */
  UPSTREAM_KEY_NEXT?: string
  /** GitHub's token: fine-grained, public repositories read-only (startside's GitHub parts). */
  GITHUB_TOKEN?: string
}

/** What a POST carries: a GraphQL query (JSON, queries only) or a form (Spotify's token). */
export type Post = "graphql" | "form"

export interface Source {
  /** The app that asks it, for the reader (every app's key may ask every source). */
  for: "medier" | "startside" | "medier, startside"
  /** The User-Agent it is asked with: the app's name, as MusicBrainz and Nominatim ask for. */
  agent: string
  /** Headers of the ask passed on to it, besides `Accept` and `If-Modified-Since`, which every source gets. Nothing else of the ask goes on. */
  forward?: readonly string[]
  /** Headers the relay sets. */
  set?: Readonly<Record<string, string>>
  /** The paths (no leading `/`) that take a POST, and what it carries. Every other POST is refused. */
  post?: Readonly<Record<string, Post>>
  /** Nothing but those POSTs: a GET, or any other path, is not found (Spotify's accounts host). */
  postOnly?: true
  /** The relay's own sign-in, put on `headers`; an answer instead where it has none. */
  sign?: (headers: Headers, env: Env) => Response | undefined
}

export const MEDIER_AGENT = "lmfaole-medier (https://github.com/lmfaole/lmfaole)"
export const STARTSIDE_AGENT = "startside github.com/lmfaole/lmfaole"

import { getCloudflareContext } from "@opennextjs/cloudflare"

import { gatewayOptions, runModel, type AiBinding } from "./ai-gateway"
import { env } from "./env"
import { mockSummary } from "./mock"
import { buildMessages, cleanSummary, fingerprint, PROMPT_VERSION, type SummaryInput, type SummaryKind } from "./summarize"

/** Cloudflare Workers AI: a small model, a few hundred tokens a summary, and only when the text is new (see below), so it stays within the free allowance. */
const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8"
const WEEK = 60 * 60 * 24 * 7


/**
 * A summary of a pull request, an issue, a discussion or the alerts, in Norwegian, or nothing: with no AI binding (as in `next dev`),
 * on an error, or when the answer is empty, the page simply shows no summary. It is kept for a week in the edge cache under a fingerprint
 * of the text, so the model is asked once for each version of the text and never again for a page that has not changed. With `AI_GATEWAY` set, the
 * call goes through that AI Gateway (logs, caching, rate limits), and without it if the gateway fails (`lib/ai-gateway.ts`).
 */
export async function summarize(kind: SummaryKind, input: SummaryInput): Promise<string | null> {
  if (env("MOCK_DATA") === "1") return mockSummary()
  try {
    const ai = (getCloudflareContext().env as unknown as { AI?: AiBinding }).AI
    if (ai === undefined) return null
    const messages = buildMessages(kind, input)
    const key = new Request(`https://startside.invalid/summary/${await fingerprint([MODEL, String(PROMPT_VERSION), ...messages.map((message) => message.content)])}`)
    const cache = (caches as unknown as { default?: Cache }).default
    const cached = await cache?.match(key)
    if (cached !== undefined) return (await cached.text()) || null
    const answer = cleanSummary((await runModel(ai, MODEL, { messages, max_tokens: 200 }, gatewayOptions(env("AI_GATEWAY"), kind))).response)
    if (answer !== null) await cache?.put(key, new Response(answer, { headers: { "Cache-Control": `public, max-age=${WEEK}` } }))
    return answer
  } catch {
    return null
  }
}

import { getCloudflareContext } from "@opennextjs/cloudflare"

import { env } from "./env"
import { mockSummary } from "./mock"
import { readSummaries, summaryRef, SUMMARIES_KEY, type StoredSummary, type SummaryStore } from "./summaries"

/**
 * The AI summary of a pull request, an issue or a discussion, or nothing. Only read here: the scheduled job makes them (`lib/summaries.ts`)
 * and keeps them in KV, so opening a page never runs the model. Nothing without the binding (as in `next dev`), on an error, or for an
 * item the job has not summarised.
 */
export async function storedSummary(repo: string, number: number): Promise<StoredSummary | null> {
  if (env("MOCK_DATA") === "1") return { fp: "mock", text: mockSummary(), at: new Date().toISOString() }
  try {
    const store = (getCloudflareContext().env as unknown as { SNAPSHOT?: SummaryStore }).SNAPSHOT
    if (store === undefined) return null
    return readSummaries(await store.get(SUMMARIES_KEY, { type: "text", cacheTtl: 60 })).items[summaryRef(repo, number)] ?? null
  } catch {
    return null
  }
}

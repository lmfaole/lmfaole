/** A weekly copy of every D1 database in R2, made by D1's own export (the SQL dump is made by Cloudflare and streamed straight into R2, so the Worker does almost no work). The newest `keep` of each are kept. */

import type { Fetch } from "./listenbrainz.ts"

export interface Bucket {
  put(key: string, value: ReadableStream): Promise<unknown>
  list(options: { prefix: string }): Promise<{ objects: { key: string }[] }>
  delete(keys: string[]): Promise<void>
}

export interface BackupOptions {
  accountId: string
  token: string
  databases: { name: string; id: string }[]
  bucket: Bucket
  fetch: Fetch
  now: Date
  keep: number
  /** Waits between asking whether the export is ready. */
  wait?: (ms: number) => Promise<void>
  log?: (message: string) => void
}

interface ExportAnswer {
  success: boolean
  errors?: { message: string }[]
  result?: { status?: string; at_bookmark?: string; error?: string; result?: { signed_url?: string } }
}

async function exported(database: { name: string; id: string }, options: BackupOptions): Promise<string> {
  const wait = options.wait ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
  let body: Record<string, string> = { output_format: "polling" }
  for (let attempt = 0; attempt < 8; attempt++) {
    const response = await options.fetch(`https://api.cloudflare.com/client/v4/accounts/${options.accountId}/d1/database/${database.id}/export`, {
      method: "POST",
      headers: { Authorization: `Bearer ${options.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const answer = (await response.json()) as ExportAnswer
    if (!answer.success) throw new Error(`export ${database.name}: ${answer.errors?.map((e) => e.message).join("; ")}`)
    const result = answer.result ?? {}
    if (result.status === "error") throw new Error(`export ${database.name}: ${result.error}`)
    if (result.status === "complete" && result.result?.signed_url) return result.result.signed_url
    if (result.at_bookmark) body = { output_format: "polling", current_bookmark: result.at_bookmark }
    await wait(5000)
  }
  throw new Error(`export ${database.name}: not ready after 8 tries`)
}

export async function backup(options: BackupOptions): Promise<string[]> {
  const date = options.now.toISOString().slice(0, 10)
  const saved: string[] = []
  for (const database of options.databases) {
    const dump = await options.fetch(await exported(database, options))
    const length = Number(dump.headers.get("content-length"))
    if (!dump.ok || dump.body === null || !(length > 0)) throw new Error(`export ${database.name}: download ${dump.status}`)
    // R2 needs the length up front; the stream is passed through, not read.
    const { readable, writable } = new FixedLengthStream(length)
    const piped = dump.body.pipeTo(writable)
    const key = `backup/${database.name}/${date}.sql`
    await Promise.all([options.bucket.put(key, readable), piped])
    saved.push(`${key} (${Math.round(length / 1024)} KB)`)
    const old = (await options.bucket.list({ prefix: `backup/${database.name}/` })).objects.map((o) => o.key).sort().slice(0, -options.keep)
    if (old.length > 0) await options.bucket.delete(old)
  }
  options.log?.(`backup: ${saved.join(", ")}`)
  return saved
}

declare class FixedLengthStream {
  constructor(length: number)
  readable: ReadableStream
  writable: WritableStream
}

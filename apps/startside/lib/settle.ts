/** What a source gave: its value, or why not. A page asks for all its sources at once, and each part shows its own error, so one failing does not take the page down. */
export type Settled<T> = { ok: true; value: T } | { ok: false; error: Error }

export async function settle<T>(promise: Promise<T>): Promise<Settled<T>> {
  try {
    return { ok: true, value: await promise }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

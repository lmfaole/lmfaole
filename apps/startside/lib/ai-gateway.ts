// Workers AI through AI Gateway (logs, caching and rate limits in the dashboard), when `AI_GATEWAY` names one. Pure: the binding is given.

export interface AiOptions {
  gateway: { id: string; metadata: Record<string, string> }
}

export interface AiBinding {
  run(model: string, input: { messages: unknown; max_tokens: number }, options?: AiOptions): Promise<{ response?: unknown }>
}

/** The third argument to `AI.run`: the gateway, tagged with what the call is for, or nothing without one (or with one that is not a gateway's name). */
export function gatewayOptions(gateway: string | undefined, kind: string): AiOptions | undefined {
  const id = gateway?.trim() ?? ""
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(id)) return undefined
  return { gateway: { id, metadata: { app: "startside", kind } } }
}

/** Runs the model through the gateway, and once more without it if that throws (a gateway that is missing or misconfigured never costs the summary). */
export async function runModel(ai: AiBinding, model: string, input: { messages: unknown; max_tokens: number }, options: AiOptions | undefined): Promise<{ response?: unknown }> {
  if (options === undefined) return ai.run(model, input)
  try {
    return await ai.run(model, input, options)
  } catch (error) {
    console.warn(`AI Gateway «${options.gateway.id}» feilet; kjører uten`, error)
    return ai.run(model, input)
  }
}

import { strict as assert } from "node:assert"
import { test } from "node:test"

import { gatewayOptions, runModel, type AiOptions } from "./ai-gateway.ts"

test("a gateway's name gives the options; none, or a name that is not one, gives none", () => {
  assert.deepEqual(gatewayOptions("default", "issue"), { gateway: { id: "default", metadata: { app: "startside", kind: "issue" } } })
  assert.equal(gatewayOptions(undefined, "issue"), undefined)
  assert.equal(gatewayOptions("", "issue"), undefined)
  assert.equal(gatewayOptions("../x", "issue"), undefined)
})

test("the model runs through the gateway, and without it when that throws", async () => {
  const seen: (AiOptions | undefined)[] = []
  const ai = (failGateway: boolean) => ({
    run: async (_model: string, _input: unknown, options?: AiOptions) => {
      seen.push(options)
      if (options !== undefined && failGateway) throw new Error("no gateway")
      return { response: options === undefined ? "plain" : "gateway" }
    },
  })
  const input = { messages: [], max_tokens: 10 }
  const options = gatewayOptions("default", "issue")
  assert.equal((await runModel(ai(false), "m", input, options)).response, "gateway")
  assert.equal((await runModel(ai(true), "m", input, options)).response, "plain")
  seen.length = 0
  assert.equal((await runModel(ai(false), "m", input, undefined)).response, "plain")
  assert.deepEqual(seen, [undefined])
})

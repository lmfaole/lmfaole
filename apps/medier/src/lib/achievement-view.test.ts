import { strict as assert } from "node:assert"
import { test } from "node:test"

import { lockedOf, rarestBeyond, unlockedOf } from "./achievement-view.ts"
import type { Achievement } from "./steam.ts"

const one = (key: string, unlocked: number | null, percent: number | null): Achievement => ({ key, name: key, description: null, icon: null, unlocked, percent })

test("the unlocked, the last first; the ones still to get, the most common first and the unknown last", () => {
  const list = [one("a", 10, 50), one("b", null, 5), one("c", 30, 20), one("d", null, null), one("e", null, 80)]
  assert.deepEqual(unlockedOf(list).map((it) => it.key), ["c", "a"])
  assert.deepEqual(lockedOf(list).map((it) => it.key), ["e", "b", "d"])
})

test("the rarest are left out where the last unlocked already show them all", () => {
  const few = unlockedOf([one("a", 1, 50), one("b", 2, 5), one("c", 3, 20)])
  assert.deepEqual(rarestBeyond(few), [])
  const many = unlockedOf([one("old-rare", 1, 1), ...[2, 3, 4, 5, 6].map((at) => one(`n${at}`, at, 60))])
  assert.deepEqual(rarestBeyond(many).map((it) => it.key), ["old-rare", "n6", "n5"])
})

import { strict as assert } from "node:assert"
import { test } from "node:test"

import { groupByRole, personRole, roleWords } from "./people.ts"

test("a feed's role is one of ours: any case, none is a host, one we do not know is «Medvirkende»", () => {
  assert.equal(personRole("Guest"), "guest")
  assert.equal(personRole("co-host"), "co-host")
  assert.equal(personRole("Cover Art Designer"), "artwork")
  assert.equal(personRole(undefined), "host")
  assert.equal(personRole(""), "host")
  assert.equal(personRole("Booking Coordinator"), "other")
})

test("people are grouped by role in a fixed order, named in Norwegian for one or several, each group in the given order", () => {
  const people = [
    { name: "Gjest A", role: "guest" as const },
    { name: "Vert A", role: "host" as const },
    { name: "Gjest B", role: "guest" as const },
    { name: "Uten rolle" },
  ]
  assert.deepEqual(
    groupByRole(people).map((group) => [group.label, group.items.map((person) => person.name)]),
    [
      ["Vert", ["Vert A"]],
      ["Gjester", ["Gjest A", "Gjest B"]],
      ["Medvirkende", ["Uten rolle"]],
    ],
  )
  assert.equal(roleWords("producer", 2), "Produsenter")
})

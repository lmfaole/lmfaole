import { strict as assert } from "node:assert"
import { test } from "node:test"

import { placesFrom } from "./place-search.ts"
import { chosenPlaceCookies, formatChosenPlace, parseChosenPlace, parsePlaceName } from "./position.ts"

test("places from a search: name, where it is without the postcode, and the position rounded", () => {
  assert.deepEqual(
    placesFrom([
      { lat: "60.3943055", lon: "5.3259192", name: "Bergen", display_name: "Bergen, Vestland, Norge" },
      { lat: "60.39", lon: "5.32", name: "Bergen", display_name: "Bergen, Vestland, Norge" },
      { lat: "59.9", lon: "10.7", name: "", display_name: "Karl Johans gate, Sentrum, 0154, Oslo, Norge" },
      { lat: "x", lon: "10", name: "Ingenting" },
      { name: "Uten posisjon" },
    ]),
    [
      { name: "Bergen", detail: "Vestland, Norge", position: { lat: 60.394, lon: 5.326 } },
      { name: "Karl Johans gate", detail: "Sentrum, Oslo, Norge", position: { lat: 59.9, lon: 10.7 } },
    ],
  )
})

test("a chosen place goes through the form and back", () => {
  const sent = formatChosenPlace({ lat: 60.39431, lon: 5.32592 }, "Bergen")
  assert.equal(sent, "60.394,5.326|Bergen")
  assert.deepEqual(parseChosenPlace(sent), { position: { lat: 60.394, lon: 5.326 }, name: "Bergen" })
  for (const bad of [undefined, "", "Bergen", "60.394,5.326|", "60.394,5.326", "x,y|Bergen", "91,5|Bergen"]) assert.equal(parseChosenPlace(bad), null, String(bad))
})

test("a chosen place is kept as its position and its name", () => {
  const [position, place] = chosenPlaceCookies({ position: { lat: 69.649, lon: 18.956 }, name: "Tromsø" }, "/start")
  assert.match(position ?? "", /^startside-pos=69\.649,18\.956; Path=\/start;/)
  assert.match(place ?? "", /^startside-sted=Troms%C3%B8; Path=\/start;/)
  assert.equal(parsePlaceName("Troms%C3%B8"), "Tromsø")
  assert.equal(parsePlaceName(""), null)
  assert.equal(parsePlaceName(undefined), null)
  assert.equal(parsePlaceName("%E0%A4%A"), null)
})

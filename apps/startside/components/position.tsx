"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

import { Button } from "@lmfaole/designsystem/components/button"
import { Inline } from "@lmfaole/designsystem/components/layout"
import { PermissionCard, type PermissionCardState } from "@lmfaole/designsystem/components/permission-card"
import { Text } from "@lmfaole/designsystem/components/text"
import { usePermissionState } from "@lmfaole/designsystem/lib/use-permission-state"

import { formatPosition, movedFar, POSITION_PARAM, roundPosition, type Position } from "../lib/position"

/** Kept in this browser only (never sent): the visitor chose the default place, so the page does not go back to following the device on its own. */
const DEFAULT_PLACE_KEY = "startside-standardsted"

function chosenDefault(): boolean {
  try {
    return localStorage.getItem(DEFAULT_PLACE_KEY) === "1"
  } catch {
    return false
  }
}

function chooseDefault(chosen: boolean) {
  try {
    if (chosen) localStorage.setItem(DEFAULT_PLACE_KEY, "1")
    else localStorage.removeItem(DEFAULT_PLACE_KEY)
  } catch {
    // Storage may be off; the choice then lasts as long as the address.
  }
}

function locate(options: PositionOptions): Promise<Position> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition((found) => resolve(roundPosition({ lat: found.coords.latitude, lon: found.coords.longitude })), reject, options),
  )
}

type Failure = "denied" | "failed"

/**
 * Asking the device for its position on a tap and putting it in the page's address (`?pos=`): the server keeps nothing about the
 * visitor. Once the browser has allowed it, the page follows the device: it is located on load (no prompt; the browser has said yes
 * before) and the address changes when it has moved a couple of hundred metres, unless the visitor chose the default place.
 */
function useLocate(current: Position | null) {
  const router = useRouter()
  const pathname = usePathname()
  const [failure, setFailure] = useState<Failure | null>(null)
  const [busy, setBusy] = useState(false)
  // Known only in the browser (Node has a `navigator` too, without `geolocation`), so a control appears once the page is hydrated.
  const [supported, setSupported] = useState(false)
  useEffect(() => setSupported("geolocation" in navigator), [])

  useEffect(() => {
    if (!("geolocation" in navigator) || !("permissions" in navigator) || (current === null && chosenDefault())) return
    let cancelled = false
    navigator.permissions
      .query({ name: "geolocation" })
      .then(async (status) => {
        if (status.state !== "granted") return
        const found = await locate({ maximumAge: 10 * 60_000, timeout: 15_000 })
        if (cancelled || (current !== null && !movedFar(current, found))) return
        go(found)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // `go` is made anew each render from the path; the position is what decides.
  }, [current])

  /** The same page with the position in its address, or without it. */
  function go(position: Position | null) {
    const params = new URLSearchParams(window.location.search)
    if (position === null) params.delete(POSITION_PARAM)
    else params.set(POSITION_PARAM, formatPosition(position))
    const query = params.toString().replace(/%2C/gi, ",")
    router.replace(query === "" ? pathname : `${pathname}?${query}`, { scroll: false })
  }

  async function use() {
    setBusy(true)
    setFailure(null)
    try {
      const found = await locate({ enableHighAccuracy: false, maximumAge: 10 * 60_000, timeout: 15_000 })
      chooseDefault(false)
      go(found)
    } catch (error) {
      setFailure((error as GeolocationPositionError).code === 1 ? "denied" : "failed")
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    chooseDefault(true)
    setFailure(null)
    go(null)
  }

  return { supported, busy, failure, use, reset }
}

function UseButton({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  return (
    <Button disabled={busy} onClick={onClick} icon="place">
      Bruk min posisjon
    </Button>
  )
}

function ResetButton({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  return (
    <Button disabled={busy} onClick={onClick} icon="home">
      Bruk standardsted
    </Button>
  )
}

/**
 * The page's choice of place, compact for the page's header: the device's position, or the default place. Asking happens on a tap, never on load;
 * once the browser has allowed it, the page follows the device and changes when it has moved a couple of hundred metres (other stations, perhaps another forecast).
 */
export function PositionControl({ current }: { current: Position | null }) {
  const { supported, busy, failure, use, reset } = useLocate(current)
  if (!supported) return current === null ? null : <ResetButton busy={false} onClick={reset} />
  return (
    <Inline>
      {failure === null ? null : (
        <Text role="note">
          {failure === "denied" ? "Posisjon er ikke tillatt i nettleseren." : "Fant ikke posisjonen."}
        </Text>
      )}
      {current === null ? <UseButton busy={busy} onClick={use} /> : null}
      {current === null ? null : <ResetButton busy={busy} onClick={reset} />}
    </Inline>
  )
}

/**
 * Asks for the device's position where the page needs it and says how it went: what it is for (`description`), whether the browser
 * has been asked, is asking, said no (with the way back in the browser's settings) or cannot. With a position in the address and the
 * browser still allowing it, there is nothing to ask: the card is gone and the compact `PositionControl` in the header is enough.
 * When the browser has said no, a position kept from before still counts: the card says so, and `fallback` says what is shown without one.
 */
export function PositionPermission({ current, title, description, fallback }: { current: Position | null; title: string; description: string; fallback?: ReactNode }) {
  const permission = usePermissionState("geolocation")
  const { busy, failure, use } = useLocate(current)
  const state: PermissionCardState = busy ? "pending" : failure === "denied" ? "denied" : failure === "failed" ? "error" : permission === "granted" && current === null ? "prompt" : permission
  if (current !== null && state !== "denied" && state !== "error") return null
  return (
    <PermissionCard
      title={title}
      description={description}
      state={state}
      action={<UseButton busy={busy} onClick={use} />}
      deniedHelp="Posisjon er avslått for dette nettstedet. Tillat posisjon i nettleserens innstillinger for nettstedet og last siden på nytt."
      fallback={current === null ? fallback : undefined}
    />
  )
}

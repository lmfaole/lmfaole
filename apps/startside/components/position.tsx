"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

import { Button } from "@lmfaole/designsystem/components/button"
import { Inline } from "@lmfaole/designsystem/components/layout"
import { LinkButton } from "@lmfaole/designsystem/components/link-button"
import { PermissionCard, type PermissionCardState } from "@lmfaole/designsystem/components/permission-card"
import { Text } from "@lmfaole/designsystem/components/text"
import { usePermissionState } from "@lmfaole/designsystem/lib/use-permission-state"

import { settingsPage } from "../lib/settings"
import { formatPosition, movedFar, PLACE_COOKIE, POSITION_COOKIE, roundPosition, type Position } from "../lib/position"

const YEAR = 60 * 60 * 24 * 365

function write(position: Position | null) {
  const value = position === null ? "" : formatPosition(position)
  document.cookie = `${POSITION_COOKIE}=${value}; path=/start; max-age=${position === null ? 0 : YEAR}; samesite=lax; secure`
  // The device's position, or none: no longer a place searched for in the settings.
  document.cookie = `${PLACE_COOKIE}=; path=/start; max-age=0; samesite=lax; secure`
}

/** Whether the position is a place chosen in the settings, which the page keeps however the device moves. */
const chosenPlace = (): boolean => document.cookie.split("; ").some((pair) => pair.startsWith(`${PLACE_COOKIE}=`) && pair.length > PLACE_COOKIE.length + 1)

function locate(options: PositionOptions): Promise<Position> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition((found) => resolve(roundPosition({ lat: found.coords.latitude, lon: found.coords.longitude })), reject, options),
  )
}

type Failure = "denied" | "failed"

/** Asking the device for its position on a tap and keeping it in the cookie; once the browser has allowed it, following the device when it has moved a couple of hundred metres. */
function useLocate(current: Position | null) {
  const router = useRouter()
  const [failure, setFailure] = useState<Failure | null>(null)
  const [busy, setBusy] = useState(false)
  // Known only in the browser (Node has a `navigator` too, without `geolocation`), so a control appears once the page is hydrated.
  const [supported, setSupported] = useState(false)
  useEffect(() => setSupported("geolocation" in navigator), [])

  useEffect(() => {
    if (current === null || !("geolocation" in navigator) || !("permissions" in navigator) || chosenPlace()) return
    let cancelled = false
    navigator.permissions
      .query({ name: "geolocation" })
      .then(async (status) => {
        if (status.state !== "granted") return
        const found = await locate({ maximumAge: 10 * 60_000, timeout: 15_000 })
        if (cancelled || !movedFar(current, found)) return
        write(found)
        router.refresh()
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [current, router])

  async function use() {
    setBusy(true)
    setFailure(null)
    try {
      write(await locate({ enableHighAccuracy: false, maximumAge: 10 * 60_000, timeout: 15_000 }))
      router.refresh()
    } catch (error) {
      setFailure((error as GeolocationPositionError).code === 1 ? "denied" : "failed")
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    write(null)
    setFailure(null)
    router.refresh()
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
 * The page's choice of place, compact for the page's header: the device's position, or the one in the settings. Asking happens on a tap, never on load;
 * once the browser has allowed it, the page follows the device and refreshes when it has moved a couple of hundred metres (other stations, perhaps another forecast).
 */
export function PositionControl({ current, place = null }: { current: Position | null; /** The name of a place chosen in the settings, when the position is that and not the device's. */ place?: string | null }) {
  const { supported, busy, failure, use, reset } = useLocate(current)
  if (!supported) return place === null ? null : <ResetButton busy={false} onClick={reset} />
  return (
    <Inline>
      {failure === null ? null : (
        <Text role="note">
          {failure === "denied" ? "Posisjon er ikke tillatt i nettleseren." : "Fant ikke posisjonen."}
        </Text>
      )}
      {current === null || place !== null ? <UseButton busy={busy} onClick={use} /> : null}
      {current === null ? null : <ResetButton busy={busy} onClick={reset} />}
    </Inline>
  )
}

/**
 * Asks for the device's position where the page needs it and says how it went: what it is for (`description`), whether the browser
 * has been asked, is asking, said no (with the way back in the browser's settings) or cannot. With a position in the cookie and the
 * browser still allowing it, there is nothing to ask: the card is gone and the compact `PositionControl` in the header is enough.
 * When the browser has said no, a position kept from before still counts: the card says so, and `fallback` says what is shown without one.
 */
export function PositionPermission({ current, title, description, fallback }: { current: Position | null; title: string; description: string; fallback?: ReactNode }) {
  const permission = usePermissionState("geolocation")
  const { busy, failure, use } = useLocate(current)
  const state: PermissionCardState = busy ? "pending" : failure === "denied" ? "denied" : failure === "failed" ? "error" : permission === "granted" && current === null ? "prompt" : permission
  if (current !== null && state !== "denied" && state !== "error") return null
  return <PermissionCard title={title} description={description} state={state} action={
        <Inline>
          <UseButton busy={busy} onClick={use} />
          <LinkButton href={settingsPage("posisjon")} icon="search">
            Søk etter et sted
          </LinkButton>
        </Inline>
      } deniedHelp="Posisjon er avslått for dette nettstedet. Tillat posisjon i nettleserens innstillinger for nettstedet og last siden på nytt, eller søk opp et sted i stedet." fallback={current === null ? fallback : undefined} />
}

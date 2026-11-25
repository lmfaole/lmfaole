/**
 * Turning a thing in 3D by hand (`AlbumSleeve`'s case, a playing `Disc`): dragged sideways it turns round all the way (yaw), dragged up and down it tips a little (pitch). Let go, it coasts on and slows as a
 * weight does, then settles on the nearest whole turn with a soft spring, so its face is toward the page again; the tip springs back at once. Pure motion here (`stepSpin`), and the pointer's in `attachSpin`.
 */

export interface SpinState {
  /** The turn round, in radians: any number, a whole turn is 2π. */
  yaw: number
  /** The tip forward or back, in radians, between ±`PITCH_LIMIT`. */
  pitch: number
  /** How fast it turns round, in radians a millisecond. */
  velocity: number
  /** How fast it tips back, in radians a millisecond. */
  pitchVelocity: number
  /** Held by a pointer: it moves with the hand and not on its own. */
  held: boolean
}

export const REST: SpinState = { yaw: 0, pitch: 0, velocity: 0, pitchVelocity: 0, held: false }

/** How far it tips at most, so it never shows its top as a face. */
export const PITCH_LIMIT = 0.55
/** How long the coast takes to lose most of its speed (the time constant, ms): a heavy thing, not a fidget. */
const FRICTION_MS = 420
/** Below this speed it stops coasting and the spring takes it to the nearest whole turn. */
const SETTLE_SPEED = 0.0035
/** The spring to rest: stiffness and damping (a little under critical, so it overshoots a hair and lands). */
const STIFFNESS = 0.00006
const DAMPING = 0.013

const TURN = Math.PI * 2

/** Where it comes to rest from `yaw`: the nearest whole turn, so the face is toward the page. */
export const restingYaw = (yaw: number): number => Math.round(yaw / TURN) * TURN

/** Whether it is still: not held, and at rest on a whole turn, flat. */
export const isStill = (state: SpinState): boolean =>
  !state.held && Math.abs(state.velocity) < 1e-5 && Math.abs(state.pitchVelocity) < 1e-5 && Math.abs(state.yaw - restingYaw(state.yaw)) < 1e-4 && Math.abs(state.pitch) < 1e-4

/** One step of `dt` milliseconds of the motion when not held: the coast, then the spring to rest. Still, it is `REST` (the yaw back to 0, so the numbers do not grow). */
export function stepSpin(state: SpinState, dt: number): SpinState {
  if (state.held) return state
  const step = Math.min(Math.max(dt, 0), 50)
  let { yaw, velocity, pitch, pitchVelocity } = state
  if (Math.abs(velocity) > SETTLE_SPEED) {
    yaw += velocity * step
    velocity *= Math.exp(-step / FRICTION_MS)
  } else {
    const pull = restingYaw(yaw) - yaw
    velocity += (pull * STIFFNESS - velocity * DAMPING) * step
    yaw += velocity * step
  }
  pitchVelocity += (-pitch * STIFFNESS * 2 - pitchVelocity * DAMPING * 1.4) * step
  pitch += pitchVelocity * step
  const next = { yaw, pitch, velocity, pitchVelocity, held: false }
  return isStill(next) ? REST : next
}

/** Moved by a drag of `dx`, `dy` CSS pixels over `dt` ms, on a thing `width` pixels wide: a drag the width of it turns it most of the way round. */
export function dragSpin(state: SpinState, dx: number, dy: number, dt: number, width: number): SpinState {
  const per = TURN / Math.max(width * 1.25, 80)
  const yaw = state.yaw + dx * per
  const pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, state.pitch + dy * per * 0.6))
  // The speed it is let go with is the hand's of the last moments, smoothed so one jerk does not fling it.
  const now = dt > 0 ? (dx * per) / dt : state.velocity
  return { yaw, pitch, velocity: state.velocity * 0.6 + now * 0.4, pitchVelocity: 0, held: true }
}

/** How far a press must move before it is a drag (CSS px), and not a tap (a `Disc`'s tap pauses it). */
const DRAG_START = 6

/**
 * Lets the pointer turn `target`: pressed and dragged sideways (a mouse's, a pen's, a finger's; a finger dragged up and down still scrolls the page, `touch-action: pan-y`), it turns, and `changed` asks
 * for a frame. `state()` is where it is now, stepped by the caller's frame (`step(now)`), which goes on while `moving()`. `dragged()` is true just after a press that turned it, so a click it ends in can
 * be let pass.
 */
export function attachSpin(target: HTMLElement, changed: () => void) {
  let state = REST
  let last = 0
  let press: { id: number; x: number; y: number; at: number; turning: boolean } | null = null
  let turned = false
  const down = (event: PointerEvent) => {
    if (event.button !== 0 || press !== null) return
    press = { id: event.pointerId, x: event.clientX, y: event.clientY, at: event.timeStamp, turning: false }
    turned = false
  }
  const move = (event: PointerEvent) => {
    if (press === null || event.pointerId !== press.id) return
    const [dx, dy] = [event.clientX - press.x, event.clientY - press.y]
    if (!press.turning) {
      if (Math.hypot(dx, dy) < DRAG_START) return
      press.turning = true
      turned = true
      target.setPointerCapture(event.pointerId)
    }
    state = dragSpin(state, dx, dy, event.timeStamp - press.at, target.clientWidth)
    press = { ...press, x: event.clientX, y: event.clientY, at: event.timeStamp }
    changed()
  }
  const up = (event: PointerEvent) => {
    if (press === null || event.pointerId !== press.id) return
    // A hand held still before it lets go lets go of nothing: no coast.
    if (press.turning) state = { ...state, held: false, velocity: event.timeStamp - press.at > 80 ? 0 : state.velocity }
    press = null
    last = 0
    changed()
  }
  const click = (event: MouseEvent) => {
    if (!turned) return
    turned = false
    event.preventDefault()
    event.stopImmediatePropagation()
  }
  target.addEventListener("pointerdown", down)
  target.addEventListener("pointermove", move)
  target.addEventListener("pointerup", up)
  target.addEventListener("pointercancel", up)
  target.addEventListener("click", click, true)
  return {
    state: () => state,
    moving: () => !isStill(state),
    step(now: number) {
      const dt = last === 0 ? 16 : now - last
      last = now
      state = stepSpin(state, dt)
      if (isStill(state)) last = 0
    },
    detach() {
      target.removeEventListener("pointerdown", down)
      target.removeEventListener("pointermove", move)
      target.removeEventListener("pointerup", up)
      target.removeEventListener("pointercancel", up)
      target.removeEventListener("click", click, true)
    },
  }
}

export type SpinControl = ReturnType<typeof attachSpin>

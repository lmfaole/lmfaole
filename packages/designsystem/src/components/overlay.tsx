"use client"

import { useId, type ReactNode } from "react"

import { X } from "../lib/icons"
import { CommandButton } from "./internal/command-button"

interface OverlayProps {
  /** What a `CommandButton` points at with `commandFor`. */
  id: string
  /** `dialog` is a box in the middle; `wide` is the same for a list or a grid that needs the room; `sheet` comes up from the bottom of the screen; `media` is a wide box in the middle for a picture or a video (`MediaGallery`). */
  variant: "dialog" | "wide" | "sheet" | "media"
  title: string
  /** The title is read by a screen reader and not drawn, where the content says what it is already. */
  hideTitle?: boolean
  children: ReactNode
}

/**
 * A modal `<dialog>`: focus is trapped, the page behind is inert, Esc closes it, and a tap outside closes it too
 * (`closedby="any"`, with a click handler for the browsers that do not know the attribute). Opened with
 * `<CommandButton command="show-modal" commandFor={id}>`. Its look and motion are in `overlay.css`.
 */
export function Overlay({ id, variant, title, hideTitle = false, children }: OverlayProps) {
  const titleId = useId()
  return (
    <dialog id={id} data-overlay={variant} closedby="any" aria-labelledby={titleId} onClick={(event) => event.target === event.currentTarget && event.currentTarget.close()}>
      <div data-overlay-body="">
        <h2 id={titleId} className={hideTitle ? "sr-only" : "font-medium"}>
          {title}
        </h2>
        <CommandButton command="close" commandFor={id} look="close" label="Lukk">
          <X aria-hidden="true" />
        </CommandButton>
        {children}
      </div>
    </dialog>
  )
}

/** Most logos are dark or coloured, so the head gives them a light plate. */
const LOGO = "h-12 w-auto max-w-44 rounded-md bg-logo-plate object-contain p-1.5 backdrop-blur"

/** One logo on a light plate, the name as its alt text and tooltip. */
export function Logo({ name, src }: { name: string; src: string }) {
  return <img src={src} alt={name} title={name} decoding="async" className={LOGO} />
}

/** Logos side by side, for the head of a page; none where there are none. */
export function Logos({ logos }: { logos: readonly { name: string; src: string }[] }) {
  if (logos.length === 0) return null
  return (
    <span className="grid grid-flow-col items-center justify-start gap-x-4">
      {logos.map(({ name, src }) => (
        <Logo key={name} name={name} src={src} />
      ))}
    </span>
  )
}

/**
 * Services side by side, each its small square logo and its name under one term (where a film streams, which shops rent it): the logo is
 * recognised before the name is read, and the name says it to everyone. The logos are a source's own icons (TMDB's of a streaming service),
 * shown whole on a soft tile, never cropped round. A link for the whole list, where there is one, is the page's to put after it.
 */
export function LogoList({ items, label }: { items: readonly { name: string; src: string | null }[]; /** What the list is of, for a screen reader («Strømming»). */ label: string }) {
  if (items.length === 0) return null
  return (
    <ul aria-label={label} className="flex flex-wrap gap-x-4 gap-y-2">
      {items.map(({ name, src }) => (
        <li key={name} className="flex items-center gap-2 text-sm">
          <span aria-hidden="true" className="bg-muted size-8 shrink-0 overflow-hidden rounded-lg">
            {src === null ? null : <img src={src} alt="" width={32} height={32} loading="lazy" decoding="async" className="size-full object-cover" />}
          </span>
          {name}
        </li>
      ))}
    </ul>
  )
}

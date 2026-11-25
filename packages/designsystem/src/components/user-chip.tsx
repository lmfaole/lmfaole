import { Icon } from "./icon"
import { ENTITY_LINK, STRETCHED_LINK, STRETCHED_ROW } from "../lib/link-style"

/**
 * Whose data the app shows, where the reader always sees it (the head or the foot of the app's frame): «Viser data for octocat · Bytt».
 * `href` leads to the `UsernameForm`, filled in with the name, where another can be given or the name cleared. «Bytt» is the one link,
 * but it covers the whole chip: a tap on the name changes it too, while a screen reader still hears only «Bytt brukernavn». The chip is 1.5rem high;
 * on a touch screen it reaches 0.625rem above and below its line (2.75rem) without moving what is round it.
 */
export function UserChip({ user, href }: { user: string; href: string }) {
  return (
    <p className={`${STRETCHED_ROW} text-muted-foreground flex w-fit min-w-0 flex-wrap items-center gap-x-1.5 text-sm pointer-coarse:-my-2.5 pointer-coarse:py-2.5`}>
      <Icon name="person" size="sm" tone="muted" />
      <span>Viser data for</span>
      <span className="text-foreground font-medium [overflow-wrap:anywhere]">{user}</span>
      <span aria-hidden="true">·</span>
      <a href={href} data-stretched="" className={`text-foreground ${ENTITY_LINK} ${STRETCHED_LINK}`}>
        Bytt
        <span className="sr-only"> brukernavn</span>
      </a>
    </p>
  )
}


const THEMES = { light: ["light"], dark: ["dark"], system: ["light", "dark"] } as const

/**
 * INTERNAL (`ThemeChoice`, `AppearanceSettings`): a picture of a page in a theme, for the theme's choice (an option's `preview`): drawn by the theme's own tokens under `data-theme`, so it is what the page will look like, not a picture of
 * it. `system` is half light and half dark. It fills a visual card. Decorative.
 */
export function ThemeSample({ theme }: { theme: "system" | "light" | "dark" }) {
  return (
    <span aria-hidden="true" className="border-border flex aspect-[16/7] w-full overflow-hidden rounded-lg border sm:aspect-[4/3]">
      {THEMES[theme].map((one) => (
        <span key={one} data-theme={one} className="bg-background text-foreground grid min-w-0 flex-1 content-start gap-2 p-3">
          <span className="text-lg font-semibold">
            Aa
          </span>
          <span className="bg-muted-foreground/60 block h-1.5 w-3/4 rounded-full" />
          <span className="bg-muted-foreground/40 block h-1.5 w-1/2 rounded-full" />
          <span className="bg-primary mt-1 block h-3 w-1/2 rounded-full" />
        </span>
      ))}
    </span>
  )
}

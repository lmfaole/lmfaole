import { Icon } from "./icon"
import { Button } from "./ui/button"

/**
 * A search of a list that sends the reader to the same page with `?q=…` (a GET form: the result has an address, works without script and
 * is found again). It stands above the list, with its label visible and the button in words; it is not hidden behind an icon. Say
 * how many results there were («5 treff») and use an `EmptyState` for none. The button is as tall as the input (2.25rem), and the label above
 * puts the cursor in the input. `value` is the search that was sent, so it stays in the input on the page of results.
 */
export function SearchField({ label, action, value = "", name = "q" }: { label: string; action: string; value?: string; name?: string }) {
  return (
    <form role="search" method="get" action={action} className="grid gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex gap-2">
        <input id={name} name={name} type="search" defaultValue={value} className="border-muted-foreground bg-background focus-visible:ring-ring h-9 min-w-0 flex-1 rounded-md border px-3 text-base focus-visible:ring-2 focus-visible:outline-none" />
        <Button type="submit" variant="outline" size="lg">
          <Icon name="search" slot="start" />
          Søk
        </Button>
      </div>
    </form>
  )
}

import { FieldError } from "./field-error"
import { Text } from "./text"

/**
 * A short list typed one item to a line (repositories to follow, places, tags), as one native `<textarea>` with its label, hint and
 * error laid out as in `TextField`. It needs no JavaScript to add or remove a line, and the server reads it back with `parseListField`
 * (`lib/list-field`): lines and commas split it, blanks and repeats go. Say the format in `hint` («Én per linje, som eier/navn»), and
 * name the line that is wrong in `error`. `values` are the lines it starts with. What is typed is taken exactly (names, ids): no capital at
 * the start and no spelling check.
 */
export function ListField({ label, name, values = [], hint, error, optional = false, placeholder }: { label: string; name: string; values?: readonly string[]; hint?: string; error?: string; optional?: boolean; placeholder?: string }) {
  const hintId = `${name}-hint`
  const errorId = `${name}-error`
  const described = [hint === undefined ? null : hintId, error === undefined ? null : errorId].filter((id) => id !== null).join(" ")
  return (
    <div className="grid gap-1" data-field="">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {optional ? <span className="text-muted-foreground font-normal"> (valgfritt)</span> : null}
      </label>
      {hint === undefined ? null : (
        <Text role="quiet" id={hintId}>
          {hint}
        </Text>
      )}
      {error === undefined ? null : <FieldError id={errorId}>{error}</FieldError>}
      <textarea
        id={name}
        name={name}
        rows={4}
        defaultValue={values.join("\n")}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-invalid={error === undefined ? undefined : true}
        aria-describedby={described === "" ? undefined : described}
        className={`border-muted-foreground bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 font-mono text-sm leading-6 focus-visible:ring-2 focus-visible:outline-none ${error === undefined ? "" : "border-destructive"}`}
      />
    </div>
  )
}

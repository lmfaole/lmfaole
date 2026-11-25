import { FieldError } from "./field-error"
import { Text } from "./text"

/**
 * One native text input with everything the reader needs beside it: the label above (always visible, never a placeholder), a hint
 * for the format, and the error, tied to the input with `aria-describedby`. The error is shown in words with a symbol and begins with
 * a hidden «Feil:» for a screen reader. Validate on submit, not while typing, and give the same words here and in the
 * `FormErrorSummary`. Mark only the minority: `optional` writes «(valgfritt)» when most fields are required. `verbatim` (on by default) is for what is typed exactly (a username,
 * a code): no capital letter at the start and no spelling check; turn it off for words. `value` is what the field holds when the page is drawn. A `placeholder` is only an example of the format, never the label. Read-only is shown as text
 * in a `FactList`; avoid `disabled` and say why instead. `name` is the id of the field, so a summary can link to it.
 */
export function TextField({ label, name, hint, error, optional = false, value, autoComplete, placeholder, verbatim = true }: { label: string; name: string; hint?: string | undefined; error?: string | undefined; optional?: boolean; value?: string | undefined; autoComplete?: string | undefined; placeholder?: string | undefined; verbatim?: boolean }) {
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
      <input
        id={name}
        name={name}
        type="text"
        defaultValue={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        {...(verbatim ? { autoCapitalize: "none", autoCorrect: "off", spellCheck: false } : {})}
        aria-invalid={error === undefined ? undefined : true}
        aria-describedby={described === "" ? undefined : described}
        className={`border-muted-foreground bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-base focus-visible:ring-2 focus-visible:outline-none ${error === undefined ? "" : "border-destructive"}`}
      />
    </div>
  )
}

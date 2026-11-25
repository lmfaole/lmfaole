import { ChoiceCards } from "@lmfaole/designsystem/components/choice-cards"
import { FieldError } from "@lmfaole/designsystem/components/field-error"
import { Stack } from "@lmfaole/designsystem/components/layout"
import { NativeSelect, NativeSelectOption } from "@lmfaole/designsystem/components/native-select"
import { PendingButton } from "@lmfaole/designsystem/components/pending-button"
import { Text } from "@lmfaole/designsystem/components/text"
import { TextField } from "@lmfaole/designsystem/components/text-field"
import type { ReactNode } from "react"

import { FORM_ID, KINDS, LOG_ENDPOINT, type Errors, type Field, type FormValues, type LogKind } from "../lib/log"

/**
 * One kind's form (lib/log.ts says its fields), to Logg's endpoint: new (`entryKey` none) or a row to change. Validated on the server
 * only (`noValidate`); what it could not take comes back as `errors`, with `values` as they were written.
 */
export function LogForm({ kind, entryKey, values, errors, cinemas = [], children }: { kind: LogKind; entryKey?: string; values: FormValues; errors: Errors; /** The film form's choices. */ cinemas?: readonly string[]; /** Under the fields, before «Lagre»: what the form keeps but does not show. */ children?: ReactNode }) {
  return (
    <form id={FORM_ID} method="post" action={LOG_ENDPOINT} noValidate>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="op" value={entryKey === undefined ? "create" : "update"} />
      {entryKey === undefined ? null : <input type="hidden" name="key" value={entryKey} />}
      <Stack>
        {KINDS[kind].fields.map((field) => (
          <LogField key={field.name} field={field} value={values[field.name] ?? ""} error={errors[field.name]} cinemas={field.type === "cinema" ? withCurrent(cinemas, values[field.name]) : []} />
        ))}
        {children}
        <div>
          <PendingButton pendingLabel="Lagrer …">Lagre</PendingButton>
        </div>
      </Stack>
    </form>
  )
}

/** The cinemas, and the one a film has where it is no longer among them (renamed in the database by hand), so a save does not lose it. */
const withCurrent = (cinemas: readonly string[], current: string | undefined): readonly string[] => (current && !cinemas.includes(current) ? [current, ...cinemas] : cinemas)

function LogField({ field, value, error, cinemas }: { field: Field; value: string; error: string | undefined; cinemas: readonly string[] }) {
  const optional = field.optional === true
  if (field.type === "choice") return <ChoiceCards name={field.name} legend={field.label} value={value} options={field.options} {...(field.hint === undefined ? {} : { hint: field.hint })} {...(error === undefined ? {} : { error })} />
  if (field.type === "cinema") {
    // The design system has no labelled select field yet: the label, hint and error are put round `NativeSelect` here, as `TextField` has them.
    const described = [field.hint === undefined ? null : `${field.name}-hint`, error === undefined ? null : `${field.name}-error`].filter((id) => id !== null).join(" ")
    return (
      <Stack gap="tight">
        <label htmlFor={field.name}>
          {field.label}
          {optional ? " (valgfritt)" : null}
        </label>
        {field.hint === undefined ? null : (
          <Text role="quiet" id={`${field.name}-hint`}>
            {field.hint}
          </Text>
        )}
        {error === undefined ? null : <FieldError id={`${field.name}-error`}>{error}</FieldError>}
        <NativeSelect id={field.name} name={field.name} defaultValue={value} aria-invalid={error === undefined ? undefined : true} aria-describedby={described === "" ? undefined : described}>
          <NativeSelectOption value="">Ingen kino</NativeSelectOption>
          {cinemas.map((name) => (
            <NativeSelectOption key={name} value={name}>
              {name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Stack>
    )
  }
  const words = field.type === "text" && field.verbatim !== true
  return <TextField label={field.label} name={field.name} value={value} hint={field.hint} error={error} optional={optional} verbatim={!words} {...(field.type === "url" ? { autoComplete: "url" } : { autoComplete: "off" })} />
}

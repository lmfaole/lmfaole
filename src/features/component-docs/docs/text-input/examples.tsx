import { useState, useEffect } from "react";
import { TextInput } from "@fremtind/jokul/text-input";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


export const examples: ComponentExample[] = [
    {
                title: "Grunnleggende bruk",
                description: "Et enkelt kontrollert inputfelt. Legg alltid til label og koble onChange til state.",
                code: `const [value, setValue] = React.useState("");

    <TextInput
      label="Fullt navn"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Ola Nordmann"
      autoComplete="name"
    />`,
                tags: ["controlled"],
                preview: (
                    <TextInput
                        label="Fullt navn"
                        defaultValue=""
                        placeholder="Ola Nordmann"
                        autoComplete="name"
                    />
                ),
            },
    {
                title: "Med hjelpetekst",
                description: "helpLabel brukes for format-hint eller instruksjoner. Vises rett under label, ikke som placeholder.",
                code: `<TextInput
      label="Fødselsnummer"
      helpLabel="11 siffer, f.eks. 01010112345"
      type="tel"
      autoComplete="off"
    />`,
                preview: (
                    <TextInput
                        label="Fødselsnummer"
                        helpLabel="11 siffer, f.eks. 01010112345"
                        type="tel"
                        autoComplete="off"
                    />
                ),
            },
    {
                title: "Med feilmelding",
                description: "errorLabel erstatter helpLabel og endrer feltet til feil-tilstand. Vis kun ved faktisk feil — ikke initialiser med feilmelding.",
                code: `<TextInput
      label="E-postadresse"
      value="ikke-en-epost"
      errorLabel="Skriv inn en gyldig e-postadresse"
      type="email"
      autoComplete="email"
    />`,
                tags: ["error-state"],
                preview: (
                    <TextInput
                        label="E-postadresse"
                        defaultValue="ikke-en-epost"
                        errorLabel="Skriv inn en gyldig e-postadresse"
                        type="email"
                        autoComplete="email"
                    />
                ),
            },
    {
                title: "Skrivebeskyttet",
                description: "readOnly passer for verdier brukeren skal se men ikke endre, f.eks. beregnet verdi eller hentet data.",
                code: `<TextInput
      label="Organisasjonsnummer"
      value="923 609 016"
      readOnly
    />`,
                preview: (
                    <TextInput
                        label="Organisasjonsnummer"
                        defaultValue="923 609 016"
                        readOnly
                    />
                ),
            }
];

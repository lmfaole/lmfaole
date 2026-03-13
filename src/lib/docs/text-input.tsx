import React from "react";
import { TextInput } from "@fremtind/jokul/text-input";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "text-input",
    name: "TextInput",
    package: "@fremtind/jokul/text-input",
    category: "Skjema",
    tags: ["input", "skjema", "interaktiv", "skjemabygging", "kontrollert"],
    description: "TextInput er en enkeltlinjers tekstinndatafelt. Komponenten inkluderer label, feilmelding og hjelpetekst i ett og håndterer tilgjengelighet automatisk — label er koblet til input via htmlFor/id. Alle skjema-primitiver i Jøkul følger samme API-mønster.",
    notes: "Bruk alltid label — ikke bruk placeholder som erstatning for label. Placeholder-tekst forsvinner når brukeren skriver og er ikke tilgjengelig. helpLabel brukes for format-hint som «Skriv inn dato som DD.MM.ÅÅÅÅ».",
    relatedIds: ["button"],
    props: [
        {
            name: "label",
            type: "string",
            required: true,
            description: "Synlig label over inputfeltet. Kobles automatisk til input-elementet for tilgjengelighet. Bruk et beskrivende substantiv, f.eks. «Navn» eller «E-postadresse».",
        },
        {
            name: "value",
            type: "string",
            required: false,
            description: "Kontrollert verdi. Bruk sammen med onChange for kontrollert komponent-mønster.",
        },
        {
            name: "defaultValue",
            type: "string",
            required: false,
            description: "Initiell verdi for ukontrollert bruk. Ikke bruk sammen med value.",
        },
        {
            name: "onChange",
            type: "React.ChangeEventHandler<HTMLInputElement>",
            required: false,
            description: "Kalles ved hvert tastetrykk. Brukes i kontrollert komponent-mønster.",
        },
        {
            name: "errorLabel",
            type: "string",
            required: false,
            description: "Feilmelding vist under inputfeltet med rød ramme. Vis kun ved faktisk valideringsfeil — ikke vis tomt errorLabel. Tømmes automatisk når verdien er gyldig.",
        },
        {
            name: "helpLabel",
            type: "string",
            required: false,
            description: "Hjelpetekst vist under label. Brukes for format-hint eller kortfattede instruksjoner. Vises ikke når errorLabel er satt.",
        },
        {
            name: "placeholder",
            type: "string",
            required: false,
            description: "Plassholdertekst i tomt felt. Bruk kun for eksempelverdi, aldri som erstatning for label. Ikke bruk instruksjoner som placeholder.",
        },
        {
            name: "disabled",
            type: "boolean",
            required: false,
            default: "false",
            description: "Deaktiverer feltet. Deaktiverte felter sendes ikke med i form-innsending.",
        },
        {
            name: "readOnly",
            type: "boolean",
            required: false,
            default: "false",
            description: "Gjør feltet skrivebeskyttet. Brukeren kan markere og kopiere verdien, men ikke endre den.",
        },
        {
            name: "type",
            type: '"text" | "email" | "password" | "tel" | "url" | "search" | "number"',
            required: false,
            default: '"text"',
            description: "HTML input-type. Velg riktig type for å få riktig tastatur på mobil og semantisk validering.",
        },
        {
            name: "autoComplete",
            type: "string",
            required: false,
            description: "HTML autocomplete-attributt. Bruk alltid autocomplete=\"email\", autocomplete=\"name\" etc. for skjemafelt som brukere forventer autofullfør for.",
        },
    ],
    examples: [
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
        },
    ],
};

export default doc;

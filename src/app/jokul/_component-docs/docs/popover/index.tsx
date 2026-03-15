import type { ComponentDoc } from "../types";
import { props } from "./props";
import { PopoverBasicPreview } from "./preview";

const doc: ComponentDoc = {
    id: "popover",
    name: "Popover",
    package: "@fremtind/jokul/popover",
    category: "Overlegg",
    status: "stable",
    description: {
        short: "Flytende informasjonsboks som vises ved siden av et trigger-element.",
        long: "Popover er en flytende informasjonsboks som vises ved siden av et trigger-element. Den brukes til kontekstuell informasjon, forklaringer og enkle handlinger som ikke krever en full modal. Bygget på Floating UI.",
    },
    warnings: [
        "Popover.Trigger rendrer en <button> som standard. Bruk asChild for å merge trigger-props inn i et eksisterende element uten ekstra DOM-noder.",
        "Popover har ikke klikk-åpning aktivert som default. Når triggeren skal åpnes med klikk (for eksempel en Jøkul Button brukt med asChild), sett clickOptions={{ enabled: true }} på Popover.",
        "Sett modal={false} når popoveren brukes i navigasjonsmenyer eller andre flater der brukeren skal kunne interagere med bakgrunnen.",
    ],
    preview: <PopoverBasicPreview />,

    relationships: {
        related: [{ id: "tooltip", description: "Bruk Tooltip for korte skrivebeskyttede hint; Popover støtter interaktivt innhold som skjemaer eller handlingsmenyer." }, { id: "modal", description: "Bruk Modal når overlegget må blokkere resten av siden og krever en bevisst avvisning." }],
        subcomponents: [
            { id: "popover-trigger", description: "Elementet som åpner og lukker popoveren." },
            { id: "popover-content", description: "Det flytende innholdsområdet som vises når popoveren er åpen." },
        ],
    },
    props,
};

export default doc;

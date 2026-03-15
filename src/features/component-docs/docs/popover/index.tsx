import { Popover } from "@fremtind/jokul/popover";
import { Link } from "@fremtind/jokul/link";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function PopoverBasicPreview() {
    return (
        <Popover>
            <Popover.Trigger>Vis informasjon</Popover.Trigger>
            <Popover.Content padding={16}>
                <p style={{ margin: 0 }}>Her finner du mer informasjon om dette feltet.</p>
                <Link href="#">Les mer</Link>
            </Popover.Content>
        </Popover>
    );
}

const doc: ComponentDoc = {
    id: "popover",
    name: "Popover",
    package: "@fremtind/jokul/popover",
    category: "Overlegg",
    status: "stable",
    description:
        "Popover er en flytende informasjonsboks som vises ved siden av et trigger-element. Den brukes til kontekstuell informasjon, forklaringer og enkle handlinger som ikke krever en full modal. Bygget på Floating UI.",
    warnings: [
        "Popover.Trigger rendrer en <button> som standard. Bruk asChild for å merge trigger-props inn i et eksisterende element uten ekstra DOM-noder.",
        "Sett modal={false} når popoveren brukes i navigasjonsmenyer eller andre flater der brukeren skal kunne interagere med bakgrunnen.",
    ],
    preview: <PopoverBasicPreview />,

    relationships: {
        related: [{ id: "tooltip", description: "Bruk Tooltip for korte skrivebeskyttede hint; Popover støtter interaktivt innhold som skjemaer eller handlingsmenyer." }, { id: "modal", description: "Bruk Modal når overlegget må blokkere resten av siden og krever en bevisst avvisning." }],
    },
    props,
    subComponents: [
        {
            name: "Popover.Trigger",
            description: "Elementet som åpner og lukker popoveren. Rendrer som en <button> som standard. Aksepterer alle native HTML-attributter for det aktuelle elementet.",
            props: [
                {
                    name: "asChild",
                    type: "boolean",
                    required: false,
                    default: "false",
                    source: "custom",
                    status: "stable",
                    description: "Slår sammen trigger-props med child-elementet i stedet for å wrappe det i en <button>. Nyttig for lenker, ikoner og andre eksisterende elementer.",
                },
                {
                    name: "children",
                    type: "React.ReactNode",
                    required: true,
                    source: "react",
                    status: "stable",
                    description: "Innholdet i trigger-elementet.",
                },
            ],
        },
        {
            name: "Popover.Content",
            description: "Det flytende innholdsområdet som vises når popoveren er åpen. Aksepterer alle native div-attributter i tillegg til egne props.",
            props: [
                {
                    name: "padding",
                    type: "0 | 8 | 16 | 24",
                    required: false,
                    default: "0",
                    source: "custom",
                    status: "stable",
                    description: "Innvendig padding i piksler rundt innholdet. Verdiene tilsvarer omtrent jkl-spacing-tokens.",
                },
                {
                    name: "initialFocus",
                    type: "number | React.RefObject<HTMLElement>",
                    required: false,
                    default: "0",
                    source: "custom",
                    status: "stable",
                    description: "Hvilket element som får fokus når popoveren åpnes. Et tall angir en tabbar-index; en ref peker direkte på elementet. Default 0 = første fokuserbare element.",
                },
                {
                    name: "returnFocus",
                    type: "boolean",
                    required: false,
                    default: "true",
                    source: "custom",
                    status: "stable",
                    description: "Om fokus skal returneres til trigger-elementet når popoveren lukkes. Sett til false i navigasjonsdropdowns der fokus skal flyttes videre.",
                },
                {
                    name: "children",
                    type: "React.ReactNode",
                    required: false,
                    source: "react",
                    status: "stable",
                    description: "Innholdet i popoveren.",
                },
            ],
        },
    ],
};

export default doc;

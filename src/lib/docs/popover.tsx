import React from "react";
import { Popover } from "@fremtind/jokul/popover";
import { Button } from "@fremtind/jokul/button";
import type { ComponentDoc } from "./types";

function PopoverBasicPreview() {
    return (
        <Popover>
            <Popover.Trigger>
                <Button>Vis info</Button>
            </Popover.Trigger>
            <Popover.Content padding={16}>
                Dette er et popover med litt innhold.
            </Popover.Content>
        </Popover>
    );
}

function PopoverRichPreview() {
    return (
        <Popover>
            <Popover.Trigger>
                <Button>Les mer</Button>
            </Popover.Trigger>
            <Popover.Content padding={24}>
                <strong style={{ display: "block", marginBottom: "var(--jkl-spacing-s)" }}>
                    Om denne funksjonen
                </strong>
                <p style={{ margin: 0 }}>
                    Denne funksjonen lar deg tilpasse innstillingene dine for en bedre
                    brukeropplevelse. Endringer lagres automatisk.
                </p>
            </Popover.Content>
        </Popover>
    );
}

function PopoverAsChildPreview() {
    return (
        <Popover>
            <Popover.Trigger asChild>
                <button style={{ textDecoration: "underline", cursor: "pointer", background: "none", border: "none", padding: 0, color: "inherit" }}>
                    Hva betyr dette?
                </button>
            </Popover.Trigger>
            <Popover.Content padding={16}>
                Dette er en forklaring på begrepet.
            </Popover.Content>
        </Popover>
    );
}

const doc: ComponentDoc = {
    id: "popover",
    name: "Popover",
    package: "@fremtind/jokul/popover",
    category: "Visning",
    tags: ["tooltip", "flyout", "popover", "informasjon", "floating"],
    status: "stable",
    description:
        "Popover er en flytende informasjonsboks som vises ved siden av et trigger-element. Den brukes til kontekstuell informasjon og handlinger som ikke krever en full modal.",
    notes:
        "Popover er en compound component: bruk Popover.Trigger og Popover.Content. Bruk asChild på Trigger for å merge props inn i et eksisterende element.",
    props: [
        {
            name: "padding (Popover.Content)",
            type: "0 | 8 | 16 | 24",
            required: false,
            default: "0",
            description: "Innvendig padding i innholdsområdet.",
        },
        {
            name: "initialFocus (Popover.Content)",
            type: "RefObject<HTMLElement>",
            required: false,
            description: "Ref til elementet som skal få fokus når popoveren åpnes.",
        },
        {
            name: "returnFocus (Popover.Content)",
            type: "RefObject<HTMLElement>",
            required: false,
            description: "Ref til elementet som skal få fokus tilbake når popoveren lukkes.",
        },
        {
            name: "asChild (Popover.Trigger)",
            type: "boolean",
            required: false,
            description: "Merger trigger-props inn i child-elementet i stedet for å wrappe det.",
        },
    ],
    examples: [
        {
            title: "Grunnleggende popover",
            description: "En enkel popover med litt tekst.",
            code: `import { Popover } from "@fremtind/jokul/popover";
import { Button } from "@fremtind/jokul/button";

<Popover>
    <Popover.Trigger>
        <Button>Vis info</Button>
    </Popover.Trigger>
    <Popover.Content padding={16}>
        Dette er et popover med litt innhold.
    </Popover.Content>
</Popover>`,
            preview: <PopoverBasicPreview />,
        },
        {
            title: "Med mer innhold",
            description: "Popover med overskrift og avsnitt, og større padding.",
            code: `import { Popover } from "@fremtind/jokul/popover";
import { Button } from "@fremtind/jokul/button";

<Popover>
    <Popover.Trigger>
        <Button>Les mer</Button>
    </Popover.Trigger>
    <Popover.Content padding={24}>
        <strong style={{ display: "block", marginBottom: "var(--jkl-spacing-s)" }}>
            Om denne funksjonen
        </strong>
        <p style={{ margin: 0 }}>
            Denne funksjonen lar deg tilpasse innstillingene dine for en bedre
            brukeropplevelse. Endringer lagres automatisk.
        </p>
    </Popover.Content>
</Popover>`,
            preview: <PopoverRichPreview />,
        },
        {
            title: "asChild trigger",
            description:
                "Med asChild merges trigger-props inn i child-elementet, uten ekstra DOM-noder.",
            code: `import { Popover } from "@fremtind/jokul/popover";

<Popover>
    <Popover.Trigger asChild>
        <button>Hva betyr dette?</button>
    </Popover.Trigger>
    <Popover.Content padding={16}>
        Dette er en forklaring på begrepet.
    </Popover.Content>
</Popover>`,
            preview: <PopoverAsChildPreview />,
        },
    ],
};

export default doc;

import React from "react";
import { Popover } from "@fremtind/jokul/popover";
import type { ComponentDoc } from "./types";

function PopoverBasicPreview() {
    return (
        <Popover>
            <Popover.Trigger>Vis info</Popover.Trigger>
            <Popover.Content padding={16}>
                Dette er et popover med litt innhold.
            </Popover.Content>
        </Popover>
    );
}

function PopoverRichPreview() {
    return (
        <Popover>
            <Popover.Trigger>Les mer</Popover.Trigger>
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
                <span style={{ textDecoration: "underline", cursor: "pointer" }}>
                    Hva betyr dette?
                </span>
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
        "Popover er en compound component: Popover.Trigger rendrer som en knapp som standard. Bruk asChild for å merge trigger-props inn i et eksisterende element.",
    props: [
        {
            name: "padding (Popover.Content)",
            type: "0 | 8 | 16 | 24",
            required: false,
            source: "custom",
            default: "0",
            description: "Innvendig padding i innholdsområdet.",
        },
        {
            name: "initialFocus (Popover.Content)",
            type: "number | RefObject<HTMLElement>",
            required: false,
            source: "custom",
            default: "0",
            description: "Elementet som får fokus når popoveren åpnes. 0 = første fokuserbare element.",
        },
        {
            name: "returnFocus (Popover.Content)",
            type: "boolean",
            required: false,
            source: "custom",
            default: "true",
            description: "Om fokus returneres til triggeren når popoveren lukkes.",
        },
        {
            name: "asChild (Popover.Trigger)",
            type: "boolean",
            required: false,
            source: "custom",
            default: "false",
            description: "Merger trigger-props inn i child-elementet i stedet for å wrappe det i en knapp.",
        },
    ],
    examples: [
        {
            title: "Grunnleggende popover",
            description: "Popover.Trigger rendrer som en knapp som standard — ingen ekstra Button-komponent nødvendig.",
            code: `<Popover>
    <Popover.Trigger>Vis info</Popover.Trigger>
    <Popover.Content padding={16}>
        Dette er et popover med litt innhold.
    </Popover.Content>
</Popover>`,
            preview: <PopoverBasicPreview />,
        },
        {
            title: "Med mer innhold",
            description: "Popover med overskrift og avsnitt, og større padding.",
            code: `<Popover>
    <Popover.Trigger>Les mer</Popover.Trigger>
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
                "Med asChild merges trigger-props inn i child-elementet, uten ekstra DOM-noder. Nyttig når du vil at en lenke eller annet element skal åpne popoveren.",
            code: `<Popover>
    <Popover.Trigger asChild>
        <span style={{ textDecoration: "underline", cursor: "pointer" }}>
            Hva betyr dette?
        </span>
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

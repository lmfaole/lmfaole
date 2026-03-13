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
    warnings: "Bruk asChild på Popover.Trigger for å merge trigger-props inn i et eksisterende element uten å introdusere et ekstra DOM-element.",
    preview: (
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
            <div style={{ background: "var(--jkl-color-background-default)", border: "1px solid var(--jkl-color-border-default)", borderRadius: "4px", padding: "var(--jkl-spacing-s) var(--jkl-spacing-m)", minWidth: "200px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <p style={{ margin: 0, fontSize: "0.9em" }}>Forsikringen gjelder for alle i husstanden og dekker ulykker 24/7.</p>
            </div>
            <button style={{ padding: "8px 16px", border: "1px solid var(--jkl-color-border-default)", borderRadius: "4px", background: "var(--jkl-color-background-default)" }}>Mer info</button>
        </div>
    ),
    props: [
        {
            name: "children",
            type: "React.ReactNode",
            required: true,
            source: "react",
            status: "stable",
            description: "Popover.Trigger og Popover.Content.",
        },
    ],
    subComponents: [
        {
            name: "Popover.Trigger",
            description: "Elementet som åpner og lukker popoveren. Rendrer som en knapp som standard.",
            props: [
                { name: "asChild", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Merger trigger-props inn i child-elementet i stedet for å wrappe det i en knapp." },
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Innholdet i trigger-elementet." },
            ],
        },
        {
            name: "Popover.Content",
            description: "Det flytende innholdsområdet som vises når popoveren er åpen.",
            props: [
                { name: "padding", type: '"s" | "m" | "l"', required: false, source: "custom", status: "stable", default: '"m"', description: "Innvendig padding i innholdsområdet." },
                { name: "initialFocus", type: "React.RefObject<HTMLElement>", required: false, source: "custom", status: "stable", description: "Elementet som får fokus når popoveren åpnes." },
                { name: "returnFocus", type: "React.RefObject<HTMLElement>", required: false, source: "custom", status: "stable", description: "Elementet som får fokus når popoveren lukkes." },
                { name: "children", type: "React.ReactNode", required: false, source: "react", status: "stable", description: "Innholdet i popoveren." },
            ],
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

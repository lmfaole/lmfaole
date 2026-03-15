import React from "react";
import { Popover } from "@fremtind/jokul/popover";
import { Link } from "@fremtind/jokul/link";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentExample } from "../types";


export function PopoverBasicPreview() {
    return (
        <Popover>
            <Popover.Trigger>Vis info</Popover.Trigger>
            <Popover.Content padding={16}>
                Forsikringen gjelder for alle i husstanden og dekker ulykker 24/7.
            </Popover.Content>
        </Popover>
    );
}

function PopoverRichPreview() {
    return (
        <Popover>
            <Popover.Trigger>Les mer</Popover.Trigger>
            <Popover.Content padding={24}>
                <strong>Om denne funksjonen</strong>
                <p>
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
                <Link href="#">Hva betyr dette?</Link>
            </Popover.Trigger>
            <Popover.Content padding={16}>
                En forklaring på begrepet som hjelper brukeren å forstå konteksten.
            </Popover.Content>
        </Popover>
    );
}

function PopoverPlacementPreview() {
    return (
        <Flex gap="s" wrap="wrap">
            {(["top", "bottom", "left", "right"] as const).map((placement) => (
                <Popover key={placement} placement={placement}>
                    <Popover.Trigger>{placement}</Popover.Trigger>
                    <Popover.Content padding={16}>
                        Vises {placement === "top" ? "over" : placement === "bottom" ? "under" : placement === "left" ? "til venstre for" : "til høyre for"} trigger.
                    </Popover.Content>
                </Popover>
            ))}
        </Flex>
    );
}

function PopoverControlledPreview() {
    const [open, setOpen] = React.useState(false);
    return (
        <Flex gap="s" alignItems="center">
            <Popover open={open} onOpenChange={setOpen}>
                <Popover.Trigger>
                    {open ? "Lukk" : "Åpne"} popover
                </Popover.Trigger>
                <Popover.Content padding={16}>
                    Denne popoveren er kontrollert utenfra.
                </Popover.Content>
            </Popover>
        </Flex>
    );
}


export const examples: ComponentExample[] = [
    {
                title: "Grunnleggende popover",
                description: "Popover.Trigger rendrer som en <button> som standard — ingen ekstern knapp nødvendig. Klikk for å åpne og lukke.",
                code: `<Popover>
        <Popover.Trigger>Vis info</Popover.Trigger>
        <Popover.Content padding={16}>
            Forsikringen gjelder for alle i husstanden og dekker ulykker 24/7.
        </Popover.Content>
    </Popover>`,
                preview: <PopoverBasicPreview />,
            },
    {
                title: "Med rikt innhold",
                description: "Popover.Content kan inneholde vilkårlig JSX. Bruk padding={24} for mer luft rundt lengre innhold.",
                code: `<Popover>
        <Popover.Trigger>Les mer</Popover.Trigger>
        <Popover.Content padding={24}>
            <strong>Om denne funksjonen</strong>
            <p>
                Denne funksjonen lar deg tilpasse innstillingene dine for en bedre
                brukeropplevelse. Endringer lagres automatisk.
            </p>
        </Popover.Content>
    </Popover>`,
                preview: <PopoverRichPreview />,
            },
    {
                title: "asChild — trigger som lenke",
                description: "Med asChild={true} slås trigger-props sammen med child-elementet. Her brukes en Jøkul Link som trigger uten ekstra DOM-noder.",
                code: `import { Link } from "@fremtind/jokul/link";

    <Popover>
        <Popover.Trigger asChild>
            <Link href="#">Hva betyr dette?</Link>
        </Popover.Trigger>
        <Popover.Content padding={16}>
            En forklaring på begrepet som hjelper brukeren å forstå konteksten.
        </Popover.Content>
    </Popover>`,
                preview: <PopoverAsChildPreview />,
            },
    {
                title: "Placement",
                description: "placement-propen styrer hvilken side popoveren vises på. Floating UI justerer automatisk hvis det ikke er plass.",
                code: `<Popover placement="top">
        <Popover.Trigger>top</Popover.Trigger>
        <Popover.Content padding={16}>Vises over trigger.</Popover.Content>
    </Popover>

    <Popover placement="right">
        <Popover.Trigger>right</Popover.Trigger>
        <Popover.Content padding={16}>Vises til høyre for trigger.</Popover.Content>
    </Popover>`,
                preview: <PopoverPlacementPreview />,
            },
    {
                title: "Kontrollert modus",
                description: "Styr åpen/lukket-tilstand selv via open og onOpenChange. Nyttig for programmatisk kontroll, f.eks. ved onboarding-flows.",
                code: `const [open, setOpen] = React.useState(false);

    <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
            {open ? "Lukk" : "Åpne"} popover
        </Popover.Trigger>
        <Popover.Content padding={16}>
            Denne popoveren er kontrollert utenfra.
        </Popover.Content>
    </Popover>`,
                preview: <PopoverControlledPreview />,
            },
    {
                title: "Ikke-modal — hover-meny",
                description: "modal={false} lar brukeren interagere med bakgrunnen mens popoveren er åpen. Kombiner med returnFocus={false} i navigasjonsmenyer. Dette er mønsteret SiteHeader bruker.",
                code: `<Popover
        open={open}
        onOpenChange={setOpen}
        placement="bottom-start"
        modal={false}
        offset={4}
    >
        <Popover.Trigger asChild>
            <button
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                Grunnleggende
            </button>
        </Popover.Trigger>
        <Popover.Content
            padding={0}
            returnFocus={false}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {/* menyinnhold */}
        </Popover.Content>
    </Popover>`,
            }
];

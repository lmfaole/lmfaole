import { Help } from "@fremtind/jokul/help";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentExample } from "../types";


function BasicHelpPreview() {
    return (
        <div style={{ padding: "var(--jkl-spacing-xl) 0" }}>
            <Flex alignItems="center" gap="s">
                <span>Personnummer</span>
                <Help buttonText="Hjelp om personnummer" position="right">
                    Personnummeret ditt er et 11-sifret nummer som identifiserer deg i offentlige registre.
                </Help>
            </Flex>
        </div>
    );
}

function PositionsPreview() {
    return (
        <Flex
            wrap="wrap"
            gap="xl"
            alignItems="center"
            justifyContent="center"
            style={{ padding: "var(--jkl-spacing-xl)" }}
        >
            <Help buttonText="Hjelp øverst" position="top">
                Popover vises over knappen.
            </Help>
            <Help buttonText="Hjelp nederst" position="bottom">
                Popover vises under knappen.
            </Help>
            <Help buttonText="Hjelp til venstre" position="left">
                Popover vises til venstre.
            </Help>
            <Help buttonText="Hjelp til høyre" position="right">
                Popover vises til høyre.
            </Help>
        </Flex>
    );
}

function LongContentPreview() {
    return (
        <div style={{ padding: "var(--jkl-spacing-xl) 0" }}>
            <Flex alignItems="center" gap="s">
                <span>Hva er en fullmakt?</span>
                <Help buttonText="Forklaring av fullmakt" position="bottom">
                    En fullmakt er et dokument som gir en person rett til å handle på vegne av en annen. Fullmakten kan
                    være generell eller begrenset til spesifikke handlinger, og kan trekkes tilbake når som helst.
                </Help>
            </Flex>
        </div>
    );
}


export const examples: ComponentExample[] = [
    {
                title: "Grunnleggende bruk",
                description: "Plasser Help ved siden av et felt for å gi kontekstuell hjelp.",
                code: `import { Help } from "@fremtind/jokul/help";
    import { Flex } from "@fremtind/jokul/flex";

    <Flex alignItems="center" gap="xs">
        <span>Personnummer</span>
        <Help buttonText="Hjelp om personnummer" position="right">
            Personnummeret ditt er et 11-sifret nummer som identifiserer deg i offentlige registre.
        </Help>
    </Flex>`,
                preview: <BasicHelpPreview />,
            },
    {
                title: "Popover-posisjon",
                description: "Velg hvilken side popoveret åpner på med position-prop.",
                code: `import { Help } from "@fremtind/jokul/help";

    <Help buttonText="Hjelp øverst" position="top">Popover vises over knappen.</Help>
    <Help buttonText="Hjelp nederst" position="bottom">Popover vises under knappen.</Help>
    <Help buttonText="Hjelp til venstre" position="left">Popover vises til venstre.</Help>
    <Help buttonText="Hjelp til høyre" position="right">Popover vises til høyre.</Help>`,
                preview: <PositionsPreview />,
            },
    {
                title: "Langt innhold",
                description: "Popoveret kan inneholde lengre forklaringstekst.",
                code: `import { Help } from "@fremtind/jokul/help";

    <Help buttonText="Forklaring av fullmakt" position="bottom">
        En fullmakt er et dokument som gir en person rett til å handle på vegne av en annen.
        Fullmakten kan være generell eller begrenset til spesifikke handlinger.
    </Help>`,
                preview: <LongContentPreview />,
            }
];

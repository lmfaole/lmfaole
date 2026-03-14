import { useState, useEffect } from "react";
import { SystemMessage } from "@fremtind/jokul/system-message";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


const VARIANTS = ["info", "success", "warning", "error"];


function DismissPreview() {
    const [dismissed, setDismissed] = useState(false);
    return dismissed ? (
        <p style={{ color: "var(--jkl-color-text-subdued)" }}>Meldingen ble lukket.</p>
    ) : (
        <SystemMessage
            variant="info"
            dismissAction={{
                handleDismiss: () => setDismissed(true),
                buttonTitle: "Lukk melding",
            }}
        >
            Du kan lukke denne meldingen ved å trykke på X.
        </SystemMessage>
    );
}


export const examples: ComponentExample[] = [
    {
                title: "Info-melding",
                description: "En enkel informasjonsmelding på sidenivå.",
                code: `<SystemMessage variant="info">
        Systemet vil være utilgjengelig for vedlikehold lørdag 22. mars fra kl. 22–24.
    </SystemMessage>`,
                preview: (
                    <SystemMessage variant="info">
                        Systemet vil være utilgjengelig for vedlikehold lørdag 22. mars fra kl. 22–24.
                    </SystemMessage>
                ),
            },
    {
                title: "Alle varianter",
                description: "Velg variant basert på alvorlighetsgraden av meldingen.",
                code: `<SystemMessage variant="info">Dette er en informasjonsmelding til brukeren.</SystemMessage>
    <SystemMessage variant="success">Handlingen ble gjennomført.</SystemMessage>
    <SystemMessage variant="warning">Vær oppmerksom på at dette kan påvirke andre.</SystemMessage>
    <SystemMessage variant="error">Noe gikk galt. Prøv igjen.</SystemMessage>`,
                preview: (
                    <Flex direction="column" gap="s">
                        <SystemMessage variant="info">Dette er en informasjonsmelding til brukeren.</SystemMessage>
                        <SystemMessage variant="success">Handlingen ble gjennomført.</SystemMessage>
                        <SystemMessage variant="warning">Vær oppmerksom på at dette kan påvirke andre.</SystemMessage>
                        <SystemMessage variant="error">Noe gikk galt. Prøv igjen.</SystemMessage>
                    </Flex>
                ),
            },
    {
                title: "Avvisbar melding",
                description: "Bruk dismissAction for å la brukeren lukke meldingen.",
                code: `const [dismissed, setDismissed] = useState(false);

    {dismissed ? (
        <p>Meldingen ble lukket.</p>
    ) : (
        <SystemMessage variant="info"
            dismissAction={{
                handleDismiss: () => setDismissed(true),
                buttonTitle: "Lukk melding",
            }}
        >
            Du kan lukke denne meldingen ved å trykke på X.
        </SystemMessage>
    )}`,
                preview: <DismissPreview />,
            },
    {
                title: "Med begrenset innholdsbredde",
                description: "Når SystemMessage strekker seg over hele sidebredden, bruk maxContentWidth for å begrense tekstlinjenes lengde.",
                code: `<SystemMessage variant="error" role="alert" maxContentWidth="60ch">
        Vi opplever for øyeblikket tekniske problemer. Prøv igjen om noen minutter.
    </SystemMessage>`,
                preview: (
                    <SystemMessage variant="error" role="alert" maxContentWidth="60ch">
                        Vi opplever for øyeblikket tekniske problemer. Prøv igjen om noen minutter.
                    </SystemMessage>
                ),
            },
    {
                title: "Dynamisk melding med role='alert'",
                description: "Legg til role='alert' når meldingen vises etter en brukerhandling — da annonserer skjermlesere den automatisk.",
                code: `<SystemMessage variant="warning" role="alert">
        Sesjonen din utløper om 5 minutter. Lagre arbeidet ditt nå.
    </SystemMessage>`,
                preview: (
                    <SystemMessage variant="warning" role="alert">
                        Sesjonen din utløper om 5 minutter. Lagre arbeidet ditt nå.
                    </SystemMessage>
                ),
            }
];

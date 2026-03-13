"use client";
import React, { useState, useEffect } from "react";
import {
    SystemMessage,
    InfoSystemMessage,
    WarningSystemMessage,
    ErrorSystemMessage,
    SuccessSystemMessage,
} from "@fremtind/jokul/system-message";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

function SystemMessagePreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 4), 1500);
        return () => clearInterval(id);
    }, [isHovered]);

    if (step === 1) return <SuccessSystemMessage>Handlingen ble gjennomført.</SuccessSystemMessage>;
    if (step === 2) return <WarningSystemMessage>Sesjonen din utløper om 5 minutter.</WarningSystemMessage>;
    if (step === 3) return <ErrorSystemMessage>Noe gikk galt. Prøv igjen.</ErrorSystemMessage>;
    return <InfoSystemMessage>Systemet vil være utilgjengelig fredag 20. juni kl. 22–24. Planlagt vedlikehold.</InfoSystemMessage>;
}

function DismissPreview() {
    const [dismissed, setDismissed] = useState(false);
    return dismissed ? (
        <p style={{ color: "var(--jkl-color-text-subdued)" }}>Meldingen ble lukket.</p>
    ) : (
        <InfoSystemMessage
            dismissAction={{
                handleDismiss: () => setDismissed(true),
                buttonTitle: "Lukk melding",
            }}
        >
            Du kan lukke denne meldingen ved å trykke på X.
        </InfoSystemMessage>
    );
}

const doc: ComponentDoc = {
    id: "system-message",
    name: "SystemMessage",
    package: "@fremtind/jokul/system-message",
    category: "Tilbakemelding",
    tags: ["melding", "varsel", "feil", "info", "suksess", "advarsel"],
    status: "stable",
    description:
        "SystemMessage brukes til å kommunisere viktig informasjon til brukeren på sidenivå. Finnes i variantene info, success, warning og error. Kan gjøres avvisbar med dismissAction.",
    warnings: "Bruk role='alert' på kritiske meldinger som vises dynamisk — uten det annonserer ikke skjermlesere dem automatisk.",
    relatedIds: ["message", "toast"],
    preview: <SystemMessagePreview />,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Innholdet i meldingen." },
        { name: "variant", type: '"info" | "success" | "warning" | "error"', required: false, source: "custom", status: "stable", default: '"info"', description: "Visuell og semantisk variant." },
        { name: "dismissed", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Skjuler meldingen når true." },
        { name: "dismissAction", type: "{ handleDismiss: () => void; buttonTitle?: string }", required: false, source: "custom", status: "stable", description: "Viser en lukkeknapp. handleDismiss kalles når brukeren klikker." },
        { name: "maxContentWidth", type: "string", required: false, source: "custom", status: "stable", description: "Maksimal bredde på innholdet — nyttig når SystemMessage strekker seg over hele sidebredden." },
        { name: "paddingLeft", type: "string", required: false, source: "custom", status: "stable", description: "Overstyr venstre padding på innholdet." },
        { name: "role", type: "string", required: false, source: "aria", status: "stable", description: "ARIA-rolle, f.eks. 'alert' for kritiske meldinger som vises dynamisk." },
        { name: "id", type: "string", required: false, source: "native", status: "stable", description: "HTML id-attributt." },
        { name: "className", type: "string", required: false, source: "react", status: "stable", description: "Ekstra CSS-klasser." },
    ],
    examples: [
        {
            title: "Info-melding",
            description: "En enkel informasjonsmelding på sidenivå.",
            code: `<InfoSystemMessage>
    Systemet vil være utilgjengelig for vedlikehold lørdag 22. mars fra kl. 22–24.
</InfoSystemMessage>`,
            preview: (
                <InfoSystemMessage>
                    Systemet vil være utilgjengelig for vedlikehold lørdag 22. mars fra kl. 22–24.
                </InfoSystemMessage>
            ),
        },
        {
            title: "Alle varianter",
            description: "Velg variant basert på alvorlighetsgraden av meldingen.",
            code: `<InfoSystemMessage>Dette er en informasjonsmelding til brukeren.</InfoSystemMessage>
<SuccessSystemMessage>Handlingen ble gjennomført.</SuccessSystemMessage>
<WarningSystemMessage>Vær oppmerksom på at dette kan påvirke andre.</WarningSystemMessage>
<ErrorSystemMessage>Noe gikk galt. Prøv igjen.</ErrorSystemMessage>`,
            preview: (
                <Flex direction="column" gap="s">
                    <InfoSystemMessage>Dette er en informasjonsmelding til brukeren.</InfoSystemMessage>
                    <SuccessSystemMessage>Handlingen ble gjennomført.</SuccessSystemMessage>
                    <WarningSystemMessage>Vær oppmerksom på at dette kan påvirke andre.</WarningSystemMessage>
                    <ErrorSystemMessage>Noe gikk galt. Prøv igjen.</ErrorSystemMessage>
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
    <InfoSystemMessage
        dismissAction={{
            handleDismiss: () => setDismissed(true),
            buttonTitle: "Lukk melding",
        }}
    >
        Du kan lukke denne meldingen ved å trykke på X.
    </InfoSystemMessage>
)}`,
            preview: <DismissPreview />,
        },
        {
            title: "Med begrenset innholdsbredde",
            description: "Når SystemMessage strekker seg over hele sidebredden, bruk maxContentWidth for å begrense tekstlinjenes lengde.",
            code: `<ErrorSystemMessage role="alert" maxContentWidth="60ch">
    Vi opplever for øyeblikket tekniske problemer. Prøv igjen om noen minutter.
</ErrorSystemMessage>`,
            preview: (
                <ErrorSystemMessage role="alert" maxContentWidth="60ch">
                    Vi opplever for øyeblikket tekniske problemer. Prøv igjen om noen minutter.
                </ErrorSystemMessage>
            ),
        },
        {
            title: "Dynamisk melding med role='alert'",
            description: "Legg til role='alert' når meldingen vises etter en brukerhandling — da annonserer skjermlesere den automatisk.",
            code: `<WarningSystemMessage role="alert">
    Sesjonen din utløper om 5 minutter. Lagre arbeidet ditt nå.
</WarningSystemMessage>`,
            preview: (
                <WarningSystemMessage role="alert">
                    Sesjonen din utløper om 5 minutter. Lagre arbeidet ditt nå.
                </WarningSystemMessage>
            ),
        },
    ],
};

export default doc;

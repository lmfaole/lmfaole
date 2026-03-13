"use client";
import { useState, useEffect } from "react";
import { SystemMessage } from "@fremtind/jokul/system-message";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

const VARIANTS = ["info", "success", "warning", "error"] as const;
const TEXTS = [
    "Systemet vil være utilgjengelig fredag 20. juni kl. 22–24. Planlagt vedlikehold.",
    "Handlingen ble gjennomført.",
    "Sesjonen din utløper om 5 minutter.",
    "Noe gikk galt. Prøv igjen.",
];

function SystemMessagePreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 4), 1500);
        return () => clearInterval(id);
    }, [isHovered]);

    return <SystemMessage variant={VARIANTS[step]}>{TEXTS[step]}</SystemMessage>;
}

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

const doc: ComponentDoc = {
    id: "system-message",
    name: "SystemMessage",
    package: "@fremtind/jokul/system-message",
    category: "Tilbakemelding",
    tags: ["melding", "varsel", "feil", "info", "suksess", "advarsel"],
    status: "stable",
    description:
        "SystemMessage brukes til å kommunisere viktig informasjon til brukeren på sidenivå. Finnes i variantene info, success, warning og error. Kan gjøres avvisbar med dismissAction.",
    warnings: [
        "Bruk role='alert' på kritiske meldinger som vises dynamisk — uten det annonserer ikke skjermlesere dem automatisk.",
        "InfoSystemMessage, SuccessSystemMessage, WarningSystemMessage og ErrorSystemMessage er utfaset. Bruk <SystemMessage variant=\"...\"> i stedet.",
    ],
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
        },
        {
            title: "Migrering fra navngitte varianter",
            description: "InfoSystemMessage, SuccessSystemMessage, WarningSystemMessage og ErrorSystemMessage er utfaset. Erstatt dem med SystemMessage og variant-propen.",
            migrationBefore: `import { InfoSystemMessage, ErrorSystemMessage } from "@fremtind/jokul/system-message";

<InfoSystemMessage>Systemet vedlikeholdes lørdag kl. 22–24.</InfoSystemMessage>
<ErrorSystemMessage>Noe gikk galt. Prøv igjen.</ErrorSystemMessage>`,
            code: `import { SystemMessage } from "@fremtind/jokul/system-message";

<SystemMessage variant="info">Systemet vedlikeholdes lørdag kl. 22–24.</SystemMessage>
<SystemMessage variant="error">Noe gikk galt. Prøv igjen.</SystemMessage>`,
            preview: (
                <Flex direction="column" gap="s">
                    <SystemMessage variant="info">Systemet vedlikeholdes lørdag kl. 22–24.</SystemMessage>
                    <SystemMessage variant="error">Noe gikk galt. Prøv igjen.</SystemMessage>
                </Flex>
            ),
        },
    ],
};

export default doc;

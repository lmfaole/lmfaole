import React, { useState } from "react";
import {
    SystemMessage,
    InfoSystemMessage,
    WarningSystemMessage,
    ErrorSystemMessage,
    SuccessSystemMessage,
} from "@fremtind/jokul/system-message";
import type { ComponentDoc } from "./types";

function VariantsPreview() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--jkl-spacing-m)" }}>
            <InfoSystemMessage>Dette er en informasjonsmelding til brukeren.</InfoSystemMessage>
            <SuccessSystemMessage>Handlingen ble gjennomført.</SuccessSystemMessage>
            <WarningSystemMessage>Vær oppmerksom på at dette kan påvirke andre.</WarningSystemMessage>
            <ErrorSystemMessage>Noe gikk galt. Prøv igjen.</ErrorSystemMessage>
        </div>
    );
}

function DismissPreview() {
    const [dismissed, setDismissed] = useState(false);
    return (
        <div>
            {dismissed ? (
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
            )}
        </div>
    );
}

function CustomVariantPreview() {
    return (
        <SystemMessage variant="warning" role="alert">
            Sesjonen din utløper om 5 minutter. Lagre arbeidet ditt nå.
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
    notes:
        "Bruk role='alert' for kritiske meldinger slik at skjermlesere annonserer dem umiddelbart. Bruk de pre-konfigurerte variantene (InfoSystemMessage, SuccessSystemMessage osv.) fremfor å angi variant manuelt.",
    props: [
        { name: "children", type: "React.ReactNode", required: true, description: "Innholdet i meldingen." },
        {
            name: "variant",
            type: '"info" | "success" | "warning" | "error"',
            required: false,
            default: '"info"',
            description: "Visuell og semantisk variant.",
        },
        {
            name: "dismissed",
            type: "boolean",
            required: false,
            default: "false",
            description: "Skjuler meldingen når true.",
        },
        {
            name: "dismissAction",
            type: "{ handleDismiss: () => void; buttonTitle?: string }",
            required: false,
            description: "Viser en lukkeknapp. handleDismiss kalles når brukeren klikker.",
        },
        { name: "id", type: "string", required: false, description: "HTML id-attributt." },
        { name: "className", type: "string", required: false, description: "Ekstra CSS-klasser." },
        {
            name: "role",
            type: "string",
            required: false,
            description: "ARIA-rolle, f.eks. 'alert' for kritiske meldinger.",
        },
        {
            name: "maxContentWidth",
            type: "string",
            required: false,
            description: "Maksimal bredde på innholdet.",
        },
    ],
    examples: [
        {
            title: "Alle varianter",
            description: "Info, success, warning og error dekker de vanligste tilbakemeldingsbehovene.",
            code: `import {
    InfoSystemMessage,
    WarningSystemMessage,
    ErrorSystemMessage,
    SuccessSystemMessage,
} from "@fremtind/jokul/system-message";

<InfoSystemMessage>Dette er en informasjonsmelding til brukeren.</InfoSystemMessage>
<SuccessSystemMessage>Handlingen ble gjennomført.</SuccessSystemMessage>
<WarningSystemMessage>Vær oppmerksom på at dette kan påvirke andre.</WarningSystemMessage>
<ErrorSystemMessage>Noe gikk galt. Prøv igjen.</ErrorSystemMessage>`,
            preview: <VariantsPreview />,
        },
        {
            title: "Avvisbar melding",
            description: "Bruk dismissAction for å la brukeren lukke meldingen.",
            code: `import { useState } from "react";
import { InfoSystemMessage } from "@fremtind/jokul/system-message";

function DismissExample() {
    const [dismissed, setDismissed] = useState(false);
    return dismissed ? (
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
    );
}`,
            preview: <DismissPreview />,
        },
        {
            title: "Tilpasset variant med role",
            description: "Bruk SystemMessage direkte for full kontroll over variant og ARIA-rolle.",
            code: `import { SystemMessage } from "@fremtind/jokul/system-message";

<SystemMessage variant="warning" role="alert">
    Sesjonen din utløper om 5 minutter. Lagre arbeidet ditt nå.
</SystemMessage>`,
            preview: <CustomVariantPreview />,
        },
    ],
    relatedIds: ["message", "toast"],
};

export default doc;

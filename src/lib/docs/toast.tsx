import React from "react";
import { ToastProvider, useToast } from "@fremtind/jokul/toast";
import { Button } from "@fremtind/jokul/button";
import type { ComponentDoc } from "./types";

function ToastTrigger() {
    const { add } = useToast();
    return (
        <Button onClick={() => add("Handlingen ble fullført!", { variant: "success" })}>
            Vis toast
        </Button>
    );
}

function ToastPreview() {
    return (
        <ToastProvider>
            <ToastTrigger />
        </ToastProvider>
    );
}

function ToastVariantsTrigger() {
    const { add } = useToast();
    return (
        <div style={{ display: "flex", gap: "var(--jkl-spacing-s)", flexWrap: "wrap" }}>
            <Button onClick={() => add("Info-melding", { variant: "info" })}>Info</Button>
            <Button onClick={() => add("Handlingen ble fullført!", { variant: "success" })}>
                Suksess
            </Button>
            <Button onClick={() => add("Vær oppmerksom på dette", { variant: "warning" })}>
                Advarsel
            </Button>
            <Button onClick={() => add("Noe gikk galt", { variant: "error" })}>Feil</Button>
        </div>
    );
}

function ToastVariantsPreview() {
    return (
        <ToastProvider>
            <ToastVariantsTrigger />
        </ToastProvider>
    );
}

function ToastActionTrigger() {
    const { add } = useToast();
    return (
        <Button
            onClick={() =>
                add("Endringer lagret", {
                    variant: "success",
                    action: {
                        label: "Angre",
                        onClick: () => console.log("Angret"),
                    },
                })
            }
        >
            Lagre endringer
        </Button>
    );
}

function ToastActionPreview() {
    return (
        <ToastProvider>
            <ToastActionTrigger />
        </ToastProvider>
    );
}

const doc: ComponentDoc = {
    id: "toast",
    name: "Toast",
    package: "@fremtind/jokul/toast",
    category: "Tilbakemelding",
    tags: ["varsling", "notification", "toast", "feedback", "dynamisk"],
    status: "stable",
    description:
        "Toast er en midlertidig varslingskomponent som vises til brukeren etter en handling. Den forsvinner automatisk etter en stund og kan inneholde en handling.",
    notes:
        "Wrap appen i ToastProvider og bruk useToast() for å vise toasts. useToast må brukes inne i en ToastProvider.",
    relatedIds: ["message"],
    props: [
        {
            name: "placement (ToastProvider)",
            type: '"center" | "left"',
            required: false,
            source: "custom",
            default: '"center"',
            description: "Plassering av toast-containeren på skjermen.",
        },
        {
            name: "content (add)",
            type: 'string | { title?: string; content: ReactNode }',
            required: true,
            source: "custom",
            description: "Innholdet i toasten. Kan være en enkel streng eller et objekt med tittel og innhold.",
        },
        {
            name: "variant (add options)",
            type: '"info" | "success" | "warning" | "error"',
            required: false,
            source: "custom",
            description: "Visuell variant som indikerer type varsling.",
        },
        {
            name: "timeout (add options)",
            type: "number | null | \"off\"",
            required: false,
            source: "custom",
            default: "5000",
            description: "Tid i millisekunder før toasten forsvinner. null eller 'off' deaktiverer automatisk lukking.",
        },
        {
            name: "action (add options)",
            type: "{ label: string; onClick: () => void }",
            required: false,
            source: "custom",
            description: "Handlingsknapp i toasten.",
        },
    ],
    examples: [
        {
            title: "Grunnleggende toast",
            description: "Vis en suksess-toast når en handling fullføres.",
            code: `import { ToastProvider, useToast } from "@fremtind/jokul/toast";
import { Button } from "@fremtind/jokul/button";

function ToastTrigger() {
    const { add } = useToast();
    return (
        <Button onClick={() => add("Handlingen ble fullført!", { variant: "success" })}>
            Vis toast
        </Button>
    );
}

function App() {
    return (
        <ToastProvider>
            <ToastTrigger />
        </ToastProvider>
    );
}`,
            preview: <ToastPreview />,
        },
        {
            title: "Med varianter",
            description: "Toasts finnes i fire varianter: info, success, warning og error.",
            code: `import { ToastProvider, useToast } from "@fremtind/jokul/toast";
import { Button } from "@fremtind/jokul/button";

function ToastVariants() {
    const { add } = useToast();
    return (
        <div style={{ display: "flex", gap: "var(--jkl-spacing-s)", flexWrap: "wrap" }}>
            <Button onClick={() => add("Info-melding", { variant: "info" })}>Info</Button>
            <Button onClick={() => add("Handlingen ble fullført!", { variant: "success" })}>
                Suksess
            </Button>
            <Button onClick={() => add("Vær oppmerksom på dette", { variant: "warning" })}>
                Advarsel
            </Button>
            <Button onClick={() => add("Noe gikk galt", { variant: "error" })}>Feil</Button>
        </div>
    );
}

function App() {
    return (
        <ToastProvider>
            <ToastVariants />
        </ToastProvider>
    );
}`,
            preview: <ToastVariantsPreview />,
        },
        {
            title: "Med handling",
            description: "Legg til en handlingsknapp i toasten for å la brukeren angre eller reagere.",
            code: `import { ToastProvider, useToast } from "@fremtind/jokul/toast";
import { Button } from "@fremtind/jokul/button";

function ToastWithAction() {
    const { add } = useToast();
    return (
        <Button
            onClick={() =>
                add("Endringer lagret", {
                    variant: "success",
                    action: {
                        label: "Angre",
                        onClick: () => console.log("Angret"),
                    },
                })
            }
        >
            Lagre endringer
        </Button>
    );
}

function App() {
    return (
        <ToastProvider>
            <ToastWithAction />
        </ToastProvider>
    );
}`,
            preview: <ToastActionPreview />,
        },
    ],
};

export default doc;

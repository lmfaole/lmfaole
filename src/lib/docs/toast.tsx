import { useState, useEffect } from "react";
import { ToastProvider, useToast } from "@fremtind/jokul/toast";
import { Button } from "@fremtind/jokul/button";
import { SuccessIcon, InfoIcon, WarningIcon, ErrorIcon } from "@fremtind/jokul/icon";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

const VARIANTS = [
    { key: "success", icon: <SuccessIcon className="jkl-toast__icon" />, title: "Endringer lagret", body: "Forsikringen din er oppdatert." },
    { key: "info",    icon: <InfoIcon className="jkl-toast__icon" />,    title: "Informasjon",      body: "Skjemaet er under vedlikehold frem til klokken 14." },
    { key: "warning", icon: <WarningIcon className="jkl-toast__icon" />, title: "Advarsel",         body: "Du har ikke lagret de siste endringene." },
    { key: "error",   icon: <ErrorIcon className="jkl-toast__icon" />,   title: "Feil",             body: "Noe gikk galt. Prøv igjen om litt." },
] as const;

function ToastMockPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % VARIANTS.length), 1800);
        return () => clearInterval(id);
    }, [isHovered]);

    const v = VARIANTS[step];
    return (
        <div data-theme="light" style={{ display: "contents" }}>
            <div className={`jkl-toast jkl-toast--${v.key}`} style={{ display: "flex", gap: "var(--jkl-spacing-xs)" }}>
                {v.icon}
                <div className="jkl-toast__content">
                    <p className="jkl-toast__title">{v.title}</p>
                    <p className="jkl-toast__message">{v.body}</p>
                </div>
            </div>
        </div>
    );
}

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
            <Button onClick={() => add("Handlingen ble fullført!", { variant: "success" })}>Suksess</Button>
            <Button onClick={() => add("Vær oppmerksom på dette", { variant: "warning" })}>Advarsel</Button>
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
                    action: { label: "Angre", onClick: () => console.log("Angret") },
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
    warnings: [
        "Wrap appen i ToastProvider — useToast() vil kaste en feil hvis det kalles utenfor.",
        "Toast forsvinner automatisk — ikke bruk den for kritisk informasjon som krever brukerhandling.",
    ],
    relatedIds: ["message"],
    preview: <ToastMockPreview />,
    props: [
        {
            name: "placement (ToastProvider)",
            type: '"center" | "left"',
            required: false,
            source: "custom",
            status: "stable",
            default: '"center"',
            description: "Plassering av toast-containeren på skjermen.",
        },
        {
            name: "content (add)",
            type: 'string | { title?: string; content: ReactNode }',
            required: true,
            source: "custom",
            status: "stable",
            description: "Innholdet i toasten. Kan være en enkel streng eller et objekt med tittel og innhold.",
        },
        {
            name: "variant (add options)",
            type: '"info" | "success" | "warning" | "error"',
            required: false,
            source: "custom",
            status: "stable",
            description: "Visuell variant som indikerer type varsling.",
        },
        {
            name: "timeout (add options)",
            type: "number | null | \"off\"",
            required: false,
            source: "custom",
            status: "stable",
            default: "5000",
            description: "Tid i millisekunder før toasten forsvinner. null eller 'off' deaktiverer automatisk lukking.",
        },
        {
            name: "action (add options)",
            type: "{ label: string; onClick: () => void }",
            required: false,
            source: "custom",
            status: "stable",
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

import { useState, useEffect } from "react";
import { ToastProvider, useToast } from "@fremtind/jokul/toast";
import { Button } from "@fremtind/jokul/button";
import { SuccessIcon, InfoIcon, WarningIcon, ErrorIcon } from "@fremtind/jokul/icon";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


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
            <Button onClick={() => add("Informasjon", { variant: "info" })}>Info</Button>
            <Button onClick={() => add("Suksess!", { variant: "success" })}>Suksess</Button>
            <Button onClick={() => add("Advarsel", { variant: "warning" })}>Advarsel</Button>
            <Button onClick={() => add("Feil oppstod", { variant: "error" })}>Feil</Button>
        </div>
    );
}

function ToastActionTrigger() {
    const { add } = useToast();
    return (
        <Button onClick={() => add("Endringen ble lagret", { variant: "success" })}>
            Lagre
        </Button>
    );
}
function ToastVariantsPreview() {
    return (
        <ToastProvider>
            <ToastVariantsTrigger />
        </ToastProvider>
    );
}

function ToastActionPreview() {
    return (
        <ToastProvider>
            <ToastActionTrigger />
        </ToastProvider>
    );
}


export const examples: ComponentExample[] = [
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


    const isHovered = usePreviewHovered();

    const [step, setStep] = useState(0);

        const id = setInterval(() => setStep(s => (s + 1) % VARIANTS.length), 1800);

    const v = VARIANTS[step];

    const { add } = useToast();

    const { add } = useToast();
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
            }
];

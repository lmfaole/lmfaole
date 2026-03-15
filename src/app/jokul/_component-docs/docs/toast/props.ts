import type { PropDef } from "../types";

export const props: PropDef[] = [
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
    ];

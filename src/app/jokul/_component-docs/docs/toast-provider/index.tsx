import type { ComponentDoc } from "../types";
import { props } from "./props";
import { ToastProviderPreview } from "./preview";

const doc: ComponentDoc = {
    id: "toast-provider",
    name: "ToastProvider",
    package: "@fremtind/jokul/toast",
    category: "Overlegg",
    status: "stable",
    description: {
        short: "Kontekstleverandor for toast-meldinger i applikasjonen.",
        long: "Gir kontekst og container for toasts i appen. Ma omslutte komponenttreet der useToast() brukes, og lar deg styre visning og begrensninger som placement og maks synlige toasts.",
    },
    warnings: "ToastProvider ma omslutte alle komponenter som bruker useToast().",
    relationships: {
        related: [
            { id: "toast", description: "Hook-baserte metoder (useToast) for a vise og lukke toasts." },
        ],
    },
    preview: <ToastProviderPreview />,
    props,
};

export default doc;

import type { ComponentDoc } from "../types";
import { props } from "./props";
import { FormErrorMessagePreview } from "./preview";

const doc: ComponentDoc = {
    id: "form-error-message",
    name: "FormErrorMessage",
    package: "@fremtind/jokul/message",
    category: "Tilbakemelding",
    status: "stable",
    description: {
        short: "Oppsummerer skjemafeil i en liste ved innsending.",
        long: "Viser en samlet feilliste for hele skjemaet etter forsok pa innsending. Brukes sammen med feltfeil for a hjelpe brukeren a finne og rette mangler.",
    },
    relationships: {
        related: [
            { id: "message", description: "FormErrorMessage bruker Message for selve visningen av feillisten." },
        ],
    },
    preview: <FormErrorMessagePreview />,
    props,
};

export default doc;


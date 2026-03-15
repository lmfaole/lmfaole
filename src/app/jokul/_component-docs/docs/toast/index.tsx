import type { ComponentDoc } from "../types";
import { props } from "./props";
import { ToastTrigger, ToastPreview } from "./preview";

const doc: ComponentDoc = {
    id: "toast",
    name: "Toast",
    package: "@fremtind/jokul/toast",
    category: "Overlegg",
    status: "stable",
    description:
        "Toast er en midlertidig varslingskomponent som vises til brukeren etter en handling. Den forsvinner automatisk etter en stund og kan inneholde en handling.",
    warnings: [
        "Wrap appen i ToastProvider — useToast() vil kaste en feil hvis det kalles utenfor.",
        "Toast forsvinner automatisk — ikke bruk den for kritisk informasjon som krever brukerhandling.",
    ],
    relationships: {
        alternatives: [{ id: "message", description: "Bruk Message for vedvarende innebygd tilbakemelding som forblir synlig i sideoppsettet." }, { id: "system-message", description: "Bruk SystemMessage for beskjeder på sidenivå som krever eksplisitt brukerbekreftelse." }],
    },

    preview: <ToastPreview />,
    props,
};

export default doc;

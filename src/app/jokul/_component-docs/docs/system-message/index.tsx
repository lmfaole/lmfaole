import type { ComponentDoc } from "../types";
import { props } from "./props";
import { migrations } from "./migration";
import { SystemMessagePreview } from "./preview";

const doc: ComponentDoc = {
    id: "system-message",
    name: "System Message",
    package: "@fremtind/jokul/system-message",
    category: "Tilbakemelding",
    status: "stable",
    description: {
        short: "SystemMessage brukes til å kommunisere viktig informasjon til brukeren på.",
        long: "SystemMessage brukes til å kommunisere viktig informasjon til brukeren på sidenivå. Finnes i variantene info, success, warning og error. Kan gjøres avvisbar med dismissAction.",
    },
    warnings: [
        "Bruk role='alert' på kritiske meldinger som vises dynamisk — uten det annonserer ikke skjermlesere dem automatisk.",
        "InfoSystemMessage, SuccessSystemMessage, WarningSystemMessage og ErrorSystemMessage er utfaset. Bruk <SystemMessage variant=\"...\"> i stedet.",
    ],
    relationships: {
        alternatives: [{ id: "message", description: "Bruk Message for vedvarende innebygd tilbakemelding innenfor en sideseksjon fremfor et banner i full bredde." }, { id: "toast", description: "Bruk Toast for korte selvlukkende varsler som vises i kanten av skjermen." }],
    },

    preview: <SystemMessagePreview />,
    props,
    migrations,
};

export default doc;

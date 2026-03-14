import { SystemMessage } from "@fremtind/jokul/system-message";
import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "InfoSystemMessage er utfaset",
        description: "Bruk SystemMessage med variant=\"info\" i stedet.",
        deprecates: { name: "InfoSystemMessage", kind: "component" },
        replacedBy: [{ name: "SystemMessage", kind: "component" }, { name: "variant", kind: "prop" }],
        before: `import { InfoSystemMessage } from "@fremtind/jokul/system-message";

<InfoSystemMessage>Systemet vedlikeholdes lørdag kl. 22–24.</InfoSystemMessage>`,
        after: `import { SystemMessage } from "@fremtind/jokul/system-message";

<SystemMessage variant="info">Systemet vedlikeholdes lørdag kl. 22–24.</SystemMessage>`,
        preview: <SystemMessage variant="info">Systemet vedlikeholdes lørdag kl. 22–24.</SystemMessage>,
    },
    {
        title: "SuccessSystemMessage er utfaset",
        description: "Bruk SystemMessage med variant=\"success\" i stedet.",
        deprecates: { name: "SuccessSystemMessage", kind: "component" },
        replacedBy: [{ name: "SystemMessage", kind: "component" }, { name: "variant", kind: "prop" }],
        before: `import { SuccessSystemMessage } from "@fremtind/jokul/system-message";

<SuccessSystemMessage>Registreringen var vellykket.</SuccessSystemMessage>`,
        after: `import { SystemMessage } from "@fremtind/jokul/system-message";

<SystemMessage variant="success">Registreringen var vellykket.</SystemMessage>`,
        preview: <SystemMessage variant="success">Registreringen var vellykket.</SystemMessage>,
    },
    {
        title: "WarningSystemMessage er utfaset",
        description: "Bruk SystemMessage med variant=\"warning\" i stedet.",
        deprecates: { name: "WarningSystemMessage", kind: "component" },
        replacedBy: [{ name: "SystemMessage", kind: "component" }, { name: "variant", kind: "prop" }],
        before: `import { WarningSystemMessage } from "@fremtind/jokul/system-message";

<WarningSystemMessage>Høy trafikk kan forsinke behandling.</WarningSystemMessage>`,
        after: `import { SystemMessage } from "@fremtind/jokul/system-message";

<SystemMessage variant="warning">Høy trafikk kan forsinke behandling.</SystemMessage>`,
        preview: <SystemMessage variant="warning">Høy trafikk kan forsinke behandling.</SystemMessage>,
    },
    {
        title: "ErrorSystemMessage er utfaset",
        description: "Bruk SystemMessage med variant=\"error\" i stedet.",
        deprecates: { name: "ErrorSystemMessage", kind: "component" },
        replacedBy: [{ name: "SystemMessage", kind: "component" }, { name: "variant", kind: "prop" }],
        before: `import { ErrorSystemMessage } from "@fremtind/jokul/system-message";

<ErrorSystemMessage>Noe gikk galt. Prøv igjen.</ErrorSystemMessage>`,
        after: `import { SystemMessage } from "@fremtind/jokul/system-message";

<SystemMessage variant="error">Noe gikk galt. Prøv igjen.</SystemMessage>`,
        preview: <SystemMessage variant="error">Noe gikk galt. Prøv igjen.</SystemMessage>,
    },
];

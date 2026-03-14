import { SystemMessage } from "@fremtind/jokul/system-message";
import { Flex } from "@fremtind/jokul/flex";
import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "Migrering fra navngitte varianter",
        description: "InfoSystemMessage, SuccessSystemMessage, WarningSystemMessage og ErrorSystemMessage er utfaset. Erstatt dem med SystemMessage og variant-propen.",
        deprecates: [
            { name: "InfoSystemMessage", kind: "component" },
            { name: "SuccessSystemMessage", kind: "component" },
            { name: "WarningSystemMessage", kind: "component" },
            { name: "ErrorSystemMessage", kind: "component" },
        ],
        replacedBy: [
            { name: "SystemMessage", kind: "component" },
            { name: "variant", kind: "prop" },
        ],
        before: `import { InfoSystemMessage, ErrorSystemMessage } from "@fremtind/jokul/system-message";

<InfoSystemMessage>Systemet vedlikeholdes lørdag kl. 22–24.</InfoSystemMessage>
<ErrorSystemMessage>Noe gikk galt. Prøv igjen.</ErrorSystemMessage>`,
        after: `import { SystemMessage } from "@fremtind/jokul/system-message";

<SystemMessage variant="info">Systemet vedlikeholdes lørdag kl. 22–24.</SystemMessage>
<SystemMessage variant="error">Noe gikk galt. Prøv igjen.</SystemMessage>`,
        preview: (
            <Flex direction="column" gap="s">
                <SystemMessage variant="info">Systemet vedlikeholdes lørdag kl. 22–24.</SystemMessage>
                <SystemMessage variant="error">Noe gikk galt. Prøv igjen.</SystemMessage>
            </Flex>
        ),
    },
];

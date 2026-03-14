import { Button } from "@fremtind/jokul/button";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "iconLeft er utfaset",
        description: "Bruk icon-propen med en Icon-komponent. Ikonet plasseres til venstre som standard.",
        uses: ["icon"],
        deprecates: { name: "iconLeft", kind: "prop" },
        replacedBy: [{ name: "icon", kind: "prop" }],
        before: `<Button iconLeft={<Icon>add</Icon>}>Ny forsikring</Button>`,
        after: `<Button icon={<Icon>add</Icon>}>Ny forsikring</Button>`,
        preview: (
            <Button variant="primary" icon={<Icon>add</Icon>}>Ny forsikring</Button>
        ),
    },
    {
        title: "iconRight er utfaset",
        description: "Bruk icon-propen kombinert med iconPosition=\"right\" for å plassere ikonet til høyre.",
        uses: ["icon"],
        deprecates: { name: "iconRight", kind: "prop" },
        replacedBy: [{ name: "icon", kind: "prop" }, { name: "iconPosition", kind: "prop" }],
        before: `<Button iconRight={<Icon>arrow_forward</Icon>}>Se alle</Button>`,
        after: `<Button icon={<Icon>arrow_forward</Icon>} iconPosition="right">Se alle</Button>`,
        preview: (
            <Button variant="ghost" icon={<Icon>arrow_forward</Icon>} iconPosition="right">Se alle</Button>
        ),
    },
];

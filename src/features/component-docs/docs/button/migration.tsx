import { Button } from "@fremtind/jokul/button";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "Ikonknapper bruker nå én icon-prop",
        description: "iconLeft og iconRight er utfaset. Bruk icon-propen med en Icon-komponent, og styr plasseringen med iconPosition.",
        uses: ["icon"],
        deprecates: [{ name: "iconLeft", kind: "prop" }, { name: "iconRight", kind: "prop" }],
        replacedBy: [{ name: "icon", kind: "prop" }, { name: "iconPosition", kind: "prop" }],
        before: `<Button iconLeft={<Icon>add</Icon>}>Ny forsikring</Button>
<Button iconRight={<Icon>arrow_forward</Icon>}>Se alle</Button>`,
        after: `<Button icon={<Icon>add</Icon>}>Ny forsikring</Button>
<Button icon={<Icon>arrow_forward</Icon>} iconPosition="right">Se alle</Button>`,
        preview: (
            <Flex gap="s" wrap="wrap">
                <Button variant="primary" icon={<Icon>add</Icon>}>Ny forsikring</Button>
                <Button variant="ghost" icon={<Icon>arrow_forward</Icon>} iconPosition="right">Se alle</Button>
            </Flex>
        ),
    },
];

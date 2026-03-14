import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "Ikonstørrelse arves nå fra omgivelsene",
        description: "variant-propen er utfaset. Størrelsen settes nå automatisk fra omgivelsenes fontstørrelse. Fjern variant og kontroller størrelsen med CSS font-size på et omsluttende element om nødvendig.",
        deprecates: [{ name: "variant", kind: "prop" }],
        replacedBy: [{ name: "font-size", kind: "prop" }],
        before: `<Icon variant="small">home</Icon>
<Icon variant="medium">home</Icon>`,
        after: `<Icon>home</Icon>

{/* Trenger du en spesifikk størrelse, styr med CSS: */}
<span style={{ fontSize: "1.5rem" }}>
    <Icon>home</Icon>
</span>`,
        preview: (
            <Flex gap="m" alignItems="center">
                <span style={{ fontSize: "1rem" }}><Icon>home</Icon></span>
                <span style={{ fontSize: "1.5rem" }}><Icon>home</Icon></span>
                <span style={{ fontSize: "2rem" }}><Icon>home</Icon></span>
            </Flex>
        ),
    },
];

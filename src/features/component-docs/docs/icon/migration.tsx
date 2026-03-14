import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "variant er utfaset",
        description: "Ikonstørrelse arves nå fra omgivelsenes fontstørrelse. Fjern variant og styr størrelsen med CSS font-size på et omsluttende element om nødvendig.",
        deprecates: { name: "variant", kind: "prop" },
        before: `<Icon variant="small">home</Icon>
<Icon variant="medium">home</Icon>`,
        after: `<Icon>home</Icon>

{/* Styr størrelse med CSS om nødvendig: */}
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

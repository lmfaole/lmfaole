import React from "react";
import { IconButton } from "@fremtind/jokul/icon-button";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "icon-button",
    name: "IconButton",
    package: "@fremtind/jokul/icon-button",
    category: "Skjema",
    description: "IconButton er en knapp med kun ikon. Krev alltid en aria-label som beskriver handlingen.",
    notes: "Ikke bruk IconButton uten aria-label.",
    relatedIds: ["button", "icon"],
    props: [
        { name: "icon", type: "string", required: true, description: "Ikonnavnet (Material Symbol)." },
        { name: "aria-label", type: "string", required: true, description: "Tilgjengelig navn for knappen." },
        { name: "onClick", type: "React.MouseEventHandler<HTMLButtonElement>", required: false, description: "Klikk-handler." },
        { name: "disabled", type: "boolean", required: false, description: "Deaktiverer knappen." },
        { name: "variant", type: '"ghost" | "primary"', required: false, description: "Visuell variant." },
    ],
    examples: [
        {
            title: "Ikonknapper",
            description: "Vanlige ikonknapper. Legg alltid til aria-label.",
            code: `<Flex gap="s" alignItems="center">
  <IconButton icon="edit" aria-label="Rediger" />
  <IconButton icon="delete" aria-label="Slett" />
  <IconButton icon="close" aria-label="Lukk" />
</Flex>`,
        },
    ],
};

export default doc;

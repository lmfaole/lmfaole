import React from "react";
import { Logo } from "@fremtind/jokul/logo";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "logo",
    name: "Logo",
    package: "@fremtind/jokul/logo",
    category: "Visning",
    description: "Logo rendrer Fremtind-logoen som en SVG-komponent.",
    notes: "Endre ikke logoens farger eller proporsjoner.",
    props: [],
    examples: [
        {
            title: "Standard logo",
            description: "Fremtind-logoen i standard størrelse.",
            code: `<Logo />`,
            preview: <Logo />,
        },
    ],
};

export default doc;

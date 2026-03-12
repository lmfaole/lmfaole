import React from "react";
import { Countdown } from "@fremtind/jokul/countdown";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "countdown",
    name: "Countdown",
    package: "@fremtind/jokul/countdown",
    category: "Visning",
    description: "Countdown viser en nedtelling fra et gitt antall millisekunder.",
    notes: "Gi alltid kontekst rundt Countdown-komponenten.",
    props: [
        { name: "from", type: "number", required: true, description: "Antall millisekunder å telle ned fra." },
        { name: "isPaused", type: "boolean", required: false, description: "Pause nedtellingen." },
    ],
    examples: [
        {
            title: "Nedtelling fra 5 minutter",
            description: "Viser en nedtelling på 5 minutter.",
            code: `<Countdown from={5 * 60 * 1000} />`,
            preview: <Countdown from={5 * 60 * 1000} />,
        },
    ],
};

export default doc;

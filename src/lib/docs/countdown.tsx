import React from "react";
import { Countdown } from "@fremtind/jokul/countdown";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "countdown",
    name: "Countdown",
    package: "@fremtind/jokul/countdown",
    category: "Visning",
    tags: ["animasjon", "tekst", "tilstandsstyring"],
    description: "Countdown viser en nedtelling fra et gitt antall millisekunder.",
    notes: "Gi alltid kontekst rundt Countdown-komponenten.",
    props: [
        { name: "from", type: "number", required: true, source: "custom", status: "stable", description: "Antall millisekunder å telle ned fra." },
        { name: "isPaused", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Pause nedtellingen." },
    ],
    examples: [
        {
            title: "Nedtelling fra 5 minutter",
            description: "Viser en nedtelling på 5 minutter.",
            code: `<Countdown from={5 * 60 * 1000} />`,
            preview: <Countdown from={5 * 60 * 1000} />,
        },
        {
            title: "Pauset nedtelling",
            description: "Nedtelling fra 2 minutter som er satt på pause.",
            code: `<Countdown from={2 * 60 * 1000} isPaused />`,
            preview: <Countdown from={2 * 60 * 1000} isPaused />,
        },
        {
            title: "Kort nedtelling",
            description: "Nedtelling på 30 sekunder, for eksempel ved sesjonens utløp.",
            code: `<Countdown from={30 * 1000} />`,
            preview: <Countdown from={30 * 1000} />,
        },
    ],
};

export default doc;

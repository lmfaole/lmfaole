import { useState, useEffect, useRef } from "react";
import { Feedback } from "@fremtind/jokul/feedback";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { FeedbackSmileyPreview } from "./examples";

const doc: ComponentDoc = {
    id: "feedback",
    name: "Feedback",
    package: "@fremtind/jokul/feedback",
    category: "Visning",
    tags: ["tilbakemelding", "vurdering", "smiley", "brukeropplevelse", "skjema"],
    status: "stable",
    description:
        "Feedback er en komponent for å samle inn tilbakemeldinger fra brukere. Den støtter smileys og radioknapper, og kan utvides med et oppfølgingsspørsmål.",
    preview: <FeedbackSmileyPreview />,

    props,
    examples,
};

export default doc;

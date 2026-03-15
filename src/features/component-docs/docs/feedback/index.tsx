import { useState, useEffect, useRef } from "react";
import { Feedback } from "@fremtind/jokul/feedback";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function FeedbackSmileyPreview() {
    const isHovered = usePreviewHovered();
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => { if (!isHovered) setSubmitted(false); }, [isHovered]);
    const options = [1, 2, 3, 4, 5].map(n => ({ label: String(n), value: n }));
    return submitted ? (
        <p style={{ margin: 0 }}>Takk for tilbakemeldingen!</p>
    ) : (
        <Feedback
            type="smiley"
            label="Var dette nyttig?"
            options={options}
            onSubmit={() => setSubmitted(true)}
        />
    );
}

const doc: ComponentDoc = {
    id: "feedback",
    name: "Feedback",
    package: "@fremtind/jokul/feedback",
    category: "Visning",
    status: "stable",
    description:
        "Feedback er en komponent for å samle inn tilbakemeldinger fra brukere. Den støtter smileys og radioknapper, og kan utvides med et oppfølgingsspørsmål.",
    preview: <FeedbackSmileyPreview />,

    props,
};

export default doc;

"use client";
import { useState, useEffect } from "react";
import { Feedback } from "@fremtind/jokul/feedback";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function FeedbackSmileyPreview() {
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

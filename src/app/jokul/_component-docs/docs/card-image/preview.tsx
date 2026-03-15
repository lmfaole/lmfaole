"use client";
import { useState, useEffect } from "react";
import { Card, CardImage } from "@fremtind/jokul/card";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function CardImagePreview() {
    const isHovered = usePreviewHovered();
    const [label, setLabel] = useState("Bilforsikring");

    useEffect(() => {
        setLabel(isHovered ? "Reiseforsikring" : "Bilforsikring");
    }, [isHovered]);

    return (
        <Card style={{ maxWidth: 200, overflow: "hidden" }}>
            <CardImage src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=200&fit=crop" alt="Bil på vei" />
            <div style={{ padding: "var(--jkl-spacing-s)" }}>
                <p style={{ margin: 0, fontSize: "0.9em" }}>{label}</p>
            </div>
        </Card>
    );
}

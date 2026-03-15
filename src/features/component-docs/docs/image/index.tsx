import { useState, useEffect } from "react";
import { Image } from "@fremtind/jokul/image";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import "./image.scss";
import { props } from "./props";
import { examples } from "./examples";

function ImagePreview() {
    const isHovered = usePreviewHovered();
    return (
        <div style={{ width: 200, height: 120, position: "relative", borderRadius: "4px", overflow: "hidden" }}>
            <Image src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=240&fit=crop" alt="Fjelllandskap" />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "white", padding: "4px 8px", fontSize: "0.8em", transition: "opacity 0.3s", opacity: isHovered ? 1 : 0 }}>
                Fjelllandskap
            </div>
        </div>
    );
}

const doc: ComponentDoc = {
    id: "image",
    name: "Image",
    package: "@fremtind/jokul/image",
    category: "Visning",
    status: "stable",
    description:
        "Image er en tilgjengelig bildekomponent som sikrer korrekt bruk av alt-tekst. Den måler containerens bredde for å sette riktig sizes-attributt, og viser en plassholder mens bildet lastes. Komponenten krever at foreldreelementet har definert bredde og høyde.",
    warnings:
        "Sett alt til en tom streng ('') for dekorative bilder. Komponenten bruker loading=\"lazy\" og avhenger av at foreldreelementet har eksplisitt størrelse for at bildet skal lastes.",

    preview: <ImagePreview />,
    props,
    examples,
};

export default doc;

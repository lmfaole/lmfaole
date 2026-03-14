import { useState, useEffect } from "react";
import { Image } from "@fremtind/jokul/image";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import "./image.scss";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "image",
    name: "Image",
    package: "@fremtind/jokul/image",
    category: "Visning",
    tags: ["bilde", "media", "alt-tekst", "tilgjengelighet"],
    status: "stable",
    description:
        "Image er en tilgjengelig bildekomponent som sikrer korrekt bruk av alt-tekst. Den måler containerens bredde for å sette riktig sizes-attributt, og viser en plassholder mens bildet lastes. Komponenten krever at foreldreelementet har definert bredde og høyde.",
    warnings:
        "Sett alt til en tom streng ('') for dekorative bilder. Komponenten bruker loading=\"lazy\" og avhenger av at foreldreelementet har eksplisitt størrelse for at bildet skal lastes.",

    props,
    examples,
};

export default doc;

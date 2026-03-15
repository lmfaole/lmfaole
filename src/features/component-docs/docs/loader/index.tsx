import { Loader } from "@fremtind/jokul/loader";
import { useState, useEffect } from "react";
import { Icon } from "@fremtind/jokul/icon";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function LoaderPreview() {
    const isHovered = usePreviewHovered();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        if (!isHovered) return;
        const id = setTimeout(() => setLoading(false), 1800);
        return () => clearTimeout(id);
    }, [isHovered]);
    return loading
        ? <Loader textDescription="Laster" />
        : <span style={{ fontSize: "2rem", color: "var(--jkl-color-text-positive)" }}><Icon>check_circle</Icon></span>;
}

const doc: ComponentDoc = {
    id: "loader",
    name: "Loader",
    package: "@fremtind/jokul/loader",
    category: "Tilbakemelding",
    status: "stable",
    description:
        "Loader viser en spinner-animasjon mens data hentes eller en operasjon pågår. Gi alltid textDescription for skjermlesere.",
    warnings: "Bruk delay-prop for å unngå flimmer ved operasjoner under ~300ms — en loader som blinker er verre enn ingen loader.",
    relationships: {
        alternatives: [{ id: "skeleton", description: "Bruk Skeleton-plassholdere når formen på innholdet som lastes er kjent på forhånd." }],
        related: [{ id: "button", description: "Erstatt Button-etiketten med Loader mens en asynkron handling pågår for å vise innebygd ladetilstand." }, { id: "feedback", description: "Kombiner Loader med Feedback-mønstre for å kommunisere fremdrift på tvers av en hel side eller seksjon." }],
    },
    preview: <LoaderPreview />,

    props,
    examples
};

export default doc;

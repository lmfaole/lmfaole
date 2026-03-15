import { Countdown } from "@fremtind/jokul/countdown";
import { useState, useEffect } from "react";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function CountdownPreview() {
    const isHovered = usePreviewHovered();
    const [key, setKey] = useState(0);
    useEffect(() => { if (isHovered) setKey(k => k + 1); }, [isHovered]);
    return <Countdown key={key} from={10 * 1000} />;
}

const doc: ComponentDoc = {
    id: "countdown",
    name: "Countdown",
    package: "@fremtind/jokul/countdown",
    category: "Visning",
    description: "Countdown viser en nedtelling fra et gitt antall millisekunder.",
    preview: <CountdownPreview />,

    props,
};

export default doc;

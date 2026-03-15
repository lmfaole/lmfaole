"use client";
import { useState, useEffect } from "react";
import { SystemMessage } from "@fremtind/jokul/system-message";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function SystemMessagePreview() {
    const isHovered = usePreviewHovered();
    const [dismissed, setDismissed] = useState(false);
    useEffect(() => { setDismissed(false); }, [isHovered]);
    return dismissed
        ? <p style={{ color: "var(--jkl-color-text-subdued)", fontSize: "0.9em" }}>Melding avvist</p>
        : <SystemMessage variant="info" dismissAction={{ handleDismiss: () => setDismissed(true) }}>Planlagt vedlikehold lørdag kl. 02–04.</SystemMessage>;
}

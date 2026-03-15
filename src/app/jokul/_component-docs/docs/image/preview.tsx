"use client";
import { Image } from "@fremtind/jokul/image";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";
import "./image.scss";

export function ImagePreview() {
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

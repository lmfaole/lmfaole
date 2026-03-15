"use client";
import { Image } from "@fremtind/jokul/image";
import "./image.scss";

export function ImagePreview() {
    return (
        <div style={{ width: 200, height: 120, borderRadius: "4px", overflow: "hidden" }}>
            <Image src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=240&fit=crop" alt="Fjelllandskap" />
        </div>
    );
}

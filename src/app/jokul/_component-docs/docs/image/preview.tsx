"use client";
import { useState, useEffect } from "react";
import { Image } from "@fremtind/jokul/image";
import "./image.scss";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

const images = [
    { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=240&fit=crop", alt: "Fjelllandskap" },
    { src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=200&fit=crop", alt: "Bil på vei" },
];

export function ImagePreview() {
    const isHovered = usePreviewHovered();
    const [imgIdx, setImgIdx] = useState(0);

    useEffect(() => {
        if (!isHovered) { setImgIdx(0); return; }
        const id = setInterval(() => setImgIdx(i => (i + 1) % images.length), 1500);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <div style={{ width: 200, height: 120, borderRadius: "4px", overflow: "hidden" }}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Image src={images[imgIdx].src} alt={images[imgIdx].alt} {...{ loading: "eager", style: { width: "100%", height: "100%", objectFit: "cover" } } as any} />
        </div>
    );
}

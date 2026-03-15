"use client";
import { Breadcrumb, BreadcrumbItem } from "@fremtind/jokul/breadcrumb";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function BreadcrumbPreview() {
    const isHovered = usePreviewHovered();
    return (
        <Breadcrumb>
            <BreadcrumbItem><a href="#">Hjem</a></BreadcrumbItem>
            <BreadcrumbItem><a href="#">Forsikringer</a></BreadcrumbItem>
            <BreadcrumbItem><span style={{ fontWeight: isHovered ? "bold" : "normal", transition: "font-weight 0.2s" }}>Bilforsikring</span></BreadcrumbItem>
        </Breadcrumb>
    );
}

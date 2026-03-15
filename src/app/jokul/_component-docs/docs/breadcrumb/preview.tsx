"use client";
import { Breadcrumb, BreadcrumbItem } from "@fremtind/jokul/breadcrumb";

export function BreadcrumbPreview() {
    return (
        <Breadcrumb>
            <BreadcrumbItem><a href="#">Hjem</a></BreadcrumbItem>
            <BreadcrumbItem><a href="#">Forsikringer</a></BreadcrumbItem>
            <BreadcrumbItem><span>Bilforsikring</span></BreadcrumbItem>
        </Breadcrumb>
    );
}

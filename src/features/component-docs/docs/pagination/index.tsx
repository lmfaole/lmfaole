import { useState, useEffect } from "react";
import { Pagination } from "@fremtind/jokul/pagination";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function PaginationPreview() {
    const [page, setPage] = useState(3);
    return <Pagination currentPage={page} numberOfPages={10} onPageChange={(to) => setPage(to)} />;
}

const doc: ComponentDoc = {
    id: "pagination",
    name: "Pagination",
    package: "@fremtind/jokul/pagination",
    category: "Navigasjon",
    description: "Pagination brukes til å dele opp lange lister i sider.",
    warnings: "Pagination er fullt kontrollert — du er ansvarlig for å oppdatere currentPage i onPageChange.",

    preview: <PaginationPreview />,
    props,
};

export default doc;

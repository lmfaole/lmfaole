import { useState, useEffect } from "react";
import { Pagination } from "@fremtind/jokul/pagination";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "pagination",
    name: "Pagination",
    package: "@fremtind/jokul/pagination",
    category: "Navigasjon",
    tags: ["navigasjon", "interaktiv", "datavisning", "liste"],
    description: "Pagination brukes til å dele opp lange lister i sider.",
    warnings: "Pagination er fullt kontrollert — du er ansvarlig for å oppdatere currentPage i onPageChange.",

    props,
    examples,
};

export default doc;

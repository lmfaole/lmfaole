"use client";
import { useState, useEffect } from "react";
import { Pagination } from "@fremtind/jokul/pagination";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

function PaginationAnimatedPreview() {
    const isHovered = usePreviewHovered();
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!isHovered) { setPage(1); return; }
        setPage(2);
        const id = setInterval(() => setPage(p => p >= 5 ? 1 : p + 1), 800);
        return () => clearInterval(id);
    }, [isHovered]);

    return <Pagination currentPage={page} numberOfPages={8} onPageChange={setPage} />;
}

function PaginationPreview() {
    const [page, setPage] = useState(3);
    return <Pagination currentPage={page} numberOfPages={10} onPageChange={setPage} />;
}

function PaginationManyPages() {
    const [page, setPage] = useState(1);
    return <Pagination currentPage={page} numberOfPages={50} onPageChange={setPage} />;
}

function PaginationCustomLabels() {
    const [page, setPage] = useState(1);
    return <Pagination currentPage={page} numberOfPages={10} onPageChange={setPage} labels={{ previous: "Forrige side", next: "Neste side" }} />;
}

const doc: ComponentDoc = {
    id: "pagination",
    name: "Pagination",
    package: "@fremtind/jokul/pagination",
    category: "Navigasjon",
    tags: ["navigasjon", "interaktiv", "datavisning", "liste"],
    description: "Pagination brukes til å dele opp lange lister i sider.",
    warnings: "Pagination er fullt kontrollert — du er ansvarlig for å oppdatere currentPage i onPageChange.",
    preview: <PaginationAnimatedPreview />,
    props: [
        { name: "currentPage", type: "number", required: true, source: "custom", status: "stable", description: "Gjeldende sidenummer (1-basert)." },
        { name: "numberOfPages", type: "number", required: true, source: "custom", status: "stable", description: "Totalt antall sider." },
        { name: "onPageChange", type: "(toPage: number, fromPage: number) => void", required: true, source: "react", status: "stable", description: "Kalles ved sidebytte." },
        { name: "labels", type: '{ previous: string; next: string }', required: false, source: "custom", status: "stable", default: '{ previous: "Forrige", next: "Neste" }', description: "Tekster for forrige/neste-knapper." },
    ],
    examples: [
        {
            title: "Grunnleggende paginering",
            description: "Paginering med 10 sider der side 3 er gjeldende.",
            code: `const [page, setPage] = React.useState(3);

<Pagination
    currentPage={page}
    numberOfPages={10}
    onPageChange={(toPage) => setPage(toPage)}
/>`,
            tags: ["controlled"],
            preview: <PaginationPreview />,
        },
        {
            title: "Mange sider",
            description: "Paginering med et høyt antall sider viser ellipsis for kompakt visning.",
            code: `const [page, setPage] = React.useState(1);

<Pagination
    currentPage={page}
    numberOfPages={50}
    onPageChange={(toPage) => setPage(toPage)}
/>`,
            preview: <PaginationManyPages />,
        },
        {
            title: "Egendefinerte knapptekster",
            description: "Egne tekster på forrige/neste-knappene.",
            code: `const [page, setPage] = React.useState(1);

<Pagination
    currentPage={page}
    numberOfPages={10}
    onPageChange={(toPage) => setPage(toPage)}
    labels={{ previous: "Forrige side", next: "Neste side" }}
/>`,
            preview: <PaginationCustomLabels />,
        },
    ],
};

export default doc;

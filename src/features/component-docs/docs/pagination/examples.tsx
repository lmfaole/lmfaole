import { useState, useEffect } from "react";
import { Pagination } from "@fremtind/jokul/pagination";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


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


export const examples: ComponentExample[] = [
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
            }
];

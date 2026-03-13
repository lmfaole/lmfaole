import React from "react";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "pagination",
    name: "Pagination",
    package: "@fremtind/jokul/pagination",
    category: "Navigasjon",
    tags: ["navigasjon", "interaktiv", "datavisning", "liste"],
    description: "Pagination brukes til å dele opp lange lister i sider.",
    notes: "Oppdater currentPage-state i onPageChange-handler.",
    props: [
        { name: "currentPage", type: "number", required: true, description: "Gjeldende sidenummer (1-basert)." },
        { name: "numberOfPages", type: "number", required: true, description: "Totalt antall sider." },
        { name: "onPageChange", type: "(toPage: number, fromPage: number) => void", required: true, description: "Kalles ved sidebytte." },
        { name: "labels", type: '{ previous: string; next: string }', required: false, description: "Tekster for forrige/neste-knapper." },
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
        },
    ],
};

export default doc;

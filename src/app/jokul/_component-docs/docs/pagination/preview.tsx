"use client";
import { useState } from "react";
import { Pagination } from "@fremtind/jokul/pagination";

export function PaginationPreview() {
    const [page, setPage] = useState(3);
    return <Pagination currentPage={page} numberOfPages={10} onPageChange={(to) => setPage(to)} />;
}

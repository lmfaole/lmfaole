import type { ComponentDoc } from "../types";
import { props } from "./props";
import { PaginationPreview } from "./preview";

const doc: ComponentDoc = {
    id: "pagination",
    name: "Pagination",
    package: "@fremtind/jokul/pagination",
    category: "Navigasjon",
    description: {
        short: "Brukes til å dele opp lange lister i sider.",
        long: "Pagination brukes til å dele opp lange lister i sider.",
    },
    warnings: "Pagination er fullt kontrollert — du er ansvarlig for å oppdatere currentPage i onPageChange.",

    preview: <PaginationPreview />,
    props,
};

export default doc;

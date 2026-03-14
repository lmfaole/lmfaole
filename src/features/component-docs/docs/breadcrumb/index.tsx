import { Breadcrumb, BreadcrumbItem } from "@fremtind/jokul/breadcrumb";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import navLinkDoc from "../nav-link";
import linkDoc from "../link";

const doc: ComponentDoc = {
    id: "breadcrumb",
    name: "Breadcrumb",
    package: "@fremtind/jokul/breadcrumb",
    category: "Navigasjon",
    tags: ["navigasjon", "hierarki"],
    description: "Breadcrumb viser hvor brukeren er i nettstedets hierarki og gir snarveier tilbake til overordnede sider.",
    relatedIds: [navLinkDoc.id, linkDoc.id],
    preview: (
        <Breadcrumb>
            <BreadcrumbItem><a href="#">Hjem</a></BreadcrumbItem>
            <BreadcrumbItem><a href="#">Forsikringer</a></BreadcrumbItem>
            <BreadcrumbItem>Bilforsikring</BreadcrumbItem>
        </Breadcrumb>
    ),

    props,
    subComponents: [
        {
            name: "BreadcrumbItem",
            description: "Et enkelt ledd i brødsmulestien.",
            props: [
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Lenke eller tekst for gjeldende side." },
            ],
        },
    ],
    examples,
};

export default doc;

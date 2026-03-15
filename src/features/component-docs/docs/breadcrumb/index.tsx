import { Breadcrumb, BreadcrumbItem } from "@fremtind/jokul/breadcrumb";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "breadcrumb",
    name: "Breadcrumb",
    package: "@fremtind/jokul/breadcrumb",
    category: "Navigasjon",
    description: "Breadcrumb viser hvor brukeren er i nettstedets hierarki og gir snarveier tilbake til overordnede sider.",
    relationships: {
        related: [{ id: "nav-link", description: "NavLink gir sidefeltsnavigasjonen som brødsmulestien supplerer ved å vise den hierarkiske stien." }, { id: "link", description: "Hvert brødsmule-element er bygget på en standard Link for tastatur- og skjermlesertilgjengelighet." }],
    },
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
    examples
};

export default doc;

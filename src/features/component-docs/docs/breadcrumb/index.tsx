import { Breadcrumb, BreadcrumbItem } from "@fremtind/jokul/breadcrumb";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function BreadcrumbPreview() {
    const isHovered = usePreviewHovered();
    return (
        <Breadcrumb>
            <BreadcrumbItem><a href="#">Hjem</a></BreadcrumbItem>
            <BreadcrumbItem><a href="#">Forsikringer</a></BreadcrumbItem>
            <BreadcrumbItem><span style={{ fontWeight: isHovered ? "bold" : "normal", transition: "font-weight 0.2s" }}>Bilforsikring</span></BreadcrumbItem>
        </Breadcrumb>
    );
}

const doc: ComponentDoc = {
    id: "breadcrumb",
    name: "Breadcrumb",
    package: "@fremtind/jokul/breadcrumb",
    category: "Navigasjon",
    description: "Breadcrumb viser hvor brukeren er i nettstedets hierarki og gir snarveier tilbake til overordnede sider.",
    relationships: {
        related: [{ id: "nav-link", description: "NavLink gir sidefeltsnavigasjonen som brødsmulestien supplerer ved å vise den hierarkiske stien." }, { id: "link", description: "Hvert brødsmule-element er bygget på en standard Link for tastatur- og skjermlesertilgjengelighet." }],
    },
    preview: <BreadcrumbPreview />,

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

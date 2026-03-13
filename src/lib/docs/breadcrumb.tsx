import React from "react";
import { Breadcrumb, BreadcrumbItem } from "@fremtind/jokul/breadcrumb";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "breadcrumb",
    name: "Breadcrumb",
    package: "@fremtind/jokul/breadcrumb",
    category: "Navigasjon",
    tags: ["navigasjon", "hierarki"],
    description: "Breadcrumb viser hvor brukeren er i nettstedets hierarki og gir snarveier tilbake til overordnede sider.",
    notes: "Bruk Breadcrumb på sider som er mer enn ett nivå dypt.",
    relatedIds: ["nav-link", "link"],
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", description: "BreadcrumbItem-elementer." },
    ],
    examples: [
        {
            title: "Standard brødsmulesti",
            description: "Typisk brødsmulesti med tre nivåer.",
            code: `<Breadcrumb>
  <BreadcrumbItem><a href="/">Hjem</a></BreadcrumbItem>
  <BreadcrumbItem><a href="/forsikring">Forsikring</a></BreadcrumbItem>
  <BreadcrumbItem>Bilforsikring</BreadcrumbItem>
</Breadcrumb>`,
            preview: (
                <Breadcrumb>
                    <BreadcrumbItem><a href="/">Hjem</a></BreadcrumbItem>
                    <BreadcrumbItem><a href="/forsikring">Forsikring</a></BreadcrumbItem>
                    <BreadcrumbItem>Bilforsikring</BreadcrumbItem>
                </Breadcrumb>
            ),
        },
        {
            title: "To nivåer",
            description: "Kort brødsmulesti med kun hjem og gjeldende side.",
            code: `<Breadcrumb>
  <BreadcrumbItem><a href="/">Hjem</a></BreadcrumbItem>
  <BreadcrumbItem>Min profil</BreadcrumbItem>
</Breadcrumb>`,
            preview: (
                <Breadcrumb>
                    <BreadcrumbItem><a href="/">Hjem</a></BreadcrumbItem>
                    <BreadcrumbItem>Min profil</BreadcrumbItem>
                </Breadcrumb>
            ),
        },
        {
            title: "Fire nivåer",
            description: "Dypere navigasjonsvei for nestet innholdsstruktur.",
            code: `<Breadcrumb>
  <BreadcrumbItem><a href="/">Hjem</a></BreadcrumbItem>
  <BreadcrumbItem><a href="/produkter">Produkter</a></BreadcrumbItem>
  <BreadcrumbItem><a href="/produkter/forsikring">Forsikring</a></BreadcrumbItem>
  <BreadcrumbItem>Reiseforsikring</BreadcrumbItem>
</Breadcrumb>`,
            preview: (
                <Breadcrumb>
                    <BreadcrumbItem><a href="/">Hjem</a></BreadcrumbItem>
                    <BreadcrumbItem><a href="/produkter">Produkter</a></BreadcrumbItem>
                    <BreadcrumbItem><a href="/produkter/forsikring">Forsikring</a></BreadcrumbItem>
                    <BreadcrumbItem>Reiseforsikring</BreadcrumbItem>
                </Breadcrumb>
            ),
        },
    ],
};

export default doc;

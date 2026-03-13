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
    relatedIds: ["nav-link", "link"],
    preview: (
        <Breadcrumb>
            <BreadcrumbItem><a href="#">Hjem</a></BreadcrumbItem>
            <BreadcrumbItem><a href="#">Forsikringer</a></BreadcrumbItem>
            <BreadcrumbItem>Bilforsikring</BreadcrumbItem>
        </Breadcrumb>
    ),
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "BreadcrumbItem-elementer." },
    ],
    subComponents: [
        {
            name: "BreadcrumbItem",
            description: "Et enkelt ledd i brødsmulestien.",
            props: [
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Lenke eller tekst for gjeldende side." },
            ],
        },
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

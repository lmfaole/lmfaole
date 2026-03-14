import { Breadcrumb, BreadcrumbItem } from "@fremtind/jokul/breadcrumb";
import type { ComponentExample } from "../types";

export const examples: ComponentExample[] = [
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
            }
];

import { useEffect, useRef } from "react";
import { Search } from "@fremtind/jokul/search";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


export const examples: ComponentExample[] = [
    {
                title: "Søkefelt med knapp",
                description: "Standard bruk: Search og Search.Button side om side i et skjema.",
                code: `<Search label="Søk" placeholder="Søk etter forsikring..." name="q">
      <Search.Button label="Søk" type="submit" />
    </Search>`,
                preview: (
                    <Search label="Søk" placeholder="Søk etter forsikring..." name="q">
                        <Search.Button label="Søk" type="submit" />
                    </Search>
                ),
            },
    {
                title: "Uten synlig label",
                description: "Søkefelt med aria-label for kompakte flater.",
                code: `<Search aria-label="Søk i dokumenter" placeholder="Søk i dokumenter..." />`,
                preview: <Search aria-label="Søk i dokumenter" placeholder="Søk i dokumenter..." />,
            }
];

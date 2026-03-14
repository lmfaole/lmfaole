import { useState, useEffect } from "react";
import { Image } from "@fremtind/jokul/image";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import "./image.scss";
import type { ComponentExample } from "../types";


export const examples: ComponentExample[] = [
    {
                title: "Grunnleggende bilde",
                description: "Image plassert i en container med definert størrelse. Komponenten måler containerens bredde for å sette sizes og laster bildet lazy.",
                code: `<Image
      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
      alt="Fjelltopp med snødekke og blå himmel"
    />`,
                preview: (
                    <Image
                        className="image-preview"
                        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
                        alt="Fjelltopp med snødekke og blå himmel"
                    />
                ),
            },
    {
                title: "Dekorativt bilde",
                description: "Sett alt til tom streng for bilder som ikke tilfører innhold — skjermlesere hopper over dem.",
                code: `<figure>
      <Image
        src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&h=200&fit=crop"
        alt=""
      />
      <figcaption>Dekorativt bilde — skjermlesere hopper over det.</figcaption>
    </figure>`,
                preview: (
                    <figure className="image-preview image-preview--small">
                        <Image
                            src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&h=200&fit=crop"
                            alt=""
                        />
                        <figcaption>Dekorativt bilde (alt er tom streng — skjermlesere hopper over det).</figcaption>
                    </figure>
                ),
            },
    {
                title: "Med plassholder",
                description: "placeholder viser et lavoppløselig bilde med blur-effekt mens det skarpe bildet lastes inn.",
                code: `<figure>
      <Image
        src="https://images.unsplash.com/photo-1490750967868-88df5691cc58?w=600&h=400&fit=crop"
        placeholder="https://images.unsplash.com/photo-1490750967868-88df5691cc58?w=20&h=13&fit=crop"
        alt="Nærbilde av fargerike blomster"
      />
      <figcaption>Plassholderen vises til det skarpe bildet er lastet.</figcaption>
    </figure>`,
                preview: (
                    <figure className="image-preview">
                        <Image
                            src="https://images.unsplash.com/photo-1490750967868-88df5691cc58?w=600&h=400&fit=crop"
                            placeholder="https://images.unsplash.com/photo-1490750967868-88df5691cc58?w=20&h=13&fit=crop"
                            alt="Nærbilde av fargerike blomster"
                        />
                        <figcaption>Plassholderen (lav oppløsning) vises til det skarpe bildet er lastet.</figcaption>
                    </figure>
                ),
            }
];

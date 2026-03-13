import React, { useState, useEffect } from "react";
import { Image } from "@fremtind/jokul/image";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";
import "./image.scss";

const IMAGES = [
    { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop", alt: "Fjelltopp med snødekke og blå himmel" },
    { src: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop", alt: "Tett skog med solstråler" },
    { src: "https://images.unsplash.com/photo-1490750967868-88df5691cc58?w=600&h=400&fit=crop", alt: "Nærbilde av fargerike blomster" },
    { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop", alt: "Sandstrand og turkis hav" },
];

function ImagePreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % IMAGES.length), 1800);
        return () => clearInterval(id);
    }, [isHovered]);

    const img = IMAGES[step];
    return (
        <div className="image-preview">
            <img key={img.src} src={img.src} alt={img.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
    );
}

const doc: ComponentDoc = {
    id: "image",
    name: "Image",
    package: "@fremtind/jokul/image",
    category: "Visning",
    tags: ["bilde", "media", "alt-tekst", "tilgjengelighet"],
    status: "stable",
    description:
        "Image er en tilgjengelig bildekomponent som sikrer korrekt bruk av alt-tekst. Den måler containerens bredde for å sette riktig sizes-attributt, og viser en plassholder mens bildet lastes. Komponenten krever at foreldreelementet har definert bredde og høyde.",
    warnings:
        "Sett alt til en tom streng ('') for dekorative bilder. Komponenten bruker loading=\"lazy\" og avhenger av at foreldreelementet har eksplisitt størrelse for at bildet skal lastes.",
    preview: <ImagePreview />,
    props: [
        { name: "src", type: "string", required: true, source: "native", status: "stable", description: "URL til bildet." },
        { name: "alt", type: "string", required: true, source: "native", status: "stable", description: "Alternativ tekst. Bruk tom streng for dekorative bilder." },
        { name: "srcSet", type: "string", required: false, source: "native", status: "stable", description: "Responsivt srcset-attributt for ulike skjermoppløsninger." },
        { name: "placeholder", type: "string", required: false, source: "custom", status: "stable", description: "URL til et lavoppløselig plassholdbilde som vises under innlasting." },
        { name: "className", type: "string", required: false, source: "react", status: "stable", description: "Ekstra CSS-klasser." },
    ],
    examples: [
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
        },
    ],
};

export default doc;

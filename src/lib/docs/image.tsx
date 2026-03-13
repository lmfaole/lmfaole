import React from "react";
import { Image } from "@fremtind/jokul/image";
import type { ComponentDoc } from "./types";

function BasicImagePreview() {
    return (
        <Image
            src="https://placehold.co/600x400"
            alt="Eksempelbilde på 600 ganger 400 piksler"
        />
    );
}

function DecorativeImagePreview() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--jkl-spacing-s)" }}>
            <Image
                src="https://placehold.co/300x200"
                alt=""
                className="decorative-image"
            />
            <p style={{ margin: 0, fontSize: "var(--jkl-font-size-small)" }}>
                Dekorativt bilde (alt er tom streng — skjermlesere hopper over det).
            </p>
        </div>
    );
}

function PlaceholderImagePreview() {
    return (
        <Image
            src="https://placehold.co/600x400/cccccc/888888?text=Ingen+bilde"
            placeholder="https://placehold.co/600x400/eeeeee/cccccc"
            alt="Produktbilde med innlastingsplassholder"
        />
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
        "Image er en tilgjengelig bildekomponent som sikrer korrekt bruk av alt-tekst. Støtter responsivt srcSet og valgfri placeholder mens bildet lastes inn.",
    notes:
        "Sett alt til en tom streng ('') for dekorative bilder som ikke tilfører meningsfylt informasjon. Bruk alltid beskrivende alt-tekst for innholdsmessige bilder.",
    props: [
        { name: "src", type: "string", required: true, source: "native", description: "URL til bildet." },
        {
            name: "alt",
            type: "string",
            required: true,
            source: "native",
            description: "Alternativ tekst. Bruk tom streng for dekorative bilder.",
        },
        {
            name: "srcSet",
            type: "string",
            required: false,
            source: "native",
            description: "Responsivt srcset-attributt for ulike skjermoppløsninger.",
        },
        {
            name: "placeholder",
            type: "string",
            required: false,
            source: "native",
            description: "URL til et lavoppløselig plassholdbilde som vises under innlasting.",
        },
        { name: "className", type: "string", required: false, source: "native", description: "Ekstra CSS-klasser." },
    ],
    examples: [
        {
            title: "Grunnleggende bilde",
            description: "Et enkelt bilde med beskrivende alt-tekst.",
            code: `import { Image } from "@fremtind/jokul/image";

<Image
    src="https://placehold.co/600x400"
    alt="Eksempelbilde på 600 ganger 400 piksler"
/>`,
            preview: <BasicImagePreview />,
        },
        {
            title: "Dekorativt bilde",
            description: "Sett alt til tom streng for bilder som ikke tilfører innhold.",
            code: `import { Image } from "@fremtind/jokul/image";

<Image
    src="https://placehold.co/300x200"
    alt=""
/>`,
            preview: <DecorativeImagePreview />,
        },
        {
            title: "Med plassholder",
            description: "Vis et plassholdbilde mens det endelige bildet lastes.",
            code: `import { Image } from "@fremtind/jokul/image";

<Image
    src="https://placehold.co/600x400/cccccc/888888?text=Ingen+bilde"
    placeholder="https://placehold.co/600x400/eeeeee/cccccc"
    alt="Produktbilde med innlastingsplassholder"
/>`,
            preview: <PlaceholderImagePreview />,
        },
    ],
};

export default doc;

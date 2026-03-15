import type { ComponentDoc } from "../types";
import { props } from "./props";
import { ImagePreview } from "./preview";

const doc: ComponentDoc = {
    id: "image",
    name: "Image",
    package: "@fremtind/jokul/image",
    category: "Visning",
    status: "stable",
    description: {
        short: "Tilgjengelig bildekomponent som sikrer korrekt bruk av alt-tekst.",
        long: "Image er en tilgjengelig bildekomponent som sikrer korrekt bruk av alt-tekst. Den måler containerens bredde for å sette riktig sizes-attributt, og viser en plassholder mens bildet lastes. Komponenten krever at foreldreelementet har definert bredde og høyde.",
    },
    warnings:
        "Sett alt til en tom streng ('') for dekorative bilder. Komponenten bruker loading=\"lazy\" og avhenger av at foreldreelementet har eksplisitt størrelse for at bildet skal lastes.",

    preview: <ImagePreview />,
    props,
};

export default doc;

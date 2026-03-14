import { Loader } from "@fremtind/jokul/loader";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import skeletonDoc from "../skeleton";
import buttonDoc from "../button";
import feedbackDoc from "../feedback";

const doc: ComponentDoc = {
    id: "loader",
    name: "Loader",
    package: "@fremtind/jokul/loader",
    category: "Tilbakemelding",
    tags: ["animasjon", "feedback", "tilstandsstyring", "spinner", "laster"],
    status: "stable",
    description:
        "Loader viser en spinner-animasjon mens data hentes eller en operasjon pågår. Gi alltid textDescription for skjermlesere.",
    warnings: "Bruk delay-prop for å unngå flimmer ved operasjoner under ~300ms — en loader som blinker er verre enn ingen loader.",
    relatedIds: [skeletonDoc.id, buttonDoc.id, feedbackDoc.id],
    preview: (
        <Flex gap="l" alignItems="center">
            <Loader variant="small" textDescription="Laster" />
            <Loader variant="medium" textDescription="Laster" />
            <Loader variant="large" textDescription="Laster" />
        </Flex>
    ),

    props,
    examples,
};

export default doc;

import { Loader } from "@fremtind/jokul/loader";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "loader",
    name: "Loader",
    package: "@fremtind/jokul/loader",
    category: "Tilbakemelding",
    status: "stable",
    description:
        "Loader viser en spinner-animasjon mens data hentes eller en operasjon pågår. Gi alltid textDescription for skjermlesere.",
    warnings: "Bruk delay-prop for å unngå flimmer ved operasjoner under ~300ms — en loader som blinker er verre enn ingen loader.",
    relationships: {
        alternatives: [{ id: "skeleton", description: "Bruk Skeleton-plassholdere når formen på innholdet som lastes er kjent på forhånd." }],
        related: [{ id: "button", description: "Erstatt Button-etiketten med Loader mens en asynkron handling pågår for å vise innebygd ladetilstand." }, { id: "feedback", description: "Kombiner Loader med Feedback-mønstre for å kommunisere fremdrift på tvers av en hel side eller seksjon." }],
    },
    preview: (
        <Flex gap="l" alignItems="center">
            <Loader variant="small" textDescription="Laster" />
            <Loader variant="medium" textDescription="Laster" />
            <Loader variant="large" textDescription="Laster" />
        </Flex>
    ),

    props,
    examples
};

export default doc;

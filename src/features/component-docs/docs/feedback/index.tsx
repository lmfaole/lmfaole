import type { ComponentDoc } from "../types";
import { props } from "./props";
import { FeedbackSmileyPreview } from "./preview";

const doc: ComponentDoc = {
    id: "feedback",
    name: "Feedback",
    package: "@fremtind/jokul/feedback",
    category: "Visning",
    status: "stable",
    description:
        "Feedback er en komponent for å samle inn tilbakemeldinger fra brukere. Den støtter smileys og radioknapper, og kan utvides med et oppfølgingsspørsmål.",
    preview: <FeedbackSmileyPreview />,

    props,
};

export default doc;

import type { ComponentDoc } from "../types";
import { props } from "./props";
import { CountdownPreview } from "./preview";

const doc: ComponentDoc = {
    id: "countdown",
    name: "Countdown",
    package: "@fremtind/jokul/countdown",
    category: "Visning",
    description: "Countdown viser en nedtelling fra et gitt antall millisekunder.",
    preview: <CountdownPreview />,

    props,
};

export default doc;

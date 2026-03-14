import { Countdown } from "@fremtind/jokul/countdown";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "countdown",
    name: "Countdown",
    package: "@fremtind/jokul/countdown",
    category: "Visning",
    description: "Countdown viser en nedtelling fra et gitt antall millisekunder.",
    preview: (
        <Countdown from={60 * 1000} />
    ),

    props,
    examples,
};

export default doc;

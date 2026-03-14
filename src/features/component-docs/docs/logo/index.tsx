import { Logo, LogoStamp, ForsikringLevertAvFremtind } from "@fremtind/jokul/logo";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "logo",
    name: "Logo",
    package: "@fremtind/jokul/logo",
    category: "Visning",
    description: "Logo rendrer Fremtind-logoen som en SVG-komponent.",
    warnings: "Endre ikke logoens farger eller proporsjoner.",
    preview: (
        <Logo />
    ),

    props,
    examples,
};

export default doc;

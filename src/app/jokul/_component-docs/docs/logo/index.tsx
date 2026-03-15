import type { ComponentDoc } from "../types";
import { props } from "./props";
import { LogoPreview } from "./preview";

const doc: ComponentDoc = {
    id: "logo",
    name: "Logo",
    package: "@fremtind/jokul/logo",
    category: "Visning",
    description: {
        short: "Rendrer Fremtind-logoen som en SVG-komponent.",
        long: "Logo rendrer Fremtind-logoen som en SVG-komponent.",
    },
    warnings: "Endre ikke logoens farger eller proporsjoner.",
    preview: <LogoPreview />,

    props,
};

export default doc;

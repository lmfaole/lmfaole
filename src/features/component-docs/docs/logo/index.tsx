import { Logo, LogoStamp, ForsikringLevertAvFremtind } from "@fremtind/jokul/logo";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function LogoPreview() {
    const isHovered = usePreviewHovered();
    return <Logo style={{ transition: "opacity 0.3s", opacity: isHovered ? 1 : 0.6 }} />;
}

const doc: ComponentDoc = {
    id: "logo",
    name: "Logo",
    package: "@fremtind/jokul/logo",
    category: "Visning",
    description: "Logo rendrer Fremtind-logoen som en SVG-komponent.",
    warnings: "Endre ikke logoens farger eller proporsjoner.",
    preview: <LogoPreview />,

    props,
    examples,
};

export default doc;

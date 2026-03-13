import { Logo, LogoStamp, ForsikringLevertAvFremtind } from "@fremtind/jokul/logo";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "logo",
    name: "Logo",
    package: "@fremtind/jokul/logo",
    category: "Visning",
    tags: ["media", "ikon", "merkevare"],
    description: "Logo rendrer Fremtind-logoen som en SVG-komponent.",
    warnings: "Endre ikke logoens farger eller proporsjoner.",
    preview: (
        <Logo />
    ),
    props: [],
    examples: [
        {
            title: "Standard logo",
            description: "Fremtind-logoen i standard størrelse.",
            code: `<Logo />`,
            preview: <Logo />,
        },
        {
            title: "Logosymbol",
            description: "Kun symbolet uten ordmerket, for eksempel i kompakte flater.",
            code: `<Logo isSymbol title="Fremtind" />`,
            preview: <Logo isSymbol title="Fremtind" />,
        },
        {
            title: "Logostempel",
            description: "LogoStamp med tekst rundt logoen, brukes for å forsterke Fremtind-merkevaren.",
            code: `<LogoStamp>
  <ForsikringLevertAvFremtind />
</LogoStamp>`,
            preview: (
                <LogoStamp>
                    <ForsikringLevertAvFremtind />
                </LogoStamp>
            ),
        },
    ],
};

export default doc;

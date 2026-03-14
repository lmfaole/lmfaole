import { Logo, LogoStamp, ForsikringLevertAvFremtind } from "@fremtind/jokul/logo";
import type { ComponentExample } from "../types";

export const examples: ComponentExample[] = [
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
            }
];

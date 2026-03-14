import { useState, useEffect } from "react";
import { ExpandablePanel, Expander } from "@fremtind/jokul/expander";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


export const examples: ComponentExample[] = [
    {
                title: "I ExpandablePanel",
                description: "Vanlig bruk: Expander er trigger-knappen inne i ExpandablePanel og kobles til konteksten automatisk.",
                code: `<ExpandablePanel>
      <Expander>Vilkår og betingelser</Expander>
      <ExpandablePanel.Content>
        <p>Ved å tegne forsikring godtar du våre generelle vilkår. Forsikringen gjelder fra betalingsdato.</p>
      </ExpandablePanel.Content>
    </ExpandablePanel>`,
                preview: (
                    <ExpandablePanel>
                        <Expander>Vilkår og betingelser</Expander>
                        <ExpandablePanel.Content>
                            <p>Ved å tegne forsikring godtar du våre generelle vilkår. Forsikringen gjelder fra betalingsdato.</p>
                        </ExpandablePanel.Content>
                    </ExpandablePanel>
                ),
            },
    {
                title: "Styrt fra utsiden",
                description: "Bruk open og onClick for full kontroll over tilstanden — nyttig når du trenger å styre ekspandering programmatisk.",
                code: `const [open, setOpen] = useState(false);

    <ExpandablePanel open={open} onOpenChange={setOpen}>
      <Expander>Finn min nærmeste agent</Expander>
      <ExpandablePanel.Content>
        <p>Søk etter agenter i ditt område på fremtind.no/agenter.</p>
      </ExpandablePanel.Content>
    </ExpandablePanel>`,
                preview: (() => {
                    function ControlledExpander() {
                        const [open, setOpen] = useState(false);
                        return (
                            <ExpandablePanel open={open} onOpenChange={setOpen}>
                                <Expander>Finn min nærmeste agent</Expander>
                                <ExpandablePanel.Content>
                                    <p>Søk etter agenter i ditt område på fremtind.no/agenter.</p>
                                </ExpandablePanel.Content>
                            </ExpandablePanel>
                        );
                    }
                    return <ControlledExpander />;
                })(),
            },
    {
                title: "Egendefinert ikon",
                description: "Bytt ut standard chevron med et valgfritt ikon via icon-propen.",
                code: `import { InfoIcon } from "@fremtind/jokul/icon";

    <ExpandablePanel>
      <Expander icon={<InfoIcon />}>Om denne beregningen</Expander>
      <ExpandablePanel.Content>
        <p>Premien beregnes ut fra alder, kjørelengde og bonus.</p>
      </ExpandablePanel.Content>
    </ExpandablePanel>`,
                preview: (() => {
                    // Inline icon as SVG since we can't import named icons here directly
                    const InfoIcon = () => (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                    );
                    return (
                        <ExpandablePanel>
                            <Expander icon={<InfoIcon />}>Om denne beregningen</Expander>
                            <ExpandablePanel.Content>
                                <p>Premien beregnes ut fra alder, kjørelengde og bonus.</p>
                            </ExpandablePanel.Content>
                        </ExpandablePanel>
                    );
                })(),
            }
];

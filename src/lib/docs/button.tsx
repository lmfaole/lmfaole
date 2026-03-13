import { useState, useEffect } from "react";
import { Button } from "@fremtind/jokul/button";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

function ButtonPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);
    useEffect(() => {
        if (!isHovered) {
            setStep(0);
            return;
        }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 4), 1200);
        return () => clearInterval(id);
    }, [isHovered]);
    return (
        <Flex gap="s" wrap="wrap">
            <Button variant={step === 0 ? "primary" : "secondary"}>Lagre endringer</Button>
            <Button variant={step === 1 ? "primary" : "secondary"}>Avbryt</Button>
            <Button variant={step === 2 ? "primary" : "secondary"}>Slett</Button>
            <Button variant={step === 3 ? "primary" : "secondary"}>Vis mer</Button>
        </Flex>
    );
}

const doc: ComponentDoc = {
    id: "button",
    name: "Button",
    package: "@fremtind/jokul/button",
    category: "Skjema",
    tags: ["knapp", "interaktiv", "skjema"],
    description: "Button brukes til å utløse handlinger. Knapper er det primære interaksjonselementet og skal alltid kommunisere hva som skjer når brukeren trykker på dem. Velg variant basert på handlingens prioritet — bruk én primary-knapp per kontekst og reserver ghost for lavprioriterte handlinger.",
    warnings: "Ikke bruk Button til navigasjon — bruk Link eller NavLink i stedet.",
    relatedIds: ["text-input", "toggle-switch", "icon-button", "icon"],
    preview: <ButtonPreview />,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tekstinnholdet i knappen." },
        { name: "variant", type: '"primary" | "secondary" | "ghost" | "tertiary"', required: false, source: "react", status: "stable", default: '"secondary"', description: "Visuell prioritet." },
        { name: "icon", type: "React.ReactElement", required: false, source: "custom", status: "stable", description: "Ikon som vises ved siden av teksten. Bruk <Icon>-komponenten." },
        { name: "iconPosition", type: '"left" | "right"', required: false, source: "custom", status: "stable", default: '"left"', description: "Plasseringen av ikonet relativt til teksten." },
        { name: "loader", type: "{ showLoader: boolean, textDescription: string }", required: false, source: "custom", status: "stable", description: "Viser lasteindikator i knappen." },
        { name: "disabled", type: "boolean", required: false, source: "native", status: "stable", default: "false", description: "Deaktiverer knappen." },
        { name: "type", type: '"button" | "submit" | "reset"', required: false, source: "native", status: "stable", default: '"button"', description: "HTML-type-attributtet." },
        { name: "onClick", type: "React.MouseEventHandler<HTMLButtonElement>", required: false, source: "react", status: "stable", description: "Klikk-handler." },
        { name: "iconLeft", type: "React.ReactElement", required: false, source: "custom", status: "deprecated", statusDescription: "Bruk icon-propen i stedet. iconLeft er fjernet fra Jøkul til fordel for den nye icon-propen.", description: "Ikon som vises til venstre for teksten." },
        { name: "iconRight", type: "React.ReactElement", required: false, source: "custom", status: "deprecated", statusDescription: "Bruk icon-propen med iconPosition=\"right\" i stedet. iconRight er fjernet fra Jøkul til fordel for den nye icon-propen.", description: "Ikon som vises til høyre for teksten." },
    ],
    examples: [
        {
            title: "Primær handling",
            description: "Standard bruk — én primary-knapp per kontekst for den viktigste handlingen.",
            code: `<Button variant="primary">Send inn søknad</Button>`,
            preview: <Button variant="primary">Send inn søknad</Button>,
        },
        {
            title: "Varianter",
            description: "Bruk primary for den viktigste handlingen. secondary og ghost for støttehandlinger. tertiary for lavprioriterte lenke-lignende handlinger.",
            code: `<Flex gap="s" wrap="wrap">
  <Button variant="primary">Lagre endringer</Button>
  <Button variant="secondary">Avbryt</Button>
  <Button variant="ghost">Slett</Button>
  <Button variant="tertiary">Vis mer</Button>
</Flex>`,
            preview: (
                <Flex gap="s" wrap="wrap">
                    <Button variant="primary">Lagre endringer</Button>
                    <Button variant="secondary">Avbryt</Button>
                    <Button variant="ghost">Slett</Button>
                    <Button variant="tertiary">Vis mer</Button>
                </Flex>
            ),
        },
        {
            title: "Med ikon",
            description: "Bruk icon-propen med en Icon-komponent. iconPosition styrer om ikonet vises til venstre (standard) eller høyre for teksten.",
            code: `<Flex gap="s" wrap="wrap">
  <Button variant="primary" icon={<Icon>add</Icon>}>
    Ny forsikring
  </Button>
  <Button variant="secondary" icon={<Icon>download</Icon>} iconPosition="left">
    Last ned
  </Button>
  <Button variant="ghost" icon={<Icon>arrow_forward</Icon>} iconPosition="right">
    Se alle
  </Button>
</Flex>`,
            uses: ["icon"],
            preview: (
                <Flex gap="s" wrap="wrap">
                    <Button variant="primary" icon={<Icon>add</Icon>}>
                        Ny forsikring
                    </Button>
                    <Button variant="secondary" icon={<Icon>download</Icon>} iconPosition="left">
                        Last ned
                    </Button>
                    <Button variant="ghost" icon={<Icon>arrow_forward</Icon>} iconPosition="right">
                        Se alle
                    </Button>
                </Flex>
            ),
        },
        {
            title: "Ikonknapper bruker nå én icon-prop",
            description: "iconLeft og iconRight er utfaset. Bruk icon-propen med en Icon-komponent, og styr plasseringen med iconPosition.",
            uses: ["icon"],
            migrationBefore: `<Button iconLeft={<Icon>add</Icon>}>Ny forsikring</Button>
<Button iconRight={<Icon>arrow_forward</Icon>}>Se alle</Button>`,
            migrationSteps: [
                "Fjern iconLeft / iconRight-propen.",
                "Legg til icon-propen med samme Icon-komponent som verdi.",
                "Vil du ha ikonet til høyre? Legg til iconPosition=\"right\".",
            ],
            code: `<Button icon={<Icon>add</Icon>}>Ny forsikring</Button>
<Button icon={<Icon>arrow_forward</Icon>} iconPosition="right">Se alle</Button>`,
            preview: (
                <Flex gap="s" wrap="wrap">
                    <Button variant="primary" icon={<Icon>add</Icon>}>Ny forsikring</Button>
                    <Button variant="ghost" icon={<Icon>arrow_forward</Icon>} iconPosition="right">Se alle</Button>
                </Flex>
            ),
        },
        {
            title: "Lasteindikator",
            description: "Bruk loader når en handling tar tid. Gi alltid textDescription for skjermlesere.",
            code: `<Button loader={{ showLoader: true, textDescription: "Lagrer endringer" }}>
  Lagrer…
</Button>`,
            preview: (
                <Button loader={{ showLoader: true, textDescription: "Lagrer endringer" }}>
                    Lagrer…
                </Button>
            ),
        },
        {
            title: "Deaktivert tilstand",
            description: "Bruk disabled med varsomhet.",
            code: `<Flex gap="s">
  <Button disabled>Kan ikke lagres</Button>
  <Button variant="secondary" disabled>Slett</Button>
</Flex>`,
            tags: ["disabled"],
            preview: (
                <Flex gap="s">
                    <Button disabled>Kan ikke lagres</Button>
                    <Button variant="secondary" disabled>Slett</Button>
                </Flex>
            ),
        },
    ],
};

export default doc;

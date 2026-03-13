import { useState, useEffect } from "react";
import { Chip } from "@fremtind/jokul/chip";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

function ChipPreview() {
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
        <Flex gap="xs" wrap="wrap">
            <Chip variant="filter" selected={step >= 1}>Reise</Chip>
            <Chip variant="filter" selected={step >= 2}>Bil</Chip>
            <Chip variant="filter" selected={step >= 3}>Hjem</Chip>
        </Flex>
    );
}

const doc: ComponentDoc = {
    id: "chip",
    name: "Chip",
    package: "@fremtind/jokul/chip",
    category: "Skjema",
    tags: ["interaktiv", "filter", "tag", "skjema"],
    description: "Chip brukes for interaktive filtre og tagger som brukeren kan velge og velge bort.",
    relatedIds: ["tag"],
    preview: <ChipPreview />,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Chip-teksten." },
        { name: "variant", type: '"input" | "filter"', required: true, source: "react", status: "stable", description: "Visuell variant og funksjon." },
        { name: "selected", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Valgt tilstand, kun for filter-variant." },
        { name: "onClick", type: "React.ButtonHTMLAttributes<HTMLButtonElement>['onClick']", required: false, source: "react", status: "stable", description: "Klikk-handler." },
    ],
    examples: [
        {
            title: "Filter-chips",
            description: "Bruk filter-chips for å la brukeren velge kategorier.",
            code: `<Flex gap="xs" wrap="wrap">
  <Chip variant="filter" selected>Bil</Chip>
  <Chip variant="filter">Båt</Chip>
  <Chip variant="filter">Hjem</Chip>
  <Chip variant="filter" selected>Reise</Chip>
</Flex>`,
            preview: (
                <Flex gap="xs" wrap="wrap">
                    <Chip variant="filter" selected>Bil</Chip>
                    <Chip variant="filter">Båt</Chip>
                    <Chip variant="filter">Hjem</Chip>
                    <Chip variant="filter" selected>Reise</Chip>
                </Flex>
            ),
        },
        {
            title: "Input-chips",
            description: "Bruk input-chips for tags som brukeren kan fjerne.",
            code: `<Flex gap="xs" wrap="wrap">
  <Chip variant="input">React</Chip>
  <Chip variant="input">TypeScript</Chip>
  <Chip variant="input">Next.js</Chip>
</Flex>`,
            preview: (
                <Flex gap="xs" wrap="wrap">
                    <Chip variant="input">React</Chip>
                    <Chip variant="input">TypeScript</Chip>
                    <Chip variant="input">Next.js</Chip>
                </Flex>
            ),
        },
    ],
};

export default doc;

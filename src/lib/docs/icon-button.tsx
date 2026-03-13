import { useState, useEffect } from "react";
import { IconButton } from "@fremtind/jokul/icon-button";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { Tooltip, TooltipTrigger, TooltipContent } from "@fremtind/jokul/tooltip";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

const ICON_BTN_SETS = [
    ["download", "edit", "delete"],
    ["share", "bookmark", "close"],
    ["content_copy", "search", "settings"],
    ["arrow_forward", "refresh", "filter_list"],
] as const;

function IconButtonPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 4), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    const icons = ICON_BTN_SETS[step];
    return (
        <Flex gap="s">
            {icons.map((name) => (
                <IconButton key={name} title={name}><Icon>{name}</Icon></IconButton>
            ))}
        </Flex>
    );
}

const doc: ComponentDoc = {
    id: "icon-button",
    name: "IconButton",
    package: "@fremtind/jokul/icon-button",
    category: "Skjema",
    status: "deprecated",
    tags: ["knapp", "ikon", "interaktiv"],
    description: "IconButton er en knapp med kun ikon. Krev alltid en aria-label som beskriver handlingen.",
    warnings: "Ikke bruk IconButton uten aria-label.",
    relatedIds: ["button", "icon"],
    preview: <IconButtonPreview />,
    props: [
        { name: "icon", type: "string", required: true, source: "custom", status: "stable", description: "Ikonnavnet (Material Symbol)." },
        { name: "aria-label", type: "string", required: true, source: "aria", status: "stable", description: "Tilgjengelig navn for knappen." },
        { name: "onClick", type: "React.MouseEventHandler<HTMLButtonElement>", required: false, source: "react", status: "stable", description: "Klikk-handler." },
        { name: "disabled", type: "boolean", required: false, source: "native", status: "stable", default: "false", description: "Deaktiverer knappen." },
        { name: "variant", type: '"ghost" | "primary"', required: false, source: "custom", status: "stable", default: '"ghost"', description: "Visuell variant." },
    ],
    examples: [
        {
            title: "Ikonknapper",
            description: "Vanlige ikonknapper. Legg alltid til aria-label.",
            uses: ["icon", "flex"],
            code: `<Flex gap="s" alignItems="center">
  <IconButton aria-label="Rediger"><Icon>edit</Icon></IconButton>
  <IconButton aria-label="Slett"><Icon>delete</Icon></IconButton>
  <IconButton aria-label="Lukk"><Icon>close</Icon></IconButton>
</Flex>`,
            tags: ["accessibility"],
            preview: (
                <Flex gap="s" alignItems="center">
                    <IconButton aria-label="Rediger"><Icon>edit</Icon></IconButton>
                    <IconButton aria-label="Slett"><Icon>delete</Icon></IconButton>
                    <IconButton aria-label="Lukk"><Icon>close</Icon></IconButton>
                </Flex>
            ),
        },
        {
            title: "Med verktøytips",
            description: "Ikonknapp pakket inn i Tooltip for ekstra forklaring.",
            uses: ["icon", "tooltip", "flex"],
            code: `<Flex gap="s" alignItems="center">
  <Tooltip>
    <TooltipTrigger>
      <IconButton aria-label="Last ned dokument"><Icon>download</Icon></IconButton>
    </TooltipTrigger>
    <TooltipContent>Last ned dokument</TooltipContent>
  </Tooltip>
  <Tooltip>
    <TooltipTrigger>
      <IconButton aria-label="Del lenke"><Icon>share</Icon></IconButton>
    </TooltipTrigger>
    <TooltipContent>Del lenke</TooltipContent>
  </Tooltip>
</Flex>`,
            preview: (
                <Flex gap="s" alignItems="center">
                    <Tooltip>
                        <TooltipTrigger>
                            <IconButton aria-label="Last ned dokument"><Icon>download</Icon></IconButton>
                        </TooltipTrigger>
                        <TooltipContent>Last ned dokument</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger>
                            <IconButton aria-label="Del lenke"><Icon>share</Icon></IconButton>
                        </TooltipTrigger>
                        <TooltipContent>Del lenke</TooltipContent>
                    </Tooltip>
                </Flex>
            ),
        },
        {
            title: "Handlingslinje i kort",
            description: "Ikonknapper brukt som handlinger knyttet til et element.",
            uses: ["icon", "card", "flex"],
            code: `<Flex gap="xs" alignItems="center">
  <IconButton aria-label="Rediger avtale"><Icon>edit</Icon></IconButton>
  <IconButton aria-label="Kopier avtale"><Icon>content_copy</Icon></IconButton>
  <IconButton aria-label="Slett avtale"><Icon>delete</Icon></IconButton>
</Flex>`,
            preview: (
                <Flex gap="xs" alignItems="center">
                    <IconButton aria-label="Rediger avtale"><Icon>edit</Icon></IconButton>
                    <IconButton aria-label="Kopier avtale"><Icon>content_copy</Icon></IconButton>
                    <IconButton aria-label="Slett avtale"><Icon>delete</Icon></IconButton>
                </Flex>
            ),
        },
    ],
};

export default doc;

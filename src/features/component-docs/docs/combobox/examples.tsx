import { useState, useEffect } from "react";
import { Combobox } from "@fremtind/jokul/combobox";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";

const LANGUAGE_ITEMS = [
    { value: "no", label: "Norsk" },
    { value: "en", label: "Engelsk" },
    { value: "se", label: "Samisk" },
    { value: "pl", label: "Polsk" },
    { value: "ar", label: "Arabisk" },
    { value: "so", label: "Somali" },
    { value: "tr", label: "Tyrkisk" },
    { value: "ur", label: "Urdu" },
];

export function ComboboxBasicPreview() {
    const isHovered = usePreviewHovered();
    const [selected, setSelected] = useState<Array<{ value: string; label: string }>>([]);

    useEffect(() => {
        if (!isHovered) {
            setSelected([]);
            return;
        }
        // Select items one by one with a delay
        const picks = [
            { value: "no", label: "Norsk" },
            { value: "en", label: "Engelsk" },
        ];
        const timers: ReturnType<typeof setTimeout>[] = [];
        picks.forEach((item, i) => {
            timers.push(setTimeout(() => {
                setSelected(prev => [...prev, item]);
            }, 600 + i * 900));
        });
        return () => timers.forEach(clearTimeout);
    }, [isHovered]);

    return (
        <Combobox
            label="Språk"
            name="languages-preview"
            items={LANGUAGE_ITEMS}
            value={selected}
            onChange={(e) => setSelected(e.target.selectedOptions)}
        />
    );
}

function ComboboxHelpPreview() {
    const [selected, setSelected] = useState<Array<{ value: string; label: string }>>([]);

    return (
        <Combobox
            label="Foretrukne språk"
            name="preferred-languages"
            items={LANGUAGE_ITEMS}
            value={selected}
            onChange={(e) => setSelected(e.target.selectedOptions)}
            helpLabel="Du kan velge flere språk"
        />
    );
}

function ComboboxErrorPreview() {
    const [selected, setSelected] = useState<Array<{ value: string; label: string }>>([]);

    return (
        <Combobox
            label="Påkrevde språk"
            name="required-languages"
            items={LANGUAGE_ITEMS}
            value={selected}
            onChange={(e) => setSelected(e.target.selectedOptions)}
            errorLabel="Du må velge minst ett språk"
        />
    );
}

export const examples: ComponentExample[] = [
    {
                title: "Grunnleggende flervalg",
                description: "Combobox med enkel liste over valg.",
                code: `import { useState } from "react";
    import { Combobox } from "@fremtind/jokul/combobox";

    const LANGUAGE_ITEMS = [
        { value: "no", label: "Norsk" },
        { value: "en", label: "Engelsk" },
        { value: "de", label: "Tysk" },
        { value: "fr", label: "Fransk" },
        { value: "es", label: "Spansk" },
    ];

    function ComboboxExample() {
        const [selected, setSelected] = useState([]);

        return (
            <Combobox
                label="Språk"
                name="languages"
                items={LANGUAGE_ITEMS}
                value={selected}
                onChange={(e) => setSelected(e.target.selectedOptions)}
            />
        );
    }`,
                preview: <ComboboxBasicPreview />,
            },
    {
                title: "Med hjelpetekst",
                description: "helpLabel gir brukeren ekstra kontekst.",
                code: `import { useState } from "react";
    import { Combobox } from "@fremtind/jokul/combobox";

    function ComboboxWithHelp() {
        const [selected, setSelected] = useState([]);

        return (
            <Combobox
                label="Foretrukne språk"
                name="preferred-languages"
                items={LANGUAGE_ITEMS}
                value={selected}
                onChange={(e) => setSelected(e.target.selectedOptions)}
                helpLabel="Du kan velge flere språk"
            />
        );
    }`,
                preview: <ComboboxHelpPreview />,
            },
    {
                title: "Med feilmelding",
                description: "errorLabel vises når validering feiler.",
                tags: ["error-state"],
                code: `import { useState } from "react";
    import { Combobox } from "@fremtind/jokul/combobox";

        const timers: ReturnType<typeof setTimeout>[] = [];
    function ComboboxWithError() {
        const [selected, setSelected] = useState([]);

        return (
            <Combobox
                label="Påkrevde språk"
                name="required-languages"
                items={LANGUAGE_ITEMS}
                value={selected}
                onChange={(e) => setSelected(e.target.selectedOptions)}
                errorLabel="Du må velge minst ett språk"
            />
        );
    }`,
                preview: <ComboboxErrorPreview />,
            }
];

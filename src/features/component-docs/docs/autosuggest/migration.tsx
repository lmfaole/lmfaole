import { useState, useEffect } from "react";
import { Autosuggest } from "@fremtind/jokul/autosuggest";
import { TextInput } from "@fremtind/jokul/text-input";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";

export const migrations: ComponentExample[] = [
    {
                title: "Hjelpetekst og ingen-treff-melding har fått nye props",
                description: "leadText og noHitsMessage er utfaset. Bruk helpLabel for hjelpetekst og noHits-objektet for ingen-treff-melding.",
                migration: {
                    deprecates: [{ name: "leadText", kind: "prop" }, { name: "noHitsMessage", kind: "prop" }],
                    replacedBy: [{ name: "helpLabel", kind: "prop" }, { name: "noHits", kind: "prop" }],
                    before: `<Autosuggest
        label="Hjemsted"
        leadText="Begynn å skrive for å se forslag"
        noHitsMessage={<span>Ingen treff</span>}
        allItems={cities}
        onChange={setValue}
    />`,

                },
                code: `<Autosuggest
        label="Hjemsted"
        helpLabel="Begynn å skrive for å se forslag"
        noHits={{ items: [], text: "Ingen byer funnet – prøv et annet søk" }}
        allItems={cities}
        onChange={setValue}
    />`,
            }
];

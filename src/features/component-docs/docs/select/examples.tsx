import { useState, useEffect } from "react";
import { BETA_Select as Select } from "@fremtind/jokul/select";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


const SELECT_OPTIONS = ["bil", "reise", "hjem"];


export const examples: ComponentExample[] = [
    {
                title: "Grunnleggende nedtrekksmeny",
                description: "BETA_Select med <option>-elementer som children — ingen items-array.",
                code: `<Select label="Fylke" name="county">
        <option value="oslo">Oslo</option>
        <option value="viken">Viken</option>
        <option value="innlandet">Innlandet</option>
        <option value="agder">Agder</option>
    </Select>`,
                preview: (
                    <Select label="Fylke" name="county">
                        <option value="oslo">Oslo</option>
                        <option value="viken">Viken</option>
                        <option value="innlandet">Innlandet</option>
                        <option value="agder">Agder</option>
                    </Select>
                ),
            },
    {
                title: "Med grupperte valg",
                description: "Native <optgroup> fungerer direkte siden BETA_Select wrapper den native select.",
                code: `<Select label="Region" name="region">
        <optgroup label="Østlandet">
            <option value="oslo">Oslo</option>
            <option value="viken">Viken</option>
        </optgroup>
        <optgroup label="Vestlandet">
            <option value="vestland">Vestland</option>
            <option value="rogaland">Rogaland</option>
        </optgroup>
    </Select>`,
                preview: (
                    <Select label="Region" name="region">
                        <optgroup label="Østlandet">
                            <option value="oslo">Oslo</option>
                            <option value="viken">Viken</option>
                        </optgroup>
                        <optgroup label="Vestlandet">
                            <option value="vestland">Vestland</option>
                            <option value="rogaland">Rogaland</option>
                        </optgroup>
                    </Select>
                ),
            },
    {
                title: "Med hjelpetekst og feilmelding",
                code: `<Select
        label="Rolle"
        name="role"
        helpLabel="Velg rollen som best beskriver deg"
        errorLabel="Du må velge en rolle"
    >
        <option value="dev">Utvikler</option>
        <option value="design">Designer</option>
        <option value="po">Produkteier</option>
    </Select>`,
                preview: (
                    <Select
                        label="Rolle"
                        name="role"
                        helpLabel="Velg rollen som best beskriver deg"
                        errorLabel="Du må velge en rolle"
                    >
                        <option value="dev">Utvikler</option>
                        <option value="design">Designer</option>
                        <option value="po">Produkteier</option>
                    </Select>
                ),
            }
];

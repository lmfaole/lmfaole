import { useState } from "react";
import { DatePicker } from "@fremtind/jokul/datepicker";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";

const doc: ComponentDoc = {
    id: "datepicker",
    name: "Date Picker",
    package: "@fremtind/jokul/datepicker",
    category: "Skjema",
    status: "stable",
    description:
        "DatePicker er et skjemafelt for å velge en dato. Den kombinerer et tekstfelt med en interaktiv kalender og validerer datoformatet automatisk.",
    warnings: "Verdien leveres som string i dd.mm.yyyy-format, ikke ISO — ta høyde for dette ved skjemainnsending.",
    relationships: {
        related: [{ id: "text-input", description: "DatePicker bruker TextInput som triggerfelt for manuell datoregistrering." }, { id: "select", description: "Bruk Select for enkle måneds-/årsnedfellslister når en full kalendervelger er unødvendig." }],
    },
    preview: (
        <div style={{ maxWidth: "280px", border: "1px solid var(--jkl-color-border-default)", borderRadius: "4px", padding: "var(--jkl-spacing-m)", background: "var(--jkl-color-background-default)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--jkl-spacing-s)" }}>
                <button style={{ background: "none", border: "none", cursor: "pointer" }}>‹</button>
                <strong>Juni 2025</strong>
                <button style={{ background: "none", border: "none", cursor: "pointer" }}>›</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "var(--jkl-spacing-xxs)", textAlign: "center", fontSize: "0.85em" }}>
                {["Ma","Ti","On","To","Fr","Lø","Sø"].map(d => <span key={d} style={{ fontWeight: "bold", padding: "4px" }}>{d}</span>)}
                {[...Array(2)].map((_,i) => <span key={`e${i}`} />)}
                {[...Array(30)].map((_,i) => (
                    <span key={i} style={{ padding: "4px", borderRadius: "50%", background: i+1 === 15 ? "var(--jkl-color-background-focus)" : "none", cursor: "pointer" }}>{i+1}</span>
                ))}
            </div>
        </div>
    ),

    props,
    examples,
    migrations,
};

export default doc;

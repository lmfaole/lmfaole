import type { PropDef } from "../types";

export const props: PropDef[] = [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Innholdet som skal layoutes." },
        { name: "direction", type: '"row" | "column" | "row-reverse" | "column-reverse"', required: false, source: "react", status: "stable", default: '"row"', description: "Retningen barn-elementene plasseres." },
        { name: "gap", type: '"none" | "xxs" | "xs" | "s" | "m" | "l" | "xl"', required: false, source: "custom", status: "stable", default: '"none"', description: "Avstand mellom barn-elementene. Bruker Jøkuls spacing-skala." },
        { name: "wrap", type: '"nowrap" | "wrap" | "wrap-reverse"', required: false, source: "custom", status: "stable", default: '"nowrap"', description: "wrap lar barn-elementene bryte over på ny linje." },
        { name: "alignItems", type: '"normal" | "start" | "center" | "end" | "baseline" | "stretch"', required: false, source: "custom", status: "stable", default: '"stretch"', description: "Justering langs kryssaksen." },
        { name: "justifyContent", type: "string", required: false, source: "custom", status: "stable", default: '"flex-start"', description: "Distribusjon langs hovedaksen." },
        { name: "as", type: "React.ElementType", required: false, source: "custom", status: "stable", default: '"div"', description: "HTML-elementtypen som rendres." },
    ];

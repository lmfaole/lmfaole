import type { PropDef } from "../types";

export const props: PropDef[] = [
        { name: "icon", type: "string", required: true, source: "custom", status: "stable", description: "Ikonnavnet (Material Symbol)." },
        { name: "aria-label", type: "string", required: true, source: "aria", status: "stable", description: "Tilgjengelig navn for knappen." },
        { name: "onClick", type: "React.MouseEventHandler<HTMLButtonElement>", required: false, source: "react", status: "stable", description: "Klikk-handler." },
        { name: "disabled", type: "boolean", required: false, source: "native", status: "stable", default: "false", description: "Deaktiverer knappen." },
        { name: "variant", type: '"ghost" | "primary"', required: false, source: "custom", status: "stable", default: '"ghost"', description: "Visuell variant." },
    ];

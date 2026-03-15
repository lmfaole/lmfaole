"use client";
import { SummaryTable, SummaryTableRow } from "@fremtind/jokul/summary-table";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function SummaryTablePreview() {
    const isHovered = usePreviewHovered();
    return (
        <SummaryTable
            caption="Oppsummering"
            header={["Dekning", "Pris"]}
            body={
                <>
                    <SummaryTableRow header="Bilforsikring" content="3 200 kr" />
                    <SummaryTableRow header="Reiseforsikring" content="890 kr" />
                </>
            }
            footer={<SummaryTableRow header="Totalt" content={isHovered ? "4 090 kr" : "···"} />}
        />
    );
}

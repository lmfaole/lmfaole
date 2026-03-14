import { Card } from "@fremtind/jokul/card";
import { Tag } from "@fremtind/jokul/tag";
import { CodeBlock } from "@/shared/components/CodeBlock";
import "./before-after.scss";

interface BeforeAfterSide {
    caption?: string;
    code: string;
    /** Live preview rendered above the code */
    preview?: React.ReactNode;
}

interface BeforeAfterProps {
    label?: string;
    before: BeforeAfterSide;
    after: BeforeAfterSide;
}

function Side({
    side,
    variant,
    label,
}: {
    side: BeforeAfterSide;
    variant: "error" | "success";
    label: string;
}) {
    const hasPreview = Boolean(side.preview);
    return (
        <Card variant="outlined" padding="m" className="before-after__col">
            <div className="before-after__col-header">
                <Tag variant={variant} className="before-after__badge">{label}</Tag>
                {side.caption && <p className="before-after__caption">{side.caption}</p>}
            </div>
            {hasPreview && (
                <div className="before-after__preview">{side.preview}</div>
            )}
            <CodeBlock
                code={side.code}
                size="small"
                collapsible={hasPreview}
            />
        </Card>
    );
}

export function BeforeAfter({ label, before, after }: BeforeAfterProps) {
    return (
        <div className="before-after">
            {label && <p className="before-after__label">{label}</p>}
            <div className="before-after__grid">
                <Side side={before} variant="error" label="Ikke slik" />
                <Side side={after} variant="success" label="Slik" />
            </div>
        </div>
    );
}

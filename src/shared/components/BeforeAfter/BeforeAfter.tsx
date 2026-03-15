import { Card } from "@fremtind/jokul/card";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
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
        <Card variant="outlined" padding="m">
            <Flex direction="column" gap="s">
                <Flex direction="column" gap="2xs">
                    <Tag variant={variant} className="before-after__badge">{label}</Tag>
                    {side.caption && <p className="before-after__caption">{side.caption}</p>}
                </Flex>
                {hasPreview && (
                    <Flex wrap="wrap" alignItems="center" gap="s" className="before-after__preview">
                        {side.preview}
                    </Flex>
                )}
                <CodeBlock code={side.code} />
            </Flex>
        </Card>
    );
}

export function BeforeAfter({ label, before, after }: BeforeAfterProps) {
    return (
        <Flex direction="column" gap="s">
            {label && <p className="before-after__label">{label}</p>}
            <div className="before-after__grid">
                <Side side={before} variant="error" label="Ikke slik" />
                <Side side={after} variant="success" label="Slik" />
            </div>
        </Flex>
    );
}

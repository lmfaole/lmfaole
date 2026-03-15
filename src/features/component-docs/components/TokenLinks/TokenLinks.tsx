import { Flex } from "@fremtind/jokul/flex";
import { Tag } from "@fremtind/jokul/tag";
import Link from "next/link";

const TOKEN_LABELS: Record<string, string> = {
    colors: "Farger",
    spacing: "Spacing",
    typography: "Typografi",
    motion: "Bevegelse",
    "border-radius": "Kantradiuser",
    breakpoints: "Breakpoints",
};

interface TokenLinksProps {
    tokens: string[];
}

export function TokenLinks({ tokens }: TokenLinksProps) {
    if (tokens.length === 0) return null;
    return (
        <Flex as="ul" className="list-bare" gap="xs" wrap="wrap">
            {tokens.map((slug) => (
                <li key={slug}>
                    <Link href={`/jokul/token/${slug}`} style={{ textDecoration: "none" }}>
                        <Tag variant="info">{TOKEN_LABELS[slug] ?? slug}</Tag>
                    </Link>
                </li>
            ))}
        </Flex>
    );
}

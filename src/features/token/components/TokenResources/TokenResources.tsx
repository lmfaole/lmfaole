import { LinkList } from "@fremtind/jokul/link-list";
import type { TokenResource } from "@/features/token/data";
import "./token-resources.scss";

interface TokenResourcesProps {
    resources: TokenResource[];
}

export function TokenResources({ resources }: TokenResourcesProps) {
    if (resources.length === 0) return null;

    return (
        <aside className="token-resources">
            <LinkList label="Referanser og videre lesning">
                {resources.map((resource) => (
                    <LinkList.Link
                        key={resource.url}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {resource.title}
                    </LinkList.Link>
                ))}
            </LinkList>
        </aside>
    );
}

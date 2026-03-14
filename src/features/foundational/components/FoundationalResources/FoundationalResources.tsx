import { LinkList } from "@fremtind/jokul/link-list";
import type { FoundationalResource } from "@/features/foundational/data";
import "./foundational-resources.scss";

interface FoundationalResourcesProps {
    resources: FoundationalResource[];
}

export function FoundationalResources({ resources }: FoundationalResourcesProps) {
    if (resources.length === 0) return null;

    return (
        <aside className="foundational-resources">
            <LinkList label="Referanser og videre lesning">
                {resources.map((resource) => (
                    <LinkList.Link
                        key={resource.url}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {resource.title}
                        {resource.description && (
                            <span className="foundational-resources__description">
                                {resource.description}
                            </span>
                        )}
                    </LinkList.Link>
                ))}
            </LinkList>
        </aside>
    );
}

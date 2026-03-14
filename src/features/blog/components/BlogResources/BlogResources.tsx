import { Link } from "@fremtind/jokul/link";
import { List, ListItem } from "@fremtind/jokul/list";
import type { Resource } from "@/features/blog/data";
import "./blog-resources.scss";

interface BlogResourcesProps {
    resources: Resource[];
}

export function BlogResources({ resources }: BlogResourcesProps) {
    if (resources.length === 0) return null;

    return (
        <aside className="blog-resources">
            <h2 className="blog-resources__heading">Ressurser og videre lesning</h2>
            <List>
                {resources.map((resource) => (
                    <ListItem key={resource.url}>
                        <Link href={resource.url} external>{resource.title}</Link>
                        {resource.description && (
                            <p className="blog-resources__description">{resource.description}</p>
                        )}
                    </ListItem>
                ))}
            </List>
        </aside>
    );
}

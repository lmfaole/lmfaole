import {Link} from "@fremtind/jokul/link";
import type {Resource} from "@/lib/blogPosts";
import {List, ListItem} from "@fremtind/jokul/list";

interface PostResourcesProps {
    resources: Resource[];
}

export function PostResources({resources}: PostResourcesProps) {
    if (resources.length === 0) return null;

    return (
        <aside>
            <h2>Ressurser og videre lesning</h2>
            <List>
                {resources.map((resource) => (
                    <ListItem key={resource.url}>
                        <Link href={resource.url} external>{resource.title}</Link>
                        {resource.description && (
                            <small className="muted">
                                {resource.description}
                            </small>
                        )}
                    </ListItem>
                ))}
            </List>
        </aside>
    );
}

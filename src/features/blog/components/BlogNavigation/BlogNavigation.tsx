import { Card } from "@fremtind/jokul/card";
import { Link } from "@fremtind/jokul/link";
import { Grid } from "@/shared/components/Grid";
import type { BlogPost } from "@/features/blog/data";
import "./blog-navigation.scss";

interface BlogNavigationProps {
    previous?: BlogPost;
    next?: BlogPost;
    related: BlogPost[];
}

interface PostCardProps {
    post: BlogPost;
    label?: string;
}

function PostCard({ post, label }: PostCardProps) {
    return (
        <Card padding="m" variant="outlined" className="blog-nav__card">
            {label && <span className="blog-nav__card-label">{label}</span>}
            <Link href={`/jokul/blog/${post.id}`}>{post.title}</Link>
            <p className="blog-nav__card-excerpt">{post.excerpt}</p>
        </Card>
    );
}

export function BlogNavigation({ previous, next, related }: BlogNavigationProps) {
    const hasNavigation = previous || next;
    const hasRelated = related.length > 0;
    if (!hasNavigation && !hasRelated) return null;

    return (
        <nav aria-label="Innleggsnavigasjon" className="blog-nav">
            {hasNavigation && (
                <section className="blog-nav__section">
                    <h2 className="blog-nav__heading">Les mer</h2>
                    <Grid columns={2} gap="m">
                        {previous && <PostCard post={previous} label="← Forrige innlegg" />}
                        {next && <PostCard post={next} label="Neste innlegg →" />}
                    </Grid>
                </section>
            )}
            {hasRelated && (
                <section className="blog-nav__section">
                    <h2 className="blog-nav__heading">Relaterte innlegg</h2>
                    <Grid columns={3} gap="m">
                        {related.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </Grid>
                </section>
            )}
        </nav>
    );
}

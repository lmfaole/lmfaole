import React from "react";
import { Card } from "@fremtind/jokul/card";
import { Link } from "@fremtind/jokul/link";
import { Tag } from "@fremtind/jokul/tag";
import { PostMeta } from "@/components/PostMeta";
import { Grid } from "@/components/Grid";
import type { BlogPost } from "@/lib/blogPosts";

interface PostNavigationProps {
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
        <Card padding="m" variant="outlined">
            {label && <small className="muted">{label}</small>}
            {!label && <Tag variant="info">{post.category}</Tag>}
            <Link href={`/blog/${post.id}`}>{post.title}</Link>
            {label ? (
                <PostMeta category={post.category} date={post.date} author={post.author} content={post.content} tags={post.tags} />
            ) : (
                <p className="muted">{post.excerpt}</p>
            )}
        </Card>
    );
}

export function PostNavigation({ previous, next, related }: PostNavigationProps) {
    const hasNavigation = previous || next;
    const hasRelated = related.length > 0;

    if (!hasNavigation && !hasRelated) return null;

    return (
        <nav aria-label="Innleggsnavigasjon">
            {hasNavigation && (
                <>
                    <h2>Les mer</h2>
                    <Grid gap="m">
                        {previous && <PostCard post={previous} label="← Forrige innlegg" />}
                        {next && <PostCard post={next} label="Neste innlegg →" />}
                    </Grid>
                </>
            )}
            {hasRelated && (
                <>
                    <h2>Relaterte innlegg</h2>
                    <Grid gap="m">
                        {related.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </Grid>
                </>
            )}
        </nav>
    );
}

import {Link} from "@fremtind/jokul/link";
import {Card} from "@fremtind/jokul/card";
import type {BlogPost} from "@/lib/blogPosts";
import "./blog-post-card.scss";

interface BlogPostCardProps {
    post: BlogPost;
    href?: string;
}

export function BlogPostCard({post, href}: BlogPostCardProps) {
    const to = href ?? (post.type === "foundational"
        ? `/jokul/foundational/${post.id}`
        : `/jokul/blog/${post.id}`);

    return (
        <Card padding="s" className="post-card">
            {post.image && (
                <div className="post-card__image">
                    <img src={post.image} alt="" aria-hidden="true" loading="lazy" />
                </div>
            )}
            <div className="post-card__body">
                <h2 className="post-card__title">
                    <Link href={to}>{post.title}</Link>
                </h2>
                <p className="post-card__excerpt">{post.excerpt}</p>
            </div>
        </Card>
    );
}

import { Link } from "@fremtind/jokul/link";
import type { BlogPost } from "@/lib/blogPosts";
import "./foundational-card.scss";

interface FoundationalCardProps {
    post: BlogPost;
}

export function FoundationalCard({ post }: FoundationalCardProps) {
    return (
        <article className="foundational-card">
            {post.image && (
                <div className="foundational-card__image">
                    <img src={post.image} alt="" aria-hidden="true" loading="lazy" />
                </div>
            )}
            <div className="foundational-card__body">
                <h2 className="foundational-card__title">
                    <Link href={`/jokul/foundational/${post.id}`}>{post.title}</Link>
                </h2>
                <p className="foundational-card__excerpt">{post.excerpt}</p>
            </div>
        </article>
    );
}

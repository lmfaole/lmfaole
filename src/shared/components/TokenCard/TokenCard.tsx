import Link from "next/link";
import type { TokenPost } from "@/features/token/data";
import { getTokenSlug } from "@/features/token/data";
import "./token-card.scss";

interface TokenCardProps {
    post: TokenPost;
}

export function TokenCard({ post }: TokenCardProps) {
    return (
        <Link href={`/jokul/token/${getTokenSlug(post)}`} className="token-card">
            {post.illustration && (
                <div className="token-card__bg" aria-hidden="true">
                    {post.illustration}
                </div>
            )}
            <div className="token-card__content">
                <h2 className="token-card__title">{post.title}</h2>
            </div>
        </Link>
    );
}

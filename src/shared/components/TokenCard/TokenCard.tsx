import Link from "next/link";
import { Flex } from "@fremtind/jokul/flex";
import type { TokenPost } from "@/app/jokul/_token/data";
import { getTokenSlug } from "@/app/jokul/_token/data";
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
            <Flex className="token-card__content" alignItems="center" justifyContent="center">
                <h2 className="token-card__title">{post.title}</h2>
            </Flex>
        </Link>
    );
}

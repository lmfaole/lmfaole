"use client";
import { TokenArticle } from "@/app/jokul/_token/components/TokenArticle";
import { NotFound } from "@/shared/components/NotFound";
import { useParams } from "next/navigation";
import { getTokenPost } from "@/app/jokul/_token/data";
import "./token-article.scss";

export default function TokenPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const post = getTokenPost(slug);

    if (!post) {
        return (
            <NotFound
                message="Fant ikke innlegget"
                backHref="/jokul/token"
                backLabel="Tilbake til grunnleggende konsepter"
            />
        );
    }

    return (
        <TokenArticle
            title={post.title}
            excerpt={post.excerpt}
            illustration={post.illustration}
            tokenOverview={post.tokenOverview}
            scssSection={post.scssSection}
        />
    );
}

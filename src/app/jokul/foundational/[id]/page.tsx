"use client";
import { FoundationalArticle } from "@/features/foundational/components/FoundationalArticle";
import { NotFound } from "@/shared/components/NotFound";
import { useParams } from "next/navigation";
import { getFoundationalPost } from "@/features/foundational/data";
import "./foundational-article.scss";

export default function FoundationalPostPage() {
    const { id } = useParams<{ id: string }>();
    const post = getFoundationalPost(id);

    if (!post) {
        return (
            <NotFound
                message="Fant ikke innlegget"
                backHref="/jokul/foundational"
                backLabel="Tilbake til grunnleggende konsepter"
            />
        );
    }

    return (
        <FoundationalArticle
            title={post.title}
            excerpt={post.excerpt}
            illustration={post.illustration}
            tokenOverview={post.tokenOverview}
            scssSection={post.scssSection}
            content={post.content}
        />
    );
}

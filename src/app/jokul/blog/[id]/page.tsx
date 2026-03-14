"use client";
import { BlogArticle } from "@/features/blog/components/BlogArticle";
import { NotFound } from "@/shared/components/NotFound";
import { useParams } from "next/navigation";
import { getBlogPost } from "@/features/blog/data";

export default function PostPage() {
    const { id } = useParams<{ id: string }>();
    const post = getBlogPost(id);

    if (!post) {
        return (
            <NotFound
                message="Fant ikke innlegget"
                backHref="/"
                backLabel="Tilbake til forsiden"
            />
        );
    }

    return (
        <BlogArticle
            title={post.title}
            excerpt={post.excerpt}
            content={post.content}
        />
    );
}

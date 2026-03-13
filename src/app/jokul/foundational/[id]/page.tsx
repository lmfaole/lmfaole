"use client";
import React from "react";
import { PostArticle } from "@/components/PostArticle";
import { NotFound } from "@/components/NotFound";
import { useParams } from "next/navigation";
import { getFoundationalPost } from "@/lib/foundationalPosts";

export default function FoundationalPostPage() {
    const { id } = useParams<{ id: string }>();
    const post = getFoundationalPost(id);

    if (!post) {
        return (
            <NotFound
                message="Fant ikke innlegget"
                backHref="/foundational"
                backLabel="Tilbake til grunnleggende konsepter"
            />
        );
    }

    return (
        <PostArticle
            title={post.title}
            excerpt={post.excerpt}
            category={post.category}
            date={post.date}
            author={post.author}
            content={post.content}
            tags={post.tags}
        />
    );
}

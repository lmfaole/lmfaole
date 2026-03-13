"use client";
import React from "react";
import { PostArticle } from "@/components/PostArticle";
import { NotFound } from "@/components/NotFound";
import { useParams } from "next/navigation";
import { getBlogPost } from "@/lib/blogPosts";

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

"use client";

import React from "react";
import {Link} from "@fremtind/jokul/link";
import {Flex} from "@fremtind/jokul/flex";
import {PostMeta} from "@/components/PostMeta";
import {useParams} from "next/navigation";
import {getBlogPost} from "@/lib/blogPosts";

export default function PostPage() {
    const params = useParams();
    const post = getBlogPost(params.id as string);

    if (!post) {
        return (
            <Flex as="main" direction="column" gap="m">
                <h1>Fant ikke innlegget</h1>
                <Link href="/">Tilbake til forsiden</Link>
            </Flex>
        );
    }

    return (
        <Flex as="article" direction="column" gap="m">
            <Flex as="header" direction="column" gap="s">
                <h1>{post.title}</h1>
                <p>{post.excerpt}</p>
                <PostMeta category={post.category} date={post.date} author={post.author} content={post.content} tags={post.tags} />
            </Flex>
            {post.content}
        </Flex>
    );
}


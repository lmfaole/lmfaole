"use client";

import React from "react";
import { Flex } from "@fremtind/jokul/flex";
import { NavLink } from "@fremtind/jokul/nav-link";
import { blogPosts } from "@/lib/blogPosts";
import { BlogPostCard } from "@/components/BlogPostCard";
import { Grid } from "@/components/Grid";

export default function BlogPage() {
    return (
        <Flex as="main" direction="column" gap="xl">
            <NavLink href="/" back>Tilbake til forsiden</NavLink>
            <Flex direction="column" gap="s">
                <h1>Blogg</h1>
                <p>Artikler om Jøkul — designsystemet til Fremtind. Tips, dybdeanalyser og god praksis for deg som bygger med komponentbiblioteket.</p>
            </Flex>
            <Grid gap="l">
                {blogPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                ))}
            </Grid>
        </Flex>
    );
}

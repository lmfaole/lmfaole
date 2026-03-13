"use client";

import React from "react";
import { Flex } from "@fremtind/jokul/flex";
import { NavLink } from "@fremtind/jokul/nav-link";
import { Card } from "@fremtind/jokul/card";
import { Link } from "@fremtind/jokul/link";
import { Tag } from "@fremtind/jokul/tag";
import { foundationalPosts } from "@/lib/foundationalPosts";
import { Grid } from "@/components/Grid";

export default function FoundationalPage() {
    return (
        <Flex as="main" direction="column" gap="xl">
            <NavLink href="/" back>Tilbake til forsiden</NavLink>
            <h1>Grunnleggende konsepter</h1>
            <p>Fundamentene i Jøkul — typografi, farger og spacing. Les disse for å forstå designsystemets kjerneprinsipper.</p>
            <Grid gap="l">
                {foundationalPosts.map((post) => (
                    <Card key={post.id} padding="l">
                        <h2>
                            <Link href={`/foundational/${post.id}`}>{post.title}</Link>
                        </h2>
                        <p>{post.excerpt}</p>
                        {post.tags.length > 0 && (
                            <Flex as="ul" className="chip-list" gap="xs" wrap="wrap">
                                {post.tags.map((tag) => (
                                    <li key={tag}><Tag variant="neutral">{tag}</Tag></li>
                                ))}
                            </Flex>
                        )}
                    </Card>
                ))}
            </Grid>
        </Flex>
    );
}

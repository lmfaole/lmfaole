"use client";

import { Flex } from "@fremtind/jokul/flex";
import { NavLink } from "@fremtind/jokul/nav-link";
import { Card } from "@fremtind/jokul/card";
import { Link } from "@fremtind/jokul/link";
import { foundationalPosts } from "@/lib/foundationalPosts";
import { Grid } from "@/components/Grid";
import { TagList } from "@/components/TagList";

export default function FoundationalPage() {
    return (
        <Flex as="main" direction="column" gap="xl">
            <NavLink href="/jokul" back>Tilbake til forsiden</NavLink>
            <h1>Grunnleggende konsepter</h1>
            <p>Fundamentene i Jøkul — typografi, farger og spacing. Les disse for å forstå designsystemets kjerneprinsipper.</p>
            <Grid columns={3} gap="l">
                {foundationalPosts.map((post) => (
                    <Card key={post.id} padding="l">
                        <h2>
                            <Link href={`/jokul/foundational/${post.id}`}>{post.title}</Link>
                        </h2>
                        <p>{post.excerpt}</p>
                        {post.tags.length > 0 && (
                            <TagList tags={post.tags} />
                        )}
                    </Card>
                ))}
            </Grid>
        </Flex>
    );
}

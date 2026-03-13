"use client";

import { Flex } from "@fremtind/jokul/flex";
import { NavLink } from "@fremtind/jokul/nav-link";
import { foundationalPosts } from "@/lib/foundationalPosts";
import { Grid } from "@/components/Grid";
import { FoundationalCard } from "@/components/FoundationalCard/FoundationalCard";
import { useBodyTheme } from "@/hooks/useBodyTheme";
import "./foundational.scss";

export default function FoundationalPage() {
    useBodyTheme("dark");

    return (
        <Flex as="main" direction="column" gap="2xl">
            <NavLink href="/jokul" back>Tilbake til forsiden</NavLink>
            <header className="foundational-index__header">
                <h1>Grunnleggende</h1>
                <p>Fundamentene i Jøkul — typografi, farger og spacing. Les disse for å forstå designsystemets kjerneprinsipper.</p>
            </header>
            <Grid columns={3} gap="l">
                {foundationalPosts.map((post) => (
                    <FoundationalCard key={post.id} post={post} />
                ))}
            </Grid>
        </Flex>
    );
}

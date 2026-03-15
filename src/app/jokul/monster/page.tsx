import { Flex } from "@fremtind/jokul/flex";
import { patternPosts } from "@/app/jokul/_pattern/data";
import { Grid } from "@/shared/components/Grid";
import { PageHeader } from "@/shared/components/PageHeader";
import { PatternFeature } from "@/shared/components/PatternFeature";

export const runtime = "edge";

export default function PatternIndexPage() {
    return (
        <Flex as="main" direction="column" gap="2xl">
            <PageHeader
                title="Mønster"
                description="Anbefalte løsninger på gjentakende UI-problemer. Bruk disse for å få konsistent, tilgjengelig og forutsigbar oppførsel."
            />

            <Grid columns={3} gap="m">
                {patternPosts.map((post) => (
                    <PatternFeature key={post.id} post={post} />
                ))}
            </Grid>
        </Flex>
    );
}


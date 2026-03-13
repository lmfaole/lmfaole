"use client";

import {Link} from "@fremtind/jokul/link";
import {SystemMessage} from "@fremtind/jokul/system-message";
import {blogPosts} from "@/lib/blogPosts";
import {componentDocs} from "@/lib/componentDocs";
import {foundationalPosts} from "@/lib/foundationalPosts";
import {BlogPostCard} from "@/components/BlogPostCard";
import {ComponentCard} from "@/components/ComponentCard";
import {FoundationalCard} from "@/components/FoundationalCard/FoundationalCard";
import {Grid} from "@/components/Grid";
import "./home.scss";

export default function Home() {
    return (
        <main className="home">
            <header className="home__hero">
                <h1 className="home__headline">Bygg bedre<br/>med Jøkul</h1>
                <p className="home__intro">
                    Artikler, veiledninger og komponentdokumentasjon for deg som bygger
                    med Fremtinds designsystem.
                </p>
                <SystemMessage variant="warning">
                    Dette er ikke den offisielle Jøkul-dokumentasjonen.{" "}
                    Den offisielle finner du på{" "}
                    <Link href="https://jokul.fremtind.no/" external>jokul.fremtind.no</Link>.
                </SystemMessage>
            </header>

            <section className="home__section home__section--dark" data-theme="dark">
                <div className="home__section-header">
                    <h2><Link href="/jokul/foundational">Grunnleggende</Link></h2>
                    <p>Fundamentene i Jøkul — typografi, farger og designtokens.</p>
                </div>
                <Grid columns={3} gap="l">
                    {foundationalPosts.map((post) => (
                        <FoundationalCard key={post.id} post={post} />
                    ))}
                </Grid>
            </section>

            <section className="home__section">
                <div className="home__section-header">
                    <h2><Link href="/jokul/blog">Blogg</Link></h2>
                    <p>Dybdeartikler om tilgjengelighet, typografi, farger og komponentbruk.</p>
                </div>
                <Grid columns={3} gap="l">
                    {blogPosts.slice(0, 3).map((post) => (
                        <BlogPostCard key={post.id} post={post} />
                    ))}
                </Grid>
                <Link href="/jokul/blog">Se alle {blogPosts.length} artikler</Link>
            </section>

            <section className="home__section">
                <div className="home__section-header">
                    <h2><Link href="/jokul/component">Komponenter</Link></h2>
                    <p>Prop-tabeller og kodeeksempler for alle Jøkul-komponenter.</p>
                </div>
                <Grid columns={4} gap="m">
                    {componentDocs.slice(0, 8).map((doc) => (
                        <ComponentCard key={doc.id} doc={doc} />
                    ))}
                </Grid>
                <Link href="/jokul/component">Se alle {componentDocs.length} komponenter</Link>
            </section>
        </main>
    );
}

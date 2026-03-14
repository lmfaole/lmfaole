"use client";

import {Link} from "@fremtind/jokul/link";
import {SystemMessage} from "@fremtind/jokul/system-message";
import {blogPosts} from "@/features/blog/data";
import {componentDocs} from "@/features/component-docs/data";
import {foundationalPosts} from "@/features/foundational/data";
import {BlogPostCard} from "@/shared/components/BlogPostCard";
import {ComponentCard} from "@/shared/components/ComponentCard";
import {FoundationalCard} from "@/shared/components/FoundationalCard/FoundationalCard";
import {FullBleed} from "@/shared/components/FullBleed/FullBleed";
import {Grid} from "@/shared/components/Grid";
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

            <FullBleed dots="fade-top" className="home__dot-section">
                <div className="home__dot-inner">
                    <section className="home__section">
                        <div className="home__section-header">
                            <h2><Link href="/jokul/foundational">Grunnleggende</Link></h2>
                            <p>Fundamentene i Jøkul — typografi, farger og designtokens.</p>
                        </div>
                        <div className="home__foundational-list">
                            {foundationalPosts.slice(0, 2).map((post) => (
                                <FoundationalCard key={post.id} post={post} />
                            ))}
                        </div>
                        <Link href="/jokul/foundational">Se alle {foundationalPosts.length} artikler</Link>
                    </section>
                </div>
            </FullBleed>
        </main>
    );
}

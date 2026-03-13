import { Link } from "@fremtind/jokul/link";
import "./footer.scss";

export function Footer() {
    return (
        <footer className="site-footer">
            <div className="site-footer__grid">
                <div className="site-footer__col">
                    <p className="site-footer__about">
                        En uoffisiell læringsressurs for Jøkul — Fremtinds designsystem.
                        Innholdet er ikke en del av det offisielle Jøkul-prosjektet.
                    </p>
                </div>

                <nav className="site-footer__col" aria-label="Innhold på denne siden">
                    <h2 className="site-footer__heading">Innhold</h2>
                    <ul className="site-footer__links">
                        <li><Link href="/jokul/blog">Blogg</Link></li>
                        <li><Link href="/jokul/foundational">Grunnleggende</Link></li>
                        <li><Link href="/jokul/component">Komponenter</Link></li>
                    </ul>
                </nav>

                <nav className="site-footer__col" aria-label="Offisielle Jøkul-ressurser">
                    <h2 className="site-footer__heading">Jøkul</h2>
                    <ul className="site-footer__links">
                        <li>
                            <Link href="https://jokul.fremtind.no/" external>
                                Dokumentasjon
                            </Link>
                        </li>
                        <li>
                            <Link href="https://jokul.fremtind.no/kom-i-gang/introduksjon/" external>
                                Kom i gang
                            </Link>
                        </li>
                        <li>
                            <Link href="https://jokul.fremtind.no/profil/designprinsipper/" external>
                                Stilguide og profil
                            </Link>
                        </li>
                        <li>
                            <Link href="https://jokul.fremtind.no/komponenter/buttons/" external>
                                Komponentbibliotek
                            </Link>
                        </li>
                        <li>
                            <Link href="https://github.com/fremtind/jokul" external>
                                GitHub
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>

            <p className="site-footer__disclaimer">
                Ikke tilknyttet Fremtind eller det offisielle Jøkul-prosjektet.
            </p>
        </footer>
    );
}

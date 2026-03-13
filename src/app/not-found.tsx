import { Link } from "@fremtind/jokul/link";

export default function NotFound() {
    return (
        <main>
            <p aria-hidden style={{ fontSize: "4rem", lineHeight: 1 }}>404</p>
            <h1>Siden finnes ikke</h1>
            <p>
                Siden du leter etter eksisterer ikke, eller har kanskje blitt flyttet.
            </p>
            <nav aria-label="Hjelpsomme lenker">
                <ul>
                    <li><Link href="/">Forsiden</Link></li>
                    <li><Link href="/jokul">Jøkul</Link></li>
                    <li><Link href="/jokul/component">Komponenter</Link></li>
                    <li><Link href="/jokul/blog">Blogg</Link></li>
                    <li><Link href="/jokul/foundational">Grunnleggende konsepter</Link></li>
                </ul>
            </nav>
        </main>
    );
}

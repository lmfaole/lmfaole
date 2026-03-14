import { LinkList } from "@fremtind/jokul/link-list";
import "./not-found.scss";

export default function NotFound() {
    return (
        <main>
            <p aria-hidden className="not-found__status">404</p>
            <h1>Siden finnes ikke</h1>
            <p>
                Siden du leter etter eksisterer ikke, eller har kanskje blitt flyttet.
            </p>
            <nav aria-label="Hjelpsomme lenker">
                <LinkList label="Hjelpsomme lenker" hideLabel>
                    <LinkList.Link href="/">Forsiden</LinkList.Link>
                    <LinkList.Link href="/jokul">Jøkul</LinkList.Link>
                    <LinkList.Link href="/jokul/component">Komponenter</LinkList.Link>
                    <LinkList.Link href="/jokul/blog">Blogg</LinkList.Link>
                    <LinkList.Link href="/jokul/foundational">Grunnleggende konsepter</LinkList.Link>
                </LinkList>
            </nav>
        </main>
    );
}

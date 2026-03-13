import {Link} from "@fremtind/jokul/link";

export default function Home() {
    return (
        <main>
            <h1>Hei</h1>
            <p>
                Gå til <Link href="/jokul">Jøkul-dokumentasjonen</Link>.
            </p>
        </main>
    );
}

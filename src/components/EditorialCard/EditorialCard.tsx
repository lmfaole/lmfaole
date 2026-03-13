import {Link} from "@fremtind/jokul/link";
import "./editorial-card.scss";

export interface EditorialItem {
    key: string | number;
    href: string;
    title: string;
    excerpt?: string;
}

interface EditorialCardProps {
    label: string;
    title: string;
    titleHref: string;
    description: string;
    items: EditorialItem[];
    stat: number;
    ctaHref: string;
    ctaLabel: string;
}

export function EditorialCard({
                                  label,
                                  title,
                                  titleHref,
                                  description,
                                  items,
                                  stat,
                                  ctaHref,
                                  ctaLabel,
                              }: EditorialCardProps) {
    return (
        <article className="home__section">
            <div>
                <span className="home__section-label">{label}</span>
                <h2 className="home__section-title">
                    <Link href={titleHref}>{title}</Link>
                </h2>
                <p className="home__section-desc">{description}</p>
            </div>
            <ul className="home__article-list">
                {items.map((item) => (
                    <li key={item.key} className="home__article-item" inert>
                        <Link href={item.href}>{item.title}</Link>
                        {item.excerpt && <span className="home__article-excerpt">{item.excerpt}</span>}
                    </li>
                ))}
            </ul>
            <div className="home__section-footer">
                <span className="home__stat" aria-hidden="true">{stat}</span>
                <Link href={ctaHref}>{ctaLabel}</Link>
            </div>
        </article>
    );
}

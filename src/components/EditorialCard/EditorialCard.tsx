import {Link} from "@fremtind/jokul/link";
import {Card} from "@fremtind/jokul/card";
import "./editorial-card.scss";

export interface EditorialItem {
    key: string | number;
    href: string;
    title: string;
    excerpt?: string;
}

interface EditorialCardProps {
    title: string;
    titleHref: string;
    description: string;
    items: EditorialItem[];
    stat: number;
    ctaHref: string;
    ctaLabel: string;
}

export function EditorialCard({
                                  title,
                                  titleHref,
                                  description,
                                  items,
                                  stat,
                                  ctaHref,
                                  ctaLabel,
                              }: EditorialCardProps) {
    return (
        <Card as="article" variant="low" padding="l" className="editorial-card">
            <div className="editorial-card__lead">
                <div>
                    <h2 className="editorial-card__title">
                        <Link href={titleHref}>{title}</Link>
                    </h2>
                    <p className="editorial-card__desc">{description}</p>
                </div>
                <div className="editorial-card__footer">
                    <span className="editorial-card__stat" aria-hidden="true">{stat}</span>
                    <Link href={ctaHref}>{ctaLabel}</Link>
                </div>
            </div>
            <ul className="editorial-card__list">
                {items.map((item) => (
                    <li key={item.key} className="editorial-card__item" inert>
                        <Link href={item.href}>{item.title}</Link>
                        {item.excerpt && <p className="editorial-card__excerpt">{item.excerpt}</p>}
                    </li>
                ))}
            </ul>
        </Card>
    );
}

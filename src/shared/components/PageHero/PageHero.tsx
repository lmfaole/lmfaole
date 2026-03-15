import React from "react";
import { FullBleed } from "@/shared/components/FullBleed/FullBleed";
import "./page-hero.scss";

interface PageHeroProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
    title: string;
    background: React.ReactNode;
}

export function PageHero({ title, background, className, ...rest }: PageHeroProps) {
    return (
        <FullBleed
            as="header"
            className={["page-hero", className].filter(Boolean).join(" ")}
            {...rest}
        >
            <div className="page-hero__bg" aria-hidden="true">
                {background}
            </div>
            <div className="page-hero__inner">
                <div className="page-hero__text">
                    <h1>{title}</h1>
                </div>
            </div>
        </FullBleed>
    );
}

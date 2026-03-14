import React from "react";
import {FullBleed} from "@/shared/components/FullBleed/FullBleed";
import "./foundational-header.scss";

export interface FoundationalHeaderProps {
    title: string;
    excerpt: string;
    /** CSS illustration filling the header background */
    illustration?: React.ReactNode;
}

export function FoundationalHeader({title, excerpt, illustration}: FoundationalHeaderProps) {
    return (
        <FullBleed as="header" className="foundational-header">
            {illustration && (
                <div className="foundational-header__bg" aria-hidden="true">
                    {illustration}
                </div>
            )}
            <div className="foundational-header__inner">
                <h1 className="foundational-header__title">{title}</h1>
                <p className="foundational-header__excerpt">{excerpt}</p>
            </div>
        </FullBleed>
    );
}

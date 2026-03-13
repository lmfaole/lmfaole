"use client";

export const runtime = "edge";

import { NavLink } from "@fremtind/jokul/nav-link";
import { PostResources } from "@/components/PostResources";
import { getFoundationalPost } from "@/lib/foundationalPosts";
import { useParams } from "next/navigation";
import "./foundational-article.scss";

export default function FoundationalPostLayout({ children }: { children: React.ReactNode }) {
    const { id } = useParams<{ id: string }>();
    const post = getFoundationalPost(id);

    return (
        <div className="foundational-article" data-theme="dark">
            <NavLink href="/jokul/foundational" back>Tilbake til grunnleggende</NavLink>
            {children}
            {post?.resources && post.resources.length > 0 && (
                <PostResources resources={post.resources} />
            )}
        </div>
    );
}

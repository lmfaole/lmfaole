import {Link} from "@fremtind/jokul/link";
import {Card} from "@fremtind/jokul/card";
import {Flex} from "@fremtind/jokul/flex";
import {PostMeta} from "@/components/PostMeta";
import type {BlogPost} from "@/lib/blogPosts";

interface BlogPostCardProps {
    post: BlogPost;
}

export function BlogPostCard({post}: BlogPostCardProps) {
    return (
        <Card padding="l">
            <Flex direction="column" gap="s">
                <h2>
                    <Link href={`/jokul/blog/${post.id}`}>{post.title}</Link>
                </h2>
                <p>{post.excerpt}</p>
                <Flex as="footer" gap="s" wrap="wrap">
                    <PostMeta category={post.category} date={post.date} author={post.author} content={post.content}
                              tags={post.tags}/>
                </Flex>
            </Flex>
        </Card>
    );
}

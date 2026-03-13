import {formatDate} from "@fremtind/jokul/utilities";
import {readingTime} from "@/lib/blogPosts";
import {DescriptionDetail, DescriptionList, DescriptionTerm} from "@fremtind/jokul/description-list";

interface PostMetaProps {
    category: string;
    date: string;
    author?: string;
    content?: React.ReactNode;
    tags?: string[];
}

export function PostMeta({category, date, author, content, tags}: PostMetaProps) {
    const minutes = content ? readingTime(content) : null;
    return (
        <DescriptionList>
            <DescriptionTerm>Kategori</DescriptionTerm>
            <DescriptionDetail>{category}</DescriptionDetail>
            <DescriptionTerm>Publisert</DescriptionTerm>
            <DescriptionDetail>{formatDate(new Date(date))}</DescriptionDetail>
            <DescriptionTerm>Lesetid</DescriptionTerm>
            <DescriptionDetail>{minutes ? `${minutes} min.` : "Ikke tilgjengelig"}</DescriptionDetail>
        </DescriptionList>
    );
}

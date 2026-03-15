import { SiteFooter } from "@/shared/components/SiteFooter/SiteFooter";
import { SiteHeader } from "@/shared/components/SiteHeader";

export default function JokulLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SiteHeader />
            <div className="site-layout">
                {children}
            </div>
            <SiteFooter />
        </>
    );
}

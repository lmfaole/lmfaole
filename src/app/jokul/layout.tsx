import { Footer } from "@/components/Footer/Footer";

export default function JokulLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Footer />
        </>
    );
}

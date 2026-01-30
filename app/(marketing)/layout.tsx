import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';
import { StaticGradientBg } from '@/components/landing';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-x-hidden relative flex flex-col">
            {/* Animated Background */}
            <StaticGradientBg className="fixed" />

            {/* Header */}
            <SiteHeader />

            {/* Main Content */}
            <main className="flex-1 relative z-10 w-full">
                {children}
            </main>

            {/* Footer */}
            <SiteFooter />
        </div>
    );
}

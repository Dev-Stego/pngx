'use client';

import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
import { Aurora } from '@/components/ui/react-bits/aurora';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-x-hidden relative flex flex-col">
                {/* Animated Background - Consistent across App */}
                <Aurora
                    colorStops={['#3b82f6', '#8b5cf6', '#06b6d4']}
                    speed={0.5}
                />

                {/* App Nav */}
                <AppHeader />

                {/* Main Content */}
                <main className="flex-1 w-full relative z-10 pt-20">
                    {children}
                </main>

                {/* App Footer */}
                <AppFooter />
            </div>
        </ProtectedRoute>
    );
}

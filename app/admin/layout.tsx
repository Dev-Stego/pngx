'use client';

import * as React from 'react';
// import { useAuth } from '@/components/auth/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Users, LayoutDashboard, Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

import { useAccount } from 'wagmi';
import { verifyAdminWallet } from '@/lib/firestore/admin';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    // We strictly use Wallet Auth for Admin
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = React.useState(false);
    const [verifying, setVerifying] = React.useState(true);

    React.useEffect(() => {
        const checkAccess = async () => {
            // 1. Check if connected
            if (!isConnected || !address) {
                // Wait a bit for hydration
                const timer = setTimeout(() => {
                    if (!isConnected) router.push('/admin-login');
                }, 1000);
                return () => clearTimeout(timer);
            }

            // 2. Check session/verify
            try {
                // In production, you might cache this result or rely on more persistent state
                const isValid = await verifyAdminWallet(address);
                if (!isValid) {
                    router.push('/admin-login');
                } else {
                    setIsAuthorized(true);
                }
            } catch (error) {
                router.push('/admin-login');
            } finally {
                setVerifying(false);
            }
        };

        checkAccess();
    }, [isConnected, address, router]);

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">Verifying Admin Access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/safety', label: 'Safety', icon: ShieldAlert },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-muted/30 border-r min-h-[auto] md:min-h-screen p-4 flex flex-col gap-6 sticky top-0 h-screen overflow-y-auto hidden md:flex">
                <div className="flex items-center gap-2 px-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground">
                        A
                    </div>
                    <div>
                        <h2 className="font-bold tracking-tight">Admin Console</h2>
                        <p className="text-xs text-muted-foreground">PNGX System</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn("w-full justify-start", isActive && "bg-primary/10 text-primary hover:bg-primary/20")}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-4 border-t">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => router.push('/')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to App
                    </Button>
                </div>
            </aside>

            {/* Mobile Sidebar (Sheet) and Header */}
            <div className="md:hidden flex flex-col">
                <header className="h-16 border-b flex items-center justify-between px-4 bg-background sticky top-0 z-20">
                    <div className="flex items-center gap-2 font-bold">
                        {/* Simple Mobile Nav Trigger - could be enhanced with Sheet later */}
                        <LayoutDashboard className="w-5 h-5 text-primary" />
                        <span>Admin Console</span>
                    </div>
                    <ConnectButton accountStatus="avatar" showBalance={false} chainStatus="none" />
                </header>
                {/* Mobile Nav Links - Simple horizontal scroll or stack for now */}
                <div className="border-b bg-muted/20 p-2 flex gap-2 overflow-x-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className="shrink-0">
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="sm"
                                    className={cn(isActive && "bg-primary/10 text-primary")}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Desktop Header */}
                <header className="h-16 border-b hidden md:flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm sticky top-0 z-10 w-full">
                    <div className="font-semibold">{navItems.find(i => i.href === pathname)?.label || 'Dashboard'}</div>
                    <div className="flex items-center gap-4">
                        <ConnectButton accountStatus="address" showBalance={false} chainStatus="none" />
                    </div>
                </header>
                <main className="flex-1 p-6 md:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

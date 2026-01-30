'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import the actual Web3 provider to avoid SSR issues with WalletConnect
const Web3ProviderInner = dynamic(
    () => import('./web3-provider-inner').then((mod) => mod.Web3ProviderInner),
    {
        ssr: false,
    }
);

interface Web3ProviderProps {
    children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Show loading spinner until mounted (prevents SSR/hydration issues with Wagmi hooks)
    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return <Web3ProviderInner>{children}</Web3ProviderInner>;
}

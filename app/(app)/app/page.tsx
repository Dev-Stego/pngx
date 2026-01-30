'use client';

import { SecureProcessor } from '@/components/secure-processor';
import { HistoryPanel } from '@/components/history-panel';

// Layout handled by (app)/layout.tsx

export default function AppPage() {
    return (
        <div className="container max-w-6xl mx-auto px-6 pb-20">
            <div className="mb-10 text-center space-y-4 pt-10">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary animate-gradient-x pb-2">
                    Secure Steganography Vault
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Encrypt files into images with military-grade AES-256 GCM encryption.
                </p>
            </div>

            <SecureProcessor />

            {/* History Panel */}
            <div className="mt-16">
                <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-12" />
                <HistoryPanel />
            </div>
        </div>
    );
}

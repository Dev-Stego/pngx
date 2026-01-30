'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// global-error must include html and body tags
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="antialiased min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center max-w-md text-center">
                    <div className="bg-destructive/10 p-6 rounded-full mb-6 ring-1 ring-destructive/30">
                        <AlertTriangle className="w-16 h-16 text-destructive" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight mb-3">Critical System Error</h2>
                    <p className="text-muted-foreground mb-8">
                        Something went wrong deep in the system. Our encryption protocols remain secure, but the interface has crashed.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={() => reset()} size="lg" className="rounded-full gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </Button>
                        <Link href="/">
                            <Button variant="outline" size="lg" className="rounded-full">
                                Return Home
                            </Button>
                        </Link>
                    </div>
                    {error.digest && (
                        <p className="mt-8 text-xs text-muted-foreground font-mono">
                            Error Digest: {error.digest}
                        </p>
                    )}
                </div>
            </body>
        </html>
    );
}

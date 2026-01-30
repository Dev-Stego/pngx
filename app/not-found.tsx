import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ghost } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center px-4">
            <div className="bg-muted/10 p-6 rounded-full mb-6 ring-1 ring-border">
                <Ghost className="w-16 h-16 text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">Page Not Found</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
                The encrypted data you are looking for seems to have vanished into the void.
            </p>
            <div className="flex gap-4">
                <Link href="/">
                    <Button size="lg" className="rounded-full">
                        Return Home
                    </Button>
                </Link>
                <Link href="/app">
                    <Button variant="outline" size="lg" className="rounded-full">
                        Go to App
                    </Button>
                </Link>
            </div>
        </div>
    );
}

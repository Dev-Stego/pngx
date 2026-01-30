'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FullPageModalProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
    showCloseData?: boolean; // If true, shows close button
}

export function FullPageModal({
    children,
    title,
    description,
    action,
    className,
    showCloseData = true
}: FullPageModalProps) {
    const router = useRouter();

    // Handle ESC key to close
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                router.back();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [router]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto"
            >
                <div className="container mx-auto px-4 pt-24 pb-6 min-h-screen flex flex-col max-w-4xl">
                    {/* Header */}
                    <header className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
                        <div className="space-y-1">
                            {title && (
                                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                            )}
                            {description && (
                                <p className="text-sm text-muted-foreground">{description}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {action}
                            {showCloseData && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.back()}
                                    className="rounded-full hover:bg-muted/50 h-10 w-10"
                                >
                                    <X className="w-5 h-5" />
                                    <span className="sr-only">Close</span>
                                </Button>
                            )}
                        </div>
                    </header>

                    {/* Content */}
                    <div className={cn("flex-1 pb-10", className)}>
                        {children}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

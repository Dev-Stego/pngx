'use client';

import * as React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { LoginModal } from '@/components/auth/login-modal';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthBarrierProps {
    children: React.ReactNode;
}

export function AuthBarrier({ children }: AuthBarrierProps) {
    const { user, loading } = useAuth();
    const [showLogin, setShowLogin] = React.useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center"
                >
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center">
                            <Lock className="w-10 h-10 text-primary" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold mb-3">
                        Sign in to get started
                    </h2>
                    <p className="text-muted-foreground max-w-md mb-8">
                        Create an account to securely encrypt your files, sync across devices,
                        and access advanced steganography features.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            size="lg"
                            onClick={() => setShowLogin(true)}
                            className="px-8 shadow-lg shadow-primary/25"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Sign In / Sign Up
                        </Button>
                    </div>

                    <div className="mt-12 grid grid-cols-3 gap-8 text-center max-w-xl">
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary">256-bit</div>
                            <div className="text-xs text-muted-foreground">AES Encryption</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary">100%</div>
                            <div className="text-xs text-muted-foreground">Client-Side</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary">Zero</div>
                            <div className="text-xs text-muted-foreground">Server Access</div>
                        </div>
                    </div>
                </motion.div>

                <LoginModal open={showLogin} onOpenChange={setShowLogin} />
            </>
        );
    }

    return <>{children}</>;
}

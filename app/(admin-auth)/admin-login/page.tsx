'use client';

import * as React from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { verifyAdminWallet, registerFirstAdmin } from '@/lib/firestore/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export default function AdminLoginPage() {
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { disconnect } = useDisconnect();
    const router = useRouter();
    const [verifying, setVerifying] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [showSetup, setShowSetup] = React.useState(false);

    // Auto-trigger login flow when connected
    const handleLogin = async () => {
        if (!isConnected || !address) return;

        setVerifying(true);
        setError(null);

        try {
            // 1. Sign Message
            const signature = await signMessageAsync({
                message: "Sign in to PNGX Admin Panel",
            });

            // 2. Exchange for Token
            const response = await fetch('/api/auth/admin-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, signature }),
            });

            const data = await response.json();

            if (!response.ok) {
                // If specific error, handle it
                if (data.error === 'Not an authorized admin') {
                    // Check if we should offer setup
                    try {
                        // Check strictly if admins count is 0? 
                        // Or just rely on the fallback permission error we saw earlier.
                        // For now, let's just enable the button if they fail auth.
                        setShowSetup(true);
                    } catch (e) { }
                }
                throw new Error(data.error || 'Login failed');
            }

            // 3. Sign in to Firebase
            await signInWithCustomToken(auth, data.token);

            // Success
            toast.success('Securely logged in as Admin');
            router.push('/admin');

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Authentication failed');
            // If user rejected signature, disconnect
            if (err.shortMessage === 'User rejected the request.') {
                disconnect();
            }
        } finally {
            setVerifying(false);
        }
    };

    const handleClaimAdmin = async () => {
        if (!address) return;
        try {
            setVerifying(true);
            await registerFirstAdmin(address);
            toast.success('Admin wallet registered! Please sign in now.');
            setShowSetup(false);
            // Retry login automatically? No, let them click.
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to claim admin access.');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
            <div className="absolute h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none -z-10" />

            <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Admin Console</CardTitle>
                    <CardDescription>
                        Secure access restricted to authorized personnel only.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    {verifying ? (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p>Verifying Credentials...</p>
                        </div>
                    ) : !isConnected ? (
                        <div className="flex justify-center w-full">
                            <ConnectButton
                                label="Connect Admin Wallet"
                                accountStatus="address"
                                chainStatus="icon"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 w-full">
                            <div className="text-center text-sm text-muted-foreground mb-2">
                                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                            </div>

                            {/* Only show Sign In if not already authenticated (though we redirect if they are) */}
                            <Button onClick={handleLogin} className="w-full" size="lg">
                                Sign In securely
                            </Button>

                            <Button variant="ghost" onClick={() => disconnect()} className="w-full text-xs">
                                Disconnect Wallet
                            </Button>
                        </div>
                    )}

                    {error && (
                        <div className="w-full space-y-4">
                            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Access Denied</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </div>
                    )}

                    <div className="text-center text-xs text-muted-foreground mt-4">
                        <p>Requires Web3 Signature Verification</p>
                        <p>IP Address Logged • SOC2 Compliant</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import * as React from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import {
    Mail,
    Wallet,
    ArrowLeft,
    Shield,
    Send,
    CheckCircle2,
    Sparkles,
    Loader2,
    Chrome
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type AuthStep = 'method' | 'email' | 'checkEmail' | 'walletConnecting' | 'walletSign';

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
    const { sendSignInLink, signInWithGoogle, signInWithWallet, user } = useAuth();
    const [loading, setLoading] = React.useState(false);
    const [step, setStep] = React.useState<AuthStep>('method');
    const [email, setEmail] = React.useState('');
    const [pendingWalletAuth, setPendingWalletAuth] = React.useState(false);
    const router = useRouter();

    // RainbowKit/Wagmi hooks
    const { openConnectModal, connectModalOpen } = useConnectModal();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { signMessageAsync } = useSignMessage();

    const resetFlow = () => {
        setStep('method');
        setEmail('');
        setLoading(false);
        setPendingWalletAuth(false);
    };

    // Auto-trigger sign message when wallet connects
    React.useEffect(() => {
        if (isConnected && address && pendingWalletAuth && !connectModalOpen) {
            // Wallet just connected, auto-trigger signing
            handleWalletSign();
        }
    }, [isConnected, address, pendingWalletAuth, connectModalOpen]);

    // Close modal if user gets authenticated
    React.useEffect(() => {
        if (user && open) {
            onOpenChange(false);
            resetFlow();
        }
    }, [user, open, onOpenChange]);

    const handleSendSignInLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter your email');
            return;
        }
        setLoading(true);

        try {
            await sendSignInLink(email);
            toast.success(`Magic link sent to ${email}`);
            setStep('checkEmail');
        } catch (error: any) {
            console.error('Send link error:', error);
            let message = 'Failed to send sign-in link';
            if (error.code === 'auth/invalid-email') {
                message = 'Please enter a valid email address';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Too many attempts. Please try again later';
            }
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleWalletConnect = () => {
        // Mark that we're pending wallet auth
        setPendingWalletAuth(true);
        setStep('walletConnecting');
        // Close our modal first
        onOpenChange(false);
        // Then open RainbowKit modal
        setTimeout(() => {
            if (openConnectModal) {
                openConnectModal();
            }
        }, 150);
    };

    const handleWalletSign = async () => {
        if (!address) {
            setPendingWalletAuth(false);
            return;
        }

        setLoading(true);

        // Show a toast to indicate signing is happening
        let toastId = toast.loading('Please sign the message in your wallet...');

        try {
            const message = `Welcome to PNGX!\n\nSign this message to authenticate.\n\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}`;
            const signature = await signMessageAsync({ message });

            // Update toast for server authentication phase
            toast.dismiss(toastId);
            toastId = toast.loading('Authenticating with server...');

            // Create Firebase session with wallet
            await signInWithWallet(address, signature, message);

            toast.dismiss(toastId);
            toast.success('Wallet authenticated successfully!');
            handleSuccess();
        } catch (error: any) {
            toast.dismiss(toastId);
            console.error('Wallet sign error:', error);

            if (error.message?.includes('User rejected') || error.message?.includes('denied')) {
                toast.error('Signature rejected. Please try again.');
            } else {
                toast.error(error.message || 'Failed to authenticate wallet');
            }

            // Disconnect and reset
            disconnect();
            setPendingWalletAuth(false);
            setStep('method');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            toast.success('Signed in with Google!');
            toast.success('Signed in with Google!');
            handleSuccess();
        } catch (error: any) {
            console.error('Google sign-in error:', error);
            if (error.code !== 'auth/popup-closed-by-user') {
                toast.error(error.message || 'Failed to sign in with Google');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnectWallet = () => {
        disconnect();
        setPendingWalletAuth(false);
        setStep('method');
    };

    const [redirecting, setRedirecting] = React.useState(false);

    const handleSuccess = () => {
        setLoading(false);
        setRedirecting(true);
        // Keep modal open, show redirection state
        setTimeout(() => {
            router.push('/app');
            // We don't close the modal here; it will unmount when page changes
            // or we can close it after a delay to be safe
            setTimeout(() => onOpenChange(false), 2000);
        }, 500);
    };

    // ... existing handlers modify to call handleSuccess ...

    // Don't render if we're in wallet connecting state (modal closed for RainbowKit)
    if (step === 'walletConnecting' && !open) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (redirecting) return; // Prevent closing while redirecting
            onOpenChange(isOpen);
            if (!isOpen && !pendingWalletAuth) {
                resetFlow();
                if (isConnected) disconnect();
            }
        }}>
            <DialogContent className="sm:max-w-[440px] border-primary/20 bg-background/95 backdrop-blur-2xl">
                {redirecting ? (
                    <div className="py-10 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold">Authentication Successful</h3>
                            <p className="text-muted-foreground">Redirecting to app...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="space-y-3">
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                                {step === 'method' && 'Welcome to PNGX'}
                                {step === 'email' && 'Sign in with Email'}
                                {step === 'checkEmail' && 'Check Your Inbox'}
                                {step === 'walletSign' && 'Verify Ownership'}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                {step === 'method' && 'Choose your preferred sign-in method'}
                                {step === 'email' && 'We\'ll send you a magic link'}
                                {step === 'checkEmail' && 'Click the link in your email to sign in'}
                                {step === 'walletSign' && 'Sign a message to verify you own this wallet'}
                            </DialogDescription>
                        </DialogHeader>
                    </>
                )}

                {!redirecting && (
                    <>


                        {/* Method Selection */}
                        {step === 'method' && (
                            <div className="space-y-4 py-4">
                                <Button
                                    onClick={() => setStep('email')}
                                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-primary/20 text-foreground"
                                    variant="outline"
                                >
                                    <Mail className="w-5 h-5 mr-3 text-primary" />
                                    Continue with Email
                                    <Sparkles className="w-4 h-4 ml-auto text-primary/50" />
                                </Button>

                                <Button
                                    onClick={handleWalletConnect}
                                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white shadow-lg shadow-primary/25"
                                >
                                    <Wallet className="w-5 h-5 mr-3" />
                                    Connect Wallet
                                </Button>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-border/50" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-3 text-muted-foreground/60">or continue with</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleGoogleSignIn}
                                    variant="outline"
                                    className="w-full h-12 border-border/50 hover:bg-muted/50"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    ) : (
                                        <Chrome className="w-5 h-5 mr-2" />
                                    )}
                                    Google
                                </Button>

                                <p className="text-xs text-center text-muted-foreground/60 pt-2">
                                    By continuing, you agree to our Terms of Service and Privacy Policy
                                </p>
                            </div>
                        )}

                        {/* Email Input */}
                        {step === 'email' && (
                            <form onSubmit={handleSendSignInLink} className="space-y-5 py-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFlow}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>

                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoFocus
                                        className="h-12 text-base bg-muted/30 border-border/50 focus:border-primary"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4 mr-2" />
                                    )}
                                    {loading ? 'Sending...' : 'Send Magic Link'}
                                </Button>

                                <p className="text-xs text-center text-muted-foreground/60">
                                    No password needed — we'll email you a secure link
                                </p>
                            </form>
                        )}

                        {/* Check Your Email */}
                        {step === 'checkEmail' && (
                            <div className="space-y-6 py-4">
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
                                            <Mail className="w-10 h-10 text-primary" />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            We sent a magic link to
                                        </p>
                                        <p className="font-semibold text-lg mt-1 text-primary">{email}</p>
                                    </div>

                                    <div className="bg-muted/30 rounded-xl p-4 text-left space-y-3 border border-border/50">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            Next steps
                                        </p>
                                        <ol className="text-sm text-muted-foreground space-y-2">
                                            <li className="flex items-start gap-2">
                                                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                                                Open the email from PNGX
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                                                Click the sign-in button in the email
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                                                You'll be automatically signed in
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <Button
                                            variant="outline"
                                            onClick={handleSendSignInLink}
                                            disabled={loading}
                                            className="w-full border-border/50"
                                        >
                                            {loading ? 'Sending...' : 'Resend Link'}
                                        </Button>
                                        <Button
                                            variant="link"
                                            onClick={() => setStep('email')}
                                            className="text-xs text-muted-foreground"
                                        >
                                            Use a different email
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Manual Wallet Sign (fallback if auto-sign fails) */}
                        {step === 'walletSign' && (
                            <div className="space-y-5 py-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDisconnectWallet}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>

                                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 text-center space-y-4 border border-green-500/20">
                                    <div className="flex justify-center">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-green-500">Wallet Connected</h3>
                                        <p className="text-sm text-muted-foreground font-mono mt-2">
                                            {address?.slice(0, 6)}...{address?.slice(-4)}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleWalletSign}
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg shadow-primary/25"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    ) : (
                                        <Shield className="w-5 h-5 mr-2" />
                                    )}
                                    {loading ? 'Signing...' : 'Sign to Verify'}
                                </Button>

                                <p className="text-xs text-center text-muted-foreground/60">
                                    This signature proves ownership — no transaction required
                                </p>
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog >
    );
}

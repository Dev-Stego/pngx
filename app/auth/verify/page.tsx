'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    isSignInWithEmailLink,
    signInWithEmailLink,
    linkWithCredential,
    EmailAuthProvider
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, Sparkles, Link2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = React.useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [isLinkMode, setIsLinkMode] = React.useState(false);
    const hasVerified = React.useRef(false);

    React.useEffect(() => {
        // Prevent double verification in strict mode
        if (hasVerified.current) return;
        hasVerified.current = true;

        const verify = async () => {
            const currentUrl = window.location.href;
            console.log('[Verify] Starting verification with URL:', currentUrl);

            // Check if this is link mode (wallet user linking email)
            const mode = searchParams.get('mode');
            const savedLinkMode = window.localStorage.getItem('emailLinkMode');
            const isLinking = mode === 'link' || savedLinkMode === 'link';
            setIsLinkMode(isLinking);

            console.log('[Verify] Mode:', isLinking ? 'LINK' : 'SIGN_IN');

            // Check if this is a valid sign-in link
            if (!isSignInWithEmailLink(auth, currentUrl)) {
                console.log('[Verify] Not a valid email link');
                setStatus('error');
                setErrorMessage('Invalid or expired verification link. Please request a new one.');
                return;
            }

            // Get email from localStorage
            let email = window.localStorage.getItem('emailForSignIn');
            console.log('[Verify] Email from storage:', email);

            // If email not found, prompt user
            if (!email) {
                email = window.prompt('Please enter your email for confirmation:');
                if (!email) {
                    setStatus('error');
                    setErrorMessage('Email is required to complete verification');
                    return;
                }
            }

            if (isLinking) {
                // ========== LINK MODE ==========
                // Don't sign in - just update the existing user's profile
                await handleLinkMode(email);
            } else {
                // ========== SIGN-IN MODE ==========
                // Normal email sign-in flow
                await handleSignInMode(email, currentUrl);
            }
        };

        const handleLinkMode = async (email: string) => {
            console.log('[Verify] Link mode - linking email to current user');

            try {
                // Get saved wallet user profile for context (fallback)
                const savedProfile = window.localStorage.getItem('walletUserProfile');
                if (!savedProfile && !auth.currentUser) {
                    throw new Error('No active session found. Please sign in with your wallet first, then click this link again.');
                }

                // Wait a moment for auth to initialize if needed
                let currentUser = auth.currentUser;
                if (!currentUser) {
                    // Wait up to 2 seconds
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    currentUser = auth.currentUser;
                }

                if (!currentUser) {
                    throw new Error('You must be signed in to link an email. Please sign in and try again.');
                }

                console.log('[Verify] Linking credential to user:', currentUser.uid);

                // 1. Create Credential
                const credential = EmailAuthProvider.credentialWithLink(email, window.location.href);

                // 2. Link with Firebase Auth
                await linkWithCredential(currentUser, credential);
                console.log('[Verify] Firebase Auth link success');

                // 3. Call Backend API to finalize/sync
                const response = await fetch('/api/auth/confirm-email-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: currentUser.uid,
                        email: email,
                        mode: 'link'
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to sync profile');
                }

                // 4. Update Local Storage & UI
                if (savedProfile) {
                    const profile = JSON.parse(savedProfile);
                    const updatedProfile = { ...profile, email };
                    window.localStorage.setItem('walletUserProfile', JSON.stringify(updatedProfile));
                }

                window.localStorage.removeItem('emailForSignIn');
                window.localStorage.removeItem('emailLinkMode');

                console.log('[Verify] Email linked successfully!');
                setStatus('success');
                toast.success('Email linked successfully!');

                // Redirect to profile page
                setTimeout(() => {
                    router.push('/profile');
                }, 2000);

            } catch (error: any) {
                console.error('[Verify] Link error:', error);

                // Handle "Credential already in use" specifically
                if (error.code === 'auth/credential-already-in-use') {
                    setErrorMessage('This email is already linked to another account. Please sign out and sign in with this email.');
                } else if (error.code === 'auth/invalid-action-code') {
                    setErrorMessage('This link is invalid or expired.');
                } else {
                    setErrorMessage(error.message || 'Failed to link email. Please try again.');
                }

                setStatus('error');
            }
        };

        const handleSignInMode = async (email: string, currentUrl: string) => {
            console.log('[Verify] Sign-in mode - completing email sign-in');

            try {
                const credential = await signInWithEmailLink(auth, email, currentUrl);
                console.log('[Verify] Sign-in successful:', credential.user.uid);

                window.localStorage.removeItem('emailForSignIn');
                setStatus('success');
                toast.success('Successfully signed in!');

                // Redirect after short delay
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } catch (error: any) {
                console.error('[Verify] Sign-in error:', error);
                setStatus('error');

                // User-friendly error messages
                switch (error.code) {
                    case 'auth/invalid-action-code':
                        setErrorMessage('This link has already been used or is invalid.');
                        break;
                    case 'auth/expired-action-code':
                        setErrorMessage('This link has expired. Please request a new one.');
                        break;
                    case 'auth/user-disabled':
                        setErrorMessage('This account has been disabled.');
                        break;
                    case 'auth/invalid-email':
                        setErrorMessage('The email address is invalid.');
                        break;
                    default:
                        setErrorMessage(error.message || 'Failed to verify email. Please try again.');
                }
            }
        };

        verify();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
            <div className="w-full max-w-md p-8 space-y-8 text-center">
                {/* Logo */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-secondary flex items-center justify-center font-bold text-white text-3xl shadow-2xl shadow-primary/30">
                            PX
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/20 animate-ping" />
                    </div>
                </div>

                {status === 'verifying' && (
                    <div className="space-y-6">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
                            <Sparkles className="w-6 h-6 absolute top-0 right-1/3 text-primary/50 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                {isLinkMode ? 'Linking Email...' : 'Verifying...'}
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                {isLinkMode ? 'Adding email to your account' : 'Please wait while we sign you in'}
                            </p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                                {isLinkMode ? (
                                    <Link2 className="w-12 h-12 text-green-500" />
                                ) : (
                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                )}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-green-500">
                                {isLinkMode ? 'Email Linked!' : 'Welcome Back!'}
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                {isLinkMode
                                    ? 'Your email has been linked to your wallet account'
                                    : 'You\'ve been successfully signed in'}
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Redirecting to {isLinkMode ? 'profile' : 'home'}...</span>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-destructive/20 to-red-500/20 flex items-center justify-center border border-destructive/30">
                                <XCircle className="w-12 h-12 text-destructive" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-destructive">Verification Failed</h1>
                            <p className="text-muted-foreground mt-2">{errorMessage}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => router.push(isLinkMode ? '/profile' : '/')}
                                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                                size="lg"
                            >
                                {isLinkMode ? 'Back to Profile' : 'Return to Home'}
                            </Button>
                            {isLinkMode && (
                                <p className="text-xs text-muted-foreground">
                                    Your wallet account is still active. You can try linking email again from your profile.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        }>
            <VerifyContent />
        </React.Suspense>
    );
}

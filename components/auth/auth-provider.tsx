'use client';

import * as React from 'react';
import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signInAnonymously,
    User,
    UserCredential,
    fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { UserProfile } from '@/lib/firestore/types';

// Extended Auth Context Type
interface AuthContextType {
    user: UserProfile | null;
    firebaseUser: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    sendSignInLink: (email: string) => Promise<void>;
    completeEmailSignIn: (emailLink: string) => Promise<UserCredential>;
    completeEmailLink: (email: string) => Promise<void>;
    isEmailLinkSignIn: (link: string) => boolean;
    signInWithWallet: (address: string, signature: string, message: string) => Promise<void>;
    linkWallet: (address: string, signature: string, message: string) => Promise<void>;
    linkEmail: (email: string) => Promise<void>;
    refreshProfile: () => Promise<void>;
    checkWalletAvailable: (address: string) => Promise<boolean>;
    checkEmailAvailable: (email: string) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Flag to prevent onAuthStateChanged from racing with wallet auth
let isWalletAuthInProgress = false;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<UserProfile | null>(null);
    const [firebaseUser, setFirebaseUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    // Create a user profile object for Firestore (no undefined values)
    const createFirestoreProfile = (
        uid: string,
        options: {
            email?: string | null;
            displayName?: string | null;
            photoURL?: string | null;
            walletAddress?: string | null;
        }
    ): Record<string, any> => {
        const { email, displayName, photoURL, walletAddress } = options;

        // Determine display name
        let name = displayName || 'User';
        if (!displayName || displayName === 'User') {
            if (walletAddress) {
                name = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
            } else if (email) {
                name = email.split('@')[0];
            }
        }

        // Build profile object - only include fields that have values
        const profile: Record<string, any> = {
            uid,
            displayName: name,
            photoURL: photoURL || null,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            isPremium: false,
            filesEncrypted: 0,
            storageUsed: 0,
            socials: {},
            preferences: {
                theme: 'dark',
                useHardwareAccel: true,
            },
        };

        if (email) profile.email = email;
        if (walletAddress) profile.walletAddress = walletAddress;

        return profile;
    };

    // Create a UserProfile for local state
    const createLocalProfile = (
        uid: string,
        options: {
            email?: string | null;
            displayName?: string | null;
            photoURL?: string | null;
            walletAddress?: string | null;
        }
    ): UserProfile => {
        const { email, displayName, photoURL, walletAddress } = options;

        let name = displayName || 'User';
        if (!displayName || displayName === 'User') {
            if (walletAddress) {
                name = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
            } else if (email) {
                name = email.split('@')[0];
            }
        }

        return {
            uid,
            email: email || undefined,
            displayName: name,
            photoURL: photoURL || null,
            walletAddress: walletAddress || undefined,
            createdAt: new Date() as unknown as Timestamp,
            lastLogin: new Date() as unknown as Timestamp,
            isPremium: false,
            status: 'active' as const,
            filesEncrypted: 0,
            storageUsed: 0,
            socials: {},
            preferences: {
                theme: 'dark',
                useHardwareAccel: true,
            },
        };
    };

    // Fetch existing user profile from Firestore
    const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
        try {
            const userDocRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                return userDoc.data() as UserProfile;
            }
            return null;
        } catch (error) {
            console.error('[Auth] Error fetching profile:', error);
            return null;
        }
    };

    // Check if a wallet address is available (not linked to any account)
    const checkWalletAvailable = async (address: string): Promise<boolean> => {
        try {
            const walletLower = address.toLowerCase();
            const walletDocRef = doc(db, 'wallets', walletLower);
            const walletDoc = await getDoc(walletDocRef);
            return !walletDoc.exists();
        } catch (error) {
            console.error('[Auth] Error checking wallet:', error);
            return false;
        }
    };

    // Check if an email is available (not linked to any account)
    const checkEmailAvailable = async (email: string): Promise<boolean> => {
        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            return methods.length === 0;
        } catch (error) {
            console.error('[Auth] Error checking email:', error);
            return false;
        }
    };

    // Refresh profile from Firestore
    const refreshProfile = async () => {
        // For wallet users, read from localStorage (which was updated during email link)
        const savedProfile = window.localStorage.getItem('walletUserProfile');
        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);
                console.log('[Auth] Refreshing from localStorage, email:', profile.email);
                setUser(profile);
                return;
            } catch (e) {
                console.error('[Auth] Failed to parse saved profile:', e);
            }
        }

        // Fallback to Firestore
        if (!user) return;

        const profile = await fetchUserProfile(user.uid);
        if (profile) {
            setUser(profile);
        }
    };

    // Listen to auth state changes
    React.useEffect(() => {
        console.log('[Auth] Setting up auth state listener');

        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            console.log('[Auth] Auth state changed:', fbUser?.uid || 'null');

            setFirebaseUser(fbUser);

            // Skip if wallet auth is in progress (we'll set state manually)
            if (isWalletAuthInProgress) {
                console.log('[Auth] Wallet auth in progress, skipping listener');
                return;
            }

            if (fbUser) {
                // Set simple auth cookie for Middleware redirection
                if (typeof document !== 'undefined') {
                    document.cookie = "pngx-auth-token=true; path=/; max-age=2592000; SameSite=Lax";
                }

                // Check if we're restoring a wallet user from localStorage
                const savedWalletProfile = window.localStorage.getItem('walletUserProfile');
                if (savedWalletProfile) {
                    try {
                        const profile = JSON.parse(savedWalletProfile);
                        // Security check: ensure the saved profile matches the current auth UID
                        if (profile.uid === fbUser.uid) {
                            console.log('[Auth] Restoring wallet user from localStorage:', profile.walletAddress);
                            setUser(profile);
                            setLoading(false);
                            return;
                        }
                    } catch (e) {
                        console.error('[Auth] Failed to restore wallet profile:', e);
                    }
                }

                // Fetch existing profile
                let profile = await fetchUserProfile(fbUser.uid);

                if (!profile) {
                    // Create new profile for email/Google users
                    console.log('[Auth] Creating new profile for:', fbUser.email || fbUser.uid);

                    let walletAddress: string | null = null;
                    let displayName = fbUser.displayName;

                    // If anonymous, try to recover wallet address from Firestore
                    if (fbUser.isAnonymous) {
                        try {
                            const walletsRef = collection(db, 'wallets');
                            const q = query(walletsRef, where('uid', '==', fbUser.uid));
                            const snapshot = await getDocs(q);
                            if (!snapshot.empty) {
                                const walletData = snapshot.docs[0].data();
                                walletAddress = walletData.address;
                                console.log('[Auth] Recovered wallet address for anonymous user:', walletAddress);
                            }
                        } catch (err) {
                            console.error('[Auth] Failed to recover wallet address:', err);
                        }
                    }

                    const firestoreProfile = createFirestoreProfile(fbUser.uid, {
                        email: fbUser.email,
                        displayName: displayName,
                        photoURL: fbUser.photoURL,
                        walletAddress: walletAddress,
                    });

                    try {
                        await setDoc(doc(db, 'users', fbUser.uid), firestoreProfile);
                        console.log('[Auth] Profile created with email/wallet:', fbUser.email || walletAddress);

                        // Immediately set profile to what we just created to prevent race conditions
                        profile = createLocalProfile(fbUser.uid, {
                            email: fbUser.email,
                            displayName: displayName,
                            photoURL: fbUser.photoURL,
                            walletAddress: walletAddress,
                        });

                    } catch (error) {
                        console.error('[Auth] CRITICAL: Failed to create profile:', error);
                        // Strict Session: If we can't create a profile, we MUST log out
                        await firebaseSignOut(auth);
                        setUser(null);
                        setLoading(false);
                        return;
                    }
                } else {
                    // Update last login (silent fail is OK)
                    updateDoc(doc(db, 'users', fbUser.uid), {
                        lastLogin: serverTimestamp()
                    }).catch(() => { });

                    // SELF-HEAL: If display name is "User" or missing wallet, try to fix it
                    if (profile.displayName === 'User' || (fbUser.isAnonymous && !profile.walletAddress)) {
                        console.log('[Auth] Attempting to self-heal profile...');
                        let updates: any = {};
                        let walletAddress = profile.walletAddress;

                        // Recover wallet if missing
                        if (!walletAddress && fbUser.isAnonymous) {
                            try {
                                const walletsRef = collection(db, 'wallets');
                                const q = query(walletsRef, where('uid', '==', fbUser.uid));
                                const snapshot = await getDocs(q);
                                if (!snapshot.empty) {
                                    walletAddress = snapshot.docs[0].data().address;
                                    updates.walletAddress = walletAddress;
                                    console.log('[Auth] Self-heal: Recovered wallet address:', walletAddress);
                                }
                            } catch (err) {
                                console.error('[Auth] Self-heal wallet recovery failed:', err);
                            }
                        }

                        // Fix display name if generic
                        if (profile.displayName === 'User') {
                            if (walletAddress) {
                                updates.displayName = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
                            } else if (profile.email) {
                                updates.displayName = profile.email.split('@')[0];
                            }
                        }

                        if (Object.keys(updates).length > 0) {
                            console.log('[Auth] Self-healing profile with updates:', updates);
                            try {
                                await updateDoc(doc(db, 'users', fbUser.uid), updates);
                                profile = { ...profile, ...updates };
                            } catch (e) {
                                console.error('[Auth] Self-heal update failed:', e);
                            }
                        }
                    }

                    // Strict Session: Check for Ghost User (Incomplete Profile after heal)
                    // If verified user still has "User" name and no connected identity, purge them.
                    if (profile && profile.displayName === 'User' && !profile.walletAddress && !profile.email) {
                        console.error('[Auth] DETECTED GHOST USER (No identity). Forcing logout.');
                        await firebaseSignOut(auth);
                        setUser(null);
                        setLoading(false);
                        return;
                    }
                }

                setUser(profile);
            } else {
                setUser(null);
                // Clear saved wallet profile
                window.localStorage.removeItem('walletUserProfile');

                // Clear auth cookie
                if (typeof document !== 'undefined') {
                    document.cookie = "pngx-auth-token=; path=/; max-age=0";
                }
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Send passwordless sign-in link to email
    const sendSignInLink = async (email: string) => {
        const actionCodeSettings = {
            url: `${window.location.origin}/auth/verify`,
            handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('emailForSignIn', email);
            // Clear any link mode flags for normal sign-in
            window.localStorage.removeItem('emailLinkMode');
            window.localStorage.removeItem('walletUserProfile');
        }
    };

    // Complete sign-in with email link (for new users / returning email users)
    const completeEmailSignIn = async (emailLink: string): Promise<UserCredential> => {
        let email = typeof window !== 'undefined'
            ? window.localStorage.getItem('emailForSignIn')
            : null;

        if (!email) {
            email = window.prompt('Please enter your email for confirmation:');
        }

        if (!email) {
            throw new Error('Email is required to complete sign-in');
        }

        const credential = await signInWithEmailLink(auth, email, emailLink);

        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('emailForSignIn');
        }

        return credential;
    };

    // Complete email link for linking (wallet user adding email)
    const completeEmailLink = async (email: string): Promise<void> => {
        console.log('[Auth] Completing email link for:', email);

        // Get saved user info
        const savedProfile = window.localStorage.getItem('walletUserProfile');
        if (!savedProfile) {
            throw new Error('No wallet session found. Please sign in again.');
        }

        const profile = JSON.parse(savedProfile) as UserProfile;
        console.log('[Auth] Linking email to wallet user:', profile.uid);

        // Update Firestore with the email
        try {
            await updateDoc(doc(db, 'users', profile.uid), {
                email: email,
            });
            console.log('[Auth] Email linked successfully');

            // Update saved profile and local state
            const updatedProfile = { ...profile, email };
            window.localStorage.setItem('walletUserProfile', JSON.stringify(updatedProfile));
            setUser(updatedProfile);

        } catch (error: any) {
            console.error('[Auth] Failed to link email:', error);
            throw new Error('Failed to link email. Please try again.');
        }
    };

    // Check if a link is a sign-in link
    const isEmailLinkSignIn = (link: string): boolean => {
        return isSignInWithEmailLink(auth, link);
    };

    // Sign in with wallet
    // Sign in with wallet - NOW SERVER-SIDER VALIDATED
    const signInWithWallet = async (address: string, signature: string, message: string) => {
        const walletLower = address.toLowerCase();
        console.log('[Auth] Wallet sign-in initiated for:', walletLower);
        isWalletAuthInProgress = true;

        try {
            // Call the secure backend API to verify signature and get a custom token
            const response = await fetch('/api/auth/wallet-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, signature, message }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to verify wallet');
            }

            const { token, uid, isNewUser } = await response.json();
            console.log('[Auth] Backend verification success. Signing in with Custom Token...', uid);

            // Import dynamically to avoid SSR issues if needed, but standard import is fine here
            const { signInWithCustomToken } = await import('firebase/auth');

            // Sign in with the Custom Token
            // This is the key fix: We become the CORRECT user instantly
            await signInWithCustomToken(auth, token);
            console.log('[Auth] Firebase Custom Token Sign-in Complete');

            // Force set cookie immediately to case race conditions with Middleware
            if (typeof document !== 'undefined') {
                document.cookie = "pngx-auth-token=true; path=/; max-age=2592000; SameSite=Lax";
            }

            // Force fetch profile to update local state immediately
            const profile = await fetchUserProfile(uid);

            if (profile) {
                setUser(profile);
                window.localStorage.setItem('walletUserProfile', JSON.stringify(profile));
            } else {
                console.warn('[Auth] Profile not found immediately after creation? This should be rare.');
                // Fallback local set if strictly needed, but backend should have created it
            }

        } catch (error: any) {
            console.error('[Auth] Wallet sign-in error:', error);
            throw error;
        } finally {
            isWalletAuthInProgress = false;
        }
    };

    // Link wallet to existing account
    const linkWallet = async (address: string, signature: string) => {
        if (!user || !firebaseUser) {
            throw new Error('Must be signed in to link wallet');
        }

        const walletLower = address.toLowerCase();
        console.log('[Auth] Linking wallet:', walletLower);

        // Check if wallet is already linked to ANOTHER account
        const walletDocRef = doc(db, 'wallets', walletLower);
        const walletDoc = await getDoc(walletDocRef);

        if (walletDoc.exists()) {
            const linkedUid = walletDoc.data().uid;
            if (linkedUid !== user.uid) {
                throw new Error('This wallet is already linked to another account');
            }
            console.log('[Auth] Wallet already linked to current user');
            return;
        }

        // Link wallet to current user
        await setDoc(walletDocRef, {
            uid: user.uid,
            address: walletLower,
            linkedAt: serverTimestamp(),
        });

        // Update user profile
        await updateDoc(doc(db, 'users', user.uid), {
            walletAddress: walletLower,
        });

        // Update local state
        const updatedUser = { ...user, walletAddress: walletLower };
        setUser(updatedUser);

        // Update localStorage if it's a wallet user
        if (user.walletAddress) {
            window.localStorage.setItem('walletUserProfile', JSON.stringify(updatedUser));
        }

        console.log('[Auth] Wallet linked successfully');
    };

    // Link email to existing account (for wallet users)
    const linkEmail = async (email: string) => {
        if (!user) {
            throw new Error('Must be signed in to link email');
        }

        console.log('[Auth] Preparing to link email:', email);

        // Check if email is already in use by checking Firestore
        // (We can't use fetchSignInMethodsForEmail without auth issues)

        // Save wallet user context for after redirect
        window.localStorage.setItem('emailForSignIn', email);
        window.localStorage.setItem('emailLinkMode', 'link');
        window.localStorage.setItem('walletUserProfile', JSON.stringify(user));

        console.log('[Auth] Saved wallet context, sending email link...');

        const actionCodeSettings = {
            url: `${window.location.origin}/auth/verify?mode=link`,
            handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        console.log('[Auth] Email link sent');
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
        setFirebaseUser(null);
        // Clear wallet session
        window.localStorage.removeItem('walletUserProfile');
        window.localStorage.removeItem('emailLinkMode');
        window.localStorage.removeItem('emailForSignIn');
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!user) return;

        // Remove undefined values
        const cleanUpdates: Record<string, any> = {};
        for (const key in updates) {
            if ((updates as any)[key] !== undefined) {
                cleanUpdates[key] = (updates as any)[key];
            }
        }

        try {
            await updateDoc(doc(db, 'users', user.uid), cleanUpdates);
        } catch (error) {
            console.error('[Auth] Profile update failed:', error);
        }

        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);

        // Update localStorage if it's a wallet user
        if (user.walletAddress) {
            window.localStorage.setItem('walletUserProfile', JSON.stringify(updatedUser));
        }
    };

    const value: AuthContextType = {
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        signOut,
        updateProfile,
        sendSignInLink,
        completeEmailSignIn,
        completeEmailLink,
        isEmailLinkSignIn,
        signInWithWallet,
        linkWallet,
        linkEmail,
        refreshProfile,
        checkWalletAvailable,
        checkEmailAvailable,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

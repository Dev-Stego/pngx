import { NextResponse } from 'next/server';
import { verifyMessage } from 'ethers';
import { 
    createCustomToken, 
    createUser, 
    getDocument, 
    setDocument, 
    updateDocument,
    serverTimestamp 
} from '@/lib/firebase/admin-rest';

export async function POST(req: Request) {
    try {
        // Check for required environment variables first
        const requiredVars = ['FIREBASE_ADMIN_PROJECT_ID', 'FIREBASE_ADMIN_CLIENT_EMAIL', 'FIREBASE_ADMIN_PRIVATE_KEY'];
        const missingVars = requiredVars.filter(v => !process.env[v]);
        
        if (missingVars.length > 0) {
            console.error('[WalletAuth] Missing env vars:', missingVars);
            return NextResponse.json({ 
                error: 'Server configuration error',
                message: `Missing environment variables: ${missingVars.join(', ')}`,
            }, { status: 500 });
        }

        const { address, signature, message } = await req.json();

        if (!address || !signature || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const walletAddress = address.toLowerCase();

        // 1. Verify Signature
        // We verify that the signature matches the message and the address
        let recoveredAddress: string;
        try {
            recoveredAddress = verifyMessage(message, signature);
        } catch (e) {
            console.error('Signature verification failed:', e);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        if (recoveredAddress.toLowerCase() !== walletAddress) {
            return NextResponse.json({ error: 'Signature mismatch' }, { status: 401 });
        }

        console.log(`[WalletAuth] Verified signature for ${walletAddress}`);

        // 2. Check if wallet is already linked to a user
        const walletData = await getDocument('wallets', walletAddress);

        let uid: string;
        let isNewUser = false;

        if (walletData) {
            // Existing user
            uid = walletData.uid;
            console.log(`[WalletAuth] Wallet ${walletAddress} linked to existing user ${uid}`);

            // Ensure user document exists (fix for "ghost" users)
            const userData = await getDocument('users', uid);
            if (!userData) {
                console.log(`[WalletAuth] User profile missing for ${uid}, recreating...`);
                await setDocument('users', uid, {
                    uid,
                    displayName: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
                    walletAddress: walletAddress,
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                    isPremium: false,
                    filesEncrypted: 0,
                    storageUsed: 0,
                    socials: {},
                    preferences: { theme: 'dark' }
                });
            } else {
                // Update last login
                await updateDocument('users', uid, {
                    lastLogin: serverTimestamp()
                });
            }

        } else {
            // New user
            console.log(`[WalletAuth] New wallet ${walletAddress}, creating new user`);

            // Create a new user in Firebase Auth
            const newUser = await createUser(
                `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            );
            uid = newUser.uid;
            isNewUser = true;

            // Link wallet
            await setDocument('wallets', walletAddress, {
                uid,
                address: walletAddress,
                linkedAt: serverTimestamp()
            });

            // Create Profile
            await setDocument('users', uid, {
                uid,
                displayName: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
                walletAddress: walletAddress,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                isPremium: false,
                filesEncrypted: 0,
                storageUsed: 0,
                socials: {},
                preferences: { theme: 'dark' }
            });
        }

        // 3. Generate Custom Token
        const customToken = await createCustomToken(uid);

        return NextResponse.json({
            token: customToken,
            uid,
            isNewUser
        });

    } catch (error: any) {
        console.error('[WalletAuth] Error:', error);
        return NextResponse.json({ 
            error: error.message || 'Internal Server Error',
            code: error.code,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

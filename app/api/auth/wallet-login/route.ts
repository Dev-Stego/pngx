
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { verifyMessage } from 'ethers';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: Request) {
    try {
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
        const walletDoc = await adminDb.collection('wallets').doc(walletAddress).get();

        let uid: string;
        let isNewUser = false;

        if (walletDoc.exists) {
            // Existing user
            uid = walletDoc.data()?.uid;
            console.log(`[WalletAuth] Wallet ${walletAddress} linked to existing user ${uid}`);

            // Ensure user document exists (fix for "ghost" users)
            const userDoc = await adminDb.collection('users').doc(uid).get();
            if (!userDoc.exists) {
                console.log(`[WalletAuth] User profile missing for ${uid}, recreating...`);
                await adminDb.collection('users').doc(uid).set({
                    uid,
                    displayName: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
                    walletAddress: walletAddress,
                    createdAt: Timestamp.now(),
                    lastLogin: Timestamp.now(),
                    isPremium: false,
                    filesEncrypted: 0,
                    storageUsed: 0,
                    socials: {},
                    preferences: { theme: 'dark' }
                });
            } else {
                // Update last login
                await adminDb.collection('users').doc(uid).update({
                    lastLogin: Timestamp.now()
                });
            }

        } else {
            // New user
            console.log(`[WalletAuth] New wallet ${walletAddress}, creating new user`);

            // Create a new anonymous UID equivalent
            // We can ask Firebase to create a user for us, or just generate a UID and custom token
            // Using createCustomToken with a new ID works, but let's create a formal user record
            const newUser = await adminAuth.createUser({
                displayName: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            });
            uid = newUser.uid;
            isNewUser = true;

            // Link wallet
            await adminDb.collection('wallets').doc(walletAddress).set({
                uid,
                address: walletAddress,
                linkedAt: Timestamp.now()
            });

            // Create Profile
            await adminDb.collection('users').doc(uid).set({
                uid,
                displayName: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
                walletAddress: walletAddress,
                createdAt: Timestamp.now(),
                lastLogin: Timestamp.now(),
                isPremium: false,
                filesEncrypted: 0,
                storageUsed: 0,
                socials: {},
                preferences: { theme: 'dark' }
            });
        }

        // 3. Generate Custom Token
        const customToken = await adminAuth.createCustomToken(uid);

        return NextResponse.json({
            token: customToken,
            uid,
            isNewUser
        });

    } catch (error: any) {
        console.error('[WalletAuth] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

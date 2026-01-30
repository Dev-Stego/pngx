
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { verifyMessage } from 'ethers';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: Request) {
    try {
        const { address, signature, message, uid } = await req.json();

        if (!address || !signature || !message || !uid) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const walletAddress = address.toLowerCase();

        // 1. Verify Signature
        let recoveredAddress: string;
        try {
            recoveredAddress = verifyMessage(message, signature);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        if (recoveredAddress.toLowerCase() !== walletAddress) {
            return NextResponse.json({ error: 'Signature mismatch' }, { status: 401 });
        }

        // 2. Check overlap
        const walletDoc = await adminDb.collection('wallets').doc(walletAddress).get();

        if (walletDoc.exists) {
            const existingUid = walletDoc.data()?.uid;

            // If it's the SAME user, verify/healing
            if (existingUid === uid) {
                console.log('[LinkWallet] Wallet already linked to this user, healing...');
            } else {
                // If linked to DIFFERENT user
                const otherUser = await adminAuth.getUser(existingUid).catch(() => null);

                // OPTIONAL: Strict check? 
                // If existing user has NO providers (anonymous) and NO email -> Steal it?
                // For now, let's ALLOW "stealing" if I have the signature. 
                // This "recovers" the wallet from a lost anonymous session.
                console.log(`[LinkWallet] Wallet linked to other user ${existingUid}. Reclaiming for ${uid}...`);

                // Cleanup old user? Maybe not, just unlink wallet
            }
        }

        console.log(`[LinkWallet] Linking wallet ${walletAddress} to ${uid}`);

        // 3. Admin Force Link
        await adminDb.collection('wallets').doc(walletAddress).set({
            uid,
            address: walletAddress,
            linkedAt: Timestamp.now()
        });

        // 4. Update Profile
        await adminDb.collection('users').doc(uid).update({
            walletAddress: walletAddress
        });

        return NextResponse.json({ success: true, walletAddress });

    } catch (error: any) {
        console.error('[LinkWallet] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

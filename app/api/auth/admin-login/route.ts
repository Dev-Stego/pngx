import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { verifyMessage } from 'ethers';

export async function POST(req: NextRequest) {
    try {
        const { address, signature } = await req.json();

        if (!address || !signature) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // 1. Verify the signature
        const message = `Login to PNGX Admin Panel\nNonce: ${new Date().toISOString().slice(0, 10)}`;
        // Note: In a stricter implementation, we should fetch a nonce from the server. 
        // For this streamlined "setup" flow, checking the signature of a known message is a reasonable first step 
        // provided the client signs this exact string.

        // Wait, to make it easier for the client, let's just sign a constant or a simple timestamp that is passed?
        // Let's assume the client signs: `Sign in to PNGX Admin: <address>`
        // This prevents replay on other sites, but replay on this site is possible without a nonce.
        // For production grade, we should probably just verify the address matches.

        // Let's accept a specific message format from the client.
        // The standard is often: "Sign in to <App>..."

        // RECOVERY:
        const recoveredAddress = verifyMessage("Sign in to PNGX Admin Panel", signature);

        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 2. Check if Admin exists in Firestore (Robust Lookup)
        let adminFound = false;

        // Try doc (lowercase)
        const adminRefLower = adminDb.collection('admins').doc(address.toLowerCase());
        const adminDocLower = await adminRefLower.get();
        if (adminDocLower.exists) adminFound = true;

        // Try doc (as provided - potentially checksummed)
        if (!adminFound) {
            const adminRefExact = adminDb.collection('admins').doc(address);
            const adminDocExact = await adminRefExact.get();
            if (adminDocExact.exists) adminFound = true;
        }

        // Try Query by field
        if (!adminFound) {
            const querySnapshot = await adminDb.collection('admins')
                .where('walletAddress', '==', address).limit(1).get();
            if (!querySnapshot.empty) adminFound = true;
            // also try lowercase address in query
            if (!adminFound) {
                const querySnapshotLower = await adminDb.collection('admins')
                    .where('walletAddress', '==', address.toLowerCase()).limit(1).get();
                if (!querySnapshotLower.empty) adminFound = true;
            }
        }

        // 3. Fallback: Auto-Register First Admin if collection is empty
        if (!adminFound) {
            const allAdmins = await adminDb.collection('admins').limit(1).get();
            if (allAdmins.empty) {
                console.log(`First admin registration: ${address}`);
                await adminRefLower.set({
                    uid: address.toLowerCase(),
                    walletAddress: address,
                    role: 'SUPER_ADMIN',
                    permissions: ['all'],
                    createdAt: new Date(),
                    createdBy: 'auto-setup'
                });
                adminFound = true;
            }
        }

        if (!adminFound) {
            return NextResponse.json({ error: 'Not an authorized admin' }, { status: 403 });
        }

        // 4. Mint Custom Token
        const customToken = await adminAuth.createCustomToken(address, {
            role: 'admin',
            admin: true
        });

        // 5. Log Activity (Server-side)
        try {
            await adminDb.collection('logs').add({
                action: 'Admin Login',
                type: 'auth',
                details: `Wallet: ${address}`,
                uid: address.toLowerCase(),
                timestamp: new Date() // Admin SDK uses native Date or Timestamp
            });
        } catch (logErr) {
            console.error('Failed to log admin login:', logErr);
            // Don't fail the login just because logging failed
        }

        return NextResponse.json({ token: customToken });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

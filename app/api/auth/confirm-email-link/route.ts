
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: Request) {
    try {
        const { uid, email, mode } = await req.json();

        if (!uid || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log(`[ConfirmEmailLink] Verifying email ${email} for user ${uid}, mode: ${mode}`);

        // 1. Update Firebase Auth User
        // This makes the email "official" for this account, checking verified status
        await adminAuth.updateUser(uid, {
            email: email,
            emailVerified: true
        });

        // 2. Update Firestore Profile
        await adminDb.collection('users').doc(uid).update({
            email: email,
            updatedAt: Timestamp.now()
        });

        console.log(`[ConfirmEmailLink] Successfully linked email ${email} to ${uid}`);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[ConfirmEmailLink] Error:', error);

        if (error.code === 'auth/email-already-exists') {
            return NextResponse.json({
                error: 'This email is already associated with another account. Please sign in with that email directly.'
            }, { status: 409 });
        }

        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

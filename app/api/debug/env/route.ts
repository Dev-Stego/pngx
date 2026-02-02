import { NextResponse } from 'next/server';
import { createCustomToken } from '@/lib/firebase/admin-rest';

export async function GET() {
    const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
    
    // Test Firebase REST API
    let firebaseInitStatus = 'not_tested';
    let firebaseError = '';
    
    try {
        // Try to create a test token (this validates credentials)
        await createCustomToken('test-user-debug');
        firebaseInitStatus = 'success';
    } catch (error: any) {
        firebaseInitStatus = 'failed';
        firebaseError = error.message;
    }

    const envCheck = {
        FIREBASE_ADMIN_PROJECT_ID: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
        FIREBASE_ADMIN_CLIENT_EMAIL: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        FIREBASE_ADMIN_PRIVATE_KEY: !!rawKey,
        RAW_KEY_LENGTH: rawKey.length,
        FIREBASE_REST_API_STATUS: firebaseInitStatus,
        FIREBASE_REST_API_ERROR: firebaseError,
    };

    return NextResponse.json(envCheck);
}

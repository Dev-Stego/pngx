import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// We need a specific Service Account for Admin privileges in API routes.
// For local dev with `firebase emulators`, standard initialization often works if GOOGLE_APPLICATION_CREDENTIALS is set
// or if we rely on default credentials.
// For production, we should use the service account JSON.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL)
        ? {
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            // Replace literal \n string with actual newlines if needed, though usually .env handles it
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }
        : undefined;

// Initialize Firebase Admin
export function initAdmin() {
    if (getApps().length === 0) {
        if (serviceAccount) {
            initializeApp({
                credential: cert(serviceAccount),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
            });
        } else {
            // Fallback for local/managed environments (like Vercel with Google Auth, or local emulator)
            initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
            });
        }
    }
    return getApp();
}

export const adminAuth = getAuth(initAdmin());
export const adminDb = getFirestore(initAdmin());

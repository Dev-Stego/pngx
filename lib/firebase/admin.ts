import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

let app: App;
let auth: Auth;
let db: Firestore;
let storage: Storage;

// Validate required environment variables
function validateEnvVars() {
    const required = [
        'FIREBASE_ADMIN_PROJECT_ID',
        'FIREBASE_ADMIN_CLIENT_EMAIL', 
        'FIREBASE_ADMIN_PRIVATE_KEY',
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(
            `Missing Firebase Admin environment variables: ${missing.join(', ')}. ` +
            `Make sure these are set in your Cloudflare secrets or .env file.`
        );
    }
}

// Process the private key - handle multiple escape scenarios
function getPrivateKey(): string {
    let key = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
    
    // Handle double-escaped newlines (\\n -> \n) from Cloudflare secrets
    // This happens when the key is stored with literal backslash-n
    if (key.includes('\\n')) {
        key = key.replace(/\\n/g, '\n');
    }
    
    // Also handle if it was JSON stringified (extra escaping)
    if (key.includes('\\\\n')) {
        key = key.replace(/\\\\n/g, '\n');
    }
    
    return key;
}

// Initialize Firebase Admin (server-side only)
function initializeFirebaseAdmin() {
    validateEnvVars();
    
    if (!getApps().length) {
        const privateKey = getPrivateKey();
        
        app = initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
                privateKey: privateKey,
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    } else {
        app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    return { app, auth, db, storage };
}

// Lazy initialization - only init when first accessed
let initialized = false;

function ensureInitialized() {
    if (!initialized) {
        initializeFirebaseAdmin();
        initialized = true;
    }
}

// Export getters that ensure initialization
export const adminApp = new Proxy({} as App, {
    get(_, prop) {
        ensureInitialized();
        return (app as any)[prop];
    }
});

export const adminAuth = new Proxy({} as Auth, {
    get(_, prop) {
        ensureInitialized();
        const value = (auth as any)[prop];
        return typeof value === 'function' ? value.bind(auth) : value;
    }
});

export const adminDb = new Proxy({} as Firestore, {
    get(_, prop) {
        ensureInitialized();
        const value = (db as any)[prop];
        return typeof value === 'function' ? value.bind(db) : value;
    }
});

export const adminStorage = new Proxy({} as Storage, {
    get(_, prop) {
        ensureInitialized();
        const value = (storage as any)[prop];
        return typeof value === 'function' ? value.bind(storage) : value;
    }
});

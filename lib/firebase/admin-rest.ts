/**
 * Firebase Admin REST API client for Cloudflare Workers
 * Uses REST APIs instead of the firebase-admin SDK which doesn't work in edge runtime
 */

import { SignJWT, importPKCS8 } from 'jose';

interface ServiceAccount {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

function getServiceAccount(): ServiceAccount {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';

    // Handle escaped newlines from Cloudflare secrets
    if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            `Missing Firebase Admin credentials. ` +
            `Required: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY`
        );
    }

    return { projectId, clientEmail, privateKey };
}

// Cache for access token
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get a Google OAuth2 access token using service account credentials
 */
async function getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 5 min buffer)
    if (cachedToken && cachedToken.expiresAt > Date.now() + 300000) {
        return cachedToken.token;
    }

    const sa = getServiceAccount();
    const now = Math.floor(Date.now() / 1000);

    // Create JWT for Google OAuth2
    const privateKey = await importPKCS8(sa.privateKey, 'RS256');
    
    const jwt = await new SignJWT({
        iss: sa.clientEmail,
        sub: sa.clientEmail,
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
        scope: [
            'https://www.googleapis.com/auth/firebase.database',
            'https://www.googleapis.com/auth/datastore',
            'https://www.googleapis.com/auth/identitytoolkit',
        ].join(' '),
    })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
        .sign(privateKey);

    // Exchange JWT for access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    
    cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
    };

    return data.access_token;
}

/**
 * Create a custom token for Firebase Auth
 */
export async function createCustomToken(uid: string, claims?: Record<string, any>): Promise<string> {
    const sa = getServiceAccount();
    const now = Math.floor(Date.now() / 1000);

    const privateKey = await importPKCS8(sa.privateKey, 'RS256');

    const token = await new SignJWT({
        uid,
        claims: claims || {},
    })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
        .setIssuer(sa.clientEmail)
        .setSubject(sa.clientEmail)
        .setAudience('https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit')
        .setIssuedAt(now)
        .setExpirationTime(now + 3600)
        .sign(privateKey);

    return token;
}

/**
 * Create a new user in Firebase Auth
 */
export async function createUser(displayName?: string): Promise<{ uid: string }> {
    const sa = getServiceAccount();
    const accessToken = await getAccessToken();

    const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/projects/${sa.projectId}/accounts`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                displayName,
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create user: ${error}`);
    }

    const data = await response.json();
    return { uid: data.localId };
}

/**
 * Firestore REST API helpers
 */
const firestoreBaseUrl = () => {
    const sa = getServiceAccount();
    return `https://firestore.googleapis.com/v1/projects/${sa.projectId}/databases/(default)/documents`;
};

export async function getDocument(collection: string, docId: string): Promise<any | null> {
    const accessToken = await getAccessToken();
    
    const response = await fetch(
        `${firestoreBaseUrl()}/${collection}/${docId}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        }
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get document: ${error}`);
    }

    const data = await response.json();
    return firestoreDocToObject(data.fields);
}

export async function setDocument(collection: string, docId: string, data: Record<string, any>): Promise<void> {
    const accessToken = await getAccessToken();
    
    const response = await fetch(
        `${firestoreBaseUrl()}/${collection}/${docId}`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: objectToFirestoreDoc(data),
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to set document: ${error}`);
    }
}

export async function updateDocument(collection: string, docId: string, data: Record<string, any>): Promise<void> {
    const accessToken = await getAccessToken();
    const updateMask = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&');
    
    const response = await fetch(
        `${firestoreBaseUrl()}/${collection}/${docId}?${updateMask}`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: objectToFirestoreDoc(data),
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update document: ${error}`);
    }
}

// Convert Firestore document format to plain object
function firestoreDocToObject(fields: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(fields || {})) {
        result[key] = firestoreValueToJs(value);
    }
    
    return result;
}

function firestoreValueToJs(value: any): any {
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.integerValue !== undefined) return parseInt(value.integerValue);
    if (value.doubleValue !== undefined) return value.doubleValue;
    if (value.booleanValue !== undefined) return value.booleanValue;
    if (value.timestampValue !== undefined) return new Date(value.timestampValue);
    if (value.nullValue !== undefined) return null;
    if (value.mapValue !== undefined) return firestoreDocToObject(value.mapValue.fields);
    if (value.arrayValue !== undefined) {
        return (value.arrayValue.values || []).map(firestoreValueToJs);
    }
    return null;
}

// Convert plain object to Firestore document format
function objectToFirestoreDoc(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
        result[key] = jsValueToFirestore(value);
    }
    
    return result;
}

function jsValueToFirestore(value: any): any {
    if (value === null || value === undefined) {
        return { nullValue: null };
    }
    if (typeof value === 'string') {
        return { stringValue: value };
    }
    if (typeof value === 'number') {
        if (Number.isInteger(value)) {
            return { integerValue: value.toString() };
        }
        return { doubleValue: value };
    }
    if (typeof value === 'boolean') {
        return { booleanValue: value };
    }
    if (value instanceof Date) {
        return { timestampValue: value.toISOString() };
    }
    if (Array.isArray(value)) {
        return { arrayValue: { values: value.map(jsValueToFirestore) } };
    }
    if (typeof value === 'object') {
        return { mapValue: { fields: objectToFirestoreDoc(value) } };
    }
    return { stringValue: String(value) };
}

// Export a timestamp helper
export function serverTimestamp(): Date {
    return new Date();
}

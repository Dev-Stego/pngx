import {
    collection,
    collectionGroup,
    getDocs,
    getCountFromServer,
    query,
    orderBy,
    limit,
    startAfter,
    DocumentData,
    doc,
    updateDoc,
    getDoc,
    setDoc,
    where,
    Timestamp,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { UserProfile, SystemSettings, ActivityLog } from './types';
import { addDoc } from 'firebase/firestore';

export interface AdminStats {
    totalUsers: number;
    encryptedFiles: number;
    activeShares: number;
}

// Activity Logs
export async function logActivity(
    action: string,
    type: ActivityLog['type'],
    details?: string,
    uid?: string
): Promise<void> {
    try {
        const logsColl = collection(db, 'logs');
        await addDoc(logsColl, {
            action,
            type,
            details,
            uid,
            timestamp: Timestamp.now()
        });
    } catch (e) {
        console.error('Failed to log activity:', e);
    }
}

export async function getRecentActivity(limitCount = 10): Promise<ActivityLog[]> {
    try {
        const logsColl = collection(db, 'logs');
        const q = query(logsColl, orderBy('timestamp', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ActivityLog));
    } catch (e) {
        console.error('Failed to fetch activity logs:', e);
        return [];
    }
}

export async function getAdminStats(): Promise<AdminStats> {
    const stats = {
        totalUsers: 0,
        encryptedFiles: 0,
        activeShares: 0
    };

    try {
        const usersColl = collection(db, 'users');
        const usersSnapshot = await getCountFromServer(usersColl);
        stats.totalUsers = usersSnapshot.data().count;
    } catch (e) {
        console.error('Failed to count users:', e);
    }

    try {
        // collectionGroup often requires an index, even for count
        const historyQuery = query(collectionGroup(db, 'history'));
        const historySnapshot = await getCountFromServer(historyQuery);
        stats.encryptedFiles = historySnapshot.data().count;
    } catch (e) {
        console.error('Failed to count encrypted files (history):', e);
    }

    try {
        const sharesColl = collection(db, 'shares');
        const sharesSnapshot = await getCountFromServer(sharesColl);
        stats.activeShares = sharesSnapshot.data().count;
    } catch (e) {
        console.error('Failed to count shares:', e);
    }

    return stats;
}

export async function getRecentUsers(limitCount = 5): Promise<UserProfile[]> {
    try {
        const usersColl = collection(db, 'users');
        const q = query(usersColl, orderBy('createdAt', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
        console.error('Error fetching recent users:', error);
        return [];
    }
}

export async function getAllUsers(limitCount = 20, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{ users: UserProfile[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    try {
        const usersColl = collection(db, 'users');
        let q = query(usersColl, orderBy('createdAt', 'desc'), limit(limitCount));

        if (lastDoc) {
            q = query(usersColl, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
        }

        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => doc.data() as UserProfile);
        const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

        return { users, lastDoc: newLastDoc };
    } catch (error) {
        console.error('Error fetching all users:', error);
        return { users: [], lastDoc: null };
    }
}

// User Management
export async function updateUserStatus(uid: string, status: 'active' | 'suspended' | 'banned'): Promise<void> {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { status });
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
}

// System Settings
export async function getSystemSettings(): Promise<SystemSettings | null> {
    try {
        const settingsRef = doc(db, 'settings', 'global');
        const snapshot = await getDoc(settingsRef);
        if (snapshot.exists()) {
            return snapshot.data() as SystemSettings;
        }
        return null; // Return null if not set, UI should handle defaults
    } catch (error) {
        console.error('Error fetching system settings:', error);
        return null;
    }
}

export async function updateSystemSettings(settings: Partial<SystemSettings>, adminUid: string): Promise<void> {
    try {
        const settingsRef = doc(db, 'settings', 'global');
        await setDoc(settingsRef, {
            ...settings,
            updatedBy: adminUid,
            updatedAt: Timestamp.now()
        }, { merge: true });
    } catch (error) {
        console.error('Error updating system settings:', error);
        throw error;
    }
}

// Admin Auth
export async function verifyAdminWallet(address: string): Promise<boolean> {
    // In a real app, you might query a specific 'admins' collection 
    // where document ID is the wallet address or contains it.
    // For now, we'll check against a hardcoded list or specific firestore doc.
    try {
        // Option 1: Check special 'admins' collection
        // const adminDoc = await getDoc(doc(db, 'admins', address.toLowerCase()));
        // return adminDoc.exists();

        // Option 2: Hardcoded for MVP (e.g., owner wallet) - REPLACE WITH YOUR WALLET FOR TESTING
        // const ALLOWED_ADMINS = ['0x...']; 
        // return ALLOWED_ADMINS.includes(address.toLowerCase());

        // Hybrid: we will allow ANY authenticated user during this dev phase if the rule relaxation is still active,
        // BUT for "Safe" production mode we should implement the check.

        // Let's implement a 'admins' collection check for robustness
        const adminQuery = query(collection(db, 'admins'), where('walletAddress', '==', address));
        const snapshot = await getDocs(adminQuery);

        // Return true if found, OR if it's the specific dev wallet (if you want to hardcode one)
        // For debugging/demo, we might return true for now if no admins exist so you don't lock yourself out.
        const adminCountSnapshot = await getCountFromServer(collection(db, 'admins'));
        if (adminCountSnapshot.data().count === 0) {
            console.warn('No admins configured, allowing access for setup.');
            return true;
        }

        return !snapshot.empty;
    } catch (error) {
        console.error('Error verifying admin wallet:', error);
        return false;
    }
}

// Setup Helper
export async function registerFirstAdmin(address: string): Promise<void> {
    const adminRef = doc(db, 'admins', address.toLowerCase());
    await setDoc(adminRef, {
        uid: address,
        walletAddress: address,
        role: 'SUPER_ADMIN',
        permissions: ['all'],
        createdAt: Timestamp.now()
    });
}

// User Inspection
export async function getUserDetails(uid: string): Promise<UserProfile | null> {
    try {
        const userRef = doc(db, 'users', uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
            return { uid: snapshot.id, ...snapshot.data() } as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
}

export async function getUserHistory(uid: string): Promise<any[]> {
    try {
        const historyColl = collection(db, 'users', uid, 'history');
        const q = query(historyColl, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching user history:', error);
        return [];
    }
}

export async function getUserShares(uid: string): Promise<any[]> {
    try {
        const sharesColl = collection(db, 'shares');
        const q = query(sharesColl, where('ownerId', '==', uid));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching user shares:', error);
        return [];
    }
}

// Global File Management
export async function getAllHistory(limitCount = 20, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{ files: any[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    try {
        // collectionGroup query on 'history' across all users
        let q = query(collectionGroup(db, 'history'), orderBy('timestamp', 'desc'), limit(limitCount));

        if (lastDoc) {
            q = query(collectionGroup(db, 'history'), orderBy('timestamp', 'desc'), startAfter(lastDoc), limit(limitCount));
        }

        const snapshot = await getDocs(q);
        const files = snapshot.docs.map(doc => {
            // Reconstruct path to find owner? 
            // doc.ref.parent.parent.id should be the userId if structure is /users/{userId}/history/{docId}
            const userId = doc.ref.parent.parent?.id;
            return {
                id: doc.id,
                uid: userId, // Add owner ID to the record
                ...doc.data()
            };
        });
        const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

        return { files, lastDoc: newLastDoc };
    } catch (error) {
        console.error('Error fetching all history:', error);
        return { files: [], lastDoc: null };
    }
}

import { deleteDoc } from 'firebase/firestore';

export async function deleteUserFile(uid: string, fileId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'users', uid, 'history', fileId));
        // Note: Actual storage deletion should ideally be handled by a Cloud Function trigger on delete
        // or we need to call storage deletion here if we have the path.
        // For now, we remove the record.
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

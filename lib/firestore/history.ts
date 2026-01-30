import {
    collection,
    doc,
    addDoc,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    runTransaction,
    increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { HistoryItem } from '@/lib/firestore/types';

// Get user's conversion history
export async function getHistory(userId: string, maxItems = 50): Promise<HistoryItem[]> {
    try {
        const historyRef = collection(db, 'users', userId, 'history');
        const q = query(historyRef, orderBy('timestamp', 'desc'), limit(maxItems));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as HistoryItem[];
    } catch (error) {
        console.error('Error fetching history:', error);
        return [];
    }
}

// Add item to history and update user stats transactionally
export async function addToHistory(userId: string, item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<string | null> {
    try {
        const historyRef = collection(db, 'users', userId, 'history');
        const userRef = doc(db, 'users', userId);

        return await runTransaction(db, async (transaction) => {
            // 1. Add history doc
            const newHistoryDocRef = doc(historyRef);
            transaction.set(newHistoryDocRef, {
                ...item,
                timestamp: serverTimestamp(),
            });

            // 2. Update user stats
            transaction.update(userRef, {
                storageUsed: increment(item.fileSize || 0),
                filesEncrypted: increment(1),
                lastLogin: serverTimestamp(), // Update activity
            });

            return newHistoryDocRef.id;
        });
    } catch (error) {
        console.error('Error adding to history:', error);
        return null;
    }
}

// Delete history item
export async function deleteHistoryItem(userId: string, itemId: string): Promise<boolean> {
    try {
        await deleteDoc(doc(db, 'users', userId, 'history', itemId));
        return true;
    } catch (error) {
        console.error('Error deleting history item:', error);
        return false;
    }
}

// Clear all history
export async function clearHistory(userId: string): Promise<boolean> {
    try {
        const historyRef = collection(db, 'users', userId, 'history');
        const snapshot = await getDocs(historyRef);

        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        return true;
    } catch (error) {
        console.error('Error clearing history:', error);
        return false;
    }
}

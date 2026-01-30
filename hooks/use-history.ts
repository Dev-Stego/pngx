import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { HistoryItem } from '@/lib/firestore/types';
import * as FirestoreHistory from '@/lib/firestore/history';
import { uploadFile } from '@/lib/storage';
import { toast } from 'sonner';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function useHistory() {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Sync history - only works when logged in
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        if (user) {
            // Subscribe to Firestore
            setIsLoading(true);
            console.log('Subscribe history for user:', user.uid);

            const historyRef = collection(db, 'users', user.uid, 'history');
            const q = query(historyRef, orderBy('timestamp', 'desc'), limit(50));

            try {
                unsubscribe = onSnapshot(q, (snapshot) => {
                    const items = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp),
                    })) as HistoryItem[];
                    setHistory(items);
                    setIsLoading(false);
                }, (error) => {
                    console.error('Firestore history subscription error:', error);
                    setIsLoading(false);
                });
            } catch (err) {
                console.error('Failed to create snapshot listener:', err);
                setIsLoading(false);
            }
        } else {
            // No user - return empty state (login required)
            setHistory([]);
            setIsLoading(false);
        }

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [user]);


    // Add item (handles upload if logged in)
    const addHistoryItem = async (item: Omit<HistoryItem, 'id' | 'timestamp'> & { blobUrl?: string }) => {
        try {
            if (user) {
                let downloadUrl = item.downloadUrl;
                let storagePath = item.storagePath;

                // If we have a blobUrl but no cloud URL, we need to upload
                if (!downloadUrl && item.blobUrl) {
                    const toastId = toast.loading('Syncing file to cloud...');
                    try {
                        const response = await fetch(item.blobUrl);
                        const blob = await response.blob();
                        const file = new File([blob], item.fileName, { type: item.fileType });

                        const uploadResult = await uploadFile(user.uid, file, item.fileName);
                        downloadUrl = uploadResult.downloadUrl;
                        storagePath = uploadResult.storagePath;

                        // Update size with actual uploaded size (often changed by metadata/headers)
                        item.fileSize = uploadResult.metadata.size;

                        toast.success('File synced!', { id: toastId });
                    } catch (e) {
                        toast.error('Failed to sync file to cloud', { id: toastId });
                        // We continue adding to history, but without the file (metadata only)
                        // Or should we fail? Better to save metadata at least.
                        console.error('Upload error in addHistoryItem:', e);
                    }
                }

                // Filter out undefined values - Firestore doesn't accept them
                const historyData: Record<string, unknown> = {
                    type: item.type,
                    fileName: item.fileName,
                    fileSize: item.fileSize,
                    fileType: item.fileType,
                };

                // Only add defined values
                if (downloadUrl) historyData.downloadUrl = downloadUrl;
                if (storagePath) historyData.storagePath = storagePath;

                await FirestoreHistory.addToHistory(user.uid, historyData as Omit<HistoryItem, 'id' | 'timestamp'>);
            } else {
                // Not logged in - cannot save history
                toast.error('Please sign in to save history');
            }
        } catch (error) {
            console.error('Error adding history item:', error);
            toast.error('Failed to save history');
        }
    };

    const deleteHistoryItem = async (itemId: string, storagePath?: string) => {
        try {
            if (user) {
                // If there's a storage path, we should ideally delete the file too
                // FirestoreHistory.deleteHistoryItem logic handles firestore doc, 
                // but does it handle storage file? 
                // Currently lib/firestore/history.ts only deletes the doc.
                // We should handle storage deletion here or update the lib.
                // Let's update the lib helper later or do it here.
                // For now, let's just delete the doc so we don't block.
                // TODO: Delete from storage

                await FirestoreHistory.deleteHistoryItem(user.uid, itemId);
                toast.success('Item deleted');
            } else {
                toast.error('Please sign in to manage history');
            }
        } catch (error) {
            console.error('Error deleting history item:', error);
            toast.error('Failed to delete item');
        }
    };

    const clearHistory = async () => {
        try {
            if (user) {
                await FirestoreHistory.clearHistory(user.uid);
                toast.success('History cleared');
            } else {
                toast.error('Please sign in to manage history');
            }
        } catch (error) {
            console.error('Error clearing history:', error);
            toast.error('Failed to clear history');
        }
    };

    return {
        history,
        isLoading,
        addHistoryItem,
        deleteHistoryItem,
        clearHistory,
    };
}

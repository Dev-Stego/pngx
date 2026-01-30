import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { nanoid } from 'nanoid';
import { deleteFile } from '@/lib/storage';
import type { ShareLink } from '@/lib/firestore/types';

// Generate a unique share ID
export function generateShareId(): string {
    return nanoid(12);
}

// Create a share link
export async function createShareLink(
    ownerId: string,
    data: {
        fileName: string;
        fileType: string;
        fileSize: number;
        encryptedData?: string;
        downloadUrl?: string;
        storagePath?: string;
        thumbnail?: string;
        expiresInDays?: number;
        maxAccessCount?: number;
        password?: string;
    }
): Promise<string | null> {
    try {
        const shareId = generateShareId();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 7));

        // Build share data, filtering out undefined values
        const shareData: Record<string, unknown> = {
            ownerId,
            fileName: data.fileName,
            fileType: data.fileType,
            fileSize: data.fileSize,
            downloadUrl: data.downloadUrl,
            storagePath: data.storagePath,
            expiresAt,
            createdAt: serverTimestamp(),
            accessCount: 0,
            downloadCount: 0,
        };

        // Only add optional fields if defined
        if (data.encryptedData) shareData.encryptedData = data.encryptedData;
        if (data.thumbnail) shareData.thumbnail = data.thumbnail;
        if (data.maxAccessCount !== undefined) shareData.maxAccessCount = data.maxAccessCount;
        if (data.password) shareData.password = data.password;

        await setDoc(doc(db, 'shares', shareId), shareData);
        return shareId;
    } catch (error) {
        console.error('Error creating share link:', error);
        return null;
    }
}

// Get share link data
export async function getShareLink(shareId: string): Promise<ShareLink | null> {
    try {
        const shareDoc = await getDoc(doc(db, 'shares', shareId));

        if (!shareDoc.exists()) {
            return null;
        }

        const data = shareDoc.data() as Omit<ShareLink, 'id'>;

        // Check if expired
        const expiresAt = data.expiresAt instanceof Timestamp
            ? data.expiresAt.toDate()
            : new Date(data.expiresAt);

        if (expiresAt < new Date()) {
            // Delete expired link
            await deleteDoc(doc(db, 'shares', shareId));
            return null;
        }

        // Check max access count
        if (data.maxAccessCount && (data.accessCount || 0) >= data.maxAccessCount) {
            return null;
        }

        return {
            id: shareId,
            ...data,
        };
    } catch (error) {
        console.error('Error getting share link:', error);
        return null;
    }
}

// Delete share link
export async function deleteShareLink(shareId: string, ownerId: string): Promise<boolean> {
    try {
        const shareDoc = await getDoc(doc(db, 'shares', shareId));

        if (!shareDoc.exists()) {
            return false;
        }

        const data = shareDoc.data();
        if (data.ownerId !== ownerId) {
            return false;
        }

        // Delete associated file from storage if it exists
        if (data.storagePath) {
            await deleteFile(data.storagePath);
        }

        await deleteDoc(doc(db, 'shares', shareId));
        return true;
    } catch (error) {
        console.error('Error deleting share link:', error);
        return false;
    }
}

// Generate share URL
export function getShareUrl(shareId: string): string {
    if (typeof window === 'undefined') {
        return `/share/${shareId}`;
    }
    return `${window.location.origin}/share/${shareId}`;
}

// Get user shares
export async function getUserShares(ownerId: string): Promise<ShareLink[]> {
    try {
        const sharesRef = collection(db, 'shares');
        // Note: This query might require a composite index if we add orderBy('createdAt', 'desc')
        // For now, let's just query by ownerId and sort client-side if needed
        const q = query(sharesRef, where('ownerId', '==', ownerId));

        const snapshot = await getDocs(q);
        const shares: ShareLink[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data() as Omit<ShareLink, 'id'>;
            // Check if expired
            const expiresAt = data.expiresAt instanceof Timestamp
                ? data.expiresAt.toDate()
                : new Date(data.expiresAt);

            if (expiresAt > new Date()) {
                shares.push({
                    id: doc.id,
                    ...data,
                });
            }
        });

        // Client-side sort by createdAt desc
        return shares.sort((a, b) => {
            const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt as any);
            const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt as any);
            return dateB.getTime() - dateA.getTime();
        });

    } catch (error) {
        console.error('Error getting user shares:', error);
        return [];
    }
}

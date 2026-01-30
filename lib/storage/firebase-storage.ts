import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { nanoid } from 'nanoid';

// Folder structure: users/{userId}/files/{fileId}/{filename}

export interface UploadResult {
    fileId: string;
    downloadUrl: string;
    storagePath: string;
    metadata: {
        size: number;
        contentType: string;
        timeCreated: string;
    };
}

export async function uploadFile(
    userId: string,
    file: File | Blob,
    fileName: string,
    metadata: { contentType?: string } = {}
): Promise<UploadResult> {
    try {
        const fileId = nanoid();
        // Sanitize filename to prevent issues
        const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `users/${userId}/files/${fileId}/${safeName}`;
        const storageRef = ref(storage, storagePath);

        const snapshot = await uploadBytes(storageRef, file, metadata);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        return {
            fileId,
            downloadUrl,
            storagePath,
            metadata: {
                size: snapshot.metadata.size,
                contentType: snapshot.metadata.contentType || 'application/octet-stream',
                timeCreated: snapshot.metadata.timeCreated,
            }
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

export async function deleteFileHelper(storagePath: string): Promise<void> {
    try {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

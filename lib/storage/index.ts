/**
 * Storage Adapter
 * 
 * Provides a unified interface for file storage, supporting both Firebase Storage and AWS S3.
 * Set NEXT_PUBLIC_STORAGE_PROVIDER in .env.local to 's3' to use AWS S3, otherwise Firebase is used.
 */

import * as firebaseStorage from './firebase-storage';
import * as s3Storage from './s3-storage';

export type { UploadResult } from './firebase-storage';

// Determine which storage provider to use
const STORAGE_PROVIDER = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'firebase';

/**
 * Upload a file to the configured storage provider
 */
export async function uploadFile(
    userId: string,
    file: File | Blob,
    fileName: string,
    metadata: { contentType?: string } = {}
) {
    if (STORAGE_PROVIDER === 's3') {
        return s3Storage.uploadFile(userId, file, fileName, metadata);
    }
    return firebaseStorage.uploadFile(userId, file, fileName, metadata);
}

/**
 * Delete a file from the configured storage provider
 */
export async function deleteFile(storagePath: string): Promise<void> {
    if (STORAGE_PROVIDER === 's3') {
        return s3Storage.deleteFileHelper(storagePath);
    }
    return firebaseStorage.deleteFileHelper(storagePath);
}

/**
 * Get the current storage provider name
 */
export function getStorageProvider(): 'firebase' | 's3' {
    return STORAGE_PROVIDER as 'firebase' | 's3';
}

/**
 * Check if storage is properly configured
 */
export function isStorageConfigured(): boolean {
    if (STORAGE_PROVIDER === 's3') {
        return s3Storage.isS3Configured();
    }
    // Firebase is configured via firebase config
    return true;
}

/**
 * S3 Storage - Client-side module
 * 
 * Uses API routes for pre-signed URLs to handle S3 operations securely
 * without exposing AWS credentials in the browser.
 */

import { nanoid } from 'nanoid';

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

/**
 * Upload a file to AWS S3 via pre-signed URL
 */
export async function uploadFile(
    userId: string,
    file: File | Blob,
    fileName: string,
    metadata: { contentType?: string } = {}
): Promise<UploadResult> {
    try {
        // 1. Get pre-signed upload URL from API
        const response = await fetch('/api/s3', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'getUploadUrl',
                fileName,
                contentType: metadata.contentType || file.type || 'application/octet-stream',
                userId,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get upload URL');
        }

        const { uploadUrl, downloadUrl, fileId, storagePath } = await response.json();

        // 2. Upload file directly to S3 using pre-signed URL
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': metadata.contentType || file.type || 'application/octet-stream',
            },
        });

        if (!uploadResponse.ok) {
            throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        return {
            fileId,
            downloadUrl,
            storagePath,
            metadata: {
                size: file.size,
                contentType: metadata.contentType || file.type || 'application/octet-stream',
                timeCreated: new Date().toISOString(),
            },
        };
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw error;
    }
}

/**
 * Generate a fresh download URL for an existing file
 */
export async function getDownloadUrl(storagePath: string, fileName?: string): Promise<string> {
    const response = await fetch('/api/s3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'getDownloadUrl',
            storagePath,
            fileName,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get download URL');
    }

    const { downloadUrl } = await response.json();
    return downloadUrl;
}

/**
 * Delete a file from S3
 */
export async function deleteFileHelper(storagePath: string): Promise<void> {
    const response = await fetch('/api/s3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'delete',
            storagePath,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete file');
    }
}

/**
 * Check if S3 is properly configured
 */
export function isS3Configured(): boolean {
    // S3 configuration is checked server-side
    return Boolean(process.env.NEXT_PUBLIC_AWS_S3_BUCKET);
}

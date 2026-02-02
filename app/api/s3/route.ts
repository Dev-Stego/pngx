import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { 
    getUploadUrl as s3GetUploadUrl, 
    getDownloadUrl as s3GetDownloadUrl, 
    deleteObject 
} from '@/lib/aws/s3-rest';

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || '';

export async function POST(request: NextRequest) {
    try {
        const { action, fileName, contentType, userId, storagePath } = await request.json();

        if (!BUCKET_NAME) {
            return NextResponse.json(
                { error: 'S3 bucket not configured' },
                { status: 500 }
            );
        }

        if (action === 'getUploadUrl') {
            // Generate a pre-signed URL for uploading
            const fileId = nanoid();
            const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
            const key = `users/${userId}/files/${fileId}/${safeName}`;

            const uploadUrl = await s3GetUploadUrl(key, contentType || 'application/octet-stream', 3600);
            const downloadUrl = await s3GetDownloadUrl(key, undefined, 3600 * 24 * 7);

            return NextResponse.json({
                uploadUrl,
                downloadUrl,
                fileId,
                storagePath: key,
            });
        }

        if (action === 'getDownloadUrl') {
            // Generate a fresh download URL for existing file
            const name = fileName ? fileName.split('/').pop() : undefined;
            const downloadUrl = await s3GetDownloadUrl(storagePath, name, 3600 * 24);

            return NextResponse.json({ downloadUrl });
        }

        if (action === 'delete') {
            // Delete file from S3
            await deleteObject(storagePath);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('S3 API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Secure storage operation failed' },
            { status: 500 }
        );
    }
}

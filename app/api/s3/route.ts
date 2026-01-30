import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

// S3 client - server-side only, has access to secret credentials
const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

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

            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                ContentType: contentType || 'application/octet-stream',
            });

            const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

            // Also generate download URL
            const getCommand = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });
            const downloadUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 * 24 * 7 }); // 7 days

            return NextResponse.json({
                uploadUrl,
                downloadUrl,
                fileId,
                storagePath: key,
            });
        }

        if (action === 'getDownloadUrl') {
            // Generate a fresh download URL for existing file
            let disposition = undefined;
            if (fileName) {
                // Force download behavior with correct filename
                disposition = `attachment; filename="${fileName.split('/').pop()}"`;
            }

            const command = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: storagePath,
                ResponseContentDisposition: disposition,
            });
            const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 * 24 }); // 24 hours

            return NextResponse.json({ downloadUrl });
        }

        if (action === 'delete') {
            // Delete file from S3
            const command = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: storagePath,
            });
            await s3Client.send(command);

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('S3 API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'S3 operation failed' },
            { status: 500 }
        );
    }
}

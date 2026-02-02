/**
 * S3 REST API client for Cloudflare Workers
 * Uses fetch with AWS Signature v4 instead of the AWS SDK which doesn't work in edge runtime
 */

interface S3Config {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
}

function getS3Config(): S3Config {
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
    const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || '';

    if (!accessKeyId || !secretAccessKey || !bucket) {
        throw new Error('Missing AWS credentials or bucket configuration');
    }

    return { region, accessKeyId, secretAccessKey, bucket };
}

// AWS Signature V4 implementation
async function hmacSha256(key: ArrayBuffer | string, message: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const keyData = typeof key === 'string' ? encoder.encode(key) : key;
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
}

async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return arrayBufferToHex(hashBuffer);
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function getSignatureKey(
    secretKey: string,
    dateStamp: string,
    region: string,
    service: string
): Promise<ArrayBuffer> {
    const kDate = await hmacSha256('AWS4' + secretKey, dateStamp);
    const kRegion = await hmacSha256(kDate, region);
    const kService = await hmacSha256(kRegion, service);
    return hmacSha256(kService, 'aws4_request');
}

interface SignedUrlParams {
    method: string;
    key: string;
    expiresIn: number;
    contentType?: string;
    responseContentDisposition?: string;
}

/**
 * Generate a pre-signed URL for S3 operations
 */
export async function getSignedUrl(params: SignedUrlParams): Promise<string> {
    const config = getS3Config();
    const { method, key, expiresIn, contentType, responseContentDisposition } = params;

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    
    const host = `${config.bucket}.s3.${config.region}.amazonaws.com`;
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');
    
    // Build canonical query string
    const queryParams: Record<string, string> = {
        'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
        'X-Amz-Credential': `${config.accessKeyId}/${dateStamp}/${config.region}/s3/aws4_request`,
        'X-Amz-Date': amzDate,
        'X-Amz-Expires': expiresIn.toString(),
        'X-Amz-SignedHeaders': 'host',
    };

    if (contentType) {
        queryParams['Content-Type'] = contentType;
    }

    if (responseContentDisposition) {
        queryParams['response-content-disposition'] = responseContentDisposition;
    }

    // Sort and encode query parameters
    const sortedKeys = Object.keys(queryParams).sort();
    const canonicalQueryString = sortedKeys
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
        .join('&');

    // Create canonical request
    const canonicalHeaders = `host:${host}\n`;
    const signedHeaders = 'host';
    const payloadHash = 'UNSIGNED-PAYLOAD';

    const canonicalRequest = [
        method,
        '/' + encodedKey,
        canonicalQueryString,
        canonicalHeaders,
        signedHeaders,
        payloadHash,
    ].join('\n');

    // Create string to sign
    const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
    const stringToSign = [
        'AWS4-HMAC-SHA256',
        amzDate,
        credentialScope,
        await sha256(canonicalRequest),
    ].join('\n');

    // Calculate signature
    const signingKey = await getSignatureKey(
        config.secretAccessKey,
        dateStamp,
        config.region,
        's3'
    );
    const signatureBuffer = await hmacSha256(signingKey, stringToSign);
    const signature = arrayBufferToHex(signatureBuffer);

    // Build final URL
    const finalQueryString = `${canonicalQueryString}&X-Amz-Signature=${signature}`;
    return `https://${host}/${encodedKey}?${finalQueryString}`;
}

/**
 * Generate a pre-signed upload URL
 */
export async function getUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
): Promise<string> {
    return getSignedUrl({
        method: 'PUT',
        key,
        expiresIn,
        contentType,
    });
}

/**
 * Generate a pre-signed download URL
 */
export async function getDownloadUrl(
    key: string,
    fileName?: string,
    expiresIn: number = 86400
): Promise<string> {
    const disposition = fileName
        ? `attachment; filename="${fileName}"`
        : undefined;

    return getSignedUrl({
        method: 'GET',
        key,
        expiresIn,
        responseContentDisposition: disposition,
    });
}

/**
 * Delete an object from S3
 */
export async function deleteObject(key: string): Promise<void> {
    const config = getS3Config();
    
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    
    const host = `${config.bucket}.s3.${config.region}.amazonaws.com`;
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');

    // Create canonical request for DELETE
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
        'DELETE',
        '/' + encodedKey,
        '',
        canonicalHeaders,
        signedHeaders,
        'UNSIGNED-PAYLOAD',
    ].join('\n');

    // Create string to sign
    const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
    const stringToSign = [
        'AWS4-HMAC-SHA256',
        amzDate,
        credentialScope,
        await sha256(canonicalRequest),
    ].join('\n');

    // Calculate signature
    const signingKey = await getSignatureKey(
        config.secretAccessKey,
        dateStamp,
        config.region,
        's3'
    );
    const signatureBuffer = await hmacSha256(signingKey, stringToSign);
    const signature = arrayBufferToHex(signatureBuffer);

    // Build authorization header
    const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await fetch(`https://${host}/${encodedKey}`, {
        method: 'DELETE',
        headers: {
            'Host': host,
            'x-amz-date': amzDate,
            'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
            'Authorization': authorization,
        },
    });

    if (!response.ok && response.status !== 204) {
        const error = await response.text();
        throw new Error(`Failed to delete object: ${error}`);
    }
}

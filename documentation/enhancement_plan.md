# PNGX Enhancement Plan

## Overview
Three main improvements based on user feedback and research:
1. **SOC2-web Feature Adoption** - Beneficial features from the referenced repository
2. **Fix Misleading DropZone Text** - Correct the steganography file type messaging
3. **AWS S3 Migration** - Replace Firebase Storage with AWS S3

---

## 1. Ideas from SOC2-web Repository

### ✅ Features Worth Adopting

| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| **SHA256 Integrity Check** | Hash embedded in PNG to verify file wasn't corrupted during extraction | High | Medium |
| **Password Protection** | Optional password to encrypt hidden files (we already have this via our security note) | ✅ Already Have | - |
| **Bit Depth Control** | Allow 1-8 bits per channel for capacity vs quality tradeoff | Medium | Medium |
| **Capacity Display** | Show exact KB/MB capacity for selected depth | ✅ Already Have | - |
| **New Image Mode** | Generate new carrier image instead of requiring existing one | ✅ Already Have (Quick Mode) | - |

### 🎯 Recommended Enhancements

#### A. SHA256 Integrity Verification
**Why**: Ensures extracted files match original - critical for trust.
```
Current: File → Encrypt → Embed → PNG
Enhanced: File → SHA256 Hash → Encrypt → Embed Hash+Data → PNG
          PNG → Extract → Decrypt → Verify SHA256 → File
```

#### B. Bit Depth Selector (Optional - Nice to Have)
Allow users to choose steganography depth:
- **1 bit/channel**: Maximum stealth, minimum capacity
- **2-4 bits/channel**: Balanced (current default)
- **8 bits/channel**: Maximum capacity, visible artifacts

> [!NOTE]
> Our current implementation already uses LSB (1-2 bits), which is the most secure default. Bit depth control is advanced - consider adding as "Advanced Options" toggle.

---

## 2. Fix Misleading DropZone Text

### Problem
The DropZone shows: *"Support for images, docs, videos, and archives up to 50 MB"*

But steganography mode **only accepts PNG images** as the carrier/cover image.

### Solution
Make DropZone text **dynamic** based on context:

#### [MODIFY] [drop-zone.tsx](file:///Users/rae/Documents/code/test/file-png-file/pngx/components/ui/drop-zone.tsx)

Add new optional props for customization:
```typescript
interface DropZoneProps {
    onFileSelect: (file: File) => void;
    className?: string;
    maxSize?: number;
    disabled?: boolean;
    // NEW PROPS
    accept?: Record<string, string[]>;  // MIME type restrictions
    title?: string;                      // Custom title text
    description?: string;                // Custom description
}
```

**Usage in secure-processor.tsx:**
- **File to encode**: Keep current text (any file up to 50MB)
- **Cover image**: `accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}` with description "PNG or JPEG images only"

---

## 3. AWS S3 Migration

### Requirements from User
> "I have a problem with Firebase Storage (internal payment issue). Can we use AWS S3?"

### What I Need From You

To implement AWS S3 storage, please provide:

1. **AWS Access Key ID**
2. **AWS Secret Access Key** 
3. **S3 Bucket Name**
4. **AWS Region** (e.g., `us-east-1`, `ap-south-1`)

> [!IMPORTANT]
> For security, store these in `.env.local`:
> ```
> AWS_ACCESS_KEY_ID=your_access_key
> AWS_SECRET_ACCESS_KEY=your_secret_key
> AWS_S3_BUCKET=your-bucket-name
> AWS_REGION=us-east-1
> ```

### Proposed Implementation

#### [NEW] [s3-storage.ts](file:///Users/rae/Documents/code/test/file-png-file/pngx/lib/storage/s3-storage.ts)

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

export async function uploadFile(userId: string, file: File | Blob, fileName: string): Promise<UploadResult> {
    const fileId = nanoid();
    const key = `users/${userId}/files/${fileId}/${fileName}`;
    
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: Buffer.from(await (file as Blob).arrayBuffer()),
        ContentType: file.type,
    });
    
    await s3Client.send(command);
    
    // Generate pre-signed URL for download
    const downloadUrl = await getSignedUrl(s3Client, new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
    }), { expiresIn: 3600 * 24 * 7 }); // 7 days
    
    return { fileId, downloadUrl, storagePath: key, metadata: {...} };
}
```

#### Required NPM Package
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

#### CORS Configuration for S3 Bucket
You'll need to configure CORS in your S3 bucket settings:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
        "ExposeHeaders": []
    }
]
```

---

## Summary & Next Steps

| Task | Status | Action |
|------|--------|--------|
| SOC2-web research | ✅ Complete | SHA256 verification is valuable; bit-depth is optional |
| Fix DropZone text | 🔜 Ready | Will implement immediately |
| AWS S3 migration | ⏸️ Blocked | **Need AWS credentials from you** |

### Questions for You

1. **For AWS S3**: Do you have an existing S3 bucket, or should we create one? Please share the credentials listed above.

2. **For SOC2 features**: Would you like me to implement SHA256 integrity verification? It adds ~200 bytes overhead but ensures files aren't corrupted.

3. **Bit depth control**: Want this as an "Advanced Options" feature, or skip for now?

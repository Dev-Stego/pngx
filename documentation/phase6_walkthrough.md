# Phase 6: Enhancements & Storage Migration

## Summary
Completed research on SOC2-web repository, fixed misleading DropZone text, and implemented AWS S3 storage as an alternative to Firebase Storage.

---

## 1. SOC2-web Repository Research

### Analyzed Repository
[FettahFT/SOC2-web](https://github.com/FettahFT/SOC2-web) - A steganography web app for hiding files in PNG images.

### Valuable Features Identified

| Feature | Status | Notes |
|---------|--------|-------|
| SHA256 integrity verification | 📋 Recommended | Ensures extracted files aren't corrupted |
| Bit-depth control (1-8 bits/channel) | ⏸️ Optional | For advanced users wanting capacity vs stealth tradeoff |
| Password encryption | ✅ Already have | Our security note system provides this |
| Capacity display | ✅ Already have | Capacity meter shows percentage |
| Generate new carrier image | ✅ Already have | "Quick Mode" feature |

---

## 2. DropZone Text Fix

### Problem
The DropZone showed *"Support for images, docs, videos, and archives"* for ALL upload areas, but:
- **Cover image upload** only accepts images
- **Decode upload** only accepts PNG files

### Solution Implemented

#### Updated [drop-zone.tsx](file:///Users/rae/Documents/code/test/file-png-file/pngx/components/ui/drop-zone.tsx)

Added new props for customization:
```typescript
interface DropZoneProps {
    onFileSelect: (file: File) => void;
    className?: string;
    maxSize?: number;
    disabled?: boolean;
    accept?: Record<string, string[]>;  // NEW: MIME type filter
    title?: string;                      // NEW: Custom title
    description?: string;                // NEW: Custom description
}
```

#### Updated [secure-processor.tsx](file:///Users/rae/Documents/code/test/file-png-file/pngx/components/secure-processor.tsx)

| DropZone | Accept Filter | Description |
|----------|---------------|-------------|
| File to encrypt | *Any file* | "Any file type up to 50MB — docs, images, videos, archives, etc." |
| Cover image | `image/*` (.png, .jpg, .jpeg, .webp) | "PNG, JPG, or WebP images. Larger images = more capacity." |
| Decode (PNGX) | `image/png` (.png) | "Upload the encrypted PNG image to decode" |

---

## 3. AWS S3 Storage Implementation

### Created Files

#### [s3-storage.ts](file:///Users/rae/Documents/code/test/file-png-file/pngx/lib/storage/s3-storage.ts)
Complete AWS S3 storage module with:
- `uploadFile()` - Upload with pre-signed download URLs
- `getDownloadUrl()` - Generate fresh pre-signed URLs
- `deleteFileHelper()` - Delete files from S3
- `isS3Configured()` - Check if credentials are set

#### [index.ts](file:///Users/rae/Documents/code/test/file-png-file/pngx/lib/storage/index.ts)
Storage adapter that switches between providers:
```typescript
// Set NEXT_PUBLIC_STORAGE_PROVIDER=s3 in .env.local to use S3
const STORAGE_PROVIDER = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'firebase';
```

### Configuration Required

To use AWS S3, add these to `.env.local`:

```env
# Switch to S3
NEXT_PUBLIC_STORAGE_PROVIDER=s3

# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
NEXT_PUBLIC_AWS_S3_BUCKET=your-bucket-name
NEXT_PUBLIC_AWS_REGION=ap-south-1
```

### S3 Bucket CORS Configuration

Configure CORS in the S3 bucket settings (AWS Console → S3 → Bucket → Permissions → CORS):

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
        "ExposeHeaders": []
    }
]
```

---

## Verification

✅ Build passes successfully:
```
✓ Compiled successfully in 12.4s
✓ Generating static pages (7/7) in 954.0ms
```

---

## Next Steps

| Item | Status | Action Required |
|------|--------|-----------------|
| DropZone fix | ✅ Complete | None |
| S3 storage | ✅ Fixed | Restart dev server to test |
| Storage Capacity tooltip | ✅ Added | None |
| Test S3 | 🔜 Ready | Restart and try encoding + sharing |

---

## 4. S3 API Route Fix

### Problem
The original S3 implementation tried to use AWS SDK directly in the browser, but `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are server-only environment variables (no `NEXT_PUBLIC_` prefix), so they're inaccessible in the browser.

### Solution
Created `/api/s3` server route that:
1. Generates **pre-signed URLs** for uploads
2. Browser uploads directly to S3 using the pre-signed URL
3. No credentials exposed to client

#### [NEW] [route.ts](file:///Users/rae/Documents/code/test/file-png-file/pngx/app/api/s3/route.ts)
Server-side API handling:
- `getUploadUrl` - Returns pre-signed PUT URL
- `getDownloadUrl` - Returns pre-signed GET URL  
- `delete` - Deletes file from S3

#### [MODIFIED] [s3-storage.ts](file:///Users/rae/Documents/code/test/file-png-file/pngx/lib/storage/s3-storage.ts)
Now calls `/api/s3` instead of using SDK directly.

---

## Testing Instructions

1. **Restart dev server**: `npm run dev`
2. **Encode a file** with steganography
3. **Check Recent Activity** - should now save
4. **Try Share** - should create link successfully
5. **Hover over "Storage Capacity"** - see tooltip explanation

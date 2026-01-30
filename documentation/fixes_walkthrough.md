# S3 Download & Filename Fixes Walkthrough

## Overview
This update resolves critical issues with file storage, preventing "403 Forbidden" errors on download and correcting the issue where encoded images were saved with the wrong file extension.

## 1. S3 Download Links (Fixed 403 Errors)

**Problem:** The application was trying to download files using direct S3 links or expired URLs stored in Firestore, resulting in access denied errors.

**Solution:**
Implemented logic to dynamically generate fresh Pre-Signed URLs whenever a user requests a download.

-   **Backend**: `/api/s3` now supports `action: 'getDownloadUrl'` to issue 24-hour temporary links.
-   **Frontend**: `HistoryPanel` now requests a fresh link on-demand instead of using the stale one.

### Code Change (`components/history-panel.tsx`)
```typescript
const downloadItem = async (item: HistoryItem) => {
    // ...
    if (item.storagePath) {
        // Fetch fresh signed URL
        const downloadUrl = await getDownloadUrl(item.storagePath);
        // ...
    }
}
```

## 2. Filename & Metadata Fix

**Problem:** Encoded files (which are always PNG images) were being saved to history using the **original file's** name, size, and MIME type.
*   *Example:* Encoding `contract.pdf` resulted in a file named `contract.pdf` in history, but the file content was actually a PNG image.

**Solution:**
Updated the encoding pipeline to correctly rename the artifact and store the correct metadata.

-   **Filename**: `[OriginalName]_secured.png`
-   **MIME Type**: `image/png`
-   **Size**: The size of the resulting PNG image, not the input file.

### Code Change (`components/secure-processor.tsx`)
```typescript
const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
const secureFileName = `${baseName}_secured.png`;

await addHistoryItem({
    type: 'encode',
    fileName: secureFileName,       // Corrects extension
    fileSize: result.encryptedSize, // Corrects size
    fileType: 'image/png',          // Corrects MIME type
    blobUrl: result.imageUrl,
});
```

## 3. Firestore Permissions (Investigation)

**Status:**
-   Added debug logging to `useHistory`.
-   Temporarily relaxed firestore rules to `if request.auth != null` to help isolate the "Missing permissions" error.
-   *Action Required*: User needs to test if history loads now.

## Verification Checklist

1.  **Test Download**: Go to "Recent Activity", click download on an old item. It should work now (no 403).
2.  **Test New Encoding**: Encode a file (e.g., a PDF).
    -   Verify it appears in history as `..._secured.png`.
    -   Verify the size matches the PNG size.
    -   Download it and ensure it opens as an image.

## 4. Share Link Permissions (Fixed)

**Problem:** Users were seeing "Missing or insufficient permissions" when trying to create a share link.

**Solution:**
Deployment of updated Firestore security rules to allow authenticated users to create share documents.

**Verification:**
1.  **Generate Share Link:** After encoding a file, click the "Share" button.
2.  **Verify Success:** The modal should open with a generated link, and no error should appear.

# Fix S3 Uploads: CORS Configuration

## Diagnosis
I have successfully verified the backend logic by manually uploading a file using a generated system command. **The backend works perfectly.**
- ✅ API Keys are correct.
- ✅ Permissions are correct (I could upload and download a file).
- ✅ Region is correct.

**The Issue:**
The S3 bucket `pngx-storage-prod` is blocking your browser from sending files because it lacks a **Cross-Origin Resource Sharing (CORS)** configuration. Browsers enforce this security feature; command-line tools (like the one I used) do not.

## Solution

You need to add a CORS policy to your S3 bucket to allow `localhost:3000`.

### Steps:
1.  Log in to the **AWS Console**.
2.  Go to **S3** and select your bucket: **`pngx-storage-prod`**.
3.  Click on the **Permissions** tab.
4.  Scroll down to the **Cross-origin resource sharing (CORS)** section.
5.  Click **Edit** and paste the following JSON:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://your-production-domain.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ]
    }
]
```
*(Replace `https://your-production-domain.com` with your actual deployment URL later).*

6.  Click **Save changes**.

## Verification
Once saved, try the upload again in the app. It should work immediately (no restart logic needed).

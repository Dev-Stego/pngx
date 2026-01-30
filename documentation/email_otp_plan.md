# Firebase Email OTP Implementation Plan

## Overview

Implement passwordless email authentication using Firebase Email Link (sign-in link sent via email). This provides a secure, user-friendly alternative to traditional passwords.

## Firebase Email Link vs Traditional OTP

**We'll use Firebase Email Link** which:
- Sends a magic link to user's email
- User clicks link to authenticate
- More secure than 6-digit codes (no code to intercept)
- Better UX (one-click authentication)
- Firebase handles all security

## Implementation Steps

### 1. Firebase Console Configuration

**Enable Email Link Authentication:**
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Enable "Email link (passwordless sign-in)"
4. Configure authorized domains (add `localhost` for development)

### 2. Email Template Customization

**Customize the email template:**
1. Firebase Console → Authentication → Templates → Email link sign-in
2. Customize subject: "Sign in to PNGX"
3. Customize body with branding
4. Add app logo

### 3. Code Implementation

#### A. Update Auth Provider

**File:** `components/auth/auth-provider.tsx`

Add email link methods:
```typescript
const sendSignInLink = async (email: string) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/auth/verify`,
    handleCodeInApp: true,
  };
  
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
};

const completeSignIn = async (emailLink: string) => {
  const email = window.localStorage.getItem('emailForSignIn');
  if (!email) throw new Error('Email not found');
  
  await signInWithEmailLink(auth, email, emailLink);
  window.localStorage.removeItem('emailForSignIn');
};
```

#### B. Update Login Modal

**File:** `components/auth/login-modal.tsx`

Replace placeholder OTP logic:
```typescript
const handleSendOTP = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    await sendSignInLink(email);
    toast.success(`Sign-in link sent to ${email}`);
    setStep('otp'); // Show "check your email" screen
  } catch (error: any) {
    toast.error(error.message || 'Failed to send sign-in link');
  } finally {
    setLoading(false);
  }
};
```

#### C. Create Verification Page

**File:** `app/auth/verify/page.tsx`

Handle email link verification:
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { isSignInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export default function VerifyPage() {
  const router = useRouter();
  const { completeSignIn } = useAuth();

  useEffect(() => {
    const verify = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        try {
          await completeSignIn(window.location.href);
          router.push('/');
        } catch (error) {
          console.error(error);
          router.push('/?error=invalid-link');
        }
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Verifying your email...</p>
      </div>
    </div>
  );
}
```

#### D. Update OTP Screen UI

**File:** `components/auth/login-modal.tsx`

Change OTP screen to "Check Your Email":
```tsx
{step === 'otp' && (
  <div className="space-y-6 py-4">
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <MailCheck className="w-8 h-8 text-primary" />
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg">Check your email</h3>
        <p className="text-sm text-muted-foreground mt-2">
          We sent a sign-in link to <strong>{email}</strong>
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
        <p className="text-sm font-medium">Next steps:</p>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Open the email from PNGX</li>
          <li>Click the "Sign in to PNGX" button</li>
          <li>You'll be automatically signed in</li>
        </ol>
      </div>

      <Button
        variant="link"
        onClick={() => setStep('email')}
        className="text-xs"
      >
        Use a different email
      </Button>
    </div>
  </div>
)}
```

### 4. Security Considerations

**Rate Limiting:**
- Firebase automatically rate limits (3 emails per hour per IP)
- Additional rate limiting can be added via Cloud Functions

**Link Expiration:**
- Email links expire after 1 hour
- User must request a new link if expired

**Domain Verification:**
- Only authorized domains can complete sign-in
- Configure in Firebase Console

### 5. Testing Checklist

- [ ] Send email link successfully
- [ ] Receive email with sign-in link
- [ ] Click link and verify authentication
- [ ] Handle expired links gracefully
- [ ] Handle invalid links
- [ ] Test on different email providers (Gmail, Outlook, etc.)
- [ ] Test on mobile devices
- [ ] Verify rate limiting works

### 6. User Experience Flow

```
1. User enters email → Click "Send Sign-in Link"
2. Modal shows "Check your email" screen
3. User opens email → Clicks sign-in link
4. Redirected to /auth/verify
5. Automatic sign-in → Redirect to home
6. User menu shows authenticated state
```

### 7. Error Handling

**Common Errors:**
- `auth/invalid-email` → "Please enter a valid email"
- `auth/too-many-requests` → "Too many attempts. Try again later"
- `auth/invalid-action-code` → "This link has expired or is invalid"
- `auth/expired-action-code` → "This link has expired. Request a new one"

### 8. Alternative: Traditional 6-Digit OTP

If you prefer traditional OTP codes instead of email links, we can use:
- Firebase Phone Auth (SMS OTP)
- Custom backend with email OTP
- Third-party service (Twilio Verify, etc.)

**Recommendation:** Stick with Email Link - it's more secure and better UX.

## Next Steps

1. Enable Email Link in Firebase Console
2. Implement auth provider methods
3. Update login modal
4. Create verification page
5. Test end-to-end flow
6. Deploy and verify in production

## Estimated Time

- Firebase setup: 10 minutes
- Code implementation: 30 minutes
- Testing: 20 minutes
- **Total: ~1 hour**

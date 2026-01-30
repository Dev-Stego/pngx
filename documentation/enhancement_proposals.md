# Enhancement Proposals

Based on a comprehensive repository audit, here are the recommended enhancements for **PNGX V2**.

## 1. Architecture & Code Quality (High Priority)
### Refactor `SecureProcessor`
**Current State**: The `SecureProcessor` component is ~900 lines long, handling state, UI, and logic for all steps.
**Proposal**: Decompose into atomic sub-components:
- `components/secure-processor/step-upload.tsx`
- `components/secure-processor/step-mode.tsx`
- `components/secure-processor/step-encrypt.tsx`
- `components/secure-processor/capacity-indicator.tsx`
**Benefit**: Improves maintainability, readability, and performance (react rendering isolation).

### Implement `middleware.ts`
**Current State**: Auth protection is likely client-side (layout wrappers).
**Proposal**: Add `middleware.ts` to the root.
- Intercept requests to `/app/*`.
- Check session cookies/tokens.
- Redirect to `/` if unauthorized *before* rendering.
**Benefit**: Hardens security and prevents flash of protected content.

## 2. Performance & SEO (Medium Priority)
### Optimize Hero Images
**Current State**: `hero.tsx` uses `backgroundImage` style for the abstract glass effect.
**Proposal**: Replace with `next/image`.
```tsx
<Image
  src="/assets/landing/hero-abstract-glass.png"
  alt="Background"
  fill
  priority
  className="object-cover opacity-40 z-0"
/>
```
**Benefit**: Faster LCP (Largest Contentful Paint) and automatic WebP conversion.

### Dynamic Metadata & Social Cards
**Current State**: `layout.tsx` has static metadata.
**Proposal**: Add `generateMetadata` handlers and default OpenGraph images (`opengraph-image.tsx`).
**Benefit**: Better sharing previews on X/Twitter and Telegram.

## 3. Resilience & Ops (Low Priority)
### Error & Not Found Delineation
**Current State**: Default Next.js error pages.
**Proposal**: Create custom `app/global-error.tsx` and `app/not-found.tsx` with the branded "Glitch" aesthetic.
**Benefit**: Keeps users within the immersive experience even when errors occur.

### Content Security Policy (CSP)
**Current State**: No strict headers in `next.config.ts`.
**Proposal**: Configure `headers()` in `next.config.ts` to set `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`.
**Benefit**: Prevents clickjacking and other common vector attacks.

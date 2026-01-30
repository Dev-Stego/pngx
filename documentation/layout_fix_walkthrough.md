
### Layout Fixes: Double Header/Footer Resolution

**Issue:**
Pages within the `(marketing)` route group (specifically `/docs/*` and `/legal/*` pages) were displaying two sets of headers and footers. This occurred because the individual page components were manually rendering `SiteHeader` and `SiteFooter`, while `(marketing)/layout.tsx` was also rendering them.

**Resolution:**
We removed the redundant `SiteHeader`, `SiteFooter`, and `<main>` wrapper elements from the following pages, allowing them to correctly inherit the single unified layout from `app/(marketing)/layout.tsx`:

- `app/(marketing)/docs/audit/page.tsx`
- `app/(marketing)/legal/terms/page.tsx`
- `app/(marketing)/docs/guide/page.tsx`
- `app/(marketing)/docs/blockchain/page.tsx`
- `app/(marketing)/docs/encryption/page.tsx`
- `app/(marketing)/legal/privacy/page.tsx`

**Verification:**
- Verified that all pages now export a clean component containing only the content sections.
- Ensured no syntax errors (e.g., double `return` statements) remained after the refactor.

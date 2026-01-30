# Authentication Modal - Backdrop Opacity Fix

## Problem
The authentication modal had a semi-transparent backdrop (50% opacity) that allowed too much background content to show through, making the modal text harder to read and creating visual distraction.

## Solution
Increased backdrop opacity from **50% to 80%** for better focus and legibility.

## Before & After Comparison

### Before (50% Opacity)
![Before - Light Backdrop](file:///Users/rae/.gemini/antigravity/brain/dd761c29-f2d3-4daa-87a6-d9cfdb0bc63f/auth_modal_overview_1768932786569.png)

**Issues:**
- Background text ("Hide anything in plain sight") clearly visible
- "Start Encrypting" and "How it works" buttons visible through modal
- Reduced contrast makes modal content harder to read
- Visual distraction from background elements

### After (80% Opacity)
![After - Dark Backdrop](file:///Users/rae/.gemini/antigravity/brain/dd761c29-f2d3-4daa-87a6-d9cfdb0bc63f/auth_modal_dark_backdrop_1768933309193.png)

**Improvements:**
- ✅ Background content significantly dimmed
- ✅ Modal text ("Welcome to PNGX") stands out clearly
- ✅ Better visual hierarchy and focus
- ✅ Reduced eye strain
- ✅ Professional, polished appearance

## Technical Change

**File:** `components/ui/dialog.tsx`

```diff
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
-       "... bg-black/50",
+       "... bg-black/80",
        className
      )}
      {...props}
    />
  )
}
```

## Result

The authentication modal now provides:
- **Better legibility** - Text is easier to read
- **Improved focus** - User attention drawn to modal content
- **Professional appearance** - Darker backdrop is industry standard
- **Maintained glassmorphism** - Modal still has modern aesthetic

## User Feedback
✅ User confirmed improved legibility
✅ Modal flow fully functional
✅ Ready for backend implementation

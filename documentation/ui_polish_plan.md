# UI/UX Polish: Glassmorphism & Blur Fixes

## Problem
Popups and overlays show through background content. The app uses glassmorphism inconsistently:
- ✅ **Dialog** - Has proper blur (`backdrop-blur-xl` on overlay, `backdrop-blur-2xl` on content)
- ❌ **Sheet** - Overlay uses `bg-black/50` without blur
- ❌ **Select Content** - Uses solid `bg-popover` without blur
- ❌ **Dropdown Menu** - Uses solid `bg-popover` without blur

## Proposed Changes

### UI Components

---

#### [MODIFY] [sheet.tsx](file:///Users/rae/Documents/code/test/file-png-file/pngx/components/ui/sheet.tsx)
Add `backdrop-blur-xl` to `SheetOverlay` and `backdrop-blur-2xl bg-background/95` to `SheetContent`:
```diff
- "bg-black/50"
+ "bg-black/80 backdrop-blur-xl"
```
```diff
- "bg-background"
+ "bg-background/95 backdrop-blur-2xl"
```

---

#### [MODIFY] [select.tsx](file:///Users/rae/Documents/code/test/file-png-file/pngx/components/ui/select.tsx)
Add blur to `SelectContent`:
```diff
- "bg-popover"
+ "bg-popover/95 backdrop-blur-xl"
```

---

#### [MODIFY] [dropdown-menu.tsx](file:///Users/rae/Documents/code/test/file-png-file/pngx/components/ui/dropdown-menu.tsx)
Add blur to `DropdownMenuContent` and `DropdownMenuSubContent`:
```diff
- "bg-popover"
+ "bg-popover/95 backdrop-blur-xl"
```

---

### CSS Variables

#### [MODIFY] [globals.css](file:///Users/rae/Documents/code/test/file-png-file/pngx/app/globals.css)
Update popover color for better translucency:
```diff
- --popover: 240 10% 4%;
+ --popover: 240 10% 6%;  /* Slightly lighter for blur visibility */
```

## Verification
1. Open app → Click Share modal → Verify blurred background
2. Click Select dropdowns → Verify glass effect
3. Open user menu dropdown → Verify blur
4. Test all on mobile viewport

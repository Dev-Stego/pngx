
### App UI/UX Fixes

**Issues Resolved:**
1.  **Header Overlap:** Profile and History page titles were hidden under the fixed navigation bar.
2.  **Missing Settings:** The "Settings" option was missing from the user profile dropdown.
3.  **Duplicate Icons:** "History" was using the same icon as "Profile".
4.  **Dashboard Divider:** The "Recent Activity" section on the main dashboard layout separation.

**Changes:**

#### 1. Fixed Header Overlap
Updated `FullPageModal` (used by Profile, History, and Settings pages) to include top padding, ensuring content starts below the fixed header.

```diff
- <div className="container mx-auto px-4 py-6 min-h-screen flex flex-col max-w-4xl">
+ <div className="container mx-auto px-4 pt-24 pb-6 min-h-screen flex flex-col max-w-4xl">
```

#### 2. Updated Navigation Menu
Modified `AppHeader` to include a link to the Settings page and updated the History icon to a `Clock` for better visual distinction.

```tsx
<DropdownMenuItem asChild>
    <Link href="/history">
        <Clock className="mr-2 h-4 w-4" /> {/* Was UserCircle */}
        <span>History</span>
    </Link>
</DropdownMenuItem>
<DropdownMenuItem asChild>
    <Link href="/settings">
        <Settings className="mr-2 h-4 w-4" />
        <span>Settings</span>
    </Link>
</DropdownMenuItem>
```

#### 3. Dashboard Divider
Added a subtle gradient divider to the main application page to separate the core functionality from the history panel.

```tsx
<div className="mt-16">
    <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-12" />
    <HistoryPanel />
</div>
```

**Verification:**
- **Profile/History/Settings Pages:** Content should now be fully visible and not obscured by the header.
- **Navigation:** Dropdown now shows "Settings" and "History" has a unique icon.
- **Dashboard:** A visual separator now exists before the history section.

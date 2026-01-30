# PNGX - Admin PRD

## Overview

The Admin Panel is a restricted section of the web app (`/admin`) accessible only to users with the `super_admin` or `moderator` role. It provides oversight, statistics, and user management capabilities.

## Access Control

- **Authentication**: Standard Firebase Login.
- **Authorization**: Checked via Custom Token Claims (`isAdmin === true`) in Next.js Middleware. If check fails, redirect to `/dashboard` or 404.

---

## Modules

### 1. Overview Dashboard (Home)
**Visuals**: High-level charts (Recharts).
- **Key Metrics Cards**:
    - Total Users (Active/Total)
    - Files Encoded (24h / All Time)
    - Blockchain Backups (Count)
    - Storage Used (Temporary Shares)
- **Activity Graph**: Line chart showing "Encodes vs Decodes" over last 30 days.

### 2. User Management
**Interface**: Data Table with Search/Filter.
- **Columns**:
    - Avatar/Name
    - Email (Obfuscated for Moderators, Visible for Super Admin)
    - Joined Date
    - Status (Active/Suspended)
    - Role
- **Actions**:
    - "Suspend User": Prevents login.
    - "Delete User": Gdpr wipe.
    - "View History": Read-only view of their file log (Metadata only).

### 3. Content Safety (Abuse Reports)
*Since files are private, this applies primarily to **Public Shares** that might be reported.*
- **List View**: Reported Share Links.
- **Details**:
    - Reporter Reason (e.g., "Malware", "Illegal Content").
    - File Metadata (Size, Type).
    - **Action**: "Takedown" (Deletes from Storage immediately).

### 4. System Settings
- **Global Config**:
    - `maintenance_mode` (bool): Shows "Under Maintenance" on frontend.
    - `max_share_size_mb` (number): Limit for temporary shares.
    - `allow_registrations` (bool): Close signups temporarily.

---

## UX/UI

- **Theme**: Distinct from the main app. Perhaps a "Command Line" or "Industrial" aesthetic, or simply a Sidebar layout with different accent color (Red/Orange) to indicate privileged context.
- **Feedback**: All destructive actions (Ban, Delete) require a "Type CONFIRM" modal.

---

## Future Roadmap

- **Broadcast System**: Send in-app notification to all active users (e.g., "System Maintenance in 10 mins").
- **Revenue Dashboard**: If Premium plans are added.

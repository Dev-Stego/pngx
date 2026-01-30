import { Timestamp } from 'firebase/firestore';

// User Profile
export interface UserProfile {
    uid: string;
    email?: string;
    displayName: string | null;
    photoURL: string | null;
    walletAddress?: string; // Web3 wallet address
    createdAt: Timestamp;
    lastLogin: Timestamp;
    isPremium: boolean;
    status: 'active' | 'suspended' | 'banned';
    storageUsed: number; // bytes
    filesEncrypted: number; // total files processed
    socials: {
        twitter?: string;
        github?: string;
        linkedin?: string;
    };
    preferences: {
        theme: 'dark' | 'light' | 'system';
        useHardwareAccel: boolean;
    };
}

// History Item (for cloud-synced history page)
export interface HistoryItem {
    id?: string;
    type: 'encode' | 'decode';
    fileName: string;
    fileSize: number;
    fileType: string;
    timestamp: Timestamp | Date;
    downloadUrl?: string;
    storagePath?: string;
    shareId?: string;
}

// Share Link
export interface ShareLink {
    id: string; // shareId
    ownerId: string; // uid
    fileName: string;
    fileSize: number;
    fileType: string;
    encryptedData?: string;
    password?: string;
    expiresAt: Timestamp | Date;
    maxDownloads?: number;
    downloadCount: number;
    accessCount?: number;
    maxAccessCount?: number;
    createdAt: Timestamp | Date;
    downloadUrl?: string;
    storagePath?: string;
    thumbnail?: string;
}

// Admin User
export interface AdminUser {
    uid: string;
    role: 'SUPER_ADMIN' | 'MODERATOR';
    permissions: string[]; // ['ban_users', 'view_analytics', etc.]
    createdAt: Timestamp;
}

// Daily Stats
export interface DailyStats {
    date: string; // YYYY-MM-DD
    encodes: number;
    decodes: number;
    newUsers: number;
    totalVolume: number; // bytes
}

// Wallet Link (for wallet-to-user mapping)
export interface WalletLink {
    uid: string;
    address: string;
    linkedAt: Timestamp;
}

// System Settings (Global Config)
export interface SystemSettings {
    maintenanceMode: boolean;
    allowNewRegistrations: boolean;
    maxUploadSizeMB: number;
    restrictedFileTypes: string[]; // e.g., ['.exe', '.sh']
    updatedAt: Timestamp;
    updatedBy: string; // admin uid
}

// Activity Log System
export interface ActivityLog {
    id: string;
    type: 'auth' | 'system' | 'user_action' | 'admin_action';
    action: string;
    details?: string;
    uid?: string; // User who performed the action (if any)
    ip?: string;
    timestamp: Timestamp;
}

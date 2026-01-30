'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Mail, Wallet, FileText, Database, Share2, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { getUserDetails, getUserHistory, getUserShares } from '@/lib/firestore/admin';
import type { UserProfile } from '@/lib/firestore/types';

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const uid = params.uid as string;

    const [user, setUser] = React.useState<UserProfile | null>(null);
    const [history, setHistory] = React.useState<any[]>([]);
    const [shares, setShares] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            if (!uid) return;
            try {
                const [userData, historyData, sharesData] = await Promise.all([
                    getUserDetails(uid),
                    getUserHistory(uid),
                    getUserShares(uid)
                ]);
                setUser(userData);
                setHistory(historyData);
                setShares(sharesData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [uid]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-muted-foreground">User not found.</p>
                <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    // Calculate Storage (approx)
    // Note: History items usually store 'fileSize'.
    const totalStorage = history.reduce((acc, item) => acc + (item.fileSize || 0), 0);
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
                    <p className="text-sm text-muted-foreground">UID: {uid}</p>
                </div>
            </div>

            {/* Profile Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Avatar className="w-24 h-24 border-4 border-muted">
                            <AvatarImage src={user.photoURL || undefined} />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                {user.displayName?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold">{user.displayName || 'Anonymous User'}</h2>
                                    <Badge variant={(user.status || 'active') === 'active' ? 'default' : 'destructive'}>
                                        {(user.status || 'active').toUpperCase()}
                                    </Badge>
                                    {user.isPremium && <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-orange-600 border-orange-200">Premium</Badge>}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 mt-2 text-sm text-muted-foreground">
                                    {user.email && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" /> {user.email}
                                        </div>
                                    )}
                                    {user.walletAddress && (
                                        <div className="flex items-center gap-1 font-mono">
                                            <Wallet className="w-4 h-4" /> {user.walletAddress}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Joined {user.createdAt ? format(user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt as any), 'PPP') : 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                        <FileText className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{history.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                        <Database className="w-4 h-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatBytes(totalStorage)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Aggregated file size</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Shares</CardTitle>
                        <Share2 className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{shares.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Data Tabs */}
            <Tabs defaultValue="files" className="w-full">
                <TabsList>
                    <TabsTrigger value="files">Recorded Files</TabsTrigger>
                    <TabsTrigger value="shares">Active Shares</TabsTrigger>
                    <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>

                <TabsContent value="files" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>File History</CardTitle>
                            <CardDescription>All files processed by this user.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {history.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-card text-sm">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-mono uppercase shrink-0">
                                                {file.fileType?.split('/')[1] || 'FILE'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{file.fileName}</p>
                                                <p className="text-xs text-muted-foreground">{formatBytes(file.fileSize || 0)} • {file.type === 'encode' ? 'Encrypted' : 'Decrypted'}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                            {file.timestamp ? formatDistanceToNow(file.timestamp.toDate ? file.timestamp.toDate() : new Date(file.timestamp), { addSuffix: true }) : ''}
                                        </div>
                                    </div>
                                ))}
                                {history.length === 0 && <p className="text-center py-8 text-muted-foreground">No history found.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="shares" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Shares</CardTitle>
                            <CardDescription>Links currently shared by this user.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {shares.map((share) => (
                                    <div key={share.id} className="flex items-center justify-between p-3 border rounded-lg bg-card text-sm">
                                        <div>
                                            <p className="font-medium">{share.fileName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Downloads: {share.downloadCount} / {share.maxDownloads === -1 ? '∞' : share.maxDownloads}
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Expires {share.expiresAt ? formatDistanceToNow(share.expiresAt.toDate ? share.expiresAt.toDate() : new Date(share.expiresAt), { addSuffix: true }) : 'Never'}
                                        </div>
                                    </div>
                                ))}
                                {shares.length === 0 && <p className="text-center py-8 text-muted-foreground">No active shares found.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="raw" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Debug Profile</CardTitle></CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-[400px]">
                                {JSON.stringify(user, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

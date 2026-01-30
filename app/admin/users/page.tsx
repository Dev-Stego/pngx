'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllUsers } from '@/lib/firestore/admin';
import type { UserProfile } from '@/lib/firestore/types';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Mail, Wallet, Copy, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Ban, PauseCircle, Trash2, CheckCircle } from 'lucide-react';
import { updateUserStatus } from '@/lib/firestore/admin';

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = React.useState<UserProfile[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [lastDoc, setLastDoc] = React.useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = React.useState(false);

    const fetchUsers = async (startAfterDoc?: QueryDocumentSnapshot<DocumentData>) => {
        try {
            const result = await getAllUsers(20, startAfterDoc);
            if (startAfterDoc) {
                setUsers(prev => [...prev, ...result.users]);
            } else {
                setUsers(result.users);
            }
            setLastDoc(result.lastDoc);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const handleLoadMore = () => {
        if (lastDoc) {
            setLoadingMore(true);
            fetchUsers(lastDoc);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const handleStatusChange = async (uid: string, status: 'active' | 'suspended' | 'banned') => {
        try {
            await updateUserStatus(uid, status);
            toast.success(`User marked as ${status}`);
            // Optimistic update
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status } : u));
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">Manage and view registered users.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setLoading(true); fetchUsers(); }}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Directory</CardTitle>
                    <CardDescription>All users registered on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.map((user) => (
                            <div
                                key={user.uid}
                                onClick={() => router.push(`/admin/users/${user.uid}`)}
                                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={user.photoURL || undefined} />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {user.displayName?.[0] || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="group-hover:translate-x-1 transition-transform duration-200">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{user.displayName || 'Anonymous'}</h3>
                                            {user.isPremium && <Badge variant="default" className="text-[10px] h-5">Premium</Badge>}
                                            {user.status === 'banned' && <Badge variant="destructive" className="text-[10px] h-5">Banned</Badge>}
                                            {user.status === 'suspended' && <Badge variant="secondary" className="text-[10px] h-5 text-orange-500 bg-orange-500/10 border-orange-500/20">Suspended</Badge>}
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground mt-1">
                                            {user.email && (
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                            )}
                                            {user.walletAddress && (
                                                <div className="flex items-center gap-1" title={user.walletAddress}>
                                                    <Wallet className="w-3 h-3" />
                                                    <span className="font-mono">
                                                        {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-muted-foreground">Joined</p>
                                        <p className="text-sm font-medium">
                                            {/* @ts-ignore timestamp handling */}
                                            {user.createdAt ? formatDistanceToNow(user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt.seconds ? user.createdAt.seconds * 1000 : user.createdAt as any), { addSuffix: true }) : 'Unknown'}
                                        </p>
                                    </div>

                                    {/* Action Menu */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.uid}`)}>
                                                <ChevronRight className="w-4 h-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => copyToClipboard(user.uid, 'User ID')}>
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copy ID
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {user.status === 'banned' ? (
                                                <DropdownMenuItem onClick={() => handleStatusChange(user.uid, 'active')} className="text-green-600">
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Unban User
                                                </DropdownMenuItem>
                                            ) : (
                                                <>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(user.uid, 'suspended')} className="text-orange-600">
                                                        <PauseCircle className="w-4 h-4 mr-2" />
                                                        Suspend User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(user.uid, 'banned')} className="text-red-600">
                                                        <Ban className="w-4 h-4 mr-2" />
                                                        Ban User
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}

                        {users.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                No users found.
                            </div>
                        )}

                        {lastDoc && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        'Load More'
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

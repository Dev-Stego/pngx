'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileImage, ShieldCheck, Activity, Loader2, RefreshCw } from 'lucide-react';
import { getAdminStats, getRecentUsers, getRecentActivity } from '@/lib/firestore/admin';
import type { AdminStats } from '@/lib/firestore/admin';
import type { UserProfile, ActivityLog } from '@/lib/firestore/types';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
    const [stats, setStats] = React.useState<AdminStats | null>(null);
    const [recentUsers, setRecentUsers] = React.useState<UserProfile[]>([]);
    const [recentActivity, setRecentActivity] = React.useState<ActivityLog[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchData = React.useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const [statsData, usersData, activityData] = await Promise.all([
                getAdminStats(),
                getRecentUsers(5),
                getRecentActivity(5)
            ]);
            setStats(statsData);
            setRecentUsers(usersData);
            setRecentActivity(activityData);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
            if (isRefresh) setRefreshing(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // ... statCards ...
    const statCards = [
        {
            label: 'Total Users',
            value: stats?.totalUsers.toLocaleString() || '0',
            icon: Users,
            color: 'text-blue-500'
        },
        {
            label: 'Encrypted Files',
            value: stats?.encryptedFiles.toLocaleString() || '0',
            icon: FileImage,
            color: 'text-primary'
        },
        {
            label: 'Active Shares',
            value: stats?.activeShares.toLocaleString() || '0',
            icon: ShieldCheck,
            color: 'text-green-500'
        },
        {
            label: 'System Status',
            value: 'Online',
            icon: Activity,
            color: 'text-orange-500'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">System overview and key metrics.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={refreshing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.label}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    Real-time data
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((log) => (
                                <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/40 text-sm">
                                    <Activity className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium">{log.action}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(log.timestamp?.toDate ? log.timestamp.toDate() : new Date(), { addSuffix: true })}
                                            </span>
                                        </div>
                                        {log.details && (
                                            <p className="text-muted-foreground text-xs mt-1">{log.details}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                    <p className="text-sm">No recent activity logged.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentUsers.map((user) => (
                                <div key={user.uid} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                        {user.displayName?.[0] || 'U'}
                                    </div>
                                    <div className="flex-1 space-y-1 min-w-0">
                                        <p className="text-sm font-medium leading-none truncate">{user.displayName || 'Anonymous User'}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email || user.walletAddress || `UID: ${user.uid.slice(0, 8)}...`}</p>
                                    </div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt as any), { addSuffix: true })}
                                    </div>
                                </div>
                            ))}
                            {recentUsers.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No users found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

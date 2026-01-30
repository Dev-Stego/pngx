'use client';

import * as React from 'react';
import { useAuth } from '@/components/auth/auth-provider';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Shield, Sparkles, User, Mail, Wallet, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { FullPageModal } from '@/components/ui/full-page-modal';

export default function SettingsPage() {
    const { user } = useAuth();
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        // Placeholder for future delete logic
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.error('Account deletion is restricted in this demo build.');
        setIsDeleting(false);
    };

    const Content = () => {
        if (!user) {
            return (
                <div className="py-20 text-center space-y-4">
                    <p className="text-muted-foreground">Please sign in to view your settings.</p>
                </div>
            );
        }

        const hasEmail = !!user.email;
        const hasWallet = !!user.walletAddress;
        const isWalletOnly = hasWallet && !hasEmail;

        return (
            <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* 1. Account Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            <CardTitle>Account</CardTitle>
                        </div>
                        <CardDescription>Your personal information and identity.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                            <Avatar className="w-20 h-20 border-2 border-primary/10">
                                <AvatarImage src={user.photoURL || undefined} />
                                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-purple-600 text-white">
                                    {isWalletOnly ? <Wallet className="w-8 h-8" /> : (user.displayName?.[0] || 'U')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1 flex-1">
                                <h3 className="font-semibold text-lg">{user.displayName || 'Anonymous User'}</h3>
                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                    {hasEmail && (
                                        <Badge variant="secondary" className="font-normal">
                                            <Mail className="w-3 h-3 mr-1" /> {user.email}
                                        </Badge>
                                    )}
                                    {hasWallet && (
                                        <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary bg-primary/5">
                                            <Wallet className="w-3 h-3 mr-1" />
                                            {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground pt-1">
                                    User ID: <span className="font-mono opacity-70">{user.uid}</span>
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-destructive flex items-center gap-2">
                                <Shield className="w-4 h-4" /> Danger Zone
                            </h4>
                            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                                <div className="space-y-1">
                                    <p className="font-medium text-destructive">Delete Account</p>
                                    <p className="text-xs text-muted-foreground">Permanently remove all data and history.</p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Processing...' : (
                                        <>
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Appearance Card - REMOVED (Dark Mode Only) */}

                {/* 3. About Card */}
                <Card className="bg-muted/10 border-none shadow-none">
                    <CardContent className="pt-6 text-center space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">PNGX Secure Environment</p>
                        <p className="text-xs text-muted-foreground opacity-50">Version 1.0.0 (Beta) • Build 2024.05</p>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <FullPageModal
            title="Settings"
            description="Manage your preferences and account details."
        >
            <Content />
        </FullPageModal>
    );
}

'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { useHistory } from '@/hooks/use-history';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Save,
    Loader2,
    Crown,
    HardDrive,
    Link2,
    Wallet,
    Twitter,
    Github,
    LogOut,
    Sparkles,
    Mail,
    CheckCircle2,
    Shield,


    Plus,
    Share2,
    Eye,
    Clock,
    Trash2,
    Copy,
    ExternalLink
} from 'lucide-react';
import { getUserShares, deleteShareLink, getShareUrl } from '@/lib/firestore/shares';
import { ShareLink } from '@/lib/firestore/types';
import { formatDistanceToNow } from 'date-fns';
import { FullPageModal } from '@/components/ui/full-page-modal';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading, updateProfile, signOut, linkWallet, linkEmail, refreshProfile } = useAuth();
    const [saving, setSaving] = React.useState(false);
    const [displayName, setDisplayName] = React.useState('');
    const [twitter, setTwitter] = React.useState('');
    const [github, setGithub] = React.useState('');
    const [linkingWallet, setLinkingWallet] = React.useState(false);
    const [showEmailLink, setShowEmailLink] = React.useState(false);
    const [linkEmail_, setLinkEmail_] = React.useState('');
    const { history } = useHistory();

    // Calculate total storage used from history items
    const totalStorage = React.useMemo(() => {
        return history.reduce((acc, item) => acc + (item.fileSize || 0), 0);
    }, [history]);

    // Wagmi hooks for wallet linking
    const { openConnectModal, connectModalOpen } = useConnectModal();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    // Refresh user state on mount (for redirects from verify page)
    React.useEffect(() => {
        // Check if we just came back from email linking
        const savedProfile = typeof window !== 'undefined'
            ? window.localStorage.getItem('walletUserProfile')
            : null;
        if (savedProfile && refreshProfile) {
            // Clear it so we don't loop
            window.localStorage.removeItem('walletUserProfile');

            // Small delay to ensure auth context is ready
            const timer = setTimeout(() => {
                refreshProfile();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [refreshProfile]);
    const { signMessageAsync } = useSignMessage();

    React.useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setTwitter(user.socials?.twitter || '');
            setGithub(user.socials?.github || '');
        }
    }, [user]);

    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    // Handle wallet link after connection
    React.useEffect(() => {
        if (isConnected && address && linkingWallet && !connectModalOpen) {
            handleWalletLinkSign();
        }
    }, [isConnected, address, linkingWallet, connectModalOpen]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        try {
            await updateProfile({
                displayName,
                socials: {
                    twitter,
                    github,
                },
            });
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        if (isConnected) {
            disconnect();
        }
        await signOut();
        router.push('/');
    };

    const handleLinkWallet = () => {
        setLinkingWallet(true);
        if (openConnectModal) {
            openConnectModal();
        }
    };

    const handleWalletLinkSign = async () => {
        if (!address || !user) {
            setLinkingWallet(false);
            return;
        }

        const toastId = toast.loading('Sign to link wallet...');

        try {
            const message = `Link wallet to PNGX account\n\nWallet: ${address}\nAccount: ${user.email || user.uid}\nTimestamp: ${new Date().toISOString()}`;
            const signature = await signMessageAsync({ message });

            toast.dismiss(toastId);

            if (linkWallet) {
                await linkWallet(address, signature, message);
                toast.success('Wallet linked successfully!');
            }
        } catch (error: any) {
            toast.dismiss(toastId);
            console.error('Wallet link error:', error);

            if (error.message?.includes('rejected') || error.message?.includes('denied')) {
                toast.error('Signature rejected');
            } else {
                toast.error(error.message || 'Failed to link wallet');
            }
            disconnect();
        } finally {
            setLinkingWallet(false);
        }
    };

    const handleLinkEmail = async () => {
        if (!linkEmail_.trim() || !user) {
            toast.error('Please enter a valid email');
            return;
        }

        setSaving(true);
        try {
            if (linkEmail) {
                await linkEmail(linkEmail_);
                toast.success(`Verification link sent to ${linkEmail_}`);
                setShowEmailLink(false);
                setLinkEmail_('');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to send verification link');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const isWalletUser = !!user.walletAddress;
    const hasEmail = !!user.email;
    const hasWallet = !!user.walletAddress;

    const displayEmail = user.email || 'Not linked';
    const displayWallet = user.walletAddress
        ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
        : 'Not linked';

    const initials = user.displayName
        ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.charAt(0).toUpperCase() || 'W';

    const formatStorage = (bytes: number) => {
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <FullPageModal
            title="Profile Settings"
            description="Manage your account"
        >
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Avatar Card */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-primary/20 via-purple-500/20 to-secondary/20" />
                    <CardContent className="relative -mt-12 pb-6">
                        <div className="flex items-end gap-4">
                            <div className="relative">
                                <Avatar className="w-24 h-24 ring-4 ring-background shadow-xl">
                                    <AvatarImage src={user.photoURL || undefined} />
                                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-purple-600 text-white">
                                        {isWalletUser ? <Wallet className="w-10 h-10" /> : initials}
                                    </AvatarFallback>
                                </Avatar>
                                {user.isPremium && (
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                                        <Crown className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 pb-2">
                                <h2 className="text-xl font-bold">{user.displayName || 'Anonymous'}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    {hasEmail && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10 text-green-500">
                                                        <Mail className="w-3 h-3" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Email Verified</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    {hasWallet && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10 text-green-500">
                                                        <Wallet className="w-3 h-3" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Wallet Connected</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Linked Accounts Card */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Linked Accounts
                        </CardTitle>
                        <CardDescription>Manage your sign-in methods</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Email Section */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border ${hasEmail ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/30 border-border/50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasEmail ? 'bg-green-500/20' : 'bg-muted'}`}>
                                    <Mail className={`w-5 h-5 ${hasEmail ? 'text-green-500' : 'text-muted-foreground'}`} />
                                </div>
                                <div>
                                    <p className="font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">{displayEmail}</p>
                                </div>
                            </div>
                            {hasEmail ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowEmailLink(true)}
                                    className="border-primary/30 text-primary hover:bg-primary/10"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Link
                                </Button>
                            )}
                        </div>

                        {/* Email Link Form */}
                        {showEmailLink && !hasEmail && (
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                                <Label htmlFor="linkEmail">Email Address</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="linkEmail"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={linkEmail_}
                                        onChange={(e) => setLinkEmail_(e.target.value)}
                                        className="bg-background"
                                    />
                                    <Button onClick={handleLinkEmail} disabled={saving}>
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Link'}
                                    </Button>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowEmailLink(false)}
                                    className="text-muted-foreground"
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}

                        {/* Wallet Section */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border ${hasWallet ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/30 border-border/50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasWallet ? 'bg-green-500/20' : 'bg-muted'}`}>
                                    <Wallet className={`w-5 h-5 ${hasWallet ? 'text-green-500' : 'text-muted-foreground'}`} />
                                </div>
                                <div>
                                    <p className="font-medium">Web3 Wallet</p>
                                    <p className="text-sm text-muted-foreground font-mono">{displayWallet}</p>
                                </div>
                            </div>
                            {hasWallet ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleLinkWallet}
                                    disabled={linkingWallet}
                                    className="border-primary/30 text-primary hover:bg-primary/10"
                                >
                                    {linkingWallet ? (
                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4 mr-1" />
                                    )}
                                    Link
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Info Card */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>Update your profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name"
                                className="border-border/50 focus:border-primary"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Links Card */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Link2 className="w-5 h-5 text-primary" />
                            Social Links
                        </CardTitle>
                        <CardDescription>Connect your social profiles</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="twitter" className="flex items-center gap-2">
                                <Twitter className="w-4 h-4 text-muted-foreground" />
                                Twitter / X
                            </Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">@</span>
                                <Input
                                    id="twitter"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                    placeholder="username"
                                    className="border-border/50 focus:border-primary"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="github" className="flex items-center gap-2">
                                <Github className="w-4 h-4 text-muted-foreground" />
                                GitHub
                            </Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">@</span>
                                <Input
                                    id="github"
                                    value={github}
                                    onChange={(e) => setGithub(e.target.value)}
                                    placeholder="username"
                                    className="border-border/50 focus:border-primary"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Stats Card */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-primary" />
                            Account Stats
                        </CardTitle>
                        <CardDescription>Your usage information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
                                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <Crown className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-sm font-semibold">{user.isPremium ? 'Premium' : 'Free'}</p>
                                <p className="text-xs text-muted-foreground">Plan</p>
                            </div>
                            <div className="text-center p-4 bg-muted/30 rounded-xl border border-border/50">
                                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-muted flex items-center justify-center">
                                    <HardDrive className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-semibold">{formatStorage(totalStorage)}</p>
                                <p className="text-xs text-muted-foreground">Storage</p>
                            </div>
                            <div className="text-center p-4 bg-muted/30 rounded-xl border border-border/50">
                                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-muted flex items-center justify-center">
                                    <Link2 className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-semibold">{history.length}</p>
                                <p className="text-xs text-muted-foreground">Files</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Shares Card */}
                <ActiveSharesCard user={user} />

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={handleSignOut} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </FullPageModal>
    );
}

function ActiveSharesCard({ user }: { user: any }) {
    const [shares, setShares] = React.useState<ShareLink[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const fetchShares = React.useCallback(async () => {
        if (!user?.uid) return;
        setIsLoading(true);
        try {
            const userShares = await getUserShares(user.uid);
            setShares(userShares);
        } catch (error) {
            console.error('Failed to fetch shares:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.uid]);

    React.useEffect(() => {
        fetchShares();
    }, [fetchShares]);

    const handleDelete = async (shareId: string) => {
        if (!confirm('Are you sure you want to delete this share link? It will stop working immediately.')) return;

        try {
            const success = await deleteShareLink(shareId, user.uid);
            if (success) {
                toast.success('Share link deleted');
                setShares(prev => prev.filter(s => s.id !== shareId));
            } else {
                toast.error('Failed to delete share link');
            }
        } catch (error) {
            toast.error('Error deleting share link');
        }
    };

    const copyLink = (shareId: string) => {
        const url = getShareUrl(shareId);
        navigator.clipboard.writeText(url);
        toast.success('Link copied!');
    };

    if (isLoading) {
        return (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-primary" />
                        Active Shared Links
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (shares.length === 0) return null;

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-primary" />
                        Active Shared Links
                    </CardTitle>
                    <Badge variant="secondary">{shares.length}</Badge>
                </div>
                <CardDescription>Manage your active share links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {shares.map((share) => {
                    const expiresAt = share.expiresAt instanceof Date
                        ? share.expiresAt
                        // @ts-ignore firebase timestamp handling
                        : (share.expiresAt?.toDate ? share.expiresAt.toDate() : new Date(share.expiresAt));

                    const isExpired = new Date() > expiresAt;

                    return (
                        <div key={share.id} className="flex items-center justify-between p-3 rounded-xl border bg-background/40 hover:bg-background/60 transition-colors group">
                            <div className="space-y-1 min-w-0 flex-1 mr-4">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium truncate text-sm">{share.fileName}</p>
                                    {isExpired && <Badge variant="destructive" className="text-[10px] h-5">Expired</Badge>}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {share.accessCount || 0} views
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Expires {formatDistanceToNow(expiresAt, { addSuffix: true })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                    onClick={() => window.open(getShareUrl(share.id), '_blank')}
                                    title="Open Link"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                    onClick={() => copyLink(share.id)}
                                    title="Copy Link"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(share.id)}
                                    title="Delete Link"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

'use client';

import * as React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { LoginModal } from '@/components/auth/login-modal';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Settings, History, Wallet, Loader2, Sparkles, Mail } from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
    const { user, loading, signOut } = useAuth();
    const [showLoginModal, setShowLoginModal] = React.useState(false);

    // Show loading state
    if (loading) {
        return (
            <Button variant="ghost" size="sm" disabled className="gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Loading...</span>
            </Button>
        );
    }

    if (!user) {
        return (
            <>
                <Button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white shadow-lg shadow-primary/25"
                    size="sm"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sign In
                </Button>
                <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
            </>
        );
    }

    // Determine auth method flags
    const hasEmail = !!user.email;
    const hasWallet = !!user.walletAddress;
    const isWalletOnlyUser = hasWallet && !hasEmail;

    // Format wallet address for display
    const formatWallet = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    // Display name logic - prioritize what user has
    let displayName = user.displayName || 'User';
    if (displayName === 'User' && hasWallet) {
        displayName = formatWallet(user.walletAddress!);
    } else if (displayName === 'User' && hasEmail) {
        displayName = user.email!.split('@')[0];
    }

    // Secondary info - show what they authenticated with
    let secondaryInfo = '';
    if (hasEmail) {
        secondaryInfo = user.email!;
    } else if (hasWallet) {
        secondaryInfo = formatWallet(user.walletAddress!);
    }

    // Initials for avatar
    const initials = displayName
        .replace(/\.\.\./g, '')
        .replace(/0x/gi, '')
        .split(/[\s-]/)
        .filter(n => n.length > 0)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL || undefined} alt={displayName} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-medium text-sm">
                                {isWalletOnlyUser ? (
                                    <Wallet className="w-5 h-5" />
                                ) : (
                                    initials
                                )}
                            </AvatarFallback>
                        </Avatar>
                        {/* Online indicator */}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-4">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12 flex-shrink-0">
                                <AvatarImage src={user.photoURL || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-lg">
                                    {isWalletOnlyUser ? <Wallet className="w-6 h-6" /> : initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col space-y-1 overflow-hidden min-w-0">
                                <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground truncate font-mono">
                                    {secondaryInfo}
                                </p>
                                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                    {hasEmail && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                            <Mail className="w-2.5 h-2.5 mr-0.5" />
                                            Email
                                        </Badge>
                                    )}
                                    {hasWallet && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-primary/20 text-primary border-primary/30">
                                            <Wallet className="w-2.5 h-2.5 mr-0.5" />
                                            Wallet
                                        </Badge>
                                    )}
                                    {user.isPremium && (
                                        <Badge className="text-[10px] px-1.5 py-0 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                                            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                            Pro
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile" className="flex items-center">
                            <User className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/history" className="flex items-center">
                            <History className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span>History</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/settings" className="flex items-center">
                            <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => signOut()}
                        className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>Sign out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
        </>
    );
}

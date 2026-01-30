'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Github, LogOut, UserCircle, Clock, Settings, Send, Mail, Wallet } from 'lucide-react';
// ThemeToggle removed (unused)
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AppHeader() {
    const { user, signOut } = useAuth();

    if (!user) return null;

    const initials = user.displayName
        ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.charAt(0).toUpperCase() || 'U';

    return (
        <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Brand */}
                <Link href="/app" className="flex items-center group">
                    <img 
                        src="/assets/pngx-logo-v01.svg" 
                        alt="PNGX" 
                        className="h-7 group-hover:opacity-80 transition-opacity"
                    />
                </Link>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">

                    {/* Socials - Minimal */}
                    <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex rounded-full text-muted-foreground hover:text-white hover:bg-white/10">
                        <Link href="https://twitter.com/pngx_io" target="_blank">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex rounded-full text-muted-foreground hover:text-white hover:bg-white/10">
                        <Link href="https://t.me/pngx_io" target="_blank">
                            <Send className="w-5 h-5" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex rounded-full text-muted-foreground hover:text-white hover:bg-white/10">
                        <Link href="https://github.com/StartYourLab/PNGX" target="_blank">
                            <Github className="w-5 h-5" />
                        </Link>
                    </Button>

                    <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary/80 to-purple-600 text-white font-medium">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                                    <p className="text-xs leading-none text-muted-foreground truncate mb-2">
                                        {user.email || user.walletAddress || 'Anonymous'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        {user.email && (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] text-green-500 font-medium">
                                                <Mail className="w-3 h-3" />
                                                <span>Email</span>
                                            </div>
                                        )}
                                        {user.walletAddress && (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] text-green-500 font-medium">
                                                <Wallet className="w-3 h-3" />
                                                <span>Wallet</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/profile" className="cursor-pointer">
                                    <UserCircle className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/history" className="cursor-pointer">
                                    <Clock className="mr-2 h-4 w-4" />
                                    <span>History</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

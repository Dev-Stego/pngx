'use client';

import { UserMenu } from '@/components/auth/user-menu';
import { Github, Twitter, Send } from 'lucide-react';
import Link from 'next/link';

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center group cursor-pointer">
                    <img 
                        src="/assets/pngx-logo-v01.svg" 
                        alt="PNGX" 
                        className="h-8 group-hover:opacity-80 transition-opacity"
                    />
                </Link>

                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/#how-it-works" className="hover:text-primary transition-colors">Technology</Link>
                        <Link href="/#security" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link href="/docs/guide" className="hover:text-primary transition-colors">Guide</Link>
                    </nav>
                    <div className="w-px h-6 bg-white/10 hidden md:block" />
                    <div className="flex items-center gap-2">
                        <Link href="https://twitter.com/pngx_io" target="_blank" className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </Link>
                        <Link href="https://t.me/pngx_io" target="_blank" className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                            <Send className="w-4 h-4" />
                        </Link>
                        <Link href="https://github.com/StartYourLab/PNGX" target="_blank" className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                            <Github className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="w-px h-6 bg-white/10" />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}

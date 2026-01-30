'use client';

import * as React from 'react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { Shield, Menu } from 'lucide-react';

export function AppHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
                        <img 
                            src="/assets/pngx-logo-v01.svg" 
                            alt="PNGX" 
                            className="h-7"
                        />
                    </Link>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider border border-primary/20">
                        App
                    </span>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    <ModeToggle />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}

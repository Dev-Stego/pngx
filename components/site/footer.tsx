'use client';

import { Github, Twitter, Send } from 'lucide-react';
import Link from 'next/link';

export function SiteFooter() {
    return (
        <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-xl pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center">
                            <img src="/assets/pngx-logo-v01.svg" alt="PNGX" className="h-8" />
                        </div>
                        <p className="text-muted-foreground max-w-sm">
                            The open-source standard for secure, steganographic file sharing. Free, private, and powerful.
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://twitter.com/pngx_io" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </Link>
                            <Link href="https://t.me/pngx_io" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all">
                                <Send className="w-5 h-5" />
                            </Link>
                            <Link href="https://github.com/StartYourLab/PNGX" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all">
                                <Github className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Resources</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/docs/guide" className="hover:text-primary transition-colors">Documentation</Link></li>
                            <li><a href="https://github.com/archistico/ShadeOfColor2" className="hover:text-primary transition-colors">Source Code</a></li>
                            <li><Link href="/docs/encryption" className="hover:text-primary transition-colors">Encryption Spec</Link></li>
                            <li><Link href="/docs/audit" className="hover:text-primary transition-colors">Audit Report</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-6">Legal</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/legal/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/legal/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><a href="https://opensource.org/licenses/MIT" className="hover:text-primary transition-colors">License (MIT)</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} PNGX Project. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        System Operational
                    </div>
                </div>
            </div>
        </footer>
    );
}

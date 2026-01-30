'use client';

// Header/Footer handled by layout
import { Shield, Lock, EyeOff, ServerOff } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <section className="flex-1 py-16 md:py-24">
            <div className="max-w-4xl mx-auto px-6">
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-500 mb-6">
                        <Shield className="w-3 h-3" />
                        Zero Knowledge Architecture
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Privacy Policy</h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        We don't know who you are, what you hide, or who you share it with.
                        PNGX is built on a "Trust No One" (including us) philosophy.
                    </p>
                </div>

                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <ServerOff className="w-8 h-8 text-primary mb-4" />
                            <h3 className="text-lg font-bold mb-2">No Server Uploads</h3>
                            <p className="text-sm text-muted-foreground">
                                Files are processed entirely within your browser using WebAssembly and WebCrypto APIs. Your original files and the resulting PNGs never touch our servers.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <EyeOff className="w-8 h-8 text-primary mb-4" />
                            <h3 className="text-lg font-bold mb-2">No Tracking</h3>
                            <p className="text-sm text-muted-foreground">
                                We do not use analytics, cookies, or trackers. We do not log IP addresses or metadata associated with encryption activities.
                            </p>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <h2>1. Data Collection</h2>
                        <p>
                            We collect <strong>absolutely no data</strong> about the files you encrypt, the passwords you use, or your usage patterns.
                            The application runs as a client-side Single Page Application (SPA).
                        </p>

                        <h2>2. Local Storage</h2>
                        <p>
                            The application may use your browser's <code>localStorage</code> only to save non-sensitive preferences (like Dark Mode settings).
                            Sensitive keys are kept in memory only for the duration of the session and are wiped upon reload.
                        </p>

                        <h2>3. Blockchain Interactions</h2>
                        <p>
                            If you choose to use the optional "Blockchain Backup" feature:
                        </p>
                        <ul>
                            <li>Your public wallet address will be visible on the blockchain (as is the nature of Web3).</li>
                            <li>The content stored on-chain is encrypted ciphertext. Even if visible, it cannot be decrypted without your private key.</li>
                        </ul>

                        <h2>4. Open Source Verification</h2>
                        <p>
                            Our code is open source. You can inspect the transparency of our privacy claims directly on our <a href="https://github.com/archistico/ShadeOfColor2" className="text-primary hover:underline">GitHub repository</a>.
                        </p>

                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mt-8">
                            <h3 className="text-primary font-bold mb-2 flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                The Bottom Line
                            </h3>
                            <p className="text-sm m-0">
                                If a government or entity demanded your data from us, we literally have nothing to give them.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

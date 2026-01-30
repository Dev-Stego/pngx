'use client';

// Header/Footer handled by layout
import { AuthCTA } from '@/components/auth/auth-cta';
import { Book, FileKey, Image as ImageIcon, Lock, Download, CheckCircle2, Shield, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function GuidePage() {
    return (
        <section className="flex-1 py-16 md:py-24">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="mb-20 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-6">
                        <Book className="w-3 h-3" />
                        User Manual
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Secure Steganography <br className="hidden md:block" />
                        <span className="text-muted-foreground">Workflow</span>
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                        A professional-grade guide to concealing sensitive data within standard image files using AES-256 encryption.
                    </p>
                </div>

                <div className="space-y-24">
                    {/* Step 1: Selection */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 order-2 md:order-1">
                            <div className="flex items-center gap-4 text-primary font-mono text-sm">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full border border-primary/20 bg-primary/5">01</span>
                                <span>INPUT SELECTION</span>
                            </div>
                            <h3 className="text-3xl font-bold">Choose Your Assets</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Select a <strong>Carrier Image</strong> to serve as the vessel. This image remains visually unchanged.
                                Then, select the <strong>Payload File</strong> containing your sensitive data (documents, seeds, keys).
                            </p>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <span>Supports PNG, JPG, WebP carriers</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <span>Any file type can be hidden</span>
                                </li>
                            </ul>
                        </div>

                        {/* Visual Mockup 1 */}
                        <div className="order-1 md:order-2 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-1 border border-white/10 shadow-2xl">
                            <div className="bg-black/80 backdrop-blur-sm rounded-xl p-6 border border-white/5 space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 border-dashed">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center">
                                            <ImageIcon className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">vacation_photo.png</div>
                                            <div className="text-xs text-muted-foreground">Carrier Image • 2.4 MB</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center -my-2 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-background border border-white/10 flex items-center justify-center">
                                        <span className="text-muted-foreground">+</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 border-dashed">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center">
                                            <FileKey className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">private_keys.txt</div>
                                            <div className="text-xs text-muted-foreground">Payload • 15 KB</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Encryption */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Visual Mockup 2 */}
                        <div className="order-1 bg-gradient-to-bl from-primary/10 to-transparent rounded-2xl p-1 border border-primary/20 shadow-2xl shadow-primary/5">
                            <div className="bg-black/80 backdrop-blur-sm rounded-xl p-8 border border-white/5 space-y-6">
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Encryption Key</div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-primary/30 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]">
                                        <Lock className="w-4 h-4 text-primary" />
                                        <div className="flex gap-1">
                                            {[...Array(12)].map((_, i) => (
                                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    <span>AES-256-GCM Verified</span>
                                    <div className="h-px flex-1 bg-white/10" />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[...Array(16)].map((_, i) => (
                                        <div key={i} className="h-1 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 order-2">
                            <div className="flex items-center gap-4 text-primary font-mono text-sm">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full border border-primary/20 bg-primary/5">02</span>
                                <span>ENCRYPTION</span>
                            </div>
                            <h3 className="text-3xl font-bold">Zero-Knowledge Processing</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Your data is encrypted locally in your browser using <strong>AES-256-GCM</strong>.
                                This ensures that the payload is mathematically indecipherable without your unique password.
                            </p>
                            <div className="p-4 bg-orange-500/5 border-l-2 border-orange-500/50 rounded-r-lg">
                                <p className="text-sm text-orange-200/80">
                                    <strong>Note:</strong> We do not store your password. If lost, the data is unrecoverable.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Output */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 order-2 md:order-1">
                            <div className="flex items-center gap-4 text-primary font-mono text-sm">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full border border-primary/20 bg-primary/5">03</span>
                                <span>OUTPUT GENERATION</span>
                            </div>
                            <h3 className="text-3xl font-bold">Download & Distribute</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                The processor generates a standard PNG file. To the naked eye, it is identical to the original carrier.
                                Hidden within its least significant bits is your encrypted payload.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground">Lossless Sharing</span>
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground">Local Storage</span>
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground">Physical Drive</span>
                            </div>
                        </div>

                        {/* Visual Mockup 3 */}
                        <div className="order-1 md:order-2 bg-gradient-to-tr from-white/5 to-white/0 rounded-2xl p-1 border border-white/10 shadow-2xl">
                            <div className="bg-black/80 backdrop-blur-sm rounded-xl p-8 border border-white/5 flex flex-col items-center text-center space-y-6">
                                <div className="relative w-24 h-24 mb-2">
                                    <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl animate-pulse" />
                                    <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-black rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                                        <ImageIcon className="w-10 h-10 text-muted-foreground opacity-50" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-full border border-primary/50 flex items-center justify-center">
                                        <Lock className="w-3 h-3 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="font-medium">secure_image_output.png</div>
                                    <div className="text-xs text-green-400 flex items-center justify-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Ready for Download
                                    </div>
                                </div>
                                <div className="w-full h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center gap-2 text-sm text-primary font-medium">
                                    <Download className="w-4 h-4" />
                                    Download PNG
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="pt-20 pb-12 border-t border-white/10 text-center space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Start Securing Your Data</h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                Join thousands of users leveraging advanced steganography for true privacy.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <AuthCTA text="Launch App & Encrypt" className="h-14 px-8" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

'use client';

// Header/Footer handled by layout
import { Shield, Key, Wallet, Database, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AuthCTA } from '@/components/auth/auth-cta';

export default function BlockchainSpecPage() {
    return (
        <section className="flex-1 py-16 md:py-24">
            <div className="max-w-5xl mx-auto px-6">
                {/* Header */}
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-500 mb-6">
                        <Wallet className="w-3 h-3" />
                        Identity Architecture
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Blockchain Identity</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Your crypto wallet is more than just money. It is your cryptographic identity, recovery key, and access pass.
                    </p>
                </div>

                <div className="grid gap-16">
                    {/* Concept 1: Signatures */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl p-8 border border-white/10 shadow-2xl">
                            <div className="space-y-6">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <Key className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold">Cryptographic Signatures</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    When you "login" to PNGX, you are not sending a password to a server. You are signing a unique message with your wallet's private key.
                                </p>
                                <div className="bg-black/50 rounded-lg p-4 font-mono text-xs text-muted-foreground border border-white/5">
                                    <div className="text-green-400 mb-2">// Example Message</div>
                                    "Welcome to PNGX! Sign this message to authenticate. <br />
                                    Wallet: 0x71C...9A2<br />
                                    Timestamp: 2024-03-21T10:00:00Z"
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    This mathematically proves you own the address without revealing your private key.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Why This Matters</h2>
                            <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-1">
                                        <Shield className="w-3 h-3 text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Unphasable Security</h4>
                                        <p className="text-muted-foreground text-sm">Since there is no password to steal, phishers cannot deduce your credentials. They need your physical hardware wallet.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-1">
                                        <Database className="w-3 h-3 text-purple-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Portable History</h4>
                                        <p className="text-muted-foreground text-sm">Your history is tied to your on-chain address. Recover your account on any device simply by connecting your wallet.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Concept 2: Recovery */}
                    <div className="bg-white/5 rounded-3xl p-8 md:p-12 border border-white/10 text-center space-y-8">
                        <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/10 flex items-center justify-center shadow-[0_0_30px_-10px_rgba(249,115,22,0.3)]">
                            <Lock className="w-8 h-8 text-orange-500" />
                        </div>
                        <div className="max-w-2xl mx-auto space-y-4">
                            <h2 className="text-3xl font-bold">Account Recovery</h2>
                            <p className="text-muted-foreground text-lg">
                                We do not have a "Forgot Password" button because we don't have your password.
                                <strong> Your seed phrase is your recovery key.</strong>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                If you lose access to your device, simply import your seed phrase into any wallet (MetaMask, Phantom, Rabby) and connect to PNGX. Your account will be instantly restored.
                            </p>
                        </div>
                        <div className="pt-4">
                            <AuthCTA text="Connect Wallet & Secure Account" className="h-14 px-8" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

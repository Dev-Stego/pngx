'use client';

// Header/Footer handled by layout
import { Lock, FileImage, Cpu, Shield, Key, Eye } from 'lucide-react';
import Image from 'next/image';
import { GlitchText } from '@/components/ui/react-bits/glitch-text';
import { TiltCard } from '@/components/ui/react-bits/tilt-card';

export default function EncryptionSpecPage() {
    return (
        <section className="flex-1 py-16 md:py-24">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="mb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-500 mb-6">
                        <Cpu className="w-3 h-3" />
                        Technical Specification
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        <GlitchText
                            text="Encryption Architecture"
                            speed={0.5}
                            className="text-foreground"
                        />
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        A deep dive into the cryptographic primitives and steganographic algorithms powering PNGX.
                    </p>
                </div>

                <div className="grid gap-20">
                    {/* Section 1: AES-256 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Lock className="w-6 h-6 text-blue-400" />
                                </div>
                                <h2 className="text-3xl font-bold">AES-256 GCM</h2>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    We leverage the <strong>Web Crypto API</strong> for native, hardware-accelerated AES-GCM encryption. This ensures optimal performance while maintaining side-channel resistance.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <TiltCard className="p-6 bg-card/30 border border-border/50 rounded-xl backdrop-blur-sm" glareMaxOpacity={0.05}>
                                    <div className="flex items-start gap-4">
                                        <Key className="w-5 h-5 text-primary mt-1" />
                                        <div>
                                            <h4 className="font-bold mb-1">Key Derivation (PBKDF2)</h4>
                                            <div className="text-sm text-muted-foreground">
                                                User passwords are salted and hashed 100,000 times using PBKDF2-HMAC-SHA256. This transforms a simple password into a cryptographic key that is resistant to brute-force attacks.
                                            </div>
                                        </div>
                                    </div>
                                </TiltCard>
                                <TiltCard className="p-6 bg-card/30 border border-border/50 rounded-xl backdrop-blur-sm" glareMaxOpacity={0.05}>
                                    <div className="flex items-start gap-4">
                                        <Shield className="w-5 h-5 text-green-400 mt-1" />
                                        <div>
                                            <h4 className="font-bold mb-1">Authenticated Encryption</h4>
                                            <div className="text-sm text-muted-foreground">
                                                GCM (Galois/Counter Mode) includes an authentication tag via GMAC. If a single bit of the file is tampered with during transit, decryption will fail instantly, preventing data corruption attacks.
                                            </div>
                                        </div>
                                    </div>
                                </TiltCard>
                            </div>
                        </div>
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl group">
                            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
                            <Image src="/assets/encryption.png" alt="Encryption Diagram" width={600} height={600} className="w-full h-auto" />
                        </div>
                    </div>

                    {/* Section 2: Steganography */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative order-last md:order-first rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl group">
                            <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
                            <Image src="/assets/steganography.png" alt="Steganography" width={600} height={600} className="w-full h-auto" />
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                    <FileImage className="w-6 h-6 text-purple-400" />
                                </div>
                                <h2 className="text-3xl font-bold">LSB Encoding</h2>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    The ciphertext is embedded into the carrier image using <strong>Least Significant Bit (LSB)</strong> steganography, rendering the data invisible to the human eye.
                                </p>
                            </div>
                            <div className="prose prose-invert prose-p:text-muted-foreground">
                                <p>
                                    The algorithm iterates through the RGBA channels of every pixel. We replace the last bit (the "least significant" one) with a bit of your encrypted sequence.
                                </p>
                                <div className="not-prose bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-xs my-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Original:</span>
                                        <span className="text-blue-300">1101100<span className="text-red-400 font-bold">0</span></span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Payload Bit:</span>
                                        <span className="text-green-400 font-bold">1</span>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Modified:</span>
                                        <span className="text-blue-300">1101100<span className="text-green-400 font-bold">1</span></span>
                                    </div>
                                </div>
                                <p>
                                    This modification changes the color value by at most 1/255. While statistically detectable by advanced steganalysis tools, to the naked eye, the image appears perfectly identical.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

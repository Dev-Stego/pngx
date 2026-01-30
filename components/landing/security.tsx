'use client';

import { ScrollReveal, StaggerReveal, StaggerItem } from './scroll-reveal';
import { Shield, Lock, Eye, Server, Code, Key, ArrowRight } from 'lucide-react';
import { GlitchText } from '@/components/ui/react-bits/glitch-text';
import Image from 'next/image';
import Link from 'next/link';

const features = [
    {
        icon: Lock,
        title: 'AES-256-GCM',
        description: 'Military-grade encryption using the Web Crypto API. Hardware accelerated and side-channel resistant.',
    },
    {
        icon: Key,
        title: 'PBKDF2 Key Derivation',
        description: '100,000 iterations of HMAC-SHA256. Your password becomes an unbreakable 256-bit key.',
    },
    {
        icon: Shield,
        title: 'Authenticated Encryption',
        description: 'GCM mode provides authentication tags. Any tampering is instantly detected on decryption.',
    },
    {
        icon: Server,
        title: 'Zero-Knowledge',
        description: 'Everything happens in your browser. We never see your files, passwords, or encryption keys.',
    },
    {
        icon: Eye,
        title: 'Client-Side Only',
        description: 'No server uploads. Your data never leaves your device until you choose to share it.',
    },
    {
        icon: Code,
        title: 'Open Source',
        description: 'Fully auditable code. Verify our security claims yourself. Trust through transparency.',
    },
];

export function SecuritySection() {
    return (
        <section id="security" className="section-padding relative">
            <div className="max-w-6xl mx-auto px-6">
                {/* Section Header */}
                <ScrollReveal className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
                        <Shield className="w-4 h-4" />
                        Security Architecture
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                        <GlitchText
                            text="Zero-Trust. Zero-Knowledge."
                            speed={0.5}
                            className="text-foreground"
                        />
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Built on proven cryptographic standards. Your secrets stay yours.
                    </p>
                </ScrollReveal>

                {/* Feature Grid */}
                <StaggerReveal staggerDelay={0.1}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <StaggerItem key={feature.title}>
                                <div className="group h-full p-6 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                                </div>
                            </StaggerItem>
                        ))}
                    </div>
                </StaggerReveal>

                {/* Architecture Diagram */}
                <ScrollReveal delay={0.3} className="mt-16">
                    <div className="relative rounded-3xl overflow-hidden border border-border/50 shadow-2xl">
                        <div className="absolute inset-0 bg-primary/5 mix-blend-overlay z-10 pointer-events-none" />
                        <Image
                            src="/assets/landing/security-pipeline.png"
                            alt="Encryption Pipeline Diagram"
                            width={1200}
                            height={600}
                            className="w-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                All processing happens in your browser using the Web Crypto API
                            </p>
                            <Link href="/docs/encryption" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-sm font-medium">
                                View Technical Specification <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

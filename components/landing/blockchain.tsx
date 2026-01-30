'use client';

import { ScrollReveal } from './scroll-reveal';
import { Wallet, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export function BlockchainSection() {
    return (
        <section id="blockchain" className="section-padding relative bg-gradient-to-b from-transparent via-primary/5 to-transparent">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <ScrollReveal direction="right">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
                            <Wallet className="w-4 h-4" />
                            Blockchain Recovery
                        </span>

                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                            Never Lose Your <span className="text-primary">Keys</span> Again
                        </h2>

                        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                            Backup your security notes to Ethereum. Your wallet becomes your master key —
                            recover from any device, anytime, without trusting a third party.
                        </p>

                        {/* Key Benefits */}
                        <div className="space-y-4 mb-8">
                            {[
                                'Self-custodial — only you control access',
                                'Permanent storage on Ethereum blockchain',
                                'Encrypted with your wallet signature',
                                'No accounts or passwords to remember',
                            ].map((benefit) => (
                                <div key={benefit} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-foreground">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <Link href="/docs/blockchain">
                            <Button
                                size="lg"
                                className="bg-primary hover:opacity-90 text-primary-foreground rounded-full px-8"
                            >
                                <Wallet className="mr-2 h-5 w-5" />
                                Learn More
                            </Button>
                        </Link>
                    </ScrollReveal>

                    {/* Visual */}
                    <ScrollReveal delay={0.2}>
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-primary/20 group">
                            <Image
                                src="/assets/landing/blockchain-flow.png"
                                alt="Blockchain Recovery Flow"
                                width={800}
                                height={800}
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
}

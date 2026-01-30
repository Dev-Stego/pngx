'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Waves } from '@/components/ui/react-bits/waves';
import { AuthCTA } from '@/components/auth/auth-cta';

export function CTABanner() {
    return (
        <section className="section-padding relative overflow-hidden">
            {/* Background Layers */}
            <Waves
                lineColor="rgba(139, 92, 246, 0.2)"
                backgroundColor="transparent"
                waveSpeedX={0.02}
                waveSpeedY={0.01}
                waveAmpX={40}
                waveAmpY={20}
                xGap={12}
                yGap={36}
            />

            {/* Background Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-secondary/10 pointer-events-none" />
            <div className="absolute inset-0 bg-background/60 backdrop-blur-md -z-10" />

            {/* Glow Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />

            <div className="relative max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                        Your Secrets Deserve
                        <span className="block gradient-text-animated">Better Protection</span>
                    </h2>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Join thousands of users who trust PNGX to keep their files invisible and secure.
                        Start encrypting in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <AuthCTA
                            text="Start Encrypting Now"
                            className="h-16 px-10 text-xl"
                        />
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            100% Client-Side
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Secure & Private
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Open Source
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

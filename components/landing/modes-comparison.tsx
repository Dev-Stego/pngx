'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from './scroll-reveal';
import { Zap, EyeOff, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelCard } from '@/components/ui/react-bits/pixel-card';
import { TiltCard } from '@/components/ui/react-bits/tilt-card';
import Image from 'next/image';

type Mode = 'quick' | 'steganography';

const modes = {
    quick: {
        title: 'Quick Encrypt',
        subtitle: 'Pixel Packing Mode',
        icon: Zap,
        description: 'Your file is AES-encrypted and converted into a unique noise pattern PNG. Fast, simple, and secure.',
        output: 'Colorful noise pattern',
        speed: 'Fastest',
        detection: 'Visible encryption',
        bestFor: 'Secure backups, large files',
        color: 'primary',
        features: [
            'No carrier image needed',
            'Works with any file size',
            'Fastest processing speed',
            'Perfect for personal archives',
        ],
    },
    steganography: {
        title: 'Steganography',
        subtitle: 'LSB Injection Mode',
        icon: EyeOff,
        description: 'Your encrypted file is hidden inside a real image using Least Significant Bit modification. Completely invisible.',
        output: 'Identical-looking image',
        speed: 'Fast',
        detection: 'Undetectable',
        bestFor: 'Covert storage, plausible deniability',
        color: 'secondary',
        features: [
            'Hide in any image',
            'Visually identical output',
            'Passes casual inspection',
            'Perfect for sensitive data',
        ],
    },
};

export function ModesComparison() {
    const [activeMode, setActiveMode] = useState<Mode>('quick');
    const mode = modes[activeMode];

    return (
        <section id="modes" className="section-padding relative bg-card/30">
            <div className="max-w-6xl mx-auto px-6">
                {/* Section Header */}
                <ScrollReveal className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
                        Two Powerful Options
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                        Choose Your <span className="gradient-text">Invisibility</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Two encryption modes for different needs. Both use AES-256-GCM.
                    </p>
                </ScrollReveal>

                {/* Mode Toggle */}
                <ScrollReveal delay={0.1} className="flex justify-center mb-12">
                    <div className="inline-flex p-1 rounded-full bg-muted/50 border border-border">
                        {(['quick', 'steganography'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setActiveMode(m)}
                                className={cn(
                                    'relative px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300',
                                    activeMode === m
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {activeMode === m && (
                                    <motion.div
                                        layoutId="activeMode"
                                        className={cn(
                                            'absolute inset-0 rounded-full',
                                            m === 'quick' ? 'bg-primary/20' : 'bg-secondary/20'
                                        )}
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative flex items-center gap-2">
                                    {m === 'quick' ? <Zap className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    {modes[m].title}
                                </span>
                            </button>
                        ))}
                    </div>
                </ScrollReveal>

                {/* Mode Details */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeMode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="grid lg:grid-cols-2 gap-8 items-center"
                    >
                        {/* Info Card */}
                        <TiltCard
                            className={cn(
                                'h-full p-8 rounded-3xl border backdrop-blur-sm',
                                activeMode === 'quick'
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-secondary/5 border-secondary/20'
                            )}
                            glareMaxOpacity={0.05}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className={cn(
                                    'w-14 h-14 rounded-2xl flex items-center justify-center',
                                    activeMode === 'quick' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                                )}>
                                    <mode.icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">{mode.title}</h3>
                                    <p className="text-sm text-muted-foreground">{mode.subtitle}</p>
                                </div>
                            </div>

                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                {mode.description}
                            </p>

                            {/* Features */}
                            <ul className="space-y-3 mb-8">
                                {mode.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <div className={cn(
                                            'w-5 h-5 rounded-full flex items-center justify-center',
                                            activeMode === 'quick' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                                        )}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Specs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                                    <p className="text-xs text-muted-foreground mb-1">Output</p>
                                    <p className="font-semibold">{mode.output}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                                    <p className="text-xs text-muted-foreground mb-1">Detection</p>
                                    <p className="font-semibold">{mode.detection}</p>
                                </div>
                            </div>
                        </TiltCard>

                        {/* Visual */}
                        <div className="relative h-[500px]">
                            <div className={cn(
                                'h-full rounded-3xl border-2 overflow-hidden relative',
                                activeMode === 'quick'
                                    ? 'border-primary/30'
                                    : 'border-secondary/30'
                            )}>
                                {activeMode === 'quick' ? (
                                    <div className="relative w-full h-full">
                                        <PixelCard variant="blue" className="w-full h-full absolute inset-0" />
                                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                                            <div className="relative w-64 h-64 rounded-xl overflow-hidden shadow-2xl shadow-primary/20 border border-primary/30 mb-6">
                                                <Image
                                                    src="/assets/landing/mode-quick.png"
                                                    alt="Quick Encrypt Visualization"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <p className="text-lg font-semibold text-primary bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-primary/20">
                                                Encrypted Pixel Pattern
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative w-full h-full">
                                        <Image
                                            src="/assets/landing/mode-steg.png"
                                            alt="Steganography Visualization"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                                        <div className="absolute bottom-12 left-0 right-0 text-center">
                                            <p className="inline-block text-lg font-semibold text-secondary bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-secondary/20">
                                                Invisible Data Layer
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}

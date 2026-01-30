'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown, Lock, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DecryptedText } from '@/components/ui/react-bits/decrypted-text';
import { ShinyText } from '@/components/ui/react-bits/shiny-text';
import { LetterGlitch } from '@/components/ui/react-bits/letter-glitch';
import { AuthCTA } from '@/components/auth/auth-cta';

export function HeroSection() {

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Layers */}
            <div className="absolute inset-0 z-0 bg-black">
                {/* Background Image */}
                {/* Background Image - Optimized */}
                <div className="absolute inset-0 z-0 select-none">
                    <Image
                        src="/assets/landing/hero-abstract-glass.png"
                        alt="PNGX Abstract Background"
                        fill
                        priority
                        className="object-cover opacity-40"
                        quality={90}
                    />
                </div>

                {/* Glitch Overlay */}
                <div className="absolute inset-0 z-10 mix-blend-screen opacity-40">
                    <LetterGlitch
                        glitchSpeed={50}
                        glitchColors={['#8B5CF6', '#EC4899', '#3B82F6']}
                        outerVignette={true}
                        smooth={true}
                    />
                </div>

                {/* Gradient Fade */}
                <div className="absolute inset-0 z-20 bg-gradient-to-b from-background/0 via-background/60 to-background pointer-events-none" />

                {/* Radial Gradient for depth */}
                <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 via-transparent to-transparent opacity-50" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-block mb-8"
                >
                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <ShinyText disabled={false} speed={3} className="text-sm font-medium">Client-Side Zero Knowledge Encryption</ShinyText>
                    </div>
                </motion.div>

                {/* Main Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="mb-8"
                >
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground mb-4">
                        Hide Anything.
                    </h1>
                    <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight gradient-text-animated min-h-[1.2em]">
                        <DecryptedText
                            text="Inside Any Image."
                            animateOn="view"
                            revealDirection="center"
                            speed={100}
                            maxIterations={20}
                            encryptedClassName="text-primary/50"
                        />
                    </div>
                </motion.div>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
                >
                    Military-grade AES-256 encryption meets invisible steganography.
                    <br className="hidden sm:block" />
                    Your files vanish into plain sight.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <AuthCTA
                        text="Start Encrypting"
                        className="h-14 px-8 text-lg"
                    />
                    <Link href="#how-it-works">
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 px-8 text-lg font-semibold rounded-full border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                        >
                            <Eye className="mr-2 h-5 w-5" />
                            See How It Works
                        </Button>
                    </Link>
                </motion.div>

                {/* Feature Pills */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex flex-wrap items-center justify-center gap-3 mt-16"
                >
                    {['AES-256 Encryption', 'LSB Steganography', 'Blockchain Backup', 'Open Source'].map((feature, i) => (
                        <span
                            key={feature}
                            className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-muted-foreground backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default"
                            style={{ animationDelay: `${0.7 + i * 0.1}s` }}
                        >
                            {feature}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            >
                <Link href="#how-it-works" className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <span className="text-sm font-medium">Scroll to explore</span>
                    <ChevronDown className="w-5 h-5 animate-scroll-indicator" />
                </Link>
            </motion.div>
        </section>
    );
}

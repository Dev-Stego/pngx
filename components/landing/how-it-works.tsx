'use client';

import { ScrollReveal, StaggerReveal, StaggerItem } from './scroll-reveal';
import { ArrowRight } from 'lucide-react';
import { TiltCard } from '@/components/ui/react-bits/tilt-card';
import { BlurText } from '@/components/ui/react-bits/blur-text';
import Image from 'next/image';

const steps = [
    {
        number: '01',
        image: '/assets/landing/process-upload.png',
        title: 'Select Your File',
        description: 'Upload any file type — documents, images, videos, archives. Up to 50MB fully encrypted.',
    },
    {
        number: '02',
        image: '/assets/landing/process-encrypt.png',
        title: 'Encrypt & Hide',
        description: 'Choose Quick Encrypt for speed, or Steganography to hide inside a real image invisibly.',
    },
    {
        number: '03',
        image: '/assets/landing/process-share.png',
        title: 'Share Anywhere',
        description: 'Download your secure PNG. Share via email, cloud, or social. Only you have the key.',
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="section-padding relative">
            <div className="max-w-6xl mx-auto px-6">
                {/* Section Header */}
                <ScrollReveal className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-sm font-medium text-secondary mb-6">
                        Simple Process
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                        How It <span className="gradient-text">Works</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Three simple steps to secure your files. Connect your wallet or email to safeguard your sessions and data.
                    </p>
                </ScrollReveal>

                {/* Steps */}
                <StaggerReveal className="relative" staggerDelay={0.15}>
                    {/* Connection Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {steps.map((step, index) => (
                            <StaggerItem key={step.number}>
                                <div className="relative group h-full">
                                    <TiltCard className="h-full rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm p-8" glareMaxOpacity={0.1}>
                                        {/* Step Number */}
                                        <div className="absolute -top-4 left-8 px-3 py-1 rounded-full bg-background border border-border text-sm font-mono font-bold text-muted-foreground z-10">
                                            {step.number}
                                        </div>

                                        {/* Image */}
                                        <div className="relative w-full aspect-square mb-6 rounded-xl overflow-hidden bg-background/50 border border-white/5">
                                            <Image
                                                src={step.image}
                                                alt={step.title}
                                                fill
                                                className="object-contain p-6 hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                                        <div className="text-muted-foreground leading-relaxed min-h-[4.5rem]">
                                            <BlurText
                                                text={step.description}
                                                delay={0.02} // Fast blur reveal
                                                animateBy="words"
                                                direction="bottom"
                                            />
                                        </div>

                                        {/* Arrow for non-last items on desktop */}
                                        {index < steps.length - 1 && (
                                            <div className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                                <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center shadow-lg">
                                                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                            </div>
                                        )}
                                    </TiltCard>
                                </div>
                            </StaggerItem>
                        ))}
                    </div>
                </StaggerReveal>
            </div>
        </section>
    );
}

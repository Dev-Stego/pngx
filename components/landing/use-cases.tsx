'use client';

import { ScrollReveal, StaggerReveal, StaggerItem } from './scroll-reveal';
import {
    FileText,
    Shield,
    MessageSquare,
    CloudUpload,
    Key,
    Users
} from 'lucide-react';
import { TiltCard } from '@/components/ui/react-bits/tilt-card';

const useCases = [
    {
        icon: FileText,
        title: 'Secure Document Backup',
        description: 'Encrypt tax documents, medical records, or legal files. Store them in plain sight on any cloud service.',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        icon: MessageSquare,
        title: 'Hidden Communication',
        description: 'Send encrypted messages inside vacation photos. Perfect for journalists and privacy-conscious users.',
        color: 'from-purple-500 to-pink-500',
    },
    {
        icon: CloudUpload,
        title: 'Private Cloud Storage',
        description: 'Upload to Google Photos, iCloud, or Dropbox without exposing your data to the provider.',
        color: 'from-green-500 to-emerald-500',
    },
    {
        icon: Key,
        title: 'Seed Phrase Storage',
        description: 'Securely store crypto wallet seed phrases inside regular-looking images.',
        color: 'from-orange-500 to-amber-500',
    },
    {
        icon: Shield,
        title: 'Whistleblowing',
        description: 'Safely transport sensitive documents that appear as ordinary photographs.',
        color: 'from-red-500 to-rose-500',
    },
    {
        icon: Users,
        title: 'Secure File Sharing',
        description: 'Share files publicly where only the intended recipient can decrypt with the security note.',
        color: 'from-indigo-500 to-violet-500',
    },
];

export function UseCasesSection() {
    return (
        <section id="use-cases" className="section-padding relative">
            <div className="max-w-6xl mx-auto px-6">
                {/* Section Header */}
                <ScrollReveal className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
                        Real-World Applications
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                        Built for <span className="gradient-text">Real Privacy</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        From everyday file security to high-stakes confidentiality.
                    </p>
                </ScrollReveal>

                {/* Use Cases Grid */}
                <StaggerReveal staggerDelay={0.1}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {useCases.map((useCase) => (
                            <StaggerItem key={useCase.title}>
                                <TiltCard
                                    className="h-full p-6 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm group"
                                    glareMaxOpacity={0.1}
                                >
                                    {/* Icon with gradient */}
                                    <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                                        <useCase.icon className="w-6 h-6 text-primary" />
                                    </div>

                                    <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                                </TiltCard>
                            </StaggerItem>
                        ))}
                    </div>
                </StaggerReveal>
            </div>
        </section>
    );
}

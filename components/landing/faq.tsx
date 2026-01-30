'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from './scroll-reveal';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
    {
        question: 'Is steganography legal?',
        answer: 'Yes, steganography is legal in most countries. It\'s simply a method of hiding data within other data. However, the content you encrypt and hide is subject to the same laws as any other data — illegal content remains illegal regardless of how it\'s stored.',
    },
    {
        question: 'What happens if I lose my security note?',
        answer: 'Your data is gone forever. We use zero-knowledge encryption, meaning we never see or store your notes. This is a feature, not a bug — it ensures maximum security. We highly recommend using the blockchain backup feature or storing your note in a password manager.',
    },
    {
        question: 'Can the image be compressed (like on social media)?',
        answer: 'No, lossy compression (JPEG, social media platforms) will destroy the hidden data. Only share the original PNG file, or use platforms that preserve original quality like email, cloud storage, or file transfer services.',
    },
    {
        question: 'How much data can I hide in an image?',
        answer: 'The capacity depends on the carrier image size. Roughly, you can hide about 1 byte per 3 pixels in LSB mode. A 1920x1080 image can hold approximately 850KB. The encoder shows a capacity meter before processing.',
    },
    {
        question: 'Is my data uploaded to your servers?',
        answer: 'Never. All encryption and steganography happens 100% in your browser using the Web Crypto API. Your files never leave your device. We don\'t have servers that could store your data even if we wanted to.',
    },
    {
        question: 'Can someone detect that an image contains hidden data?',
        answer: 'With Quick Encrypt mode, yes — the output looks like colored noise. With Steganography mode, detection is extremely difficult. The image looks visually identical to the original, though sophisticated statistical analysis could theoretically detect modifications.',
    },
    {
        question: 'What encryption algorithm do you use?',
        answer: 'We use AES-256-GCM (Advanced Encryption Standard with 256-bit keys in Galois/Counter Mode). Keys are derived from your security note using PBKDF2 with 100,000 iterations. This is the same level of encryption used by banks and governments.',
    },
    {
        question: 'Is this open source?',
        answer: 'Yes! The entire codebase is open source and auditable. We believe in security through transparency. You can verify exactly how your data is being encrypted and that no backdoors exist.',
    },
];

function FAQItem({
    question,
    answer,
    isOpen,
    onClick
}: {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}) {
    return (
        <div className="border-b border-border/50 last:border-b-0">
            <button
                onClick={onClick}
                className="w-full py-6 flex items-start justify-between gap-4 text-left transition-colors hover:text-foreground"
            >
                <span className="text-lg font-medium">{question}</span>
                <ChevronDown
                    className={cn(
                        'w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0 mt-1',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-muted-foreground leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="section-padding relative bg-card/20">
            <div className="max-w-3xl mx-auto px-6">
                {/* Section Header */}
                <ScrollReveal className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-sm font-medium text-muted-foreground mb-6">
                        <HelpCircle className="w-4 h-4" />
                        FAQ
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                        Common Questions
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Everything you need to know about PNGX.
                    </p>
                </ScrollReveal>

                {/* FAQ Items */}
                <ScrollReveal delay={0.1}>
                    <div className="rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm p-2 sm:p-4">
                        {faqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openIndex === index}
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            />
                        ))}
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

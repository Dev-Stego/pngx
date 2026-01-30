'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

export function HeroAnimation() {
    return (
        <div className="relative w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden rounded-3xl aspect-square shadow-2xl border border-white/10 bg-black">
            {/* Base Image Layer */}
            <motion.div
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
            >
                <img
                    src="/assets/concepts/hero-bg.png"
                    alt="Cyber Security Network"
                    className="w-full h-full object-cover opacity-80"
                />
            </motion.div>

            {/* Overlay Gradient for Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            {/* Pulse Effect */}
            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay animate-pulse" />

            {/* Floating Data Particles (Subtle) */}
            <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * 400 - 200,
                            y: Math.random() * 400 - 200,
                            opacity: 0,
                        }}
                        animate={{
                            y: [null, Math.random() * -50],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: Math.random() * 4 + 3,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                        className="absolute left-1/2 top-1/2 w-1 h-1 bg-blue-400 rounded-full blur-[1px]"
                    />
                ))}
            </div>

            {/* Central Badge (Glassmorphism) */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="relative z-10 w-28 h-28 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.2)]"
            >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-2xl blur opacity-50" />
                <img src="/assets/logo-icon.png" alt="PNGX" className="w-16 h-16 relative z-10 drop-shadow-lg" onError={(e) => e.currentTarget.style.display = 'none'} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 tracking-tighter">X</span>
                </div>
            </motion.div>
        </div>
    );
}

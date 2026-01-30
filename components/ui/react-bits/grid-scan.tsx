'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface GridScanProps {
    className?: string;
    lineColor?: string;
    gridColor?: string;
    scanDuration?: number;
}

export function GridScan({
    className = '',
    lineColor = '#8B5CF6', // Primary Purple
    gridColor = 'rgba(255, 255, 255, 0.1)',
    scanDuration = 3,
}: GridScanProps) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Grid Background */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, ${gridColor} 1px, transparent 1px),
                        linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                }}
            />

            {/* Scanning Line */}
            <motion.div
                className="absolute left-0 right-0 h-[2px] shadow-[0_0_20px_2px_rgba(139,92,246,0.5)] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                initial={{ top: '0%', opacity: 0 }}
                animate={{
                    top: ['0%', '100%'],
                    opacity: [0, 1, 0]
                }}
                transition={{
                    duration: scanDuration,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    backgroundColor: lineColor,
                }}
            />

            {/* Secondary Faint Scan Line (Offset) */}
            <motion.div
                className="absolute left-0 right-0 h-[1px] bg-purple-500/30"
                initial={{ top: '-20%', opacity: 0 }}
                animate={{
                    top: ['-20%', '80%'],
                    opacity: [0, 0.5, 0]
                }}
                transition={{
                    duration: scanDuration,
                    repeat: Infinity,
                    ease: "linear",
                    delay: scanDuration / 2
                }}
            />
        </div>
    );
}

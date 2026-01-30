'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface PixelCardProps {
    className?: string;
    variant?: 'pink' | 'blue' | 'default';
    active?: boolean;
}

export function PixelCard({ className, variant = 'default', active = true }: PixelCardProps) {
    const [pixels, setPixels] = useState<number[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ rows: 8, cols: 8 });

    useEffect(() => {
        // Calculate grid size based on container
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            // Assuming 8px gaps + 12px blocks approx 20px per unit
            // This is a rough heuristic to fill the card
            const cols = Math.floor(width / 24);
            const rows = Math.floor(height / 24);
            setDimensions({ rows: rows || 4, cols: cols || 4 });
        }
    }, []);

    const getColor = () => {
        if (!active) return 'bg-white/5';
        const rand = Math.random();

        if (variant === 'pink') {
            if (rand > 0.95) return 'bg-rose-500';
            if (rand > 0.9) return 'bg-rose-500/50';
            if (rand > 0.8) return 'bg-rose-500/20';
            return 'bg-white/5';
        }
        if (variant === 'blue') {
            if (rand > 0.95) return 'bg-blue-500';
            if (rand > 0.9) return 'bg-blue-500/50';
            if (rand > 0.8) return 'bg-blue-500/20';
            return 'bg-white/5';
        }

        // Default (Monochrome/Cyber)
        if (rand > 0.95) return 'bg-white';
        if (rand > 0.9) return 'bg-white/50';
        if (rand > 0.8) return 'bg-white/20';
        return 'bg-white/5';
    };

    // Re-render interval to simulate "noise"
    const [seed, setSeed] = useState(0);
    useEffect(() => {
        if (!active) return;
        const interval = setInterval(() => {
            setSeed(s => s + 1);
        }, 150); // Fast noise update
        return () => clearInterval(interval);
    }, [active]);

    const totalPixels = dimensions.rows * dimensions.cols;

    return (
        <div ref={containerRef} className={`grid gap-2 w-full h-full p-2 ${className}`} style={{
            gridTemplateColumns: `repeat(${dimensions.cols}, 1fr)`,
            gridTemplateRows: `repeat(${dimensions.rows}, 1fr)`
        }}>
            {Array.from({ length: totalPixels }).map((_, i) => (
                <div
                    key={`${i}-${seed}`}
                    className={`rounded-sm transition-colors duration-150 ${getColor()}`}
                />
            ))}
        </div>
    );
}

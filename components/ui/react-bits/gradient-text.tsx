'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode, CSSProperties } from 'react';

interface GradientTextProps {
    children: ReactNode;
    className?: string;
    colors?: string[];
    animationSpeed?: number;
    showBorder?: boolean;
}

export function GradientText({
    children,
    className = '',
    colors = ['#ffaa40', '#9c40ff', '#ffaa40'],
    animationSpeed = 8,
    showBorder = false,
}: GradientTextProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    const gradientStyle: CSSProperties = {
        backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
        backgroundSize: '300% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        animation: isInView ? `gradient-flow ${animationSpeed}s linear infinite` : 'none',
    };

    const borderStyle: CSSProperties = showBorder
        ? {
            backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
            backgroundSize: '300% 100%',
            animation: isInView ? `gradient-flow ${animationSpeed}s linear infinite` : 'none',
        }
        : {};

    return (
        <>
            <style jsx global>{`
        @keyframes gradient-flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
            <span ref={ref} className={`relative inline-block ${className}`}>
                {showBorder && (
                    <span
                        className="absolute -inset-1 rounded-lg opacity-30 blur-sm"
                        style={borderStyle}
                    />
                )}
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={gradientStyle}
                >
                    {children}
                </motion.span>
            </span>
        </>
    );
}

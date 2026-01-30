'use client';

import { motion, useInView, useAnimation, Easing } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    animationFrom?: Record<string, string | number>;
    animationTo?: Record<string, string | number>;
    easing?: Easing;
    threshold?: number;
    onAnimationComplete?: () => void;
}

export function SplitText({
    text,
    className = '',
    delay = 0.03,
    animationFrom,
    animationTo,
    easing = 'easeOut' as Easing,
    threshold = 0.1,
    onAnimationComplete,
}: SplitTextProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, amount: threshold });
    const controls = useAnimation();

    const characters = text.split('');

    const defaultFrom = {
        opacity: 0,
        y: 40,
        rotateX: -90,
    };

    const defaultTo = {
        opacity: 1,
        y: 0,
        rotateX: 0,
    };

    const from = animationFrom || defaultFrom;
    const to = animationTo || defaultTo;

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        }
    }, [isInView, controls]);

    return (
        <motion.span
            ref={ref}
            className={`inline-flex ${className}`}
            style={{ perspective: '1000px' }}
            initial="hidden"
            animate={controls}
            onAnimationComplete={onAnimationComplete}
        >
            {characters.map((char, index) => (
                <motion.span
                    key={index}
                    className="inline-block origin-bottom"
                    style={{ transformStyle: 'preserve-3d' }}
                    variants={{
                        hidden: from,
                        visible: {
                            ...to,
                            transition: {
                                duration: 0.5,
                                ease: easing,
                                delay: index * delay,
                            },
                        },
                    }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </motion.span>
            ))}
        </motion.span>
    );
}

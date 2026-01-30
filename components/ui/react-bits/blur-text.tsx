'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useAnimation, Variants, Easing } from 'framer-motion';

interface BlurTextProps {
    text: string;
    delay?: number;
    className?: string;
    animateBy?: 'words' | 'characters';
    direction?: 'top' | 'bottom';
    threshold?: number;
    rootMargin?: string;
    animationFrom?: Record<string, string | number>;
    animationTo?: Record<string, string | number>;
    easing?: Easing;
    onAnimationComplete?: () => void;
}

export function BlurText({
    text,
    delay = 0.05,
    className = '',
    animateBy = 'words',
    direction = 'bottom',
    threshold = 0.1,
    rootMargin = '0px',
    animationFrom,
    animationTo,
    easing = 'easeOut' as Easing,
    onAnimationComplete,
}: BlurTextProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, amount: threshold });
    const controls = useAnimation();

    const elements = animateBy === 'words' ? text.split(' ') : text.split('');

    const defaultFrom = {
        filter: 'blur(10px)',
        opacity: 0,
        y: direction === 'bottom' ? 20 : -20,
    };

    const defaultTo = {
        filter: 'blur(0px)',
        opacity: 1,
        y: 0,
    };

    const from = animationFrom || defaultFrom;
    const to = animationTo || defaultTo;

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        }
    }, [isInView, controls]);

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: delay,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: from,
        visible: {
            ...to,
            transition: {
                duration: 0.5,
                ease: easing,
            },
        },
    };

    return (
        <motion.span
            ref={ref}
            className={`inline-flex flex-wrap ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            onAnimationComplete={onAnimationComplete}
        >
            {elements.map((element, index) => (
                <motion.span
                    key={index}
                    variants={itemVariants}
                    className="inline-block"
                    style={{ marginRight: animateBy === 'words' ? '0.25em' : undefined }}
                >
                    {element}
                </motion.span>
            ))}
        </motion.span>
    );
}

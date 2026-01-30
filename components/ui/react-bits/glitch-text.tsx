'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface GlitchTextProps {
    text: string;
    className?: string;
    speed?: number;
    intensity?: number;
    glitchChars?: string;
}

export function GlitchText({
    text,
    className = '',
    speed = 50,
    intensity = 0.3,
    glitchChars = '!<>-_\\/[]{}—=+*^?#_____',
}: GlitchTextProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const [displayText, setDisplayText] = useState(text);
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        if (!isInView) return;

        let iteration = 0;
        const targetText = text;
        let interval: NodeJS.Timeout;

        const glitch = () => {
            setDisplayText(
                targetText
                    .split('')
                    .map((char, index) => {
                        if (index < iteration) {
                            return targetText[index];
                        }
                        if (char === ' ') return ' ';
                        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                    })
                    .join('')
            );

            if (iteration >= targetText.length) {
                clearInterval(interval);
                setIsGlitching(false);
                return;
            }

            iteration += intensity;
        };

        setIsGlitching(true);
        interval = setInterval(glitch, speed);

        return () => clearInterval(interval);
    }, [isInView, text, speed, intensity, glitchChars]);

    // Periodic re-glitch effect
    useEffect(() => {
        if (!isInView || isGlitching) return;

        const reglitchInterval = setInterval(() => {
            let iteration = 0;
            const targetText = text;

            const glitchOnce = setInterval(() => {
                setDisplayText(
                    targetText
                        .split('')
                        .map((char, index) => {
                            if (index < iteration) {
                                return targetText[index];
                            }
                            if (char === ' ') return ' ';
                            if (Math.random() > 0.8) {
                                return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                            }
                            return char;
                        })
                        .join('')
                );

                if (iteration >= targetText.length) {
                    clearInterval(glitchOnce);
                    setDisplayText(text);
                    return;
                }

                iteration += 2;
            }, 30);
        }, 5000);

        return () => clearInterval(reglitchInterval);
    }, [isInView, isGlitching, text, glitchChars]);

    return (
        <motion.span
            ref={ref}
            className={`font-mono ${className}`}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {displayText}
        </motion.span>
    );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface DecryptedTextProps {
    text: string;
    speed?: number;
    maxIterations?: number;
    className?: string;
    parentClassName?: string;
    encryptedClassName?: string;
    animateOn?: 'view' | 'hover';
    revealDirection?: 'start' | 'end' | 'center';
    sequential?: boolean;
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

export function DecryptedText({
    text,
    speed = 50,
    maxIterations = 10,
    className,
    parentClassName,
    encryptedClassName,
    animateOn = 'view',
    revealDirection = 'start',
    sequential = true,
}: DecryptedTextProps) {
    const [displayText, setDisplayText] = useState(text);
    const [isHovering, setIsHovering] = useState(false);
    const isAnimating = useRef(false);
    const containerRef = useRef<HTMLSpanElement>(null);

    const animate = () => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        const originalText = text.split('');
        const revealedIndices = new Set<number>();
        let iterations = 0;

        const interval = setInterval(() => {
            setDisplayText((prevText) => {
                return prevText
                    .split('')
                    .map((char, i) => {
                        if (originalText[i] === ' ') return ' ';
                        if (revealedIndices.has(i)) return originalText[i];

                        // Random chance to reveal this character based on progress
                        // Or if we exceeded max iterations for this specific char
                        if (Math.random() > 0.9 || iterations > maxIterations) {
                            revealedIndices.add(i);
                            return originalText[i];
                        }

                        return characters[Math.floor(Math.random() * characters.length)];
                    })
                    .join('');
            });

            iterations++;

            if (revealedIndices.size === originalText.length) {
                clearInterval(interval);
                isAnimating.current = false;
                setDisplayText(text); // Ensure final state is clean
            }
        }, speed);
    };

    useEffect(() => {
        if (animateOn === 'view') {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && !isAnimating.current) {
                            animate();
                        }
                    });
                },
                { threshold: 0.1 }
            );

            if (containerRef.current) {
                observer.observe(containerRef.current);
            }

            return () => observer.disconnect();
        }
    }, [animateOn, text]);

    const handleMouseEnter = () => {
        if (animateOn === 'hover') {
            setIsHovering(true);
            animate();
        }
    };

    const handleMouseLeave = () => {
        if (animateOn === 'hover') {
            setIsHovering(false);
        }
    };

    return (
        <span
            ref={containerRef}
            className={`inline-block whitespace-wrap ${parentClassName}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className={className}>
                {displayText.split('').map((char, index) => {
                    const isEncrypted = char !== text[index];
                    return (
                        <span
                            key={index}
                            className={isEncrypted ? encryptedClassName : undefined}
                        >
                            {char}
                        </span>
                    );
                })}
            </span>
        </span>
    );
}

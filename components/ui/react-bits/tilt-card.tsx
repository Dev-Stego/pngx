'use client';

import { useRef, useState, MouseEvent, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
    children: ReactNode;
    className?: string;
    tiltMaxAngle?: number;
    perspective?: number;
    scale?: number;
    glareEnabled?: boolean;
    glareMaxOpacity?: number;
    glareColor?: string;
}

export function TiltCard({
    children,
    className = '',
    tiltMaxAngle = 15,
    perspective = 1000,
    scale = 1.02,
    glareEnabled = true,
    glareMaxOpacity = 0.2,
    glareColor = 'white',
}: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [tiltMaxAngle, -tiltMaxAngle]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-tiltMaxAngle, tiltMaxAngle]);

    const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
    const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;

        const xPercent = mouseXPos / width - 0.5;
        const yPercent = mouseYPos / height - 0.5;

        x.set(xPercent);
        y.set(yPercent);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    return (
        <motion.div
            ref={ref}
            className={`relative ${className}`}
            style={{
                perspective,
                transformStyle: 'preserve-3d',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
        >
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    scale: isHovered ? scale : 1,
                    transformStyle: 'preserve-3d',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="w-full h-full"
            >
                {children}
                {glareEnabled && (
                    <motion.div
                        className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden"
                        style={{
                            opacity: isHovered ? glareMaxOpacity : 0,
                        }}
                    >
                        <motion.div
                            className="absolute inset-0"
                            style={{
                                background: `radial-gradient(circle at ${glareX}% ${glareY}%, ${glareColor}, transparent 50%)`,
                            }}
                        />
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}

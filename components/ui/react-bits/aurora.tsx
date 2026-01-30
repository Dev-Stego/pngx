'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AuroraProps {
    className?: string;
    colorStops?: string[];
    speed?: number;
    blur?: number;
}

export function Aurora({
    className = '',
    colorStops = ['#3b82f6', '#8b5cf6', '#06b6d4', '#3b82f6'],
    speed = 10,
    blur = 100,
}: AuroraProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        const drawAurora = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const gradient1 = ctx.createRadialGradient(
                canvas.width * 0.3 + Math.sin(time * 0.5) * 100,
                canvas.height * 0.4 + Math.cos(time * 0.3) * 50,
                0,
                canvas.width * 0.3,
                canvas.height * 0.4,
                canvas.width * 0.5
            );
            gradient1.addColorStop(0, `${colorStops[0]}40`);
            gradient1.addColorStop(1, 'transparent');

            const gradient2 = ctx.createRadialGradient(
                canvas.width * 0.7 + Math.cos(time * 0.4) * 80,
                canvas.height * 0.6 + Math.sin(time * 0.6) * 60,
                0,
                canvas.width * 0.7,
                canvas.height * 0.6,
                canvas.width * 0.4
            );
            gradient2.addColorStop(0, `${colorStops[1]}30`);
            gradient2.addColorStop(1, 'transparent');

            const gradient3 = ctx.createRadialGradient(
                canvas.width * 0.5 + Math.sin(time * 0.7) * 120,
                canvas.height * 0.3 + Math.cos(time * 0.5) * 40,
                0,
                canvas.width * 0.5,
                canvas.height * 0.3,
                canvas.width * 0.6
            );
            gradient3.addColorStop(0, `${colorStops[2]}25`);
            gradient3.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = gradient2;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = gradient3;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.01 * (10 / speed);
            animationId = requestAnimationFrame(drawAurora);
        };

        resize();
        window.addEventListener('resize', resize);
        drawAurora();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [colorStops, speed]);

    return (
        <motion.div
            className={`absolute inset-0 overflow-hidden ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ filter: `blur(${blur}px)` }}
            />
        </motion.div>
    );
}

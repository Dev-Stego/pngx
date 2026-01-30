'use client';

import { useEffect, useRef } from 'react';

interface GradientMeshProps {
    className?: string;
}

export function GradientMesh({ className = '' }: GradientMeshProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const drawBlob = (
            x: number,
            y: number,
            radius: number,
            color: string,
            offset: number
        ) => {
            const wobble = Math.sin(time * 0.5 + offset) * 20;
            const gradient = ctx.createRadialGradient(
                x + wobble,
                y + wobble,
                0,
                x + wobble,
                y + wobble,
                radius
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x + wobble, y + wobble, radius, 0, Math.PI * 2);
            ctx.fill();
        };

        const animate = () => {
            time += 0.01;

            ctx.fillStyle = 'hsl(220, 20%, 4%)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Enable blending
            ctx.globalCompositeOperation = 'screen';

            // Purple blob - top right
            drawBlob(
                canvas.width * 0.7 + Math.sin(time * 0.3) * 50,
                canvas.height * 0.3 + Math.cos(time * 0.4) * 30,
                canvas.width * 0.4,
                'hsla(263, 70%, 25%, 0.4)',
                0
            );

            // Cyan blob - bottom left
            drawBlob(
                canvas.width * 0.3 + Math.cos(time * 0.35) * 40,
                canvas.height * 0.7 + Math.sin(time * 0.45) * 40,
                canvas.width * 0.35,
                'hsla(180, 80%, 20%, 0.4)',
                2
            );

            // Blue blob - center
            drawBlob(
                canvas.width * 0.5 + Math.sin(time * 0.25) * 60,
                canvas.height * 0.5 + Math.cos(time * 0.35) * 50,
                canvas.width * 0.3,
                'hsla(200, 70%, 20%, 0.3)',
                4
            );

            ctx.globalCompositeOperation = 'source-over';

            animationId = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener('resize', resize);
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none ${className}`}
            style={{ zIndex: -1 }}
        />
    );
}

// Static gradient background (lighter weight alternative)
export function StaticGradientBg({ className = '' }: { className?: string }) {
    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ zIndex: -1 }}>
            {/* Main background */}
            <div className="absolute inset-0 bg-background" />

            {/* Purple glow - top right */}
            <div
                className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-30 blur-[120px]"
                style={{ background: 'hsl(263, 70%, 30%)' }}
            />

            {/* Cyan glow - bottom left */}
            <div
                className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-25 blur-[100px]"
                style={{ background: 'hsl(180, 80%, 25%)' }}
            />

            {/* Blue glow - center */}
            <div
                className="absolute top-[30%] left-[40%] w-[40%] h-[40%] rounded-full opacity-20 blur-[80px]"
                style={{ background: 'hsl(200, 70%, 25%)' }}
            />

            {/* Grid overlay */}
            <div className="absolute inset-0 grid-pattern opacity-30" />

            {/* Noise texture */}
            <div className="absolute inset-0 noise-overlay" />
        </div>
    );
}

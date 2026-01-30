'use client';

import { useRef, useEffect } from 'react';

interface WavesProps {
    lineColor?: string;
    backgroundColor?: string;
    waveSpeedX?: number;
    waveSpeedY?: number;
    waveAmpX?: number;
    waveAmpY?: number;
    friction?: number;
    tension?: number;
    maxCursorMove?: number;
    xGap?: number;
    yGap?: number;
}

export const Waves: React.FC<WavesProps> = ({
    lineColor = 'rgba(255, 255, 255, 0.3)',
    backgroundColor = 'transparent',
    waveSpeedX = 0.0125,
    waveSpeedY = 0.005,
    waveAmpX = 32,
    waveAmpY = 16,
    xGap = 10,
    yGap = 32,
    friction = 0.925,
    tension = 0.005,
    maxCursorMove = 100,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
        let height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;

        let waves: { x: number, y: number, z: number, lx: number, ly: number, lz: number }[] = [];

        const init = () => {
            width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
            height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
            waves = [];
            for (let y = 0; y < height; y += yGap) {
                waves.push({
                    x: 0,
                    y: y,
                    z: 0,
                    lx: 0,
                    ly: 0,
                    lz: 0 // local z for wave offset
                });
            }
        };

        init();

        const handleResize = () => {
            init();
        };
        window.addEventListener('resize', handleResize);

        let time = 0;
        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Optional Background
            if (backgroundColor !== 'transparent') {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, width, height);
            }

            ctx.lineWidth = 1;
            ctx.strokeStyle = lineColor;
            ctx.beginPath();

            for (let i = 0; i < waves.length; i++) {
                const wave = waves[i];
                const yBase = wave.y;

                ctx.moveTo(0, yBase);

                for (let x = 0; x <= width; x += xGap) {
                    // Simple sine wave combination
                    const y = yBase +
                        Math.sin(x * 0.01 + time * waveSpeedX + i * 0.5) * waveAmpX * Math.cos(time * waveSpeedY) +
                        Math.sin(x * 0.03 + time * waveSpeedX) * waveAmpY;

                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();
            time += 1;
            requestAnimationFrame(draw);
        };

        const animationId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, [lineColor, backgroundColor, waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, xGap, yGap]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full block absolute inset-0 -z-10"
        />
    );
};

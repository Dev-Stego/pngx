'use client';

import { useRef, useEffect } from 'react';

interface LetterGlitchProps {
    glitchColors?: string[];
    glitchSpeed?: number;
    centerVignette?: boolean;
    outerVignette?: boolean;
    smooth?: boolean;
}

export const LetterGlitch: React.FC<LetterGlitchProps> = ({
    glitchColors = ['#2b45f5', '#f5aa2b', '#f52b2b'],
    glitchSpeed = 50,
    centerVignette = false,
    outerVignette = true,
    smooth = true,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        const charArray = chars.split('');

        const fontSize = 16;
        const columns = Math.ceil(width / fontSize);
        const rows = Math.ceil(height / fontSize);

        const drops: number[] = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * rows; // Start at random positions
        }

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        let lastDraw = 0;

        const draw = (timestamp: number) => {
            if (timestamp - lastDraw < glitchSpeed) {
                animationRef.current = requestAnimationFrame(draw);
                return;
            }
            lastDraw = timestamp;

            // Semi-transparent black to create trail effect
            if (smooth) {
                // Fade out previous frame using destination-out
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(0, 0, width, height);
                ctx.globalCompositeOperation = 'source-over';
            } else {
                ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                ctx.fillRect(0, 0, width, height);
            }

            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = charArray[Math.floor(Math.random() * charArray.length)];

                // Color selection
                const isGlitch = Math.random() > 0.95;
                if (isGlitch) {
                    ctx.fillStyle = glitchColors[Math.floor(Math.random() * glitchColors.length)];
                } else {
                    ctx.fillStyle = '#333'; // Default dim color
                }

                // Random brightness for non-glitch
                if (!isGlitch && Math.random() > 0.9) {
                    ctx.fillStyle = '#666';
                }

                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0; // Reset to top
                }

                drops[i]++;
            }

            // Vignette effects
            if (outerVignette) {
                const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.5);
                gradient.addColorStop(0, 'rgba(0,0,0,0)');
                gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }

            if (centerVignette) {
                const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
                gradient.addColorStop(0, 'rgba(0,0,0,0.6)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [glitchColors, glitchSpeed, centerVignette, outerVignette, smooth]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full block"
            style={{ backgroundColor: smooth ? 'transparent' : 'black' }}
        />
    );
};

'use client';

import React, { useRef, useEffect } from 'react';

interface ParticlesProps {
    particleCount?: number;
    particleSpread?: number;
    speed?: number;
    particleColors?: string[];
    moveParticlesOnHover?: boolean;
    particleHoverFactor?: number;
    alphaParticles?: boolean;
    particleBaseSize?: number;
    sizeRandomness?: number;
    cameraDistance?: number;
}

export const Particles: React.FC<ParticlesProps> = ({
    particleCount = 200,
    particleSpread = 10,
    speed = 0.1,
    particleColors = ['#ffffff', '#aa99ff', '#88ccff'],
    moveParticlesOnHover = false,
    particleHoverFactor = 1,
    alphaParticles = false,
    particleBaseSize = 100,
    sizeRandomness = 1,
    cameraDistance = 20,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: any[] = [];
        let animationFrameId: number;
        let mouseX = 0;
        let mouseY = 0;
        let targetSpeed = speed;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: (Math.random() - 0.5) * particleSpread,
                    y: (Math.random() - 0.5) * particleSpread,
                    z: (Math.random() - 0.5) * particleSpread,
                    color: particleColors[Math.floor(Math.random() * particleColors.length)],
                    size: particleBaseSize * (0.5 + Math.random() * sizeRandomness),
                });
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            particles.forEach((particle) => {
                // Update position
                particle.z -= speed;
                if (particle.z < -cameraDistance) {
                    particle.z = cameraDistance;
                }

                // Project 3D to 2D
                const scale = cameraDistance / (cameraDistance + particle.z);
                const x2d = particle.x * scale * canvas.width / particleSpread + centerX;
                const y2d = particle.y * scale * canvas.height / particleSpread + centerY;

                // Draw
                if (scale > 0) {
                    ctx.beginPath();
                    ctx.fillStyle = particle.color;
                    ctx.globalAlpha = alphaParticles ? scale : 1;
                    const size = particle.size * scale;
                    ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(drawParticles);
        };

        // Initialize
        resizeCanvas();
        createParticles();
        drawParticles();

        // Event Listeners
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [particleCount, particleSpread, speed, particleColors, moveParticlesOnHover, particleHoverFactor, alphaParticles, particleBaseSize, sizeRandomness, cameraDistance]);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

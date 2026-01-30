'use client';

import { useRef, useEffect } from 'react';

interface SquaresProps {
    speed?: number;
    squareSize?: number;
    direction?: 'diagonal' | 'up' | 'down' | 'right' | 'left';
    borderColor?: string;
    hoverFillColor?: string;
}

export const Squares: React.FC<SquaresProps> = ({
    speed = 0.5,
    squareSize = 50,
    direction = 'diagonal',
    borderColor = '#333',
    hoverFillColor = '#555',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const gridOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
        let height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;

        const handleResize = () => {
            width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
            height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.lineWidth = 1;
            ctx.strokeStyle = borderColor;

            // Update offset
            switch (direction) {
                case 'diagonal':
                    gridOffset.current.x += speed;
                    gridOffset.current.y += speed;
                    break;
                case 'up':
                    gridOffset.current.y -= speed;
                    break;
                case 'down':
                    gridOffset.current.y += speed;
                    break;
                case 'right':
                    gridOffset.current.x += speed;
                    break;
                case 'left':
                    gridOffset.current.x -= speed;
                    break;
            }

            // Wrap offset
            if (gridOffset.current.x >= squareSize) gridOffset.current.x = 0;
            if (gridOffset.current.y >= squareSize) gridOffset.current.y = 0;
            if (gridOffset.current.x <= 0) gridOffset.current.x = squareSize;
            if (gridOffset.current.y <= 0) gridOffset.current.y = squareSize;

            // Draw Grid
            for (let x = -squareSize; x < width + squareSize; x += squareSize) {
                for (let y = -squareSize; y < height + squareSize; y += squareSize) {
                    ctx.strokeRect(x + gridOffset.current.x - squareSize, y + gridOffset.current.y - squareSize, squareSize, squareSize);
                }
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [speed, squareSize, direction, borderColor, hoverFillColor]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full block absolute inset-0 -z-10"
        />
    );
};

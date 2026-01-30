import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface LiquidGlassButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    className?: string;
    gradient?: string;
}

export function LiquidGlassButton({
    children,
    className,
    gradient = "linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))",
    ...props
}: LiquidGlassButtonProps) {
    return (
        <motion.button
            className={cn(
                "relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 rounded-xl overflow-hidden group",
                "shadow-[0_4px_30px_rgba(0,0,0,0.1)]",
                "border border-white/30",
                "backdrop-blur-[10px]",
                className
            )}
            style={{
                background: gradient,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            {...props}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Liquid fluid animation background */}
            <div className="absolute top-0 -left-[100%] w-[300%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-[25deg] transition-all duration-1000 group-hover:animate-shine" />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
                {children}
            </span>
        </motion.button>
    );
}

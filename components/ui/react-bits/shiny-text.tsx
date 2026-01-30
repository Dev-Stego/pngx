
import { CSSProperties, FC, ReactNode } from 'react';

interface ShinyTextProps {
    children: ReactNode;
    disabled?: boolean;
    speed?: number;
    className?: string;
    style?: CSSProperties;
}

export const ShinyText: FC<ShinyTextProps> = ({
    children,
    disabled = false,
    speed = 5,
    className = '',
    style
}) => {
    const animationDuration = `${speed}s`;

    return (
        <span
            className={`bg-clip-text text-transparent bg-[linear-gradient(120deg,rgba(255,255,255,0.8)_40%,rgba(255,255,255,1)_50%,rgba(255,255,255,0.8)_60%)] bg-[length:200%_100%] animate-shine ${className}`}
            style={{
                backgroundImage: 'linear-gradient(120deg, transparent 40%, rgba(255, 255, 255, 0.8) 50%, transparent 60%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                animationDuration: animationDuration,
                ...style,
            }}
        >
            {children}
        </span>
    );
};

/* 
Add this to globals.css if not present:
@keyframes shine {
  0% {
    background-position: 100%;
  }
  100% {
    background-position: -100%;
  }
}
.animate-shine {
  animation: shine 5s linear infinite;
}
*/

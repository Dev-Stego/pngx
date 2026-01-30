'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { LoginModal } from '@/components/auth/login-modal';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthCTAProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text?: string;
    showIcon?: boolean;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link' | 'premium';
}

export function AuthCTA({
    text = "Start Encrypting Now",
    showIcon = true,
    className,
    variant = 'premium',
    ...props
}: AuthCTAProps) {
    const { user } = useAuth();
    const [showLoginModal, setShowLoginModal] = React.useState(false);
    const router = useRouter();

    const handleClick = () => {
        if (user) {
            router.push('/app');
        } else {
            setShowLoginModal(true);
        }
    };

    const isPremium = variant === 'premium';
    const buttonVariant = isPremium ? 'default' : variant;

    return (
        <>
            <Button
                onClick={handleClick}
                className={cn(
                    isPremium && "group h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-primary via-purple-600 to-secondary hover:from-primary/90 hover:via-purple-700 hover:to-secondary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105",
                    className
                )}
                variant={buttonVariant}
                {...props}
            >
                {showIcon && <Lock className="mr-2 h-5 w-5" />}
                {text}
                {showIcon && <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />}
            </Button>

            <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
        </>
    );
}

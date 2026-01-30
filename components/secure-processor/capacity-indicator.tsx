'use client';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface CapacityIndicatorProps {
    used: number;
    max: number;
}

export function CapacityIndicator({ used, max }: CapacityIndicatorProps) {
    const percentage = Math.min(100, (used / max) * 100);
    const isOverLimit = used > max;

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
                <span className={cn("font-medium", isOverLimit ? "text-destructive" : "text-muted-foreground")}>
                    Capacity Used: {percentage.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">
                    {formatBytes(used)} / {formatBytes(max)}
                </span>
            </div>
            <Progress
                value={percentage}
                className={cn("h-1.5", isOverLimit && "[&>div]:bg-destructive")}
            />
            <p className={cn("text-xs flex items-center gap-1.5", isOverLimit ? "text-destructive" : "text-emerald-500")}>
                {isOverLimit ? (
                    <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        File too large for this cover image
                    </>
                ) : (
                    <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Safe for encryption
                    </>
                )}
            </p>
        </div>
    );
}

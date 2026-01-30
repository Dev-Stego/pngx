'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, Loader2, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StepEncryptProps {
    onEncrypt: () => void;
    isProcessing: boolean;
    isDisabled: boolean;
    progress: number;
    stage: string;
}

export function StepEncrypt({
    onEncrypt,
    isProcessing,
    isDisabled,
    progress,
    stage
}: StepEncryptProps) {

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">3</div>
                <h3 className="text-lg font-semibold">Encrypt & Generate</h3>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-muted/50">
                <ShieldCheck className="w-8 h-8 text-primary flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-sm font-medium">256-bit AES Encryption</p>
                    <p className="text-xs text-muted-foreground">We'll auto-generate a cryptographic security note for you</p>
                </div>
            </div>

            <div className="relative group w-full">
                <Button
                    size="lg"
                    onClick={onEncrypt}
                    disabled={isDisabled}
                    className="w-full h-16 text-xl font-bold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Lock className="w-6 h-6 mr-2" />
                            Encrypt & Download
                        </>
                    )}
                </Button>
            </div>

            {isProcessing && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-primary">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            {stage === 'analyzing' && 'Analyzing content...'}
                            {stage === 'encrypting' && 'Encrypting data (AES-256)...'}
                            {stage === 'processing' && 'Embedding steganography layer...'}
                            {stage === 'finalizing' && 'Generating final image...'}
                        </span>
                        <span className="font-mono text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            )}
        </motion.div>
    );
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DropZone } from '@/components/ui/drop-zone';
import { FilePreview } from '@/components/ui/file-preview';
import { ShieldCheck, ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CapacityIndicator } from './capacity-indicator';

interface StepModeProps {
    encryptionMode: 'quick' | 'steganography' | null;
    setEncryptionMode: (mode: 'quick' | 'steganography' | null) => void;
    coverImage: File | null;
    setCoverImage: (file: File | null) => void;
    onCoverSelect: (file: File) => void;
    capacityStats: { max: number; used: number } | null;
    sourceFileSize?: number; // Size of the source file in bytes
}

// Calculate minimum dimensions needed for a given file size
function calculateMinDimensions(fileSize: number): { pixels: number; dimension: number; formatted: string } {
    // Header (328 bytes) + file + AES tag (16 bytes)
    const payloadBytes = 328 + fileSize + 16;
    // LSB: 32-bit length header + payload bits, 3 bits per pixel
    const neededBits = 32 + (payloadBytes * 8);
    const pixelsNeeded = Math.ceil(neededBits / 3);
    const dimension = Math.ceil(Math.sqrt(pixelsNeeded));
    return {
        pixels: pixelsNeeded,
        dimension,
        formatted: `${dimension} × ${dimension}`
    };
}

export function StepMode({
    encryptionMode,
    setEncryptionMode,
    coverImage,
    setCoverImage,
    onCoverSelect,
    capacityStats,
    sourceFileSize = 0
}: StepModeProps) {
    const minDimensions = sourceFileSize > 0 ? calculateMinDimensions(sourceFileSize) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">2</div>
                <h3 className="text-lg font-semibold">Choose Encryption Mode</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Quick Mode Card */}
                <div
                    onClick={() => {
                        setEncryptionMode('quick');
                        setCoverImage(null);
                    }}
                    className={cn(
                        "relative p-6 rounded-xl border cursor-pointer transition-all duration-300 group overflow-hidden",
                        encryptionMode === 'quick'
                            ? "border-primary bg-gradient-to-br from-primary/20 via-primary/10 to-transparent shadow-xl shadow-primary/20"
                            : "border-muted/50 bg-card/30 hover:border-primary/30 hover:bg-primary/5"
                    )}
                >
                    {/* Glow effect when selected */}
                    {encryptionMode === 'quick' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent animate-pulse" />
                    )}
                    {encryptionMode === 'quick' && (
                        <div className="absolute top-3 right-3 z-10">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/50">
                                <ShieldCheck className="w-4 h-4 text-primary-foreground" />
                            </div>
                        </div>
                    )}
                    <div className="relative space-y-3">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                            encryptionMode === 'quick' ? "bg-primary/20" : "bg-muted"
                        )}>
                            <div className={cn("w-6 h-6 rounded", encryptionMode === 'quick' ? "bg-primary/40" : "bg-muted-foreground/30")} />
                        </div>
                        <div>
                            <h4 className={cn("font-semibold", encryptionMode === 'quick' && "text-primary")}>Quick Encrypt</h4>
                            <p className="text-sm text-muted-foreground mt-1">Generates secure noise pattern</p>
                        </div>
                        <p className="text-xs text-muted-foreground/70">Fast • Simple • Secure</p>
                    </div>
                </div>

                {/* Steganography Mode Card */}
                <div
                    onClick={() => setEncryptionMode('steganography')}
                    className={cn(
                        "relative p-6 rounded-xl border cursor-pointer transition-all duration-300 overflow-hidden",
                        encryptionMode === 'steganography'
                            ? "border-secondary bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent shadow-xl shadow-secondary/20"
                            : "border-muted/50 bg-card/30 hover:border-secondary/30 hover:bg-secondary/5"
                    )}
                >
                    {/* Glow effect when selected */}
                    {encryptionMode === 'steganography' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent animate-pulse" />
                    )}
                    {encryptionMode === 'steganography' && (
                        <div className="absolute top-3 right-3 z-10">
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shadow-lg shadow-secondary/50">
                                <ShieldCheck className="w-4 h-4 text-secondary-foreground" />
                            </div>
                        </div>
                    )}
                    <div className="relative space-y-3">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                            encryptionMode === 'steganography' ? "bg-secondary/20" : "bg-muted"
                        )}>
                            <ImageIcon className={cn("w-6 h-6", encryptionMode === 'steganography' ? "text-secondary" : "text-muted-foreground")} />
                        </div>
                        <div>
                            <h4 className={cn("font-semibold", encryptionMode === 'steganography' && "text-secondary")}>Steganography</h4>
                            <p className="text-sm text-muted-foreground mt-1">Hide inside another image</p>
                        </div>
                        <p className="text-xs text-muted-foreground/70">Invisible • Artistic • Private</p>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {encryptionMode === 'steganography' && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm text-orange-200">
                            <p className="flex items-center gap-2 font-medium">
                                <AlertCircle className="w-4 h-4" /> Cover Image Required
                            </p>
                            <p className="text-orange-200/70 mt-1 pl-6">
                                Upload an image to hide your file inside.
                                {minDimensions && (
                                    <span className="block mt-1">
                                        <strong>Minimum size:</strong> {minDimensions.formatted} pixels ({minDimensions.pixels.toLocaleString()} pixels total)
                                    </span>
                                )}
                            </p>
                        </div>

                        {!coverImage ? (
                            <DropZone
                                onFileSelect={onCoverSelect}
                                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                                className="h-65"
                                title="Upload Cover Image"
                                description={minDimensions 
                                    ? `Select a PNG, JPG, or WebP image (min ${minDimensions.formatted} px)`
                                    : "Select a PNG, JPG, or WebP image to hide your file inside"
                                }
                            />
                        ) : (
                            <div className="space-y-4">
                                <div className="relative">
                                    <FilePreview file={coverImage} />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 shadow-sm"
                                        onClick={() => setCoverImage(null)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                {capacityStats && (
                                    <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                                        <CapacityIndicator
                                            used={capacityStats.used}
                                            max={capacityStats.max}
                                        />
                                        <p className={cn("text-sm flex flex-col gap-3 mt-3", capacityStats.used > capacityStats.max ? "text-destructive" : "text-primary")}>
                                            {capacityStats.used > capacityStats.max ? (
                                                <div className="flex flex-col gap-3 w-full">
                                                    <span className="flex items-center gap-2 font-medium">
                                                        <X className="w-4 h-4" /> Cover image too small
                                                    </span>
                                                    {minDimensions && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Need at least <strong>{minDimensions.formatted}</strong> pixels ({minDimensions.pixels.toLocaleString()} total)
                                                        </span>
                                                    )}
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setCoverImage(null)}
                                                        className="w-full sm:w-auto"
                                                    >
                                                        <ImageIcon className="w-4 h-4 mr-2" />
                                                        Select Larger Image
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <ShieldCheck className="w-4 h-4" /> Perfect fit - image will look identical
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Importing AlertCircle for local usage
import { AlertCircle } from 'lucide-react';

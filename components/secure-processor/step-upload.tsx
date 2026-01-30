'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DropZone } from '@/components/ui/drop-zone';
import { FilePreview } from '@/components/ui/file-preview';
import { X } from 'lucide-react';

interface StepUploadProps {
    file: File | null;
    onFileSelect: (file: File) => void;
    onFileRemove: () => void;
}

export function StepUpload({ file, onFileSelect, onFileRemove }: StepUploadProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">1</div>
                <h3 className="text-lg font-semibold">Select File to Hide</h3>
            </div>

            {!file ? (
                <DropZone
                    onFileSelect={onFileSelect}
                    className="h-64"
                />
            ) : (
                <div className="relative">
                    <FilePreview file={file} />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 shadow-sm"
                        onClick={onFileRemove}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
